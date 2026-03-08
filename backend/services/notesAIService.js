import { callModel } from "./aiService.js"

export async function summarizeNotes(content) {

    const prompt = `
Summarize the following study notes clearly for a student.

Notes:
${content}

Return:
- concise summary
- key points
`

    return await callModel("claude-haiku", prompt)
}


export async function generateQuiz(content) {

    const prompt = `
Create 5 quiz questions based on these notes.

Notes:
${content}

Return JSON format:
[
 { "question": "...", "answer": "..." }
]
`

    const result = await callModel("claude-haiku", prompt)

    return result
}


export async function generateFlashcards(content) {

    const prompt = `
Create flashcards for studying.

Notes:
${content}

Return JSON format:
[
 { "front": "...", "back": "..." }
]
`

    const result = await callModel("claude-haiku", prompt)

    return result
}