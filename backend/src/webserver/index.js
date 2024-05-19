const httpStatus = require("http-status");

const app = require("./app");
const { config } = require("../config/env");
const { logger } = require("../config/logger");
const { redisClient } = require("../config/redis");

require("../config/mongoose");

const routerV1 = require("./v1.routes");

const port = config.port;

logger.info(`-- Starting server -- ${Date()}`);

app.use("/api", routerV1);

const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

const healthcheck = {
  uptime: process.uptime(),
  message: "OK",
  timestamp: Date.now(),
};

app.get("/health", (req, res) => {
  try {
    res.send(healthcheck);
  } catch (error) {
    healthcheck.message = error;
    res.status(httpStatus.SERVICE_UNAVAILABLE).send(healthcheck);
  }
});

process.on("SIGTERM", () => {
  logger.error("SIGTERM signal received: closing HTTP server");
  redisClient.disconnect();
  server.close(() => {
    logger.info("HTTP server closed");
  });
});
