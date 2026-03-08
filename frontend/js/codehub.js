let editor;

// Initialize CodeMirror on load
document.addEventListener("DOMContentLoaded", () => {
    editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
        mode: "python",
        theme: "dracula",
        lineNumbers: true,
        indentUnit: 4,
        matchBrackets: true,
        scrollbarStyle: "null"
    });

    // Default placeholder snippet
    editor.setValue("def hello_world():\n    print('Hello from Consensus Engine')\n\nhello_world()");
});

function updateLanguage() {
    const lang = document.getElementById("language").value;

    // Map dropdown to CodeMirror modes
    let modeMap = {
        "python": "python",
        "java": "text/x-java",
        "c": "text/x-csrc",
        "javascript": "javascript"
    };

    editor.setOption("mode", modeMap[lang] || "python");

    // Give user a helper snippet based on language selected
    if (lang === "python") {
        editor.setValue("def calculate():\n    return 42");
    } else if (lang === "java") {
        editor.setValue("public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello Java\");\n    }\n}");
    } else if (lang === "c") {
        editor.setValue("#include <stdio.h>\n\nint main() {\n    printf(\"Hello C\\n\");\n    return 0;\n}");
    }
}

async function runCode() {
    const language = document.getElementById("language").value;
    const code = editor.getValue();
    document.getElementById("output").innerText = "Executing in isolated backend environment...";

    try {
        const result = await runCodeAPI(language, code);
        if (result.error) {
            document.getElementById("output").innerText = "Server Error: " + result.error;
        } else {
            document.getElementById("output").innerText = result.output || result.explanation || result.analysis || "Execution completed without text output.";
        }
    } catch (e) {
        document.getElementById("output").innerText = "Network Error executing code via API: " + e.message;
    }
}

async function explainCode() {
    const language = document.getElementById("language").value;
    const code = editor.getValue();
    document.getElementById("output").innerText = "Requesting analysis from Consensus Models...";

    try {
        const result = await explainCodeAPI(language, code);
        if (result.error) {
            document.getElementById("output").innerText = "AI Server Error: " + result.error;
        } else {
            document.getElementById("output").innerText = result.explanation || "No explanation returned.";
        }
    } catch (e) {
        document.getElementById("output").innerText = "Network error fetching analysis via API: " + e.message;
    }
}

async function analyzeCode() {
    const language = document.getElementById("language").value;
    const code = editor.getValue();
    document.getElementById("output").innerText = "Running static analysis...";

    try {
        const result = await analyzeCodeAPI(language, code);
        if (result.error) {
            document.getElementById("output").innerText = "AI Server Error: " + result.error;
        } else {
            document.getElementById("output").innerText = result.analysis || "No analysis returned.";
        }
    } catch (e) {
        document.getElementById("output").innerText = "Network error fetching analysis via API: " + e.message;
    }
}