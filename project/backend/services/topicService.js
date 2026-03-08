import { pool } from "../config/db.js"

const knownTopics = [
    "arrays",
    "binary search",
    "recursion",
    "trees",
    "graphs",
    "dynamic programming",
    "linked list"
]

export function detectTopics(text) {

    const lower = text.toLowerCase()

    return knownTopics.filter(topic =>
        lower.includes(topic)
    )

}

export async function updateUserSkills(user_id, topics) {

    for (const topic of topics) {

        const { rows } = await pool.query(
            "SELECT * FROM user_skills WHERE user_id = $1 AND topic = $2 LIMIT 1",
            [user_id, topic]
        );

        if (rows.length > 0) {

            const data = rows[0];
            await pool.query(
                "UPDATE user_skills SET mastery = $1 WHERE id = $2",
                [data.mastery + 1, data.id]
            );

        } else {

            await pool.query(
                "INSERT INTO user_skills (user_id, topic, mastery) VALUES ($1, $2, $3)",
                [user_id, topic, 1]
            );

        }

    }

}