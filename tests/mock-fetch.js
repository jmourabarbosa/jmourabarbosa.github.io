/**
 * Fetch Mock
 * Replaces window.fetch with a programmable stub.
 */
(function () {
  'use strict';

  var originalFetch = null;
  var handlers = [];
  var sequenceHandlers = [];

  window.MockFetch = {
    callLog: [],

    install: function () {
      originalFetch = window.fetch;
      window.MockFetch.callLog = [];
      handlers = [];
      sequenceHandlers = [];

      window.fetch = function (url, options) {
        var method = (options && options.method) ? options.method.toUpperCase() : 'GET';
        window.MockFetch.callLog.push({ url: url, method: method, options: options });

        // Check sequence handlers first
        for (var s = 0; s < sequenceHandlers.length; s++) {
          var seq = sequenceHandlers[s];
          if (seq.method === method && matchUrl(seq.urlPattern, url)) {
            var idx = seq.callIndex;
            seq.callIndex++;
            var resp = (idx < seq.responses.length) ? seq.responses[idx] : seq.responses[seq.responses.length - 1];
            return buildResponse(resp, url, options);
          }
        }

        // Check static handlers
        for (var i = 0; i < handlers.length; i++) {
          var h = handlers[i];
          if (h.method === method && matchUrl(h.urlPattern, url)) {
            return buildResponse(h.response, url, options);
          }
        }

        return Promise.reject(new Error('MockFetch: no handler for ' + method + ' ' + url));
      };
    },

    uninstall: function () {
      if (originalFetch) {
        window.fetch = originalFetch;
        originalFetch = null;
      }
      handlers = [];
      sequenceHandlers = [];
      window.MockFetch.callLog = [];
    },

    on: function (method, urlPattern, response) {
      handlers.push({
        method: method.toUpperCase(),
        urlPattern: urlPattern,
        response: response
      });
    },

    sequence: function (method, urlPattern, responses) {
      sequenceHandlers.push({
        method: method.toUpperCase(),
        urlPattern: urlPattern,
        responses: responses,
        callIndex: 0
      });
    },

    reset: function () {
      handlers = [];
      sequenceHandlers = [];
      window.MockFetch.callLog = [];
    }
  };

  function matchUrl(pattern, url) {
    if (typeof pattern === 'string') {
      return url.indexOf(pattern) !== -1;
    }
    if (pattern instanceof RegExp) {
      return pattern.test(url);
    }
    return false;
  }

  function buildResponse(resp, url, options) {
    if (typeof resp === 'function') {
      resp = resp(url, options);
    }
    var status = resp.status || 200;
    var body = resp.body !== undefined ? resp.body : {};

    return Promise.resolve({
      ok: status >= 200 && status < 300,
      status: status,
      json: function () { return Promise.resolve(body); },
      text: function () { return Promise.resolve(typeof body === 'string' ? body : JSON.stringify(body)); }
    });
  }

})();
