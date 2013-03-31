'use strict';

var WebSocketClient = require('websocket').client;
var EventEmitter = require('events').EventEmitter;

var util = require('./common.js');

var Client = function(opts) {
  var messageEvents = new EventEmitter();
  var connectEvents = new EventEmitter();
  var replyEvents = new EventEmitter();
  var queue = [];

  var reconnectTimeout = null;
  var closedByUser = false;

  var tryReconnect = function() {
    if (opts.reconnect && !closedByUser) {
      reconnectTimeout = setTimeout(connect, opts.reconnectDelay || 5000);
    }
  };

  if (opts.maxListeners !== undefined) {
    messageEvents.setMaxListeners(opts.maxListeners);
    connectEvents.setMaxListeners(opts.maxListeners);
  }
  replyEvents.setMaxListeners(1);

  var url = [ 'ws://', opts.host || 'localhost', ':', opts.port || 80, opts.path || '/' ].join('');
  var client = new WebSocketClient();

  client.on('connect', function(conn) {
    util.log('Connected to ' + url, opts);
    conn.name = 'server';

    messageEvents.send = util.send(conn, replyEvents, opts);

    messageEvents.disconnect = function() {
      util.log('Disconnecting from websocket', opts);
      offlineDisconnect();
      conn.close();
    };

    messageEvents.isReady = function() {
      return conn.bufferedAmount === 0; //TODO: is this property the correct thing to check?
    };

    conn.on('message', util.receive(messageEvents, conn, replyEvents, opts));

    conn.on('close', function() {
      messageEvents.send = offlineSend;
      messageEvents.isReady = offlineIsReady;
      messageEvents.disconnect = offlineDisconnect;
      util.log('Websocket disconnected', opts);
      connectEvents.emit('disconnect');
      tryReconnect();
    });

    if (queue.length) { util.log('Sending ' + queue.length + ' queued messages', opts); }
    for(var i = 0; i < queue.length; i++) {
      //TODO: test what happens if a queued message has a callback?
      messageEvents.send.apply(undefined, queue[i]);
    }
    queue = [];

    connectEvents.emit('connect');
  });

  client.on('connectFailed', function(err) {
    util.log('Error connecting to ' + url + ': ' + err.toString(), opts);
    connectEvents.emit('error', err);
    tryReconnect();
  });

  var offlineSend = function(type) {
    if (typeof type !== 'string') { throw new Error('Message type must be a string'); }
    util.log('Queueing ' + type + ' message for later delivery', opts);
    queue.push(Array.prototype.slice.call(arguments));
  };

  messageEvents.send = offlineSend;

  var offlineDisconnect = function() {
    closedByUser = true;
    if (reconnectTimeout) { clearTimeout(reconnectTimeout); }
  };

  messageEvents.disconnect = offlineDisconnect;

  var offlineIsReady = function() { return false; };

  messageEvents.isReady = offlineIsReady;

  //TODO: expose this method?
  var connect = function() {
    util.log('Connecting to ' + url, opts);
    client.connect(url, opts.protocol || 'json-socket');
  };

  process.nextTick(connect);

  messageEvents.connect = connectEvents;

  return messageEvents;
};

module.exports = Client;
