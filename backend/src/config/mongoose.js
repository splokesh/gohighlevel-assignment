const mongoose = require("mongoose");

const { config } = require("./env");
const { logger } = require("./logger");

// MongoDB connection URL
const MONGODB_URI = config.mongo_url;

logger.info(`Mongo Url - ${MONGODB_URI}`);
// Create a Mongoose connection
const db = mongoose.connect(MONGODB_URI);

module.exports = db;
