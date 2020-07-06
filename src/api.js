"use strict";

const express    = require('express');
const bodyParser = require('body-parser');
const helmet     = require('helmet');

const middlewares = require('./middlewares');
const fileUpload = require('express-fileupload');
const auth  = require('./routes/auth');
const entity = require('./routes/entity');
const review = require('./routes/review');
const offer = require('./routes/offer');
const badge = require('./routes/badge');
const biddingrequest = require('./routes/biddingrequest');

const api = express();

// Adding Basic Middlewares
api.use(fileUpload({
    createParentPath: true
}));
api.use(helmet());
api.use(bodyParser.json({limit : "50mb"}));
api.use(bodyParser.urlencoded({ limit : "50mb", extended: false }));
api.use(middlewares.allowCrossDomain);


// Basic route
api.get('/', (req, res) => {
    res.json({
        name: 'Welcome to Care for Flora and Fauna'
    });
});

// API routes
api.use('/auth'  , auth);
api.use('/entity', entity);
api.use('/review', review);
api.use('/offer', offer);
api.use('/badge', badge);
api.use('/biddingrequest', biddingrequest);
api.use('/public', express.static('public'));

module.exports = api;
