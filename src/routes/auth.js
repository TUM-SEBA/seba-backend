"use strict";

const express = require('express');
const router = express.Router();

const middlewares = require('../middlewares');
const AuthController = require('../controllers/auth');

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.get('/confirm/:token', AuthController.confirm);
router.get('/me', middlewares.checkAuthentication, AuthController.me);
router.get('/mybadges', middlewares.checkAuthentication, AuthController.mybadges);
router.put('/forgotPass', AuthController.forgotPass);
router.put('/update', middlewares.checkAuthentication, AuthController.update);
router.get('/logout', middlewares.checkAuthentication, AuthController.logout);

module.exports = router;