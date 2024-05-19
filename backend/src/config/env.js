const Joi = require("joi");
require("dotenv").config(); // If using dotenv for loading .env file

const schema = Joi.object({
  NODE_ENV: Joi.string().required().valid("development", "production"),
  PORT: Joi.number().default(8000),
  MONGO_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  AMQP_URL: Joi.string().required(),
  OPENAI_API_KEY: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().required(),
  CRAWL_DEPTH: Joi.number().required(),
  PINECONE_API_KEY: Joi.string().required(),
  PINECONE_INDEX_NAME: Joi.string().required(),
  INDEX_INIT_TIMEOUT: Joi.number().required(),
}).unknown(true); // Allow additional variables not defined in schema

// Load and validate environment variables
const { error, value: envVars } = schema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongo_url: envVars.MONGO_URL,
  redis_url: envVars.REDIS_URL,
  amqp_url: envVars.AMQP_URL,
  frontend_url: envVars.FRONTEND_URL,
  open_apikey: envVars.OPENAI_API_KEY,
  crawl_depth: envVars.CRAWL_DEPTH,
  pinecone: {
    api_key: envVars.PINECONE_API_KEY,
    index_name: envVars.PINECONE_INDEX_NAME,
    index_init_timeout: envVars.INDEX_INIT_TIMEOUT,
  },
};

module.exports.config = config;
