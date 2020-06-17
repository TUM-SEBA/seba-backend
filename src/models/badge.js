"use strict";

const mongoose = require("mongoose");

// Define the badge schema
const BadgeSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
  }
});

// Export the Badge model
module.exports = mongoose.model("Badge", BadgeSchema);