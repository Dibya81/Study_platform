import express from "express"
import {
    addNote,
    updateNoteSummary,
    updateNoteQuiz,
    updateNoteFlashcards
} from "../services/notesService.js"
import {
    summarizeNotes,
    generateQuiz,
    generateFlashcards
} from "../services/notesAIService.js"

const router = express.Router()

// Create note
router.post("/create", async (req, res) => {

    try {
        const { user_id, title, content } = req.body
        const data = await addNote(user_id, content)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})


// Summarize note
router.post("/summarize", async (req, res) => {

    try {
        const { note_id, content } = req.body
        const summary = await summarizeNotes(content)

        await updateNoteSummary(note_id, summary)

        res.json({ summary })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})


// Generate quiz
router.post("/quiz", async (req, res) => {

    try {
        const { note_id, content } = req.body
        const quiz = await generateQuiz(content)

        await updateNoteQuiz(note_id, quiz)

        res.json({ quiz })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})


// Flashcards
router.post("/flashcards", async (req, res) => {

    try {
        const { note_id, content } = req.body
        const flashcards = await generateFlashcards(content)

        await updateNoteFlashcards(note_id, flashcards)

        res.json({ flashcards })

    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})

export default router