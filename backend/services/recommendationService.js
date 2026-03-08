import { pool } from "../config/db.js"

export async function recommendNextTopic(user_id) {

    const { rows: skills } = await pool.query(
        "SELECT * FROM user_skills WHERE user_id = $1",
        [user_id]
    );

    const learned = skills.map(s => s.topic)

    const { rows: dependencies } = await pool.query(
        "SELECT * FROM topic_dependencies"
    );

    const next = dependencies.find(dep =>
        learned.includes(dep.prerequisite) &&
        !learned.includes(dep.topic)
    );

    return next?.topic || "continue practicing current topics"
}