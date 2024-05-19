const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const { logger } = require("../config/logger");
const { config } = require("../config/env");

const app = express();

// Apply middleware
app.use(compression());
app.use(helmet());

const corsOptions = {
  origin: config.frontend_url,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  morgan("tiny", {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

app.get("/", (req, res) => {
  res.send("Gohighlevel assignment");
});

module.exports = app;
