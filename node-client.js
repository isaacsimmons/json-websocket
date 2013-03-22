'use strict';

var WebSocketClient = require('websocket').client;
var EventEmitter = require('events').EventEmitter;

var util = require('./util.js');

var Client = function(opts) {
  var events = new EventEmitter();

  if (opts.maxListeners !== undefined) {
    events.setMaxListeners(opts.maxListeners);
  }

  var url = [ 'ws://', opts.host || 'localhost', ':', opts.port || 80, opts.path || '/' ].join('');
  var client = new WebSocketClient();

  client.on('connect', function(conn) {
    util.log('Connected to ' + url, opts);

    events.send = util.send(opts, conn);

    events.disconnect = function() {
      util.log('Disconnecting from websocket', opts);
      ws.close();
    };

    events.isReady = function() {
      return ws.bufferedAmount === 0; //TODO: also factor "readyState" in?
    };

    conn.on('message', util.handleMessage(opts, events));

    conn.on('close', function() {
      util.log('Websocket disconnected', opts);
      events.emit(util.EVENTS.disconnect);
    });

    events.emit(util.EVENTS.connect);
  });


  client.on('error', function(err) {
    util.log('Error connecting to ' + url + ': ' + err.toString(), opts);
    events.emit(util.EVENTS.error);
  }); //TODO: is this the right event name for failed connections?

  events.send = util.send(opts, function(type) {
    throw new Error('Not connected yet'); //TODO: queue these and send later?
  });

  events.disconnect = function() {
    util.log('Socket not connected yet', opts);
  };

  events.isReady = function() {
    return false;
  };

  client.connect(url, opts.protocol || 'json-socket');
  return events;
};

module.exports = Client;
