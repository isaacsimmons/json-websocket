JSON WebSocket is a lightweight wrapper around the [websocket](https://github.com/Worlize/WebSocket-Node) implementation. Event types and objects are automatically translated to and from JSON, and emitted as events when received.

# Installation #

Install JsonWebSocket using Node Package Manager (npm):

    npm install json-websocket

# Usage #

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

# API #

## Server ##

To create a server, use `require('json-websocket').server(opts);`.

Options:

* `httpServer`: A [http.Server](http://nodejs.org/api/http.html#http_class_http_server) object that the websocket will bind to.
* `path`: The URL path the websocket will listen on in the server. Defaults to `/`.
* `verbose`: Any truthy value will enable debug logging to `console.log`.
* `protocol`: Name of the websocket protocol to support. Defaults to `'json-websocket'`.
* `maxListeners`: Controls the maximum number of listeners that can be attached to the resulting EventEmitter. Use `0` for unlimited. Defaults to `10`.

This returns an [Event Emitter](http://nodejs.org/api/events.html#events_class_events_emitter) with the following properties:

###Event: 'js:connect'###
`function (clientId) { }`

Emitted each time a new client successfully connects.

###Event: 'js:disconnect'###
`function (clientId) { }`

Emitted each time a client disconnects.

###Event: 'js:error'###
`function (err) { }`

Emitted on errors.

###server.clients###

An object mapping client identifiers to the underlaying websocket connections.

###server.numClients###

The number of currently connected clients.

###server.isReady(clientId)###

Returns `true` if there is a connected client with the given identifier that is in the ready state and has no currently buffered outgoing data, `false` otherwise.

###server.send(clientId, type, ...)###

## Client ##

## Browser ##

# Testing #

Run tests using Node Package Manager (npm):

    npm test

# License #

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
