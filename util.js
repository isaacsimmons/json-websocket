'use strict';

var isArray = Array.isArray || function(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; };

var parse = function(msg) {
  if (msg.type !== 'utf8') {
    throw new Error('Non-UTF-8 message received');
  }

  var parsed = JSON.parse(msg.utf8Data);

  if (!isArray(parsed)) {
    throw new Error('JSON non-array received');
  }

  if (parsed.length === 0) {
    throw new Error('Zero-length JSON array received');
  }

  return parsed;
};

var log = function(message, opts) {
  if ((opts === undefined || opts.verbose) && typeof console !== undefined) {
    console.log(message);
  }
};

var EVENTS = {
  connect: 'js:connect',
  disconnect: 'js:disconnect',
  error: 'js:error'
};

var RESERVED_WORDS = (function() {
  var tmp = {};
  for(var key in EVENTS) {
    if (Object.prototype.hasOwnProperty.call(EVENTS, key)) {
      tmp[EVENTS[key]] = true;
    }
  }
  return tmp;
})();

var send = function (opts, socket) {
  return function (type) {
    if (typeof type !== 'string') {
      throw new Error('Message type must be a string');
    }
    if (Object.prototype.hasOwnProperty.call(RESERVED_WORDS, type)) {
      throw new Error('Cannot send message type ' + type);
    }
    log('Sending ' + type + ' message', opts);
    socket.send(JSON.stringify(Array.prototype.slice.call(arguments)));
  };
};

var handleMessage = function(opts, events) {
  return function(msg) {
    var parsed;
    try {
      parsed = parse(msg);
    } catch (parseError) {
      log('Trouble parsing JSON from message on websocket: ' + parseError.message, opts);
      return;
    }
    log('Got ' + parsed[0] + ' message', opts);
    events.emit.apply(events, parsed);
  };
};

//TODO: turn this into some sort of generic object and wrap it with thin server and client objects?
exports.EVENTS = EVENTS;
exports.send = send;
exports.parse = parse;
exports.log = log;
exports.handleMessage = handleMessage;