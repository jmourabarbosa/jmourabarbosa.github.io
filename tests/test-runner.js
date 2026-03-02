/**
 * Minimal Test Runner
 * Provides describe/it/assert with async support.
 * Renders results into #test-results.
 */
(function () {
  'use strict';

  var suites = [];
  var currentSuite = null;

  window.describe = function (name, fn) {
    var suite = { name: name, tests: [], beforeEach: null, afterEach: null };
    var previousSuite = currentSuite;
    currentSuite = suite;
    fn();
    currentSuite = previousSuite;
    suites.push(suite);
  };

  window.it = function (name, fn) {
    if (!currentSuite) throw new Error('it() must be called inside describe()');
    currentSuite.tests.push({ name: name, fn: fn });
  };

  window.beforeEach = function (fn) {
    if (!currentSuite) throw new Error('beforeEach() must be called inside describe()');
    currentSuite.beforeEach = fn;
  };

  window.afterEach = function (fn) {
    if (!currentSuite) throw new Error('afterEach() must be called inside describe()');
    currentSuite.afterEach = fn;
  };

  window.assert = {
    equal: function (actual, expected, msg) {
      if (actual !== expected) {
        throw new Error((msg || 'assert.equal') + ': expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual));
      }
    },
    deepEqual: function (actual, expected, msg) {
      var a = JSON.stringify(actual);
      var b = JSON.stringify(expected);
      if (a !== b) {
        throw new Error((msg || 'assert.deepEqual') + ': expected ' + b + ' but got ' + a);
      }
    },
    ok: function (value, msg) {
      if (!value) {
        throw new Error((msg || 'assert.ok') + ': expected truthy but got ' + JSON.stringify(value));
      }
    },
    throws: function (fn, msg) {
      var threw = false;
      try { fn(); } catch (e) { threw = true; }
      if (!threw) {
        throw new Error((msg || 'assert.throws') + ': expected function to throw');
      }
    }
  };

  window.runTests = function () {
    var container = document.getElementById('test-results');
    if (!container) {
      container = document.createElement('div');
      container.id = 'test-results';
      document.body.appendChild(container);
    }
    container.innerHTML = '<h1>Running tests...</h1>';

    var totalPass = 0;
    var totalFail = 0;
    var results = [];

    function runSuite(suiteIndex) {
      if (suiteIndex >= suites.length) {
        render(results, totalPass, totalFail, container);
        return;
      }

      var suite = suites[suiteIndex];
      var suiteResult = { name: suite.name, tests: [] };
      results.push(suiteResult);

      function runTest(testIndex) {
        if (testIndex >= suite.tests.length) {
          runSuite(suiteIndex + 1);
          return;
        }

        var test = suite.tests[testIndex];
        var chain = Promise.resolve();

        if (suite.beforeEach) {
          chain = chain.then(function () { return suite.beforeEach(); });
        }

        chain = chain.then(function () {
          return test.fn();
        }).then(function () {
          suiteResult.tests.push({ name: test.name, passed: true });
          totalPass++;
        }).catch(function (err) {
          suiteResult.tests.push({ name: test.name, passed: false, error: err.message || String(err) });
          totalFail++;
        });

        if (suite.afterEach) {
          chain = chain.then(function () { return suite.afterEach(); }).catch(function () {});
        }

        chain.then(function () {
          runTest(testIndex + 1);
        });
      }

      runTest(0);
    }

    runSuite(0);
  };

  function render(results, pass, fail, container) {
    var html = '<h1>Tests: ' + pass + ' passed, ' + fail + ' failed</h1>';

    results.forEach(function (suite) {
      html += '<div class="test-suite">';
      html += '<h2>' + esc(suite.name) + '</h2>';
      suite.tests.forEach(function (t) {
        if (t.passed) {
          html += '<div class="test-pass">&#10003; ' + esc(t.name) + '</div>';
        } else {
          html += '<div class="test-fail">&#10007; ' + esc(t.name) + '<pre>' + esc(t.error) + '</pre></div>';
        }
      });
      html += '</div>';
    });

    container.innerHTML = html;
  }

  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

})();
