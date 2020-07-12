"use strict";

const mongoose = require("mongoose");

// Define the entity schema
const BiddingRequestSchema = new mongoose.Schema({
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
  },
  caretaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  price: {
    type: Number,
  },
  remarks: {
    type: String,
  },
  rejected: {
    type: Boolean,
    default: false,
  }
});

// Export the Bidding Request model
module.exports = mongoose.model("BiddingRequest", BiddingRequestSchema);
