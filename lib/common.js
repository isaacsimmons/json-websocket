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
var PREFIX = 'js:';

var check = function (type, opts) {
  if (typeof type !== 'string') {
    throw new Error('Message type must be a string');
  }
  if (type.lastIndexOf(PREFIX, 0) === 0) {
    throw new Error('Message type cannot start with ' + PREFIX);
  }
  log('Ready to send ' + type + ' message', opts);
};

var handler = function(opts, callback) {
  return function(msg) {
    var parsed;
    try {
      parsed = parse(msg);
    } catch (parseError) {
      log('Trouble parsing JSON from message on websocket: ' + parseError.message, opts);
      return;
    }
    log('Got ' + parsed[0] + ' message', opts);
    callback(parsed);
  };
};

//TODO: turn this into some sort of generic object and wrap it with thin server and client objects?
exports.EVENTS = EVENTS;
exports.check = check;
exports.log = log;
exports.handler = handler;

