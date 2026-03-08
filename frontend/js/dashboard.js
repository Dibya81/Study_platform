// Scroll reveal animation

const reveals = document.querySelectorAll(".reveal")

window.addEventListener("scroll", revealElements)
// Also trigger once on load
window.addEventListener("load", revealElements)

function revealElements() {

    reveals.forEach(el => {

        const top = el.getBoundingClientRect().top
        const windowHeight = window.innerHeight

        if (top < windowHeight - 50) {

            el.classList.add("active")

        }

    })

}


// --- Parallax 3D Core ---
const core = document.getElementById("consensusCore");
window.addEventListener("scroll", () => {
    if (!core) return;
    const scrollY = window.scrollY;
    // Rotate the 3D core liquid shape as the user scrolls
    const rotX = scrollY * 0.05;
    const rotY = scrollY * 0.1;
    core.style.transform = `translate(-50%, -50%) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.1, 1.1, 1.1)`;
});

// 3D Tilt Effect for new Celestial Cards & Bento Cards
const cards = document.querySelectorAll('.celestial-card, .bento-card');
const foilBadges = document.querySelectorAll('.foil-badge');

cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10; // Exaggerated 10 deg gravity tilt
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

        // Holographic Shimmer mapping if it's a foil badge
        if (card.classList.contains('foil-badge')) {
            const angle = Math.atan2(y - centerY, x - centerX) * (180 / Math.PI) + 180;
            requestAnimationFrame(() => {
                card.style.setProperty('--foil-angle', `${angle}deg`);
                // Dynamically injecting a temporary background gradient update for the foil effect
                card.style.background = `
                    linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)),
                    conic-gradient(from ${angle}deg at ${x}px ${y}px, var(--accent-blue), var(--accent-purple), transparent, var(--accent-blue))
                `;
            });
        }
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        if (card.classList.contains('foil-badge')) {
            card.style.background = 'var(--bg-surface)';
        }
    });
});

// Terminal Melting Typewriter Effect
document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.querySelector('.typewrite-effect');
    if (!terminal) return;

    // We store the original HTML, clear it out, and then append characters simulating a melting glow drop-in
    const codes = [
        '<span style="color:#94A3B8">// Python, Java, C Sandbox</span><br>',
        '<span style="color:#A855F7">import</span> CodeEnv<br>',
        '<span>run(</span><span style="color:#4ade80">"hello_world.py"</span><span>)</span><br>'
    ];

    // Clear terminal except cursor
    terminal.innerHTML = '<span class="fluid-cursor"></span>';
    const cursor = terminal.firstChild;

    let delay = 1000; // start delay

    const typeLine = (htmlLine, lineDelay) => {
        setTimeout(() => {
            // Because we have spans, we'll just inject the whole line but give it a melting fadeIn animation
            const el = document.createElement('div');
            el.innerHTML = htmlLine;
            el.style.opacity = '0';
            el.style.filter = 'blur(10px)';
            el.style.display = 'inline-block';
            el.style.marginRight = '8px';
            el.style.transition = 'opacity 0.4s ease, filter 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.4s';
            el.style.transform = 'translateY(-10px)';

            terminal.insertBefore(el, cursor);

            // Trigger reflow
            void el.offsetWidth;

            requestAnimationFrame(() => {
                el.style.opacity = '1';
                el.style.filter = 'blur(0)';
                el.style.transform = 'translateY(0)';
            });
        }, lineDelay);
    };

    let accumulatedDelay = delay;
    codes.forEach(line => {
        typeLine(line, accumulatedDelay);
        accumulatedDelay += 1200; // Typewriter line speed
    });
});