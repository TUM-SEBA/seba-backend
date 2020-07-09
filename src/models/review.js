"use strict";

const mongoose = require('mongoose');


// Define the review schema
const ReviewSchema  = new mongoose.Schema({
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Offer'
  },
  caretaker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
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
