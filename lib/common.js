'use strict';

var EventEmitter = require('events').EventEmitter;

//Message on wire = [replyToId || null, type || inResponseTo, ... z]

var isArray = Array.isArray || function(obj) { return Object.prototype.toString.call(obj) === '[object Array]'; };

var parse = function(msg) {
  if (msg.type !== 'message' && msg.type !== 'utf8') {
    throw new Error('Non-UTF-8 message received');
  }

  var parsed = JSON.parse(msg.utf8Data || msg.data);

  if (!isArray(parsed)) {
    throw new Error('JSON non-array received');
  }

  if (parsed.length < 2) {
    throw new Error('Messages must contain at least two elements');
  }

  if (parsed[0] !== null && typeof parsed[0] !== 'number') {
    throw new Error('First message element must be a numeric message id or null');
  }

  if (typeof parsed[1] !== 'number' && typeof parsed[1] !== 'string') {
    throw new Error('Second message element must be a numeric message id or a type string');
  }

  return parsed;
};

var log = function(message, opts) {
  if ((opts === undefined || opts.verbose) && typeof console !== undefined) {
    console.log(message);
  }
};

var nextMessageId = (function() {
  var counter = 0;
  return function() { return counter++; };
})();

var send = function(socket, replyEvents, opts) {
  return function() {
    //TODO: some logging
    var payload = Array.prototype.slice.call(arguments);
    var callback = false;
    var replyToId = null;
    if (payload.length > 0 && typeof payload[payload.length - 1] === 'function') {
      callback = payload.pop();
      replyToId = nextMessageId();
    }
    payload.unshift(replyToId);
    log('Sending ' + payload[1] + ' message to ' + socket.name, opts);
    log(JSON.stringify(payload));
    socket.send(JSON.stringify(payload));
    if (callback) {
      //TODO: timeouts
      replyEvents.once(replyToId.toString(), function() {
        callback.apply(callback, Array.prototype.slice.call(arguments));
      });
    }
  };
};

var receive = function(messageEvents, socket, replyEvents, opts) {
  var sendResponse = send(socket, replyEvents);

  return function(msg) {
    var parsed;
    try {
      parsed = parse(msg);
    } catch (parseError) {
      log('Error parsing message from ' + socket.name + ': ' + parseError.message, opts);
      return;
    }
    //TODO: include the "expecting response" or "in response to X" or "type Y" in this log message
    log('Got ' + parsed[1] + ' message from ' + socket.name, opts);
    log(JSON.stringify(parsed));

    var respondToId = parsed.shift();
    if (respondToId !== null) { 
      //Expecting a response, build a callback and shove it on the end
      var respond = function() {
        var args = Array.prototype.slice.call(arguments);
        args.unshift(respondToId); //Push the respondToId onto the front as a "in response to" value
        sendResponse.apply(undefined, args);
      };
      parsed.push(respond);
    }

    if (typeof parsed[0] === 'string') { //This is a new regular "typed" message
      if (socket.id !== undefined) {
        parsed.splice(1, 0, socket.id);
      }
      messageEvents.emit.apply(messageEvents, parsed);
    } else if (typeof parsed[0] === 'number') { //This is a response to one of my messages
      replyEvents.emit.apply(replyEvents, parsed); //TODO: assert that there is a listener for this event?
    }
  };
};

exports.send = send;
exports.receive = receive;
exports.log = log;
