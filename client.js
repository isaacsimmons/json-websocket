'use strict';

var WebSocketClient = require('websocket').client;
var EventEmitter = require('events').EventEmitter;

var util = require('./util.js');

var Client = function(opts) {
  var events = new EventEmitter();
  var queue = [];

  if (opts.maxListeners !== undefined) {
    events.setMaxListeners(opts.maxListeners);
  }

  var url = [ 'ws://', opts.host || 'localhost', ':', opts.port || 80, opts.path || '/' ].join('');
  var client = new WebSocketClient();

  client.on('connect', function(conn) {
    util.log('Connected to ' + url, opts);

    events.send = function(type) {
      util.check(type, opts);
      conn.send(JSON.stringify(Array.prototype.slice.call(arguments)));
    };

    events.disconnect = function() {
      util.log('Disconnecting from websocket', opts);
      conn.close();
    };

    events.isReady = function() {
      return conn.bufferedAmount === 0; //TODO: is this property the correct thing to check?
    };

    conn.on('message', util.handler(opts, function(parsed) {
      events.emit.apply(events, parsed);
    }));

    conn.on('close', function() {
      util.log('Websocket disconnected', opts);
      events.emit(util.EVENTS.disconnect);
    });

    for(var i = 0; i < queue.length; i++) {
      util.log('Sending queued ' + queue[i][0] + ' message');
      conn.send(JSON.stringify(queue[i]));
    }
    queue = undefined;

    events.emit(util.EVENTS.connect);
  });

  client.on('error', function(err) {
    util.log('Error connecting to ' + url + ': ' + err.toString(), opts);
    events.emit(util.EVENTS.error);
  }); //TODO: is this the right event name for failed connections?


  events.send = function(type) {
    util.check(type, opts);
    util.log('Queueing ' + type + ' message for later delivery');
    queue.push(Array.prototype.slice.call(arguments));
  };

  events.disconnect = function() {
    util.log('Socket not connected yet', opts);
  };

  events.isReady = function() {
    return false;
  };

  process.nextTick(function() {
    client.connect(url, opts.protocol || 'json-socket');
  });

  return events;
};

module.exports = Client;
