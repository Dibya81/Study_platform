import { callModel } from "./aiService.js"

export async function verifyAnswer(content) {
    const prompt = `
Analyze the following community post. Determine if the information is accurate, safe, and helpful.
Post: "${content}"

You MUST output your response strictly as a JSON object with the following key:
- "verified": boolean (true if accurate/helpful, false if factually incorrect or harmful)

Output ONLY JSON. No markdown formatting.
`;

    let responseText = await callModel("claude-haiku", prompt, true);

    responseText = responseText.replace(/^```json/i, '').replace(/```$/i, '').trim();

    try {
        const json = JSON.parse(responseText);
        return json.verified === true;
    } catch (e) {
        console.error("Failed to parse verification JSON:", responseText);
        return false;
    }
}
