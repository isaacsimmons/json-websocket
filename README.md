JSON WebSocket is a lightweight wrapper around the [websocket](https://github.com/Worlize/WebSocket-Node) implementation. Event types and objects are automatically translated to and from JSON, and emitted as events when received.

# Installation #

Install JsonWebSocket using Node Package Manager (npm):

    npm install json-websocket

# Usage #

Example client (found in `examples/client.js`)

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

Example server (found in `examples/server.js`)

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

Example browser client (from `examples/browser.html`):

    var client = jsonSocket({
      host: 'localhost',
      port: 8000,
      verbose: true
    });

    client.connect.on('connect', function() {
      client.send('greeting', 'Websocket client here');
    });

    client.on('add', function(v1, v2, callback) {
      callback(v1 + v2);
    });

**You must first build the browser bundle with `./browserify.sh` before browser.html will work.**

# API #

## Server ##

To create a server, use `require('json-websocket').server(opts);`.

Options:

* `httpServer`: A [http.Server](http://nodejs.org/api/http.html#http_class_http_server) object that the websocket will bind to
* `path`: The URL path the websocket will listen on in the server. Defaults to `/`
* `verbose`: Any truthy value will enable debug logging to `console.log`
* `protocol`: Name of the websocket protocol to support. Defaults to `'json-websocket'`
* `maxListeners`: Controls the maximum number of listeners that can be attached to the resulting EventEmitter. Use `0` for unlimited. Defaults to `10`

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

###Event: \*###
`function (clientId, ...) { }`

All messages received by clients are emitted as events with the "type" of the sent message. 

###server.send(clientId, type, ...)###

Send a message to the given client of the given type. `type` must be a `String` and cannot start with "js:". Any additional arguments provided to this function will be transmitted to the client and attached to the emitted event.

###server.clients###

An object mapping client identifiers to the underlaying websocket connections.

###server.numClients###

The number of currently connected clients.

###server.isReady(clientId)###

Returns `true` if there is a connected client with the given identifier that is in the ready state and has no currently buffered outgoing data, `false` otherwise.

## Client ##

To create a client, use `require('json-websocket').client(opts);`.

Options:

* `hostname`: The host that the client will attempt to connect to. Defaults to `localhost`
* `port`: The port that the client will attempt to connect to. Defaults to `80`
* `path`: The URL path that the client will attempt to connect to. Defaults to `/`
* `verbose`: Any truthy value will enable debug logging to `console.log`
* `protocol`: Name of the websocket protocol to request. Defaults to `'json-websocket'`
* `maxListeners`: Controls the maximum number of listeners that can be attached to the resulting EventEmitter. Use `0` for unlimited. Defaults to `10`

###Event: 'js:connect'###
`function () { }`

Emitted when the socket successfully connects.

###Event: 'js:disconnect'###
`function () { }`

Emitted when the socket is closed.

###Event: 'js:error'###
`function (err) { }`

Emitted on a connection failure.

###Event: \*###

All messages received by the server are emitted as events with the "type" of the sent message.

###client.send(type, ...)###

Send a message to the server with the given type. `type` must be a `String` and cannot start with "js:". Any additional arguments will be sent along to the server and attached to the emitted event.

Messages sent before the `js:connect` event has been emitted will be queued and sent once the connection is established.

###client.disconnect()###

Closes the websocket connection.

###client.isReady()###

Returns `true` if the websocket connection is established, ready, and has no buffered outgoing data, `false` otherwise.

## Browser ##

JSON WebSocket can also be used in the browser with no dependency on the node [websocket](https://github.com/Worlize/WebSocket-Node) module relying instead on the browser's implementation.

In order to do this, you should include `./lib/browser.js` using a CommonJS bundler. For instance, using [browserify](http://browserify.org/):

    browserify ./lib/browser.js -s jsonSocket -o bundle.js
    
or simply running the included `./browserify.sh` script. (Note that browserify must be installed on your system globally for this script to work.)

Pointing a web browser to `./examples/browser.html` on the local filesystem after generating the browser bundle will load an empty test page that will attempt to connect to the example server.

The `client` object in the global namespace is the connected json-socket object and the `jsonSocket` function in the global namespace is the method to create additional client sockets.

The client socket object has the same events and methods as the Node JS client object.

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

