"use strict";

const express  = require('express');
const router   = express.Router();

const middlewares    = require('../middlewares');
const EntityController = require('../controllers/entity');


router.get('/', middlewares.checkAuthentication, EntityController.list); // List all entities
router.post('/', middlewares.checkAuthentication, EntityController.create); // Create a new entity
router.get('/:id', middlewares.checkAuthentication, EntityController.read); // Read a entity by Id
router.put('/:id', middlewares.checkAuthentication, EntityController.update); // Update a entity by Id
router.delete('/:id', middlewares.checkAuthentication, EntityController.remove); // Delete a entity by Id


module.exports = router;
