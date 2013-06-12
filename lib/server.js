'use strict';

var WebSocketServer = require('websocket').server;
var EventEmitter = require('events').EventEmitter;

var util = require('./common.js');

var serve = function(opts) {
  var server = new WebSocketServer(opts);

  var connectEvents = new EventEmitter();
  var messageEvents = new EventEmitter();
  var replyEvents = {};

  if (opts.maxListeners !== undefined) {
    messageEvents.setMaxListeners(opts.maxListeners);
    connectEvents.setMaxListeners(opts.maxListeners);
  }

  var timeout = opts.timeout || 5000;
  var numClients = 0;
  var clients = {};
  var sendFns = {};
  var clientIdCounter = 0;

  server.on('request', function(request) {
    var ws = request.accept(opts.protocol || 'json-socket');
    var id = clientIdCounter++;
    var socketReplyEvents = new EventEmitter();
    socketReplyEvents.setMaxListeners(1);

    numClients++;
    ws.name = 'Client #' + id;
    ws.id = id;
    clients[id] = ws;
    replyEvents[id] = socketReplyEvents;
    sendFns[id] = util.send(ws, socketReplyEvents, opts);

    util.log(ws.name + ' connected', opts);

    ws.on('message', util.receive(messageEvents, ws, socketReplyEvents, opts));

    ws.on('close', function() {
      util.log('Client #' + id + ' disconnected', opts);
      connectEvents.emit('disconnect', id);
      numClients--;
      delete clients[id];
      delete replyEvents[id];
      delete sendFns[id];
      //TODO: error out all existing replyEvent listeners when a socket disconnects
    });

    setTimeout(function() {
      connectEvents.emit('connect', id, request.remoteAddress);
    }, 0);
  });

  var send = function send(clientId, type) {
    if (arguments.length === 1) {
      return function(type) {
        send.apply(undefined, [clientId].concat(Array.prototype.slice.call(arguments)));
      };
    }

    if (typeof type !== 'string') {
      throw new Error('Message type must be a string');
    }
    
    sendFns[clientId].apply(undefined, Array.prototype.slice.call(arguments, 1));
  };

  messageEvents.send = send;
  messageEvents.clients = clients;
  messageEvents.numClients = numClients;
  messageEvents.connect = connectEvents;
  return messageEvents;
};

module.exports = serve;

