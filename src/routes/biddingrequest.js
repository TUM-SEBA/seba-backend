"use strict";

const express  = require('express');
const router   = express.Router();

const middlewares    = require('../middlewares');
const BiddingRequestController = require('../controllers/biddingrequest');


router.get('/offer/:id', middlewares.checkAuthentication, BiddingRequestController.listByOffer); // List bidding request by offer id
router.post('/', middlewares.checkAuthentication, BiddingRequestController.create); // Create a new bidding request
router.get('/caretaker/:id', middlewares.checkAuthentication, BiddingRequestController.getCaretakerFromBiddingRequest); // Get caretaker from bidding request by Id

module.exports = router;
