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
      }
      messageEvents.emit.apply(messageEvents, parsed);
    };
  };

  server.on('request', function(request) {
    //TODO: don't always auto-accept
    var ws = request.accept(opts.protocol || 'json-socket');
    var id = counter++;
    numClients++;
    clients[id] = ws;
    ws.on('message', handleMessage(id));
    server.emit('clientconnect', ws, id);
    ws.on('close', function() {
      server.emit('clientdisconnect', id);
      numClients--;
      delete clients[id];
    });
  });

  var send = function(clientId, type) {
    clients[clientId].send(JSON.stringify(Array.prototype.slice.call(arguments, 1)));
  };

  server.send = send;
  server.clients = clients;
  server.messages = messageEvents;
  server.numClients = numClients;
  return server;
};

module.exports = serve;