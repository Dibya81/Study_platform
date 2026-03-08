import { callModel } from "./aiService.js"

export async function explainCode(language, code) {

    const prompt = `
Explain the following ${language} code step by step.

Code:
${code}
`

    const response = await callModel("mistral", prompt)

    return response

}


export async function analyzeCode(language, code) {

    const prompt = `
Analyze the following ${language} code.

Find:
- bugs
- logical mistakes
- optimization suggestions

Code:
${code}
`

    const response = await callModel("mistral", prompt)

    return response

}