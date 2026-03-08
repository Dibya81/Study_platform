import Redis from "ioredis"

export const redis = new Redis(process.env.REDIS_URL)

export async function getCache(key) {

    const data = await redis.get(key)

    if (!data) return null

    return JSON.parse(data)

}

export async function setCache(key, value) {

    await redis.set(
        key,
        JSON.stringify(value),
        "EX",
        3600
    )

}