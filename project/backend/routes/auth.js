import express from "express"
import { v4 as uuidv4 } from "uuid"
import { pool } from "../config/db.js"

const router = express.Router()

router.post("/login", async (req, res) => {
    try {
        const { name } = req.body

        if (!name) {
            return res.status(400).json({ error: "Name is required" })
        }

        const id = uuidv4()

        await pool.query(
            "INSERT INTO users(id, name) VALUES($1, $2)",
            [id, name]
        )

        console.log(`\n=================================`);
        console.log(`🔐 USER LOGIN DETECTED`);
        console.log(`👤 Name: ${name}`);
        console.log(`🔑 ID:   ${id}`);
        console.log(`=================================\n`);

        res.json({
            user_id: id,
            name: name
        })
    } catch (err) {
        console.error("Login Error:", err)
        res.status(500).json({ error: err.message })
    }
})

export default router
