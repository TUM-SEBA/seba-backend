"use strict";

const mongoose = require("mongoose");

// Define the offer schema
const OfferSchema = new mongoose.Schema({
  offerNumber: {
    type: String,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
  },
  approveBiddingRequestId: {
    type: String,
  },
  entity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entity",
  },
  review: {
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
  title: {
    type: String,
  },
});

// Export the Offer model
module.exports = mongoose.model("Offer", OfferSchema);
