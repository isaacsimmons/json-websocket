# JSON WebSocket #

## Installation ##

Install JsonWebSocket using Node Package Manager (npm):

    npm install json-websocket

## Usage ##

Example client (found in `examples/client.js`)

    var main = require('../lib/main.js');

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

Example server (found in `examples/server.js`)

    var http = require('http').createServer();
    var main = require('../lib/main.js');

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

## API ##

### Server ###

### Client ###

## Testing ##

Run tests using Node Package Manager (npm):

    npm test

## License ##

Copyright (c) 2013 Isaac Simmons

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
