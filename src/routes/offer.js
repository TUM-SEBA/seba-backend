"use strict";

const express  = require('express');
const router   = express.Router();

const middlewares    = require('../middlewares');
const OfferController = require('../controllers/offer');


router.get('/', middlewares.checkAuthentication, OfferController.list); // List all offers
router.get('/available', middlewares.checkAuthentication, OfferController.listAvailable); // List all available offers
router.get('/interested', middlewares.checkAuthentication, OfferController.listInterested); // List all interested offers
router.get('/not-interested', middlewares.checkAuthentication, OfferController.listNotInterested); // List all not interested offers
router.post('/', middlewares.checkAuthentication, OfferController.create); // Create a new offer
router.get('/:id', middlewares.checkAuthentication, OfferController.read); // Read an offer by Id
router.get('/user/listByOwnerId', middlewares.checkAuthentication, OfferController.listByOwnerId); // Read an offer by Owner Id
router.put('/:id', middlewares.checkAuthentication, OfferController.update); // Update an offer by Id
router.put('/accept/:id', middlewares.checkAuthentication, OfferController.accept); // Update an offer by Id
router.put('/not-interested/:id', middlewares.checkAuthentication, OfferController.updateNotInterested); // Update an offer by Id
router.delete('/:id', middlewares.checkAuthentication, OfferController.remove); // Delete an offer by Id


module.exports = router;
