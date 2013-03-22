'use strict';

var http = require('http').createServer();
var main = require('../lib/main');

var server = main.server({ httpServer: http, verbose: true });

server.on('update', function(clientId, value) {
  //Process "update" event from client here
});

server.on('js:connect', function(clientId) {
  server.send(clientId, 'greet', 'Greetings, client #' + clientId);
});

server.on('js:disconnect', function(clientId) {
  //Client disconnected
});

http.listen(8000);
