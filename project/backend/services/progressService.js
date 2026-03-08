import { pool } from "../config/db.js"

export async function getProgress(user_id) {

    const countResult = await pool.query(
        "SELECT COUNT(*) AS total_questions FROM conversations WHERE user_id = $1",
        [user_id]
    );

    const latestResult = await pool.query(
        "SELECT question FROM conversations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
        [user_id]
    );

    return {
        total_questions: parseInt(countResult.rows[0]?.total_questions || 0),
        latest_question: latestResult.rows[0]?.question || null
    };
}