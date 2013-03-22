'use strict';

var main = require('../lib/main');

var client = main.client({ host: 'localhost', port: 8000, verbose: true });

client.on('js:connect', function() {
  client.send('greeting', 'Websocket client here');
});

client.on('tick', function(serverTime) {
  //Emitted when the server sends a "tick" event
});

setTimeout(function() {
  client.disconnect();
}, 1000);
