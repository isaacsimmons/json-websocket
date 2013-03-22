'use strict';

var WebSocketClient = require('websocket').client;
var EventEmitter = require('events').EventEmitter;

var parse = require('./util.js').parse;

var connect = function(opts, callback) {
  var client = new WebSocketClient();

  client.on('connect', function(conn) {

    var events = new EventEmitter(opts);

    conn.on('message', function(msg) {
      var parsed;
      try {
        parsed = parse(msg);
      } catch (parseError) {
        if (opts.verbose) { console.log('Trouble parsing JSON from message on websocket: ' + parseError.message); }
        return;
      }
      events.emit.apply(events, parsed);
    });

    var send = function(type) {
      if (typeof type !== 'string') {
        throw new Error('Message type must be a string');
      }
      conn.send(JSON.stringify(Array.prototype.slice.call(arguments)));
    };

    client.messages = events;
    client.send = send;
    client.disconnect = conn.close;

    callback(undefined, client);
  });

  client.connect('ws://' + opts.host + ':' + opts.port + (opts.path ? '/' + opts.path : '/'), opts.protocol);
}

module.exports = connect;
