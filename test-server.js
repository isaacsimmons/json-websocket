'use strict';

var http = require('http').createServer();
var Server = require('./main.js').server;

var server = Server({ httpServer: http, verbose: true });

var clientValue = null;

server.on('hello', function(clientId, greeting, value) {
  clientValue = value;
});

server.on('update', function(clientId, value) {
  clientValue = value;
});

server.on('js:connect', function(id) {
  server.send(id, 'hello', 'Greetings, client #' + id, 123);
});

http.listen(8000);

