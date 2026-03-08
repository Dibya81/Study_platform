import express from "express"
import { getAllCareers, getCareerByTitle } from "../services/careerService.js"

const router = express.Router()

// Get all career paths
router.get("/all", async (req, res) => {

    try {

        const careers = await getAllCareers()

        res.json(careers)

    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})


// Get specific career roadmap
router.get("/:title", async (req, res) => {

    try {

        const career = await getCareerByTitle(req.params.title)

        res.json(career)

    } catch (err) {
        res.status(500).json({ error: err.message })
    }

})

export default router