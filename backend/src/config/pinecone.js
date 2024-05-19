const PineconeClient = require("@pinecone-database/pinecone").Pinecone;
const { config } = require("./env");

let pineconeClientInstance = null;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Create pineconeIndex if it doesn't exist
async function createIndex(client, indexName) {
  try {
    await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: 1536,
        metric: "cosine",
      },
    });
    console.log(
      `Waiting for ${config.pinecone.index_init_timeout} seconds for index initialization to complete...`
    );
    await delay(config.pinecone.index_init_timeout);
    console.log("Index created !!");
  } catch (error) {
    console.error("error ", error);
    throw new Error("Index creation failed");
  }
}

async function initPineconeClient() {
  try {
    const pineconeClient = new PineconeClient({
      apiKey: config.pinecone.api_key,
    });
    const indexName = config.pinecone.index_name;

    const existingIndexes = await pineconeClient.listIndexes();

    if (
      !(existingIndexes?.indexes || [])
        .map(({ name }) => name)
        .includes(indexName)
    ) {
      createIndex(pineconeClient, indexName);
    } else {
      console.log("Your index already exists. nice !!");
    }

    return pineconeClient;
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone Client");
  }
}

module.exports.getPineconeClient = async function getPineconeClient() {
  if (!pineconeClientInstance) {
    pineconeClientInstance = await initPineconeClient();
  }

  return pineconeClientInstance;
};
