"use strict";

const express  = require('express');
const router   = express.Router();

const middlewares    = require('../middlewares');
const BadgeController = require('../controllers/badge');

router.get('/', BadgeController.list); // List all badges available
router.get('/:id', middlewares.checkAuthentication, BadgeController.read); // Get a badge by Id 
router.post('/', middlewares.checkAuthentication, BadgeController.create); // Create a new badge
router.put('/:id', middlewares.checkAuthentication, BadgeController.update); // Update a badge by Id
router.delete('/:id', middlewares.checkAuthentication, BadgeController.remove); // Delete a badge by Id

module.exports = router;