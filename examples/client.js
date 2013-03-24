'use strict';

var main = require('../lib/main');

var client = main.client({ host: 'localhost', port: 8000, verbose: true });

client.connect.on('connect', function() {
  client.send('greeting', 'Websocket client here');
});

client.on('add', function(v1, v2, callback) {
  callback(v1 + v2);
});

setTimeout(function() {
  client.disconnect();
}, 1000);
