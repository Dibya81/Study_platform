import express from "express"
import { runConsensus } from "../services/consensusEngine.js"
import { pool } from "../config/db.js"
import fetch from "node-fetch"

const router = express.Router()

const LAMBDA_URL = "https://6u6a3ub4qmn4qppzc7hdsnflqy0lkold.lambda-url.us-east-1.on.aws/";

router.post("/ask", async (req, res) => {

    try {

        const { user_id, question } = req.body

        const result = await runConsensus(user_id, question)

        res.json(result)

    } catch (err) {

        res.status(500).json({ error: err.message })

    }

})

// New Bedrock Lambda Integration (Migrating from Ollama)
router.post("/query", async (req, res) => {
    const { user_id, question } = req.body;

    try {
        console.log(`\n=================================`);
        console.log(`🛫 ROUTING TO AWS BEDROCK LAMBDA`);
        console.log(`📝 Question: "${question}"`);

        // 1. Call AWS Lambda
        const response = await fetch(LAMBDA_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: question }) // Lambda specifically expects "query"
        });

        const result = await response.json();
        const data = result.data;

        // 2. Track in Aurora DB to preserve Chat History UI
        let convoId = null;
        if (data && data.responses && data.responses.length >= 2) {
            try {
                const convoResult = await pool.query(
                    `INSERT INTO conversations(user_id, question, final_answer) VALUES($1,$2,$3) RETURNING id`,
                    [user_id, question, data.judge_explanation]
                );
                convoId = convoResult.rows[0].id;

                await pool.query(
                    `INSERT INTO ai_responses(conversation_id, model_name, response) VALUES($1,$2,$3)`,
                    [convoId, data.responses[0].model_name, data.responses[0].content]
                );
                await pool.query(
                    `INSERT INTO ai_responses(conversation_id, model_name, response) VALUES($1,$2,$3)`,
                    [convoId, data.responses[1].model_name, data.responses[1].content]
                );
                await pool.query(
                    `INSERT INTO user_activity(user_id, activity_type, content) VALUES($1,$2,$3)`,
                    [user_id, "mentor_question", question]
                );
            } catch (dbErr) {
                console.error("Database tracking failed:", dbErr);
            }
        }

        // Attach convoId to payload so frontend select-buttons work
        result.convoId = convoId;

        console.log(`✅ Lambda consensus complete. Delivered to UI.`);
        console.log(`=================================\n`);

        res.json(result);
    } catch (err) {
        console.error("Lambda Integration Error:", err);
        res.status(500).json({ error: "AI service temporarily unavailable" });
    }
})

// Let users override the judge's default pick
router.post("/update-answer", async (req, res) => {
    try {
        const { convoId, finalAnswer } = req.body;
        if (!convoId || !finalAnswer) return res.status(400).json({ error: "Missing required fields" });

        await pool.query(
            "UPDATE conversations SET final_answer = $1 WHERE id = $2",
            [finalAnswer, convoId]
        );

        console.log(`\n=================================`);
        console.log(`👤 USER OVERRIDE: Changed database answer to match their choice.`);
        console.log(`=================================\n`);

        res.json({ success: true });
    } catch (err) {
        console.error("Failed overriding final answer:", err);
        res.status(500).json({ error: err.message });
    }
});

router.get("/history/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;
        const result = await pool.query(
            "SELECT id, question, final_answer, created_at FROM conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20",
            [user_id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching history:", err);
        res.status(500).json({ error: err.message });
    }
})

export default router