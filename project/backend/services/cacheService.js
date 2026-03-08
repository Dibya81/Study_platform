import { dynamo } from "../config/dynamo.js"
import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb"
import crypto from "crypto"

export function hashQuestion(question) {
    return crypto.createHash("sha256").update(question.trim().toLowerCase()).digest("hex")
}

export async function checkCache(question) {
    try {
        const hash = hashQuestion(question)

        const params = {
            TableName: "semantic_cache",
            Key: {
                question_hash: hash
            }
        }

        const data = await dynamo.send(new GetCommand(params))

        if (data.Item) {
            return data.Item
        }

        return null
    } catch (err) {
        console.error("DynamoDB Cache Read Error:", err.message)
        return null
    }
}

export async function saveCache(question, answer) {
    try {
        const hash = hashQuestion(question)

        const params = {
            TableName: "semantic_cache",
            Item: {
                question_hash: hash,
                question: question,
                answer: answer,
                created_at: new Date().toISOString()
            }
        }

        await dynamo.send(new PutCommand(params))
    } catch (err) {
        console.error("DynamoDB Cache Write Error:", err.message)
    }
}
