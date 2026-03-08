let history = [];
let isListening = false;
let recognition = null;

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false; // Set to true if you want it to keep listening

    recognition.onresult = async function (event) {
        setListeningState(false);
        const text = event.results[event.results.length - 1][0].transcript;

        document.getElementById("transcript").innerText = `"${text}"`;
        document.getElementById("micStatus").innerText = "Processing...";

        // Add user msg optimistically
        history.push({ role: "user", text });
        renderHistory();

        try {
            const result = await askMentor(text);
            const finalAns = result.finalAnswer || "I couldn't process that.";

            history.push({ role: "ai", text: finalAns });
            renderHistory();

            // Text to Speech
            speakText(finalAns);

            document.getElementById("micStatus").innerText = "Engine Ready";
        } catch (e) {
            document.getElementById("micStatus").innerText = "Error Processing";
            history.push({ role: "ai", text: "Error connecting to AI." });
            renderHistory();
        }
    };

    recognition.onerror = function (event) {
        console.error("Speech error", event);
        setListeningState(false);
        document.getElementById("micStatus").innerText = "Microphone Error";
    };

    recognition.onend = function () {
        if (isListening) setListeningState(false);
    }
} else {
    document.getElementById("micStatus").innerText = "Speech API Not Supported";
}

function setListeningState(state) {
    isListening = state;
    const btn = document.getElementById("micBtn");
    const panel = document.querySelector(".mic-panel");
    const status = document.getElementById("micStatus");

    if (isListening) {
        btn.classList.add("active");
        panel.classList.add("is-listening");
        status.innerText = "Listening...";
        document.getElementById("transcript").innerText = "Speak now...";
    } else {
        btn.classList.remove("active");
        panel.classList.remove("is-listening");
        status.innerText = "Engine Ready";
    }
}

function startVoice() {
    if (!recognition) {
        alert("Speech Recognition is not supported in this browser.");
        return;
    }

    if (isListening) {
        recognition.stop();
        setListeningState(false);
    } else {
        recognition.start();
        setListeningState(true);
    }
}

function speakText(text) {
    // If browser supports TTS
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        // Clean markdown if present
        utterance.text = text.replace(/[*_#`>~]/g, "").replace(/\n/g, " ");
        window.speechSynthesis.speak(utterance);
    }
}

function clearVoiceHistory() {
    history = [];
    renderHistory();
    document.getElementById("transcript").innerText = "Press the button to start speaking...";
}

function renderHistory() {
    const container = document.getElementById("voiceHistory");
    container.innerHTML = "";

    if (history.length === 0) {
        container.innerHTML = `<div class="empty-state">Your conversations will appear here.</div>`;
        return;
    }

    history.forEach(item => {
        const div = document.createElement("div");
        div.className = `chat-msg ${item.role === 'user' ? 'msg-user' : 'msg-ai'}`;

        let content = item.text.replace(/\n/g, '<br>');
        div.innerHTML = content;

        container.appendChild(div);
    });

    // Auto scroll to bottom
    container.scrollTop = container.scrollHeight;
}