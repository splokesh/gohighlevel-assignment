const httpStatus = require("http-status");
const https = require("https");
const fs = require("fs");

const app = require("./app");
const { config } = require("../config/env");
const { logger } = require("../config/logger");
const { redisClient } = require("../config/redis");

const options = {
  key: fs.readFileSync("server.key"),
  cert: fs.readFileSync("server.cert"),
};

require("../config/mongoose");

const routerV1 = require("./v1.routes");

const port = config.port;

logger.info(`-- Starting server -- ${Date()}`);

app.use("/api", routerV1);

// Create HTTPS server
const serverSecure = https.createServer(options, app);

serverSecure.listen(port + 1, () => {
  logger.info("HTTPS Server running at https://localhost:443/");
});

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
  serverSecure.close(() => {
    logger.info("HTTPs server closed");
  });
});
