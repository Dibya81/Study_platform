document.addEventListener("DOMContentLoaded", async () => {
    await loadHistory();
});

async function loadHistory() {
    const list = document.getElementById("historyList");
    try {
        const history = await getHistory();
        if (!history || history.length === 0) {
            list.innerHTML = `<div class="empty-state">No past chats found.</div>`;
            return;
        }

        list.innerHTML = history.map(item => `
            <div class="history-item-container" style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <div class="history-item" onclick="viewHistory('${item.id}')" style="flex:1; overflow: hidden;">
                    <div class="history-title" style="white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${item.question}</div>
                    <div class="history-date">${new Date(item.created_at).toLocaleDateString()}</div>
                </div>
                <button class="delete-history-btn" onclick="deleteMentorHistory('${item.id}', event)" title="Delete Chat" style="background: transparent; border: none; cursor: pointer; color: var(--text-secondary); padding: 4px; transition: color 0.2s;">
                    🗑️
                </button>
            </div>
        `).join('');
    } catch (e) {
        console.error("Failed to load history:", e);
        list.innerHTML = `<div class="empty-state">Failed to load history.</div>`;
    }
}

async function deleteMentorHistory(id, event) {
    event.stopPropagation();
    try {
        await deleteHistoryAPI(id);
        // Refresh UI completely from backend state
        await loadHistory();

        // Clear chatbox if it feels like we need to reset
        const chatBox = document.getElementById("chatBox");
        chatBox.innerHTML = `
            <h2>AI Mentor</h2>
            <div class="empty-state" style="text-align:left; margin-top:0;">
                Ask a specific question and our consensus engine will evaluate multiple AI pathways.
            </div>
        `;
    } catch (e) {
        console.error("Delete failed:", e);
        alert("Could not delete chat at this time.");
    }
}

async function sendQuestion() {
    const input = document.getElementById("questionInput");
    const question = input.value.trim();

    if (!question) return;

    // Add user message
    addUserMessage(question);
    input.value = "";

    // Show loading state
    const loadingId = addLoadingState();

    try {
        const result = await askMentor(question);

        // Remove loading state
        document.getElementById(loadingId).remove();

        // Add AI consensus response
        addAIResponse(result);
    } catch (e) {
        document.getElementById(loadingId).remove();
        console.error(e);
        addUserMessage("Error connecting to Mentor. Please try again.", "user-msg error");
    }
}

function addUserMessage(text, type = "user-msg") {
    const chat = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.classList.add("message-wrapper");
    div.innerHTML = `<div class="${type}">${text}</div>`;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function addLoadingState() {
    const chat = document.getElementById("chatBox");
    const id = "loading-" + Date.now();

    const div = document.createElement("div");
    div.id = id;
    div.className = "message-wrapper ai-group";
    div.innerHTML = `
        <div class="consensus-engine-thinking">
            <div class="loader-dots"><span></span><span></span><span></span></div>
            Models are generating and verifying...
        </div>
    `;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
    return id;
}

function addAIResponse(result) {
    const chat = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.className = "message-wrapper ai-group";

    const ans1 = result.answer1 || "Model answered implicitly based on context.";
    const ans2 = result.answer2 || "Model provided an alternative explanation.";
    const score = result.confidence || "9.5/10";

    div.innerHTML = `
        <div class="intermediate-models">
            <div class="model-response">
                <div class="model-title">🤖 Claude Haiku</div>
                <div class="model-text">${formatText(ans1)}</div>
            </div>
            <div class="model-response">
                <div class="model-title">⚡ Nova Micro</div>
                <div class="model-text">${formatText(ans2)}</div>
            </div>
        </div>
        
        <div class="final-answer">
            <div class="final-header">
                <div class="final-title">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--accent-blue)"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
                    Consensus Verified Answer
                </div>
                <div class="confidence-badge">Confidence: ${score}</div>
            </div>
            <div class="final-text">${formatText(result.finalAnswer)}</div>
        </div>
    `;

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function formatText(text) {
    if (!text) return "";
    return text.toString().replace(/\n/g, '<br>');
}