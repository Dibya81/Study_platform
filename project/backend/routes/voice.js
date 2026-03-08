import express from "express"
import multer from "multer"
import { processVoiceText } from "../services/voiceService.js"

const router = express.Router()
const upload = multer({ dest: "uploads/" })

// Speech → AI answer
router.post("/input", upload.single("audio"), async (req, res) => {

    try {

        // Placeholder transcription
        const transcribedText = "Explain binary search"

        const aiAnswer = await processVoiceText(transcribedText)

        res.json({
            text: transcribedText,
            answer: aiAnswer
        })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})


// Text → Speech (simple response)
router.post("/output", async (req, res) => {

    try {

        const { text } = req.body

        res.json({
            message: "Audio generation placeholder",
            text
        })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})

export default router