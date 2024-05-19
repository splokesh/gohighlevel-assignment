const amqplib = require("amqplib");
const { config } = require("./env");
const { logger } = require("./logger");

const QUEUE_NAME = "CRAWL_WEBPAGE";

class RabbitMQManager {
  constructor() {
    this.connection = null;
    this.crawlerChannel = null;
  }

  async initialize() {
    if (!this.connection) {
      logger.info(`AMQP URL - ${config.amqp_url}`);
      this.connection = await amqplib.connect(config.amqp_url);
    }

    await this.crawlerQueue();
    return this.connection;
  }

  async crawlerQueue() {
    this.crawlerChannel = await this.connection.createChannel();
    await this.crawlerChannel.assertQueue(QUEUE_NAME);
  }

  async crawlerPublisher(param) {
    await this.initialize();

    this.crawlerChannel.sendToQueue(
      QUEUE_NAME,
      Buffer.from(JSON.stringify(param))
    );
  }

  async crawlerListener(fn) {
    await this.initialize();

    this.crawlerChannel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          await fn(JSON.parse(msg.content.toString()));
        } else {
          logger.error("Consumer cancelled by server");
        }
      },
      { noAck: true }
    );
  }
}

module.exports.RabbitMQManager = RabbitMQManager;
