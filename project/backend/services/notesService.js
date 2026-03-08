import { pool } from "../config/db.js"

export async function addNote(user_id, content) {

    const insertResult = await pool.query(
        "INSERT INTO notes (user_id, content) VALUES ($1, $2) RETURNING *",
        [user_id, content]
    );

    await pool.query(
        "INSERT INTO user_activity (user_id, activity_type, content) VALUES ($1, $2, $3)",
        [user_id, "note_saved", content]
    );

    return insertResult.rows[0];
}

export async function getNotes(user_id) {

    const { rows } = await pool.query(
        "SELECT * FROM notes WHERE user_id = $1",
        [user_id]
    );

    return rows;
}

export async function updateNoteSummary(note_id, summary) {
    await pool.query(
        "UPDATE notes SET summary = $1 WHERE id = $2",
        [summary, note_id]
    );
}

export async function updateNoteQuiz(note_id, quiz) {
    await pool.query(
        "UPDATE notes SET quiz = $1 WHERE id = $2",
        [quiz, note_id]
    );
}

export async function updateNoteFlashcards(note_id, flashcards) {
    await pool.query(
        "UPDATE notes SET flashcards = $1 WHERE id = $2",
        [flashcards, note_id]
    );
}