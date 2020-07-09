"use strict";

const express  = require('express');
const router   = express.Router();

const middlewares    = require('../middlewares');
const ReviewController = require('../controllers/review');


router.get('/', middlewares.checkAuthentication, ReviewController.list); // List all reviews
router.post('/', middlewares.checkAuthentication, ReviewController.create); // Create a new review
router.get('/:id', middlewares.checkAuthentication, ReviewController.read); // Read a review by Id
router.put('/:id', middlewares.checkAuthentication, ReviewController.update); // Update a review by Id
router.delete('/:id', middlewares.checkAuthentication, ReviewController.remove); // Delete a review by Id
router.get('/user/listByOwnerId', middlewares.checkAuthentication, ReviewController.listByOwnerId); // Read a review by Owner Id

module.exports = router;
