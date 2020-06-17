"use strict";

require('dotenv').config()

// Configuration variables
const port      = process.env.PORT        || '5000';
const mongoURI  = process.env.MONGODB_URI || 'mongodb://localhost:27010/communitydb';
const JwtSecret = process.env.JWT_SECRET  || 'very secret secret';


module.exports = {
    port,
    mongoURI,
    JwtSecret,
};
