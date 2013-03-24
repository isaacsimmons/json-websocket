#!/usr/bin/env node

'use strict';

var http = require('http').createServer();
var main = require('../lib/main.js');

var server = main.server({ httpServer: http, verbose: true });

server.on('multiply', function(clientId, n1, n2, callback) {
  var count = n2;
  server.send(clientId, 'set', n1);

  var handleResponse = function handleResponse(err, value) {
    count--;
    if (count === 0) {
      callback(value); //TODO: always callback error first argument (and give that special toString handling when JSONifying)
    } else {
      server.send(clientId, 'add', value, handleResponse);
    }
  };

  if (count > 0) {
    server.send(clientId, 'add', 0, handleResponse);
  } else {
    callback(0);
  }
});

server.connect.on('connect', function(clientId) {
  server.send(clientId, 'hello', 'Greetings, client #' + clientId);
});

http.listen();
var PORT = http.address().port;

var client = main.client({ port: PORT, verbose: true });
var amount = 1;

client.on('set', function(value) {
  amount = value;
});

client.on('add', function(value, callback) {
  callback(value + amount);
});

client.connect.on('connect', function() {
  client.send('hello', 'Websocket client here');
});

client.connect.on('error', function(err) {
  console.log('FAILED TO CONNECT');
});

client.send('multiply', 4, 5, function(err, result) {
  console.log('Server multiplied 4 * 5 and got ' + result);
});

setTimeout(function() {
  client.disconnect();
  http.close();
}, 1000);
