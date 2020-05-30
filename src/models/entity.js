"use strict";

const mongoose = require("mongoose");

// Define the entity schema
const EntitySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  description: {
    type: String,
  },
  images: {
    type: [String],
  },
  breed: {
    type: String,
  },
});

// Export the Entity model
module.exports = mongoose.model("Entity", EntitySchema);
