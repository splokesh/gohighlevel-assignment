const puppeteer = require("puppeteer");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { Document } = require("langchain/document");
const { redisClient } = require("../config/redis");
const { RabbitMQManager } = require("../config/amqp");
const { logger } = require("../config/logger");
const { getPineconeClient } = require("../config/pinecone");
const { embedAndStoreDocs } = require("../config/pineVectorStore");

// async function isSameDomain(id, url) {
//   // Extract hostname from the URLs
//   const kb = JSON.parse(await redisClient.get(`kb:${id}`));
//   if (!kb) {
//     const metadata = await Sites.findOne({ _id: new ObjectId(id) });
//     if (metadata) {
//       await redisClient.set(`kb:${id}`, JSON.stringify(metadata));
//       await redisClient.expire(`kb:${siteData._id}`, 60 * 60 * 4);

//       kb = metadata;
//     }
//   }
//   const domain = new URL(`https://${kb.domain}`).hostname;
//   const hostname = new URL(url).hostname;

//   // Compare the hostnames
//   return domain === hostname;
// }

function preprocessText(text) {
  // Convert text to lowercase
  text = text.toLowerCase();

  // Remove punctuation
  text = text.replace(/[^\w\s]|_/g, "");

  // Handle special characters (if needed)
  // Example: Convert accented characters to their base form
  text = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  return text;
}

let browser;

const fn = async () => {
  const rabbitmq = new RabbitMQManager();

  const pineconeClient = await getPineconeClient();
  const resolution = {
    x: 1920,
    y: 1080,
  };

  const args = [
    "--disable-gpu",
    `--window-size=${resolution.x},${resolution.y}`,
    "--no-sandbox",
  ];

  browser = await puppeteer.launch({
    headless: "new",
    handleSIGINT: false,
    args: args,
  });

  rabbitmq.crawlerListener(async ({ depth, url, id }, ack) => {
    const page = await browser.newPage();

    try {
      await page.setViewport({
        width: resolution.x,
        height: resolution.y,
      });
      console.log({ depth, url, id });

      const alreadyVisited = await redisClient.sismember(id, url);
      console.log({ alreadyVisited });

      if (depth < 0 || alreadyVisited) {
        console.log("No more adding", { depth, alreadyVisited, url });
        return;
      }

      await page.goto(url, { waitUntil: "load", timeout: 0 });

      await redisClient.sadd(id, url);
      await redisClient.expire(id, 60 * 60 * 4);

      // ! Not Scarping recurssively
      // const links = await page.evaluate(() => {
      //   const links = Array.from(document.querySelectorAll("a"));
      //   return links.map((link) => link.href);
      // });

      // await Promise.all(
      //   links.map(async (link) => {
      //     const [isSame, isVisitedSite] = await Promise.all([
      //       isSameDomain(id, link),
      //       redisClient.sismember(id, link),
      //     ]);

      //     console.log({ link, isSame, isVisitedSite });
      //     if (isSame && !isVisitedSite) {
      //       logger.info(`Added URL - ${link}; depth - ${depth}`);

      //       await rabbitmq.crawlerPublisher({
      //         depth: depth - 1,
      //         id,
      //         url: link,
      //       });
      //     }
      //   })
      // );

      // Extract visible text content
      const visibleText = await page.evaluate(() => {
        const elements = document.querySelectorAll("*");

        let text = "";
        const dedupetext = new Set();

        elements.forEach((element) => {
          if (element.offsetWidth > 0 && element.offsetHeight > 0) {
            const innerText = element.innerText.trim();
            if (
              innerText &&
              !dedupetext.has(innerText) &&
              !["STYLE", "PATH", "SVG", "SCRIPT", "NOSCRIPT", "IMG"].includes(
                element.tagName
              )
            ) {
              text += innerText;
              dedupetext.add(innerText);
            }
          }
        });
        return text;
      });

      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 20,
        separators: [" ", "\n", "\t"],
      });

      const docs = await await splitter.splitDocuments([
        new Document({
          pageContent: preprocessText(visibleText),
          metadata: { source: url, id },
        }),
      ]);

      logger.info(`Loading ${docs.length} chunks into pinecone...`);
      await embedAndStoreDocs(pineconeClient, docs, id);

      logger.info(`Vectorised Url - ${url}`);
      return "Done";
    } catch (error) {
      console.log(error);
      logger.error(error);
    } finally {
      await page.close();
    }
  });
};

fn();

process.on("SIGTERM", () => {
  browser.close();
  redisClient.disconnect();
  logger.error("SIGTERM signal received: closing worker");
});
