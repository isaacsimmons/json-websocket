'use strict';

var WebSocketClient = require('websocket').client;
var EventEmitter = require('events').EventEmitter;

var parse = require('./util.js').parse;

var connect = function(opts, callback) {
  var client = new WebSocketClient();

  client.on('connect', function(conn) {
    if (opts.verbose) { console.log('Connected'); }
    var events = new EventEmitter(opts);

    conn.on('message', function(msg) {
      var parsed;
      try {
        parsed = parse(msg);
      } catch (parseError) {
        if (opts.verbose) { console.log('Trouble parsing JSON from message on websocket: ' + parseError.message); }
        return;
      }
      if (opts.verbose) { console.log('Got ' + parsed[0] + ' message'); }
      events.emit.apply(events, parsed);
    });

    var send = function(type) {
      if (typeof type !== 'string') {
        throw new Error('Message type must be a string');
      }
      if (opts.verbose) { console.log('Sending ' + type + ' message'); }
      conn.send(JSON.stringify(Array.prototype.slice.call(arguments)));
    };

    if (opts.verbose) { conn.on('close', function() { console.log('Disconnected'); }); }

    client.messages = events;
    client.send = send;
    client.disconnect = conn.close;

    callback(undefined, client); //TODO: give back the conn as well?
    //Nah, lets hide all kinds of stuff, fuck getting access to the raw sockets
  });

  var url = [ 'ws://', opts.host || 'localhost', ':', opts.port || 80, opts.path || '/' ].join('');
  client.connect(url, opts.protocol || 'json-socket');
};

module.exports = connect;
