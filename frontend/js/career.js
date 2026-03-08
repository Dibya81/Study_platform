async function loadCareers() {
    try {
        const careers = await getCareers();
        const list = document.getElementById("careerList");
        list.innerHTML = "";

        if (!careers || careers.length === 0) {
            list.innerHTML = `<div style="color:var(--text-secondary);">No careers available.</div>`;
            return;
        }

        careers.forEach((career, i) => {
            const div = document.createElement("div");
            div.className = "career-card";
            div.style.animationDelay = `${i * 0.05}s`;

            div.innerHTML = `
                <div class="career-title">${career.title}</div>
                <div class="career-desc">${career.description}</div>
            `;


            div.onclick = () => {
                // Remove active class from others
                document.querySelectorAll(".career-card").forEach(el => el.classList.remove("active"));
                div.classList.add("active");
                showCareer(career.title);
            };

            list.appendChild(div);
        });
    } catch (e) {
        console.error(e);
    }
}

async function showCareer(title) {
    const details = document.getElementById("careerDetails");
    details.innerHTML = `
        <div class="empty-state">
            <div class="loader-dots" style="margin-bottom:16px;"><span></span><span></span><span></span></div>
            <p>Loading roadmap for ${title}...</p>
        </div>
    `;

    try {
        const data = await getCareerDetails(title);

        const skillsHTML = (data.skills || []).map(skill => `<li>${skill}</li>`).join("");

        let resourcesHTML = "";
        if (data.resources && data.resources.length > 0) {
            resourcesHTML = data.resources.map(res => {
                let displayUrl = res;
                try {
                    displayUrl = new URL(res).hostname;
                } catch (e) { }
                return `<li><a href="${res}" target="_blank" style="color:var(--accent-blue); text-decoration:none;">${displayUrl}</a></li>`;
            }).join("");
        } else {
            resourcesHTML = `<li style="color:var(--text-secondary);">No external resources linked.</li>`;
        }

        let embedHtml = "";
        if (data.youtube_playlist) {
            embedHtml = `
            <div class="youtube-box" style="margin-top:24px;">
                <div class="youtube-info" style="margin-bottom:16px;">
                    <h4 style="margin:0; font-family:var(--font-display); font-size:18px;">Recommended Course</h4>
                    <p style="margin:4px 0 0 0; font-size:14px; color:var(--text-secondary);">Free comprehensive video series to master ${escapeHTML(data.title)}.</p>
                </div>
                <a href="${data.youtube_playlist}" target="_blank" class="btn-youtube">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"></polygon></svg>
                    📺 Watch Full Playlist
                </a>
            </div>
            `;
        }

        details.innerHTML = `
            <div class="roadmap-header">
                <div class="roadmap-title">${escapeHTML(data.title)}</div>
                <div class="roadmap-desc">${escapeHTML(data.description)}</div>
            </div>

            <div class="bento-road">
                <div class="bento-box">
                    <div class="bento-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        Required Skills
                    </div>
                    <ul class="bento-list">${skillsHTML}</ul>
                </div>
                
                <div class="bento-box">
                    <div class="bento-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                        Learning Resources
                    </div>
                    <ul class="bento-list">${resourcesHTML}</ul>
                </div>
            </div>

            ${embedHtml}
        `;
    } catch (e) {
        console.error("Roadmap Render Error:", e);
        details.innerHTML = `<div class="empty-state" style="color:#ef4444;">Failed to load roadmap details.</div>`;
    }
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

loadCareers();