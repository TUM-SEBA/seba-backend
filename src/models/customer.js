"use strict";

const mongoose = require("mongoose");

// Define the Customer schema
const CustomerSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
  },
  phoneNumber: {
    type: String
  },
  address: {
    type: String
  },
  feedbacksGiven: {
    type: Number,
    default: 0
  },
  starsRecieved: {
    type: Number,
    default: 0
  },
  badgesEarned: {
    type: [{ badgeId: mongoose.Schema.Types.ObjectId, date: Date }],
    ref: "Badge",
  },
  interestedOffers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Offer' }]
});

CustomerSchema.set("versionKey", false);

// Export the Customer model
module.exports = mongoose.model("Customer", CustomerSchema);
