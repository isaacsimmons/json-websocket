'use strict';

var http = require('http').createServer();
var Server = require('./main.js').server;

var server = Server({ httpServer: http, verbose: true });

var clientValue = null;

server.messages.on('hello', function(clientId, greeting, value) {
  clientValue = value;
});

server.messages.on('update', function(clientId, value) {
  clientValue = value;
});

server.on('clientconnect', function(id) {
  server.send(id, 'hello', 'Greetings, client #' + id, 123);
});

http.listen(8000);

