'use strict';

var http = require('http').createServer();
var main = require('../lib/main');

var server = main.server({ httpServer: http, verbose: true });

server.on('multiply', function(clientId, v1, v2, callback) {
  callback(v1 * v2);
});

server.on('tick', function(clientId, time) {
  //Process "tick" event here
});

server.connect.on('connect', function(clientId) {
  server.send(clientId, 'greet', 'Greetings, client #' + clientId);
});

server.connect.on('disconnect', function(clientId) {
  //Client disconnected
});

http.listen(8000);
