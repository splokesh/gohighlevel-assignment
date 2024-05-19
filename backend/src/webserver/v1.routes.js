const express = require("express");
const { crawlerRoutes } = require("./crawl.api");
const { siteRoutes } = require("./site.api");

const routerV1 = express.Router();

const publicRoutes = [
  {
    path: "/",
    route: crawlerRoutes,
  },
  {
    path: "/site",
    route: siteRoutes,
  },
];

publicRoutes.forEach(({ path, route }) => {
  routerV1.use(path, route);
});

module.exports = routerV1;
