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

exports.parse = parse;