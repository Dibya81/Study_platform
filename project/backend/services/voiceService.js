import { callModel } from "./aiService.js"

export async function processVoiceText(text) {

    const prompt = `
Answer this educational question clearly:

${text}
`

    const response = await callModel("mistral", prompt)

    return response
}