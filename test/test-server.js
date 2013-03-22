'use strict';

var http = require('http').createServer();
var Server = require('../lib/main.js').server;

var SERVER_VAL = 123;

var server = Server({ httpServer: http, verbose: true });

var clients = {};

server.on('hello', function(clientId, greeting, value) {
  clients[clientId].push(value);
});

server.on('update', function(clientId, value) {
  clients[clientId].push(value);
});

server.on('js:connect', function(clientId) {
  clients[clientId] = [];
  server.send(clientId, 'hello', 'Greetings, client #' + clientId, SERVER_VAL);
});

server.on('js:disconnect', function(clientId) {
  console.log('Client #' + clientId + ' value summary');
  console.log(JSON.stringify(clients[clientId]));
  //TODO: assert zero, SERVER_VAL, 100
  delete clients[clientId];
});

http.listen(8000);

