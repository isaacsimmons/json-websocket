'use strict';

var WebSocketServer = require('websocket').server;
var EventEmitter = require('events').EventEmitter;

var util = require('./util.js');

var serve = function(opts) {
  var server = new WebSocketServer(opts);
  var events = new EventEmitter();
  if (opts.maxListeners !== undefined) {
    events.setMaxListeners(opts.maxListeners);
  }

  var clients = {};
  var numClients = 0;
  var counter = 0;

  var handleMessage = function(clientId) {
    return function(msg) {
      var parsed;
      try {
        parsed = util.parse(msg);
      } catch (err) {
        util.log(err.toString(), opts);
        return;
      }
      Array.prototype.splice.apply(parsed, [1, 0, clientId]);
      util.log('Got ' + parsed[0] + ' message from client #' + parsed[1], opts);
      events.emit.apply(events, parsed);
    };
  };

  server.on('request', function(request) {
    var ws = request.accept(opts.protocol || 'json-socket');
    var id = counter++;
    numClients++;
    clients[id] = ws;
    util.log('Client #' + id + ' connected', opts);
    ws.on('message', handleMessage(id));
    events.emit(util.EVENTS.connect, id, ws);
    ws.on('close', function() {
      util.log('Client #' + id + ' disconnected', opts);
      events.emit(util.EVENTS.disconnect, id);
      numClients--;
      delete clients[id];
    });
  });

  var send = function(clientId, type) {
    util.send(opts, clients[clientId]).apply(undefined, Array.prototype.slice.call(arguments, 1));
  };

  events.send = send;
  events.clients = clients;
  events.numClients = numClients;
//  events.shutdown = shutdown;
  return events;
};

module.exports = serve;
