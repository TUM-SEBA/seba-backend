"use strict";

const express = require('express');
const router = express.Router();

const middlewares = require('../middlewares');
const AuthController = require('../controllers/auth');

router.post('/login', AuthController.login); //Endpoint to login
router.post('/register', AuthController.register); //Endpoint to sign up a user
router.get('/confirm/:token', AuthController.confirm); //Endpoint to confirm customer and his email
router.get('/me', middlewares.checkAuthentication, AuthController.me); //Get the user profile
router.get('/mybadges', middlewares.checkAuthentication, AuthController.mybadges); //Get the user badges
router.put('/newbadge', middlewares.checkAuthentication, AuthController.checkForNewBadge); //Update user badges
router.put('/forgotPass', AuthController.forgotPass); //Change password if email exists and let the user update password randomly
router.put('/changePassword', middlewares.checkAuthentication, AuthController.changePassword); //Update the password with a new user typed password
router.put('/update', middlewares.checkAuthentication, AuthController.update); //Update the user document
router.get('/logout', middlewares.checkAuthentication, AuthController.logout); //Perform logout

module.exports = router;