import "dotenv/config";
import express from "express"
import cors from "cors"
import helmet from "helmet"


const app = express()


app.use(helmet())
app.use(cors())
app.use(express.json())

import { aiLimiter } from "./middleware/rateLimiter.js"
app.use("/mentor", aiLimiter)
app.use("/code/analyze", aiLimiter)
app.use("/notes/summarize", aiLimiter)
app.use("/notes/quiz", aiLimiter)
app.use("/voice", aiLimiter)

// routes
import voiceRoutes from "./routes/voice.js"
import recommendRoutes from "./routes/recommend.js"
import codeRoutes from "./routes/code.js"
import careerRoutes from "./routes/career.js"
import notesRoutes from "./routes/notes.js"
import communityRoutes from "./routes/community.js"
import progressRoutes from "./routes/progress.js"
import mentorRoutes from "./routes/mentor.js"
import authRoutes from "./routes/auth.js"

// middleware
app.use(cors())
app.use(express.json())

// routes
app.use("/code", codeRoutes)
app.use("/career", careerRoutes)
app.use("/notes", notesRoutes)
app.use("/community", communityRoutes)
app.use("/progress", progressRoutes)
app.use("/mentor", mentorRoutes)
app.use("/api/ai", mentorRoutes)
app.use("/auth", authRoutes)

import { pool } from "./config/db.js"

// start server
const PORT = process.env.PORT || 5001

app.listen(PORT, async () => {
    console.log(`\n🚀 Server running on port ${PORT}`);

    try {
        await pool.query('SELECT NOW()');
        console.log("✅ Database is ready");
    } catch (e) {
        console.log("❌ Database failed:", e.message);
    }

    console.log("-----------------------------------\n");
})