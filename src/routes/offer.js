"use strict";

const express  = require('express');
const router   = express.Router();

const middlewares    = require('../middlewares');
const OfferController = require('../controllers/offer');


router.get('/available', middlewares.checkAuthentication, OfferController.listAvailable); // List all available offers
router.get('/interested', middlewares.checkAuthentication, OfferController.listInterested); // List all interested offers
router.get('/not-interested', middlewares.checkAuthentication, OfferController.listNotInterested); // List all not interested offers
router.get('/rejected', middlewares.checkAuthentication, OfferController.listRejected); // List all rejected offers
router.post('/', middlewares.checkAuthentication, OfferController.create); // Create a new offer
router.get('/:id', middlewares.checkAuthentication, OfferController.read); // Read an offer by Id
router.get('/user/listByOwnerId', middlewares.checkAuthentication, OfferController.listByOwnerId); // Read an offer by Owner Id
router.put('/accept/:id', middlewares.checkAuthentication, OfferController.accept); // Accept an offer by Id
router.put('/reject/:id', middlewares.checkAuthentication, OfferController.reject); // Reject an offer by Id
router.put('/paymentPending/:id', middlewares.checkAuthentication, OfferController.paymentPending); // Update an offer by Id
router.put('/completed/:id', middlewares.checkAuthentication, OfferController.completed); // Update an offer by Id
router.put('/closed/:id', middlewares.checkAuthentication, OfferController.closed); // Update an offer by Id
router.put('/disablenotification/:id', middlewares.checkAuthentication, OfferController.disablenotification); // Update an offer by Id
router.put('/not-interested/:id', middlewares.checkAuthentication, OfferController.updateNotInterested); // Update an offer by Id


module.exports = router;
