const Redis = require("ioredis");

const { config } = require("./env");
const { logger } = require("./logger");

logger.info(`Redis Url - ${config.redis_url}`);

const redisClient = new Redis(config.redis_url);

redisClient.on("error", (err) => {
  logger.error("Redis client error:", err);
});

redisClient.on("reconnecting", () => {
  logger.info("Redis client is trying to reconnect to the server");
});

redisClient.on("ready", () => {
  logger.info("Redis client is ready to use");
});

module.exports.redisClient = redisClient;
