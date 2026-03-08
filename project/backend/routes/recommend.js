import express from "express"
import { recommendNextTopic } from "../services/recommendationService.js"

const router = express.Router()

router.get("/:user_id", async (req, res) => {

    const topic = await recommendNextTopic(req.params.user_id)

    res.json({
        recommended: topic
    })

})

export default router