import { callModel } from "./aiService.js"
import { pool } from "../config/db.js"
import { detectTopics, updateUserSkills } from "./topicService.js"
import { checkCache, saveCache } from "./cacheService.js"

export async function runConsensus(user_id, question) {

    // Using local Ollama models for the platform
    const model1 = "mistral";
    const model2 = "llama3";
    const judgeModel = "deepseek-coder-v2";

    // 1. Check DynamoDB Semantic Cache
    const cached = await checkCache(question);

    let answer1, answer2, judgeJson;

    if (cached) {
        console.log("CACHE HIT");

        // Use cached response as the universal output
        answer1 = "Cached Answer";
        answer2 = "Cached Answer";
        judgeJson = {
            winner: "cache",
            reason: "Retrieved from DynamoDB Semantic Cache",
            finalAnswer: cached.answer
        };

    } else {
        console.log("CACHE MISS");

        // 2. Worker models generate answers independently and concurrently
        [answer1, answer2] = await Promise.all([
            callModel(model1, question),
            callModel(model2, question)
        ]);

        // 3. Judge Model Prompt enforcing JSON
        const judgePrompt = `
You are an expert AI Consensus Judge.
The user asked: "${question}"

AI Agent 1 (Mistral) answered:
"${answer1}"

AI Agent 2 (Llama3) answered:
"${answer2}"

Your job is to compare both answers, determine which is better based on accuracy, clarity, and completeness.
You MUST output your response strictly as a JSON object with the following keys:
- "winner": string (either "answer1" or "answer2")
- "reason": string (Explanation of why this answer is better)
- "finalAnswer": string (The ultimate best answer to provide to the user, you may synthesize them or pick the best one).

Output ONLY JSON. No markdown formatting.
`;

        // 4. Call Judge with JSON mode forced
        console.log(`⚖️  Judge model evaluating responses...`);
        let judgeText = await callModel(judgeModel, judgePrompt, true);

        // Clean up potential markdown blocks if the model ignored strict json mode
        judgeText = judgeText.replace(/^```json/i, '').replace(/```$/i, '').trim();

        try {
            judgeJson = JSON.parse(judgeText);
        } catch (e) {
            console.error("Judge failed to return valid JSON:", judgeText);
            // Fallback safe JSON
            judgeJson = {
                winner: "answer1",
                reason: "The judge failed to evaluate properly. Defaulting to Agent 1.",
                finalAnswer: answer1
            };
        }

        // 5. Store new answer in DynamoDB Cache
        await saveCache(question, judgeJson.finalAnswer);
    }

    // 6. DB Preservation Phase: Detect topics and store everything to Aurora PostgreSQL
    const topics = detectTopics(question);
    await updateUserSkills(user_id, topics);

    let convoId = null;
    try {
        // Save conversation
        const convoResult = await pool.query(
            `INSERT INTO conversations(user_id, question, final_answer)
             VALUES($1,$2,$3) RETURNING id`,
            [user_id, question, judgeJson.finalAnswer]
        );
        convoId = convoResult.rows[0].id;

        // Save AI responses
        await pool.query(
            `INSERT INTO ai_responses(conversation_id, model_name, response)
             VALUES($1,$2,$3)`,
            [convoId, model1, answer1]
        );

        await pool.query(
            `INSERT INTO ai_responses(conversation_id, model_name, response)
             VALUES($1,$2,$3)`,
            [convoId, model2, answer2]
        );

        // Track activity
        await pool.query(
            `INSERT INTO user_activity(user_id, activity_type, content)
             VALUES($1,$2,$3)`,
            [user_id, "mentor_question", question]
        );

    } catch (err) {
        console.error("Database Error:", err);
    }

    // Rich Terminal Tracing
    console.log(`\n=================================`);
    console.log(`📝 NEW TASK: "${question}"`);
    console.log(`=================================`);
    if (cached) {
        console.log(`⚡  [CACHE HIT] Delivered Semantic Answer Instantly.`);
    } else {
        console.log(`🤖 Agent 1 (Mistral): "${answer1.substring(0, 70)}..."`);
        console.log(`🤖 Agent 2 (Llama3):  "${answer2.substring(0, 70)}..."`);
        const winName = judgeJson.winner === "answer1" ? "Agent 1" : (judgeJson.winner === "answer2" ? "Agent 2" : "System / Cache");
        console.log(`🏆 Judge Selected:    ${winName}`);
        console.log(`💡 Judge Reason:      ${judgeJson.reason}`);
    }
    console.log(`✅ Final Answer successfully recorded to Profile History.`);
    console.log(`=================================\n`);

    // Connect to new AI Hub frontend expectation
    return {
        convoId: convoId,
        answer1,
        answer2,
        judge: judgeJson,
        models: [model1, model2, judgeModel],
        topicsDetected: topics
    };
}