const API = "http://localhost:5001"

function getUserId() {
    return localStorage.getItem("user_id");
}


async function askMentor(question) {

    const res = await fetch(API + "/mentor/ask", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            user_id: getUserId(),
            question
        })

    })

    if (!res.ok) throw new Error("Mentor API failed")

    return res.json()

}



async function runCodeAPI(language, code) {

    const res = await fetch(API + "/code/run", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            user_id: getUserId(),
            language,
            code
        })

    })

    return res.json()

}



async function explainCodeAPI(language, code) {

    const res = await fetch(API + "/code/explain", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            language,
            code
        })

    })

    return res.json()

}



async function analyzeCodeAPI(language, code) {

    const res = await fetch(API + "/code/analyze", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            language,
            code
        })

    })

    return res.json()

}



async function saveNoteAPI(title, content) {

    const res = await fetch(API + "/notes/create", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            user_id: getUserId(),
            title,
            content
        })

    })

    return res.json()

}



async function summarizeNoteAPI(note_id, content) {

    const res = await fetch(API + "/notes/summarize", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            note_id,
            content
        })

    })

    return res.json()

}



async function quizNoteAPI(note_id, content) {

    const res = await fetch(API + "/notes/quiz", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            note_id,
            content
        })

    })

    return res.json()

}



async function flashcardsAPI(note_id, content) {

    const res = await fetch(API + "/notes/flashcards", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            note_id,
            content
        })

    })

    return res.json()

}



async function getCommunityFeed() {

    const res = await fetch(API + "/community/feed")

    return res.json()

}



async function createPostAPI(title, content) {

    const res = await fetch(API + "/community/post", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            user_id: getUserId(),
            title,
            content
        })

    })

    return res.json()

}



async function getProgress() {

    const res = await fetch(API + "/progress/" + getUserId())

    return res.json()

}



async function getRecommendation() {

    const res = await fetch(API + "/recommend/" + getUserId())

    return res.json()

}



async function getCareers() {

    const res = await fetch(API + "/career/all")

    return res.json()

}



async function getCareerDetails(title) {

    const res = await fetch(
        API + "/career/" + encodeURIComponent(title)
    )

    return res.json()

}

async function getHistory() {
    const res = await fetch(API + "/mentor/history/" + getUserId());
    if (!res.ok) throw new Error("Failed to load history");
    return res.json();
}