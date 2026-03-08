import { InvokeCommand } from "@aws-sdk/client-lambda"
import { lambdaClient } from "../config/aws.js"
import { pool } from "../config/db.js"

import fs from "fs"
import path from "path"
import { exec } from "child_process"
import { promisify } from "util"
import { randomUUID } from "crypto"
import os from "os"

const execPromise = promisify(exec);

// Execute Code via Native System
export async function runCode(user_id, language, code) {

    let output = ""
    let success = true;

    const tmpDir = os.tmpdir();
    const sessionId = randomUUID();

    try {
        if (language === "python" || language === "python3") {
            const filePath = path.join(tmpDir, `${sessionId}.py`);
            fs.writeFileSync(filePath, code);

            const { stdout, stderr } = await execPromise(`python3 ${filePath}`, { timeout: 5000 });
            output = stdout || stderr;
        }
        else if (language === "java") {
            const classNameMatch = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
            const className = classNameMatch ? classNameMatch[1] : "Main";

            const dirPath = path.join(tmpDir, sessionId);
            fs.mkdirSync(dirPath, { recursive: true });

            const filePath = path.join(dirPath, `${className}.java`);
            fs.writeFileSync(filePath, code);

            await execPromise(`javac ${filePath}`, { timeout: 5000 });
            const { stdout, stderr } = await execPromise(`java -cp ${dirPath} ${className}`, { timeout: 5000 });
            output = stdout || stderr;
        }
        else if (language === "c") {
            const filePath = path.join(tmpDir, `${sessionId}.c`);
            const exePath = path.join(tmpDir, `${sessionId}.out`);
            fs.writeFileSync(filePath, code);

            await execPromise(`gcc ${filePath} -o ${exePath}`, { timeout: 5000 });
            const { stdout, stderr } = await execPromise(`${exePath}`, { timeout: 5000 });
            output = stdout || stderr;
        }
        else {
            output = "Execution logic not found for language";
            success = false;
        }
    } catch (e) {
        output = e.stderr || e.stdout || e.message || "Execution Failed";
        success = false;
    }

    try {
        await pool.query(
            "INSERT INTO code_runs(user_id, language, code, output, success) VALUES($1, $2, $3, $4, $5)",
            [user_id, language, code, output, success]
        );
    } catch (e) {
        console.error("Failed to log code run to Postgres:", e.message);
    }

    return output;
}