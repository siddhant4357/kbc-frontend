if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: {},
    browser: true,
    version: '0.0.0',
    platform: 'browser',
    nextTick: function(fn) { setTimeout(fn, 0); }
  };
}

if (typeof window !== 'undefined') {
  window.global = window;
}