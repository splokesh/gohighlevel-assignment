const httpStatus = require("http-status");
const { config } = require("./env");

class HttpException extends Error {
  constructor(status = undefined, message) {
    super(message);
    this.status = status;
    if (!this.status) {
      this.status = httpStatus.INTERNAL_SERVER_ERROR;
    }
    if (
      config.env === "production" &&
      this.status === httpStatus.INTERNAL_SERVER_ERROR
    ) {
      message = "Internal Server Error";
    }
  }
}

module.exports.HttpException = HttpException;
