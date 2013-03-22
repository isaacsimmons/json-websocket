'use strict';

var JS = require('./main.js');

var http = require('http');

var httpServer = http.createServer();

var server = JS.server({ httpServer: httpServer, verbose: true });

server.messages.on('123', function(val) {
  console.log('server got 123: ' + JSON.stringify(val));
});

server.messages.on('456', function(val) {
  console.log('server got 456: ' + JSON.stringify(val));
});

server.on('clientconnect', function(socket, id) {
  server.send(id, 'hello', 'there');
  server.send(id, 'def', 4, 5, 6);
});

httpServer.listen(8000);

JS.client({ host: 'localhost', port: 8000, verbose: true }, function(err, client) {
  client.messages.on('abc', function(val) {
    console.log('client got abc: ' + JSON.stringify(val));
  });
  client.messages.on('def', function(val) {
    console.log('client got ghi: ' + JSON.stringify(val));
  });
  client.send('123', 'one two three');
  client.send('456', {four: 'four'}, 'five', 6)
});

