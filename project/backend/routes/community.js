import express from "express"
import {
    createPost,
    getPosts,
    addComment,
    addVote,
    setVerified
} from "../services/communityService.js"
import { verifyAnswer } from "../services/communityAIService.js"

const router = express.Router()


// Create post
router.post("/post", async (req, res) => {

    try {
        const { user_id, title, content } = req.body
        const data = await createPost(user_id, title, content)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})


// Get feed
router.get("/feed", async (req, res) => {

    try {
        const data = await getPosts()
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})


// Add comment
router.post("/comment", async (req, res) => {

    try {
        const { post_id, user_id, content } = req.body
        const data = await addComment(post_id, user_id, content)
        res.json(data)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})


// Vote
router.post("/vote", async (req, res) => {

    try {
        const { post_id, user_id, vote_type } = req.body
        await addVote(post_id, user_id, vote_type)
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})


// AI verification
router.post("/verify", async (req, res) => {

    try {
        const { post_id, content } = req.body
        const result = await verifyAnswer(content)
        await setVerified(post_id, result)
        res.json({ verified: result })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})

export default router