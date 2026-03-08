import { pool } from "../config/db.js"
import { callModel } from "./aiService.js"

// AI career suggestion based on user activity
export async function getCareerSuggestions(user_id, question) {

    const historyResult = await pool.query(
        "SELECT * FROM user_activity WHERE user_id = $1",
        [user_id]
    );
    const history = historyResult.rows;

    let topics = history?.map(h => h.content).join(" ") || ""

    const prompt = `
User asked:
${question}

User learning history:
${topics}

Based on the user's learning activity suggest the best career path.

Give:
1. Recommended career
2. Reason
3. Skills to focus on
`

    const result = await callModel("mistral", prompt)

    return result
}



// Get all career paths
export async function getAllCareers() {
    const { rows } = await pool.query("SELECT * FROM career_paths");
    return rows;
}


// Get specific career
export async function getCareerByTitle(title) {
    const { rows } = await pool.query(
        "SELECT * FROM career_paths WHERE title = $1 LIMIT 1",
        [title]
    );
    return rows[0] || null;
}