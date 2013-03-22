'use strict';

var WebSocketServer = require('websocket').server;
var EventEmitter = require('events').EventEmitter;

var util = require('./common.js');

var serve = function(opts) {
  var server = new WebSocketServer(opts);
  var events = new EventEmitter();
  if (opts.maxListeners !== undefined) {
    events.setMaxListeners(opts.maxListeners);
  }

  var clients = {};
  var numClients = 0;
  var counter = 0;

  server.on('request', function(request) {
    var ws = request.accept(opts.protocol || 'json-socket');
    var id = counter++;
    numClients++;
    clients[id] = ws;

    util.log('Client #' + id + ' connected', opts);

    ws.on('message', util.handler(opts, function(parsed) {
      util.log('Got message from client #' + id, opts);
      parsed.splice(1, 0, id);
      events.emit.apply(events, parsed);
    }));

    ws.on('close', function() {
      util.log('Client #' + id + ' disconnected', opts);
      events.emit(util.EVENTS.disconnect, id);
      numClients--;
      delete clients[id];
    });

    events.emit(util.EVENTS.connect, id, ws);
  });

  var send = function(clientId, type) {
    util.check(type, opts);
    util.log('Sending message to client #' + clientId);
    clients[clientId].send(JSON.stringify(Array.prototype.slice.call(arguments, 1)));
  };

  events.send = send;
  events.clients = clients;
  events.numClients = numClients;
  return events;
};

module.exports = serve;
