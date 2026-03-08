export async function callModel(modelId, prompt, forceJson = false) {
    // Determine target URL and payload for Ollama
    const url = "http://localhost:11434/api/generate";

    const payload = {
        model: modelId,
        prompt: prompt,
        stream: false
    };

    if (forceJson) {
        payload.format = "json";
        payload.prompt = prompt + "\n\nProvide ONLY valid JSON output.";
    }

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`Ollama responded with status: ${response.status}`);
        }

        const data = await response.json();
        return data.response.trim();

    } catch (error) {
        console.error("Local Ollama Error:", error);
        throw new Error(`Failed to communicate with Local Model (${modelId})`);
    }
}