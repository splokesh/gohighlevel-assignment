const express = require("express");
const mongoose = require("mongoose");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence, RunnableMap } = require("@langchain/core/runnables");
const { ChatOpenAI } = require("@langchain/openai");
const { StringOutputParser } = require("@langchain/core/output_parsers");

const { catchAsync } = require("../config/catchAsync");
const { RabbitMQManager } = require("../config/amqp");
const { Sites } = require("../schema/site.schema");
const httpStatus = require("http-status");
const { redisClient } = require("../config/redis");
const { config } = require("../config/env");
const { getPineconeClient } = require("../config/pinecone");
const { getVectorStore } = require("../config/pineVectorStore");
const crawlerRoutes = express.Router();

// Inserts Url to the Queue
crawlerRoutes.post(
  "/crawl",
  catchAsync(async (req, res) => {
    const { name, url } = req.body;

    const site = await Sites.aggregate([
      {
        $match: {
          $or: [{ name }, { url }],
        },
      },
    ]);

    if (site.length) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Site already vectorised",
        data: site,
      });
    }

    const siteData = await Sites.create({ name, url });

    await redisClient.set(`kb:${siteData._id}`, JSON.stringify(siteData));
    await redisClient.expire(`kb:${siteData._id}`, 60 * 60 * 4);

    console.log("???", siteData);
    await new RabbitMQManager().crawlerPublisher({
      depth: config.crawl_depth,
      id: siteData._id,
      url,
    });

    return res.json({
      message: "Site already vectorised",
      data: siteData,
    });
  })
);

const convertDocsToString = (documents) => {
  return documents
    .map((document) => {
      return `<doc>\n${document.pageContent}\n</doc>`;
    })
    .join("\n");
};

crawlerRoutes.post(
  "/answer-question",
  catchAsync(async (req, res) => {
    const { question, id } = req.body;
    console.log({ question, id, v: mongoose.Types.ObjectId.isValid({ id }) });

    if (!mongoose.Types.ObjectId.isValid({ id })) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Invalid ObjectId",
        data: null,
      });
    }

    const site = await Sites.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    if (!site) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Site doesn't exists",
        data: null,
      });
    }

    const namespace = id;
    const sanitizedQuestion = question.trim().replaceAll("\n", " ");
    const pineconeClient = await getPineconeClient();
    const vectorStore = await getVectorStore(pineconeClient, namespace);

    const retriever = vectorStore.asRetriever({
      searchKwargs: { namespace },
    });

    const documentRetrievalChain = RunnableSequence.from([
      (input) => input.question,
      retriever,
      convertDocsToString,
    ]);

    const TEMPLATE_STRING = `
    You are an enthusiastic and experienced AI assistant, skilled at interpreting and answering questions based on provided sources. 
    Use the following pieces of context to answer the user's question thoroughly and to the best of your ability using only the resources provided. 
    If you don't know the answer, just say you don't know. DO NOT try to make up an answer. If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

    You are referring to {websiteName} at url {url}
    
    {context}
    
    Question: {question}
    
    Helpful answer in markdown:`;

    const answerGenerationPrompt =
      ChatPromptTemplate.fromTemplate(TEMPLATE_STRING);

    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo-1106",
      apiKey: config.open_apikey,
    });

    const retrievalChain = RunnableSequence.from([
      {
        context: documentRetrievalChain,
        question: (input) => input.question,
        websiteName: (input) => input.websiteName,
        url: (input) => input.url,
      },
      answerGenerationPrompt,
      model,
      new StringOutputParser(),
    ]);

    const answer = await retrievalChain.invoke({
      question: sanitizedQuestion,
      websiteName: site.name,
      url: site.url,
    });

    console.log(answer);

    return res.json({
      // message: "Site already vectorised",
      data: answer,
    });
  })
);

module.exports.crawlerRoutes = crawlerRoutes;
