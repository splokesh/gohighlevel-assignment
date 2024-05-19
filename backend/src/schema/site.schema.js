const mongoose = require("mongoose");

const sitesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
});

const Sites = mongoose.model("Sites", sitesSchema);

module.exports.Sites = Sites;
