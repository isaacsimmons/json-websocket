#!/usr/bin/env node

'use strict';

var http = require('http').createServer();
var main = require('../lib/main.js');

var SERVER_VAL = new Date().getTime();

var server = main.server({ httpServer: http, verbose: true });

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

http.listen();
var PORT = http.address().port;

var client = main.client({ host: 'localhost', port: PORT, verbose: true });

client.on('hello', function(greeting, value) {
  client.send('update', value);
});

client.on('js:connect', function() {
  client.send('hello', 'Websocket client here', 0);
});

setTimeout(function() {
  client.send('update', 100);
  client.disconnect();
  http.close();
}, 1000);
