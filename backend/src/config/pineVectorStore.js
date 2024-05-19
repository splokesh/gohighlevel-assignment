const { OpenAIEmbeddings } = require("@langchain/openai");
const { PineconeStore } = require("@langchain/pinecone");
const { config } = require("./env");

const embeddings = new OpenAIEmbeddings({
  apiKey: config.open_apikey,
  stripNewLines: true,
});

module.exports.embedAndStoreDocs = async function embedAndStoreDocs(
  client,
  docs,
  namespace
) {
  /* create and store the embeddings in the vectorStore */
  try {
    const index = client.Index(config.pinecone.index_name);

    //embed the PDF documents
    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      textKey: "text",
      namespace,
    });
  } catch (error) {
    console.log("error ", error);
    throw new Error("Failed to load your docs !");
  }
};

// Returns vector-store handle to be used a retrievers on langchains
module.exports.getVectorStore = async function getVectorStore(
  client,
  namespace
) {
  try {
    const embeddings = new OpenAIEmbeddings();
    const index = client.Index(config.pinecone.index_name);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex: index,
      textKey: "text",
      namespace,
    });

    return vectorStore;
  } catch (error) {
    console.log("error ", error);
    throw new Error("Something went wrong while getting vector store !");
  }
};
