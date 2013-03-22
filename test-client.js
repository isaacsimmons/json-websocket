'use strict';

var Client = require('./main.js').client;

var client = Client({ host: 'localhost', port: 8000, verbose: true });
client.on('js:connect', function() {
  client.on('hello', function(greeting, value) {
    client.send('update', value);
  });
  client.send('hello', 'Websocket client here', 0);
  setTimeout(function() {
    client.send('update', 100);
  }, 2000);
});

