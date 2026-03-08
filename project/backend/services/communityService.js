import { pool } from "../config/db.js"

export async function createPost(user_id, title, content) {

    const insertResult = await pool.query(
        "INSERT INTO community_posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *",
        [user_id, title, content]
    );

    await pool.query(
        "INSERT INTO user_activity (user_id, activity_type, content) VALUES ($1, $2, $3)",
        [user_id, "community_post", title]
    );

    return insertResult.rows[0];
}

export async function getPosts() {

    const { rows } = await pool.query(
        "SELECT * FROM community_posts ORDER BY created_at DESC"
    );

    return rows;
}

export async function addComment(post_id, user_id, content) {
    const insertResult = await pool.query(
        "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
        [post_id, user_id, content]
    );
    return insertResult.rows[0];
}

export async function addVote(post_id, user_id, vote_type) {
    await pool.query(
        "INSERT INTO votes (post_id, user_id, vote_type) VALUES ($1, $2, $3)",
        [post_id, user_id, vote_type]
    );
}

export async function setVerified(post_id, verifiedStatus) {
    await pool.query(
        "UPDATE community_posts SET verified = $1 WHERE id = $2",
        [verifiedStatus, post_id]
    );
}