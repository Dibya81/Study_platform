import express from "express"
import { runCode } from "../services/lambdaService.js"
import { explainCode, analyzeCode } from "../services/codeAIService.js"

const router = express.Router()

// Run code
router.post("/run", async (req, res) => {

    try {

        const { user_id, language, code } = req.body

        console.log(`\n=================================`);
        console.log(`🚀 CODE COMPILER: Executing ${language.toUpperCase()} Code`);
        console.log(`💻 Input snippet size: ${code.length} characters`);

        const output = await runCode(user_id, language, code)

        console.log(`✅ EXECUTED: Output Length ${output.length} characters`);
        console.log(`=================================\n`);

        res.json({
            success: true,
            output
        })

    } catch (err) {

        res.status(500).json({ error: err.message })

    }

})


// Explain code
router.post("/explain", async (req, res) => {
    try {
        const { language, code } = req.body

        console.log(`\n=================================`);
        console.log(`🧠 AI CODE EXPLAINER: Analyzing ${language.toUpperCase()} Code`);

        const explanation = await explainCode(language, code)

        console.log(`✅ EXPLANATION COMPLETED: Evaluated by Mistral AI`);
        console.log(`=================================\n`);

        res.json({ explanation })

    } catch (err) {

        res.status(500).json({ error: err.message })

    }

})


// Analyze code
router.post("/analyze", async (req, res) => {
    try {
        const { language, code } = req.body

        console.log(`\n=================================`);
        console.log(`🕵️‍♂️ AI STATIC ANALYSIS: Deep-scanning ${language.toUpperCase()} Code`);

        const analysis = await analyzeCode(language, code)

        console.log(`✅ ANALYSIS COMPLETED: Evaluated by Mistral AI`);
        console.log(`=================================\n`);

        res.json({ analysis })

    } catch (err) {

        res.status(500).json({ error: err.message })

    }

})
export default router