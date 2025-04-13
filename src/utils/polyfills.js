if (typeof process === 'undefined') {
  window.process = {
    env: {},
    browser: true,
    version: '0.0.0',
    platform: 'browser',
    nextTick: function(fn) { setTimeout(fn, 0); },
    on: function() { return process; },
    addListener: function() { return process; },
    once: function() { return process; },
    off: function() { return process; },
    removeListener: function() { return process; },
    removeAllListeners: function() { return process; },
    emit: function() { return process; },
    prependListener: function() { return process; },
    prependOnceListener: function() { return process; }
  };
}