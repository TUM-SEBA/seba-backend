"use strict";

const mongoose = require('mongoose');


// Define the review schema
const ReviewSchema  = new mongoose.Schema({
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  caretaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  text: {
    type: String,
  },
  rating: {
    type: Number
  }
});


// Export the Review model
module.exports = mongoose.model('Review', ReviewSchema);
