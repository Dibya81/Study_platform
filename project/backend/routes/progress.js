import express from "express"
import { getProgress } from "../services/progressService.js"

const router = express.Router()

router.get("/:user_id", async (req, res) => {

    const data = await getProgress(req.params.user_id)

    res.json(data)

})

export default router