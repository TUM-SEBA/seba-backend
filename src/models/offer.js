"use strict";

const mongoose = require("mongoose");

// Define the entity schema
const EntitySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  approveBiddingRequestId: {
    type: String,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entity",
  },
  reviewId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Review",
  },
  status: {
    type: String,
  },
  description: {
    type: String,
  },
  createdDate: {
    type: Date,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  insurance: {
    type: Boolean,
  },
});

// Export the Entity model
module.exports = mongoose.model("Offer", EntitySchema);
