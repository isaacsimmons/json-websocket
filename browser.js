'use strict';

var EventEmitter = require('events').EventEmitter;

var util = require('./lib/common.js');

var Client = function(opts) {
  var events = new EventEmitter();

  if (opts.maxListeners !== undefined) {
    events.setMaxListeners(opts.maxListeners);
  }

  var url = [ 'ws://', opts.host || 'localhost', ':', opts.port || 80, opts.path || '/' ].join('');
  var ws = new WebSocket(url, opts.protocol || 'json-socket');

  ws.onopen = function() {
    util.log('Connected to ' + url, opts);
    events.emit(util.EVENTS.connect);
  };

  ws.onmessage = util.handler(opts, function(parsed) {
    events.emit.apply(events, parsed);
  });

  ws.onerror = function(err) {
    util.log('Error connecting to ' + url + ': ' + err.toString(), opts);
    events.emit(util.EVENTS.error);
  };

  ws.onclose = function() {
    util.log('Websocket disconnected', opts);
    events.emit(util.EVENTS.disconnect);
  };

  events.send = function(type) {
    util.check(type, opts);
    ws.send(JSON.stringify(Array.prototype.slice.call(arguements)));
  };

  events.disconnect = function() {
    util.log('Disconnecting from websocket', opts);
    ws.close();
  };

  events.isReady = function() {
    return ws.bufferedAmount === 0; //TODO: also factor "readyState" in?
  };

  return events;
};

module.exports = Client;
