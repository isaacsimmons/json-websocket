'use strict';

var EventEmitter = require('events').EventEmitter;

var util = require('./common.js');

var Client = function(opts) {
  var messageEvents = new EventEmitter();
  var connectEvents = new EventEmitter();
  var replyEvents = new EventEmitter();

  if (opts.maxListeners !== undefined) {
    messageEvents.setMaxListeners(opts.maxListeners);
    connectEvents.setMaxListeners(opts.maxListeners);
  }
  replyEvents.setMaxListeners(1);

  var url = [ 'ws://', opts.host || 'localhost', ':', opts.port || 80, opts.path || '/' ].join('');
  var ws = new WebSocket(url, opts.protocol || 'json-socket');

  ws.onopen = function() {
    util.log('Connected to ' + url, opts);
    connectEvents.emit('connect');
  };

  ws.onmessage = util.receive(messageEvents, ws, replyEvents, opts);

  ws.onerror = function(err) {
    util.log('Error connecting to ' + url + ': ' + err.toString(), opts);
    connectEvents.emit('error', err);
  };

  ws.onclose = function() {
    util.log('Websocket disconnected', opts);
    connectEvents.emit('disconnect');
  };

  messageEvents.send = util.send(ws, replyEvents, opts);

  messageEvents.disconnect = function() {
    util.log('Disconnecting from websocket', opts);
    ws.close();
  };

  messageEvents.isReady = function() {
    return ws.bufferedAmount === 0; //TODO: also factor "readyState" in?
  };

  messageEvents.connect = connectEvents;

  return messageEvents;
};

module.exports = Client;
