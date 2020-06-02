"use strict";

const express  = require('express');
const router   = express.Router();

const middlewares    = require('../middlewares');
const OfferController = require('../controllers/offer');


router.get('/', OfferController.list); // List all offers
router.post('/', middlewares.checkAuthentication, OfferController.create); // Create a new offer
router.get('/:id', middlewares.checkAuthentication, OfferController.read); // Read an offer by Id
router.get('/:userid', middlewares.checkAuthentication, OfferController.read); // Read an offer by Owner Id
router.put('/:id', middlewares.checkAuthentication, OfferController.update); // Update an offer by Id
router.delete('/:id', middlewares.checkAuthentication, OfferController.remove); // Delete an offer by Id


module.exports = router;
