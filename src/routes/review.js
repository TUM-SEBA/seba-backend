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
router.get('/user/listByCaretakerId', middlewares.checkAuthentication, ReviewController.listByMyCaretakerId); // Read the reviews of the current user
router.get('/user/:id', middlewares.checkAuthentication, ReviewController.listByCaretakerId); // Read the reviews by Caretaker Id

module.exports = router;
