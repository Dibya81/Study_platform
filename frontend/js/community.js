let localPosts = [];

async function loadFeed() {
    const feed = document.getElementById("feed");
    feed.innerHTML = "";

    try {
        const posts = await getCommunityFeed();

        if (!posts || posts.length === 0) {
            feed.innerHTML = `
                <div style="text-align:center; padding: 60px; border: 1px dashed rgba(255,255,255,0.1); border-radius: var(--radius-lg); color: var(--text-secondary);">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 16px; opacity: 0.5;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <p>No posts yet. Share your thoughts to start the feed!</p>
                </div>
            `;
            return;
        }

        posts.forEach((post, i) => {
            const div = document.createElement("div");
            div.className = "post-card";
            div.style.animationDelay = `${i * 0.05}s`;

            const usernameStr = post.username || post.title || post.author || "User";
            const avatarInitial = usernameStr.charAt(0).toUpperCase();
            const dateStr = post.created_at ? new Date(post.created_at).toLocaleString() : "Just now";

            div.innerHTML = `
                <div class="post-header">
                    <div class="post-user-info">
                        <div class="avatar-placeholder">${avatarInitial}</div>
                        <div>
                            <div class="post-username">${escapeHTML(usernameStr)} ${post.is_verified ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="#4ade80" stroke="#0a0a0b" stroke-width="2" style="vertical-align: middle; margin-left: 4px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>' : ''}</div>
                            <div class="post-time">${dateStr}</div>
                        </div>
                    </div>
                </div>
                <div class="post-content">${escapeHTML(post.content || '').replace(/\n/g, '<br>')}</div>
                
                <div class="interaction-bar">
                    <button class="interact-btn" onclick="toggleLike(this)">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                        <span>${post.upvotes || 0}</span>
                    </button>
                    <button class="interact-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Comment
                    </button>
                    <button class="interact-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                        Share
                    </button>
                </div>
            `;

            feed.appendChild(div);
        });
    } catch (e) {
        console.error("Failed to load community feed", e);
        feed.innerHTML = `<div style="text-align:center; padding: 20px; color: var(--text-secondary);">Failed to connect to the Community API layer.</div>`;
    }
}

function toggleLike(btn) {
    const span = btn.querySelector('span');
    let count = parseInt(span.innerText);
    const svg = btn.querySelector('svg');

    if (svg.getAttribute('fill') === 'none') {
        svg.setAttribute('fill', '#ef4444');
        svg.setAttribute('stroke', '#ef4444');
        span.innerText = count + 1;
        span.style.color = '#ef4444';
    } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        span.innerText = count - 1;
        span.style.color = 'var(--text-secondary)';
    }
}

async function createPost() {
    const titleInput = document.getElementById("postUsername"); // Repurposed as post Title / username
    const contentInput = document.getElementById("postContent");

    const title = titleInput.value.trim() || localStorage.getItem("user_name") || "Guest User";
    const content = contentInput.value.trim();

    if (!content) return;

    const btn = document.querySelector(".post-actions button");
    const originalText = btn.innerHTML;
    btn.innerHTML = "Posting...";
    btn.disabled = true;

    try {
        await createPostAPI(title, content);
        contentInput.value = "";
        await loadFeed();
    } catch (e) {
        console.error("Failed to create post API", e);
        alert("Could not reach backend to save the post.");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag])
    );
}

// Initial load
loadFeed();