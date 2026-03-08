let isPinned = localStorage.getItem('sidebarPinned') === 'true';
const sidebar = document.getElementById('mainSidebar');
const pinBtn = document.getElementById('pinBtn');

function openPage(page) {
    document.getElementById("workspaceFrame").src = `pages/${page}.html`;

    // Update active state
    document.querySelectorAll(".sidebar li").forEach(li => {
        li.classList.remove("active");
        if (li.getAttribute("onclick").includes(page)) {
            li.classList.add("active");
        }
    });

    // Auto-hide or completely hide Sidebar
    if (sidebar) {
        if (page === 'dashboard') {
            sidebar.style.display = 'none';
        } else {
            sidebar.style.display = 'flex';
            if (!isPinned) {
                sidebar.classList.add('collapsed');
            } else {
                sidebar.classList.remove('collapsed');
            }
        }
    }
}

// Set initial active state
document.addEventListener('DOMContentLoaded', () => {
    // Initial UI rules
    if (!isPinned && pinBtn) {
        pinBtn.classList.add('unpinned');
    }

    const listItems = document.querySelectorAll(".sidebar li");
    if (listItems.length > 0) {
        // By default openPage('dashboard') executes in iframe already, let's sync state
        listItems[0].classList.add("active");
        if (sidebar) sidebar.style.display = 'none';
    }

    // Pin Button logic
    if (pinBtn) {
        pinBtn.addEventListener('click', () => {
            isPinned = !isPinned;
            localStorage.setItem('sidebarPinned', isPinned);
            if (isPinned) {
                sidebar.classList.remove('collapsed');
                pinBtn.classList.remove('unpinned');
            } else {
                sidebar.classList.add('collapsed');
                pinBtn.classList.add('unpinned');
            }
        });
    }

    // Search logic
    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');
    const items = Array.from(document.querySelectorAll('#sidebarList li')).map(li => ({
        name: li.innerText,
        action: li.getAttribute('onclick')
    }));

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            if (!query) {
                searchResults.style.display = 'none';
                return;
            }

            const matches = items.filter(i => i.name.toLowerCase().includes(query));
            if (matches.length > 0) {
                searchResults.innerHTML = matches.map(m => `
                    <div class="search-result-item" onclick="${m.action.replace(/"/g, '&quot;')}; document.getElementById('searchResults').style.display='none'; document.getElementById('globalSearch').value='';">
                        ${m.name}
                    </div>
                `).join('');
                searchResults.style.display = 'flex';
            } else {
                searchResults.innerHTML = `<div class="search-result-item" style="color:var(--text-secondary)">No results found.</div>`;
                searchResults.style.display = 'flex';
            }
        });

        // Hide search when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
                searchResults.style.display = 'none';
            }
        });
    }
});

// Listen for messages from iframes to trigger parent routing
window.addEventListener('message', (event) => {
    if (event.data === 'open-aihub') {
        openPage('aihub');
    }
});

// --- Phase 2: 11/10 Global Interactions (Cursor & Theme Array) ---

document.addEventListener('DOMContentLoaded', () => {
    const mist = document.getElementById('cursorMist');
    const wipe = document.getElementById('themeWipe');
    const toggleBtn = document.getElementById('themeToggle');

    let isDark = false; // Ice White is default

    // 1. Cursor Mist (Iridescent Trailing)
    if (mist) {
        document.addEventListener('mousemove', (e) => {
            // Use requestAnimationFrame for smooth 8k performance feel
            requestAnimationFrame(() => {
                mist.style.left = `${e.clientX}px`;
                mist.style.top = `${e.clientY}px`;
            });
        });

        // Hide when mouse leaves window
        document.addEventListener('mouseout', (e) => {
            if (e.relatedTarget === null) {
                mist.style.opacity = '0';
            }
        });
        document.addEventListener('mouseover', () => {
            mist.style.opacity = '0.8';
        });
    }

    // Sync iframes on load to ensure theme consistency
    const iframe = document.getElementById('workspaceFrame');
    if (iframe) {
        iframe.addEventListener('load', () => {
            try {
                if (isDark) {
                    iframe.contentDocument.body.classList.add('dark-theme');
                } else {
                    iframe.contentDocument.body.classList.remove('dark-theme');
                }
            } catch (err) { }
        });
    }
});