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
  email: {
    type:String,
    required: true,
    unique: true,
  },
  phoneNumber: {
    type: String
  },
  address: {
    type: String
  },
  confirmed: {
    type: Boolean,
    default: false
  },
  shouldChangePassword: {
    type: Boolean,
    default: false
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
  newBadgeRecieved: {
    type: Boolean,
    default: false
  }
});

CustomerSchema.set("versionKey", false);

// Export the Customer model
module.exports = mongoose.model("Customer", CustomerSchema);
