const winston = require("winston");
const { config } = require("./env");

function getFormatter() {
  if (config.env === "production") {
    return winston.format.combine(winston.format.simple());
  } else {
    return winston.format.combine(
      winston.format.colorize(),
      winston.format.splat(),
      winston.format.simple()
    );
  }
}
// Winston logger configuration
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    // new winston.transports.File({ filename: 'combined.log' }), // Log to file
  ],
  format: getFormatter(),
});

module.exports.logger = logger;
