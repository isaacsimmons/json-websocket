'use strict';

var WebSocketServer = require('websocket').server;
var EventEmitter = require('events').EventEmitter;

var util = require('./common.js');

var eventName = function(clientId, messageId) {
  return clientId.toString() + ':' + Math.abs(messageId).toString();
};

//[replyToId || null, type || inResponseTo, ... z]

var serve = function(opts) {
  var server = new WebSocketServer(opts);

  var connectEvents = new EventEmitter();
  var messageEvents = new EventEmitter();
  var replyEvents = new EventEmitter();

  if (opts.maxListeners !== undefined) {
    messageEvents.setMaxListeners(opts.maxListeners);
    connectEvents.setMaxListeners(opts.maxListeners);
  }
  replyEvents.setMaxListeners(1);

  var timeout = opts.timeout || 5000;
  var numClients = 0;
  var clients = {};
  var clientIdCounter = 0;
  var messageCounters = {};

  server.on('request', function(request) {
    var ws = request.accept(opts.protocol || 'json-socket');
    var id = clientIdCounter++;
    var socketReplyEvents = new EventEmitter();
    socketReplyEvents.setMaxListeners(1);

    numClients++;
    ws.name = 'Client #' + id;
    clients[id] = ws;
    messageCounters[id] = 1;
    replyEvents[id] = socketReplyEvents;

    util.log(ws.name + ' connected', opts);

    ws.on('message', receiveRaw(messageEvents, ws, socketReplyEvents));

    ws.on('close', function() {
      util.log('Client #' + id + ' disconnected', opts);
      connectEvents.emit(util.EVENTS.disconnect, id);
      numClients--;
      delete clients[id];
      delete messageCounters[id];
      delete replyEvents[id];
      //TODO: error out all existing replyEvent listeners when a socket disconnects
    });

    connectEvents.emit(util.EVENTS.connect, id, ws); //TODO: get rid of those constants, just use strings
  });

  var send = function(clientId, type) {
    util.check(type, opts);
    util.log('Sending message to client #' + clientId);
    
    var args = Array.prototype.slice.call(arguments);
    args[0] = null; //Overwrite the clientId argument with "null" (not in response to anything)

    sendRaw(clients[clientId], replyEvents[clientId]).apply(undefined, args);
  };

  var sendRaw = function(socket, replyEvents) {
    return function(first) {
      var payload = Array.prototype.slice.call(arguments);
      var callback = false;
      var replyToId = null;
      if (payload.length > 0 && typeof payload[payload.length - 1] === 'function') {
        callback = payload.pop();
        replyToId = nextMessageId();
      }
      payload.unshift(replyToId);
      socket.send(JSON.stringify(payload));
      if (callback) {
        //TODO: timeouts
        replyEvents.once(replyToId.toString(), function() {
          callback.apply(callback, [null].concat(Array.prototype.slice.call(arguments)));
        });
      }
    };
  };

  var receiveRaw = function(messageEvents, socket, replyEvents) {
    return function(msg) {
      var parsed;
      try {
        parsed = util.parse(msg);
      } catch (parseError) {
        util.log('Error parsing message from ' + socket.name + ': ' + parseError.message, opts);
        return;
      }
      //TODO: include the "expecting response" or "in response to X" or "type Y" in this log message
      util.log('Got message from ' + socket.name, opts);

      var respondToId = parsed.shift();
      if (respondToId !== null) { 
        //Expecting a response, build a callback and shove it on the end
        var respond = function() {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(respondToId); //Push the respondToId onto the front as a "in response to" value
          sendRaw(socket, replyEvents).apply(undefined, args);
        };
        parsed.push(respond);
      }

      if (typeof parsed[0] === 'string') { //This is a new regular "typed" message
        if (socketId !== undefined) {
          parsed.splice.apply(1, 0, socketId);
        }
        messageEvents.emit.apply(messageEvents, parsed);
      } else if (typeof parsed[0] === 'number') { //This is a response to one of my messages
        replyEvents.emit.apply(replyEvents, parsed); //TODO: assert that there is a listener for this event?
      }
    };
  };

  messageEvents.send = send;
  messageEvents.clients = clients;  //TODO: should I expose these?
  messageEvents.numClients = numClients;
  messageEvents.connect = connectEvents;
  return messageEvents;
};

module.exports = serve;

