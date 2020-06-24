"use strict";

const express  = require('express');
const router   = express.Router();

const middlewares    = require('../middlewares');
const BiddingRequestController = require('../controllers/biddingrequest');


router.get('/', BiddingRequestController.list); // List all bidding requests
router.get('/offer/:id', middlewares.checkAuthentication, BiddingRequestController.listByOffer); // List bidding request by offer id
router.post('/', middlewares.checkAuthentication, BiddingRequestController.create); // Create a new bidding request
router.get('/:id', middlewares.checkAuthentication, BiddingRequestController.read); // Read a bidding request by Id
router.put('/:id', middlewares.checkAuthentication, BiddingRequestController.update); // Update a bidding request by Id
router.delete('/:id', middlewares.checkAuthentication, BiddingRequestController.remove); // Delete a bidding request by Id


module.exports = router;
