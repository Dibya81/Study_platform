async function loadProgress() {
    const stats = document.getElementById("stats");
    try {
        const progress = await getProgress();
        const total = progress.total_questions || 0;
        const latest = progress.latest_question || "No learning activity yet";

        stats.innerHTML = `
            <div class="stat-card floating-card holographic-badge" style="animation-delay: 0s">
                <div class="stat-title">Total Questions Asked</div>
                <div class="stat-value">${total}</div>
            </div>
            <div class="stat-card floating-card holographic-badge" style="animation-delay: 0.1s; grid-column: span 2;">
                <div class="stat-title">Latest Topic</div>
                <div class="stat-value" style="font-size: 16px; margin-top: 10px; font-weight: 500; font-family: var(--font-ui); color: var(--text-primary);">${latest}</div>
            </div>
        `;
    } catch (e) {
        console.error("Failed to load progress:", e);
        stats.innerHTML = `<div class="stat-card floating-card"><div class="stat-title">Error</div><div class="stat-value">Failed to load data</div></div>`;
    }

    // Initialize the holographic bounding box listeners right after injecting to DOM
    bindHolographicBadges();

    // Calculate streak based on total questions (simple approximation for minimum feature)
    let currentStreak = 0;
    try {
        const progress = await getProgress();
        if (progress && progress.total_questions > 0) {
            currentStreak = 1;
        }
    } catch (e) { }

    // Explicitly set streak and chart
    document.getElementById("currentStreak").innerHTML = `${currentStreak} <span class="streak-flame">🔥</span>`;
    document.getElementById("maxStreak").innerHTML = `${currentStreak} <span class="streak-flame">✨</span>`;

    // Add minimal progress purely for visual
    const chart = document.getElementById("progressChart");
    if (currentStreak > 0) {
        chart.style.background = `conic-gradient(var(--accent-blue) 0% 15%, rgba(255,255,255,0.05) 15% 100%)`;
        document.getElementById("chartLabel").innerText = "15%";
    } else {
        chart.style.background = `conic-gradient(rgba(255,255,255,0.05) 0% 100%)`;
        document.getElementById("chartLabel").innerText = "0%";
    }
}

async function loadSkills() {
    const skillsDiv = document.getElementById("skills");
    skillsDiv.innerHTML = `<div style="color:var(--text-secondary); font-size: 14px; padding: 20px;">No recent activity found. Start learning to build your timeline!</div>`;
}

async function loadRecommendation() {
    const recBox = document.getElementById("recommendation");
    recBox.innerHTML = `Keep asking the AI Mentor questions to generate your personalized recommendations!`;
}

loadProgress();
loadSkills();
loadRecommendation();

/** Holographic Foil Hover Logic **/
function bindHolographicBadges() {
    const badges = document.querySelectorAll('.holographic-badge');
    badges.forEach(badge => {
        badge.addEventListener('mousemove', (e) => {
            const rect = badge.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Map the mouse coordinates to percentage variants for the CSS conic-backgrounds
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            badge.style.setProperty('--x', `${xPercent}%`);
            badge.style.setProperty('--y', `${yPercent}%`);
        });
    });
}