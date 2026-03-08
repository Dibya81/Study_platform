document.addEventListener("DOMContentLoaded", () => {
    // If already logged in natively, redirect to dashboard.
    // If legacy "demo-user" or "1" is stuck in storage from pre-auth history, purge it.
    const currentUser = localStorage.getItem("user_id");
    if (currentUser && currentUser !== "demo-user" && currentUser !== "1") {
        window.location.href = "../index.html";
    } else {
        localStorage.removeItem("user_id");
        localStorage.removeItem("user_name");
    }

    const loginForm = document.getElementById("loginForm");
    const nameInput = document.getElementById("nameInput");
    const loginBtn = document.getElementById("loginBtn");
    const errorMessage = document.getElementById("errorMessage");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = nameInput.value.trim();
        if (!name) return;

        loginBtn.disabled = true;
        loginBtn.textContent = "Connecting...";
        errorMessage.style.display = "none";

        try {
            const response = await fetch(`${API}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name })
            });

            if (!response.ok) {
                throw new Error("Failed to create user session");
            }

            const data = await response.json();

            // Save UUID in localStorage
            localStorage.setItem("user_id", data.user_id);
            localStorage.setItem("user_name", data.name);

            // Redirect to main dashboard
            window.location.href = "../index.html";

        } catch (err) {
            console.error("Login failed:", err);
            errorMessage.textContent = err.message;
            errorMessage.style.display = "block";
            loginBtn.disabled = false;
            loginBtn.textContent = "Start Learning";
        }
    });
});
