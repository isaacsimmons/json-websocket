'use strict';

var WebSocketServer = require('websocket').server;
var EventEmitter = require('events').EventEmitter;

var parse = require('./util.js').parse;

var serve = function(opts) {
  var server = new WebSocketServer(opts);
  var messageEvents = new EventEmitter(opts);
  var clients = {};
  var numClients = 0;
  var counter = 0;

  var handleMessage = function(clientId) {
    return function(msg) {
      var parsed;
      try {
        parsed = parse(msg);
      } catch (err) {
        if (opts.verbose) { console.log(err.toString()); }
        return;
      }
      Array.prototype.splice.apply(parsed, [1, 0, clientId]);
      if (opts.verbose) { console.log('Got ' + parsed[0] + ' message from client #' + parsed[1]); }
      messageEvents.emit.apply(messageEvents, parsed);
    };
  };

  server.on('request', function(request) {
    //TODO: don't always auto-accept
    var ws = request.accept(opts.protocol || 'json-socket');
    var id = counter++;
    numClients++;
    clients[id] = ws;
    if (opts.verbose) { console.log('Client #' + id + ' connected'); }
    ws.on('message', handleMessage(id));
    server.emit('clientconnect', id, ws);
    ws.on('close', function() {
      if (opts.verbose) { console.log('Client #' + id + ' disconnected'); }
      server.emit('clientdisconnect', id);
      numClients--;
      delete clients[id];
    });
  });

  var send = function(clientId, type) {
    if (opts.verbose) { console.log('Sending '  + type + ' message to client #' + clientId); }
    clients[clientId].send(JSON.stringify(Array.prototype.slice.call(arguments, 1)));
  };

  server.send = send;
  server.clients = clients;
  server.messages = messageEvents;
  server.numClients = numClients;
  return server;
};

module.exports = serve;
