"use strict";

const http       = require('http');
const mongoose   = require('mongoose');

const api        = require('./src/api');
const config     = require('./src/config');
const sockjs     = require('sockjs');

// Set the port to the API.
api.set('port', config.port);

//Create a http server based on Express
const server = http.createServer(api);

//Connect to the MongoDB database; then start the server
mongoose
    .connect(config.mongoURI)
    .then(() => server.listen(config.port))
    .catch(err => {
        console.log('Error connecting to the database', err.message);
        process.exit(err.statusCode);
    });


//Websocket server setup
const echo = sockjs.createServer({ sockjs_url: config.sockjsURL });
let clients=[];
echo.on('connection', function(conn) {
    clients.push(conn);
    conn.on('data', function(message) {
        console.log(message);
        for (var i=0; i < clients.length; i++)
            clients[i].write(message);
    });
    conn.on('close', function() {
        clients = clients.filter(client => client.id !== conn.id);
    });
});
echo.installHandlers(server, {prefix:'/echo'});


server.on('listening', () => {
    console.log(`API is running in port ${config.port}`);
});

server.on('error', (err) => {
    console.log('Error in the server', err.message);
    process.exit(err.statusCode);
});
