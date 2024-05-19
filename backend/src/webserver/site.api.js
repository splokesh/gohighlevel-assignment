const express = require("express");
const mongoose = require("mongoose");
const { catchAsync } = require("../config/catchAsync");
const { Sites } = require("../schema/site.schema");
const httpStatus = require("http-status");
const { redisClient } = require("../config/redis");
const { getPineconeClient } = require("../config/pinecone");
const { config } = require("../config/env");
const siteRoutes = express.Router();

siteRoutes.get("/", async (req, res) => {
  const sites = await Sites.find({}).limit(30);
  return res.json({
    message: "Sites fetched",
    data: sites,
  });
});

siteRoutes.delete(
  "/:id",
  catchAsync(async (req, res) => {
    const { id } = req.params;

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

    const pineconeClient = await getPineconeClient();
    const index = pineconeClient.Index(config.pinecone.index_name);

    await Promise.all([
      redisClient.del(`kb:${id}`),
      redisClient.del(id),
      Sites.deleteMany({ _id: site._id }),
      index.namespace(id).deleteAll(),
    ]);

    return res.json({
      message: "Site deleted",
      data: null,
    });
  })
);

module.exports.siteRoutes = siteRoutes;
