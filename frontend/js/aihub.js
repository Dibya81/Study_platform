let currentConversation = [];
let chats = []; // Array of saved specific conversations

const API_BASE = "http://localhost:5001";

const chatWindow = document.getElementById("chatWindow");
const promptInput = document.getElementById("promptInput");
const chatHistoryList = document.getElementById("chatHistoryList");

async function init() {
    try {
        const history = await getHistory();
        if (history && history.length > 0) {
            chats = history.map(item => ({
                id: item.id || Date.now().toString() + Math.random(),
                title: (item.question || "Chat").substring(0, 30) + ((item.question && item.question.length > 30) ? "..." : ""),
                session: [
                    { role: "user", message: item.question },
                    { role: "judge", message: item.final_answer || "No final answer recorded." }
                ]
            }));
        }
    } catch (e) {
        console.error("Failed to load AI Hub history on init:", e);
    }
    renderHistorySidebar();
}

function startNewChat() {
    currentConversation = [];
    chatWindow.innerHTML = `
        <div class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5; margin-bottom: 24px;"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            <h3>Welcome to the Consensus Engine Hub</h3>
            <p>Ask a question. Three individual local AI models will process it to determine the optimal truth.</p>
        </div>
    `;
    promptInput.value = "";
    removeFile();
    document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
}

let attachedFileName = null;
let simulatedFileContent = null;

function handleHubFileUpload(input) {
    if (input.files && input.files[0]) {
        const file = input.files[0];
        attachedFileName = file.name;

        // Simulate extraction
        simulatedFileContent = `[Contents of ${file.name} extracted successfully.]`;

        document.getElementById("fileName").innerText = file.name;
        document.getElementById("filePreviewArea").style.display = "block";
    }
}

function removeFile() {
    attachedFileName = null;
    simulatedFileContent = null;
    document.getElementById("hubFileUpload").value = "";
    document.getElementById("filePreviewArea").style.display = "none";
}

