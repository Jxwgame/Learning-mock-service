const { createClient } = require("redis");

let redisClient;

async function initRedis() {
  if (redisClient) return redisClient;

  redisClient = createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on("error", (err) => {
    console.error("Redis Client Error", err);
  });

  redisClient.on("connect", () => {
    console.log("Redis connecting...");
  });

  redisClient.on("ready", () => {
    console.log("Redis ready");
  });

  await redisClient.connect();
  console.log("Connected to Redis");

  return redisClient;
}

function getRedis() {
  if (!redisClient) {
    throw new Error("Redis not initialized. Call initRedis() first.");
  }
  return redisClient;
}

module.exports = { initRedis, getRedis };
