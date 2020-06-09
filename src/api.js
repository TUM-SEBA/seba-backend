"use strict";

const express    = require('express');
const bodyParser = require('body-parser');
const helmet     = require('helmet');

const middlewares = require('./middlewares');

const auth  = require('./routes/auth');
const entity = require('./routes/entity');
const review = require('./routes/review');
const offer = require('./routes/offer');


const api = express();

// Adding Basic Middlewares
api.use(helmet());
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: false }));
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


module.exports = api;