async function sendPrompt() {
    let text = promptInput.value.trim();
    if (!text && !attachedFileName) return;

    if (attachedFileName) {
        text += `\n\nContext File [${attachedFileName}]:\n${simulatedFileContent}`;
    }

    // Clear empty state
    if (currentConversation.length === 0) {
        chatWindow.innerHTML = "";
    }

    // Add User Message to UI & State
    currentConversation.push({ role: "user", message: text });

    // UI Display (Truncate file contents visually so user doesn't see giant block)
    const uiText = attachedFileName ? `${promptInput.value.trim()}\n\n📎 Attached: ${attachedFileName}` : text;
    appendUserMessage(uiText);

    promptInput.value = "";
    removeFile();
    scrollToBottom();

    // Spawn Thinking Indicators
    const thinkingId = "think-" + Date.now();
    appendThinkingState(thinkingId);
    scrollToBottom();

    try {
        // Send to new backend Lambda proxy route
        const payload = {
            user_id: getUserId(),
            question: text
        };

        const res = await fetch(`${API_BASE}/api/ai/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("API failed");
        const jsonResponse = await res.json();

        // Remove thinking block
        const tkBlk = document.getElementById(thinkingId);
        if (tkBlk) tkBlk.remove();

        const data = jsonResponse.data;

        // Check if Judge returned properly from AWS Bedrock
        if (!data || !data.responses || data.responses.length < 2) {
            appendSystemMessage("Error: The consensus engine failed to return all required AI answers.");
            return;
        }

        const agent1 = data.responses[0];
        const agent2 = data.responses[1];

        currentConversation.push({ role: "ai1", message: agent1.content });
        currentConversation.push({ role: "ai2", message: agent2.content });
        currentConversation.push({ role: "judge", message: data.judge_explanation });

        appendConsensusBlock(jsonResponse.convoId, agent1, agent2, data.judge_explanation);

        saveChatToHistory(text);

    } catch (e) {
        console.error("Consensus Error", e);
        const tkBlk = document.getElementById(thinkingId);
        if (tkBlk) tkBlk.remove();
        appendSystemMessage("Looks like the backend disconnected or the AWS Server is offline.");
    }
}

// UI Appenders
function appendUserMessage(text) {
    const div = document.createElement("div");
    div.className = "msg-row user-row";
    div.innerHTML = `<div class="msg-bubble">${escapeHTML(text)}</div>`;
    chatWindow.appendChild(div);
}

function appendThinkingState(id) {
    const div = document.createElement("div");
    div.id = id;
    div.className = "thinking-row";
    div.innerHTML = `
        <div class="thinking-agent"><div class="ping"></div> AI Agent 1 is analyzing...</div>
        <div class="thinking-agent"><div class="ping"></div> AI Agent 2 is analyzing...</div>
        <div class="thinking-agent"><div class="ping" style="background:#4ade80;"></div> Judge AI waiting for consensus...</div>
    `;
    chatWindow.appendChild(div);
}

function appendConsensusBlock(convoId, agent1, agent2, judgeExplanation) {
    const blockId = "consensus-" + Date.now();
    const div = document.createElement("div");
    div.id = blockId;
    div.className = "consensus-block";

    const escapedAns1 = escapeHTML(agent1.content).replace(/'/g, "&#39;").replace(/"/g, "&quot;");
    const escapedAns2 = escapeHTML(agent2.content).replace(/'/g, "&#39;").replace(/"/g, "&quot;");

    // Contextual Glow Logic
    let a1Class = "agent-col floating-card";
    let a2Class = "agent-col floating-card";
    if (agent1.consensus_score > agent2.consensus_score) {
        a1Class += " glowing-winner";
    } else if (agent2.consensus_score > agent1.consensus_score) {
        a2Class += " glowing-winner";
    }

    div.innerHTML = `
        <div class="agents-split-view">
            <div class="${a1Class}">
                <div class="worker-identity" style="display:flex; justify-content:space-between; width:100%;">
                    <div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                        Agent 1 (${agent1.model_name})
                    </div>
                    <span style="background:rgba(99, 102, 241, 0.1); color:var(--accent-blue); padding: 2px 8px; border-radius: 10px; font-size: 11px;">
                        Score: ${agent1.consensus_score}
                    </span>
                </div>
                <div class="msg-bubble">${escapeHTML(agent1.content)}</div>
            </div>
            <div class="${a2Class}">
                <div class="worker-identity" style="display:flex; justify-content:space-between; width:100%;">
                    <div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                        Agent 2 (${agent2.model_name})
                    </div>
                    <span style="background:rgba(99, 102, 241, 0.1); color:var(--accent-blue); padding: 2px 8px; border-radius: 10px; font-size: 11px;">
                        Score: ${agent2.consensus_score}
                    </span>
                </div>
                <div class="msg-bubble">${escapeHTML(agent2.content)}</div>
            </div>
        </div>
        <div class="judge-block">
            <div class="judge-header">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Judge Verification (Amazon Nova Pro)
            </div>
            <div class="judge-answer">
                ${escapeHTML(judgeExplanation)}
            </div>
            <div class="actions-row">
                <button class="select-btn" id="btn-ans1-${blockId}">Use Answer 1</button>
                <button class="select-btn" id="btn-ans2-${blockId}">Use Answer 2</button>
            </div>
        </div>
    `;

    chatWindow.appendChild(div);

    // Attach strict event listeners safely avoiding raw HTML string quotes compilation errors
    document.getElementById(`btn-ans1-${blockId}`).addEventListener('click', () => {
        selectFinalAnswer(blockId, convoId, 1, agent1.content);
    });

    document.getElementById(`btn-ans2-${blockId}`).addEventListener('click', () => {
        selectFinalAnswer(blockId, convoId, 2, agent2.content);
    });

    scrollToBottom();
}

function appendSystemMessage(text) {
    const div = document.createElement("div");
    div.className = "msg-row system-row";
    div.innerHTML = `<div class="msg-bubble" style="color:#ef4444">${escapeHTML(text)}</div>`;
    chatWindow.appendChild(div);
    scrollToBottom();
}

// Interaction: Safely visually collapse the entire consensus pane into the selected text
async function selectFinalAnswer(blockId, convoId, choiceNum, text) {
    const consensusBlock = document.getElementById(blockId);
    if (!consensusBlock) return;

    consensusBlock.className = "msg-row system-row";
    consensusBlock.innerHTML = `
        <div class="worker-identity" style="color:var(--accent-blue)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
            Selected AI Agent ${choiceNum} as Final Answer
        </div>
        <div class="msg-bubble">${text}</div>
    `;
    scrollToBottom();

    // Persist this choice back to PostgreSQL to overwrite Judge
    try {
        if (convoId && convoId !== 'undefined' && convoId !== 'null') {
            await fetch(`${API_BASE}/mentor/update-answer`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ convoId, finalAnswer: text })
            });
            console.log("Overwrite successful.");
        }
    } catch (e) {
        console.error("Failed to commit final choice to database:", e);
    }
}

// Sidebar History Management
function saveChatToHistory(firstPrompt) {
    if (currentConversation.length <= 3) {
        chats.unshift({
            id: Date.now().toString(),
            title: firstPrompt.substring(0, 30) + "...",
            session: [...currentConversation]
        });
        renderHistorySidebar();
    }
}

function renderHistorySidebar() {
    chatHistoryList.innerHTML = chats.map(c => `
        <button class="history-item" onclick="loadChat('${c.id}')">${escapeHTML(c.title)}</button>
    `).join("");
}

function loadChat(id) {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    // Set UI Active
    document.querySelectorAll('.history-item').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    currentConversation = [...chat.session];
    chatWindow.innerHTML = "";

    // Simplistic re-render
    currentConversation.forEach(msg => {
        if (msg.role === "user") {
            appendUserMessage(msg.message);
        } else if (msg.role === "judge") {
            // Mock a collapsed view for history
            const div = document.createElement("div");
            div.className = "msg-row system-row";
            div.innerHTML = `
                <div class="worker-identity" style="color:var(--accent-blue)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    Historical Memory
                </div>
                <div class="msg-bubble">${escapeHTML(msg.message)}</div>
            `;
            chatWindow.appendChild(div);
        }
    });
    scrollToBottom();
}

function scrollToBottom() {
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function escapeHTML(str) {
    if (!str) return "";
    return str.toString().replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// Start
init();
