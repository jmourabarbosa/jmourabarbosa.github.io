/**
 * Tests for CMS.readFile and CMS.writeFile (admin.js)
 */
describe('CMS.readFile', function () {

  beforeEach(function () {
    MockFetch.install();
    window.CMS.token = 'test-token';
    if (window.CMS._clearShaCache) window.CMS._clearShaCache();
  });

  afterEach(function () {
    MockFetch.uninstall();
  });

  it('fetches from GitHub API with cache-busting parameter', function () {
    MockFetch.on('GET', '/contents/data/test.json', {
      status: 200,
      body: { sha: 'abc123', content: btoa('{}') }
    });

    return window.CMS.readFile('data/test.json').then(function () {
      var call = MockFetch.callLog[0];
      assert.ok(call.url.indexOf('&t=') !== -1, 'URL should contain cache-busting &t= parameter');
      assert.equal(call.options.cache, 'no-store', 'Should use cache: no-store');
    });
  });
});

describe('CMS.writeFile', function () {

  beforeEach(function () {
    MockFetch.install();
    window.CMS.token = 'test-token';
    if (window.CMS._clearShaCache) window.CMS._clearShaCache();
  });

  afterEach(function () {
    MockFetch.uninstall();
  });

  it('reads SHA then PUTs successfully', function () {
    MockFetch.on('GET', '/contents/data/test.json', {
      status: 200,
      body: { sha: 'abc123', content: btoa('{}') }
    });

    MockFetch.on('PUT', '/contents/data/test.json', function (url, opts) {
      var body = JSON.parse(opts.body);
      return {
        status: 200,
        body: { content: { sha: 'def456' }, commit: {} }
      };
    });

    return window.CMS.writeFile('data/test.json', '{"key":"value"}', 'test commit').then(function (result) {
      // Verify PUT was called with correct SHA
      var putCall = MockFetch.callLog.find(function (c) { return c.method === 'PUT'; });
      assert.ok(putCall, 'PUT should have been called');
      var putBody = JSON.parse(putCall.options.body);
      assert.equal(putBody.sha, 'abc123', 'PUT body should include SHA from readFile');
      assert.ok(putBody.content, 'PUT body should include encoded content');
    });
  });

  it('creates new file when readFile returns 404', function () {
    MockFetch.on('GET', '/contents/data/new-file.json', {
      status: 404,
      body: { message: 'Not Found' }
    });

    MockFetch.on('PUT', '/contents/data/new-file.json', {
      status: 201,
      body: { content: { sha: 'new-sha' }, commit: {} }
    });

    return window.CMS.writeFile('data/new-file.json', '{}', 'create file').then(function () {
      var putCall = MockFetch.callLog.find(function (c) { return c.method === 'PUT'; });
      var putBody = JSON.parse(putCall.options.body);
      assert.ok(!putBody.sha, 'PUT body should not include sha for new file');
    });
  });

  it('retries on SHA mismatch error', function () {
    // GET always returns same sha (simulating stale CDN)
    MockFetch.on('GET', '/contents/data/test.json', {
      status: 200,
      body: { sha: 'stale-sha', content: btoa('{}') }
    });

    // First PUT fails with 409/422, second succeeds
    MockFetch.sequence('PUT', '/contents/data/test.json', [
      { status: 409, body: { message: 'data/test.json does not match' } },
      { status: 200, body: { content: { sha: 'fresh-sha' }, commit: {} } }
    ]);

    return window.CMS.writeFile('data/test.json', '{"updated":true}', 'retry test').then(function () {
      var putCalls = MockFetch.callLog.filter(function (c) { return c.method === 'PUT'; });
      assert.ok(putCalls.length >= 2, 'Should have retried PUT at least once');
    });
  });

  it('uses cached SHA from prior successful write', function () {
    // First write: needs GET + PUT
    MockFetch.on('GET', '/contents/data/cached.json', {
      status: 200,
      body: { sha: 'original-sha', content: btoa('{}') }
    });

    MockFetch.on('PUT', '/contents/data/cached.json', function (url, opts) {
      return {
        status: 200,
        body: { content: { sha: 'new-sha-from-put' }, commit: {} }
      };
    });

    return window.CMS.writeFile('data/cached.json', '{"v":1}', 'first write').then(function () {
      // Reset call log to track second write
      MockFetch.callLog = [];

      return window.CMS.writeFile('data/cached.json', '{"v":2}', 'second write');
    }).then(function () {
      // Second write should NOT call GET (SHA from cache)
      var getCalls = MockFetch.callLog.filter(function (c) { return c.method === 'GET'; });
      assert.equal(getCalls.length, 0, 'Second writeFile should skip readFile when SHA is cached');

      // Verify the cached SHA was used in PUT
      var putCall = MockFetch.callLog.find(function (c) { return c.method === 'PUT'; });
      var putBody = JSON.parse(putCall.options.body);
      assert.equal(putBody.sha, 'new-sha-from-put', 'Should use SHA returned by previous PUT');
    });
  });

  it('rejects on non-SHA errors without retry', function () {
    MockFetch.on('GET', '/contents/data/test.json', {
      status: 200,
      body: { sha: 'abc123', content: btoa('{}') }
    });

    MockFetch.on('PUT', '/contents/data/test.json', {
      status: 403,
      body: { message: 'Resource not accessible by integration' }
    });

    var caught = false;
    return window.CMS.writeFile('data/test.json', '{}', 'test').catch(function (err) {
      caught = true;
      assert.ok(err.message.indexOf('not accessible') !== -1, 'Should propagate original error');
    }).then(function () {
      assert.ok(caught, 'Should have rejected');
      var putCalls = MockFetch.callLog.filter(function (c) { return c.method === 'PUT'; });
      assert.equal(putCalls.length, 1, 'Should NOT retry on non-SHA errors');
    });
  });

  it('invalidates cached SHA on mismatch and retries', function () {
    // Pre-populate cache via a successful write
    MockFetch.on('GET', '/contents/data/inv.json', {
      status: 200,
      body: { sha: 'orig-sha', content: btoa('{}') }
    });

    MockFetch.sequence('PUT', '/contents/data/inv.json', [
      // First write succeeds, caching sha
      { status: 200, body: { content: { sha: 'cached-sha' }, commit: {} } },
      // Second write: cached sha is stale, fails
      { status: 409, body: { message: 'data/inv.json does not match' } },
      // Retry after re-read succeeds
      { status: 200, body: { content: { sha: 'final-sha' }, commit: {} } }
    ]);

    return window.CMS.writeFile('data/inv.json', '{"v":1}', 'first').then(function () {
      // Now the sha 'cached-sha' is cached. Change GET to return a fresh sha
      MockFetch.reset();
      MockFetch.on('GET', '/contents/data/inv.json', {
        status: 200,
        body: { sha: 'fresh-from-api', content: btoa('{}') }
      });
      MockFetch.sequence('PUT', '/contents/data/inv.json', [
        { status: 409, body: { message: 'data/inv.json does not match' } },
        { status: 200, body: { content: { sha: 'final-sha' }, commit: {} } }
      ]);

      return window.CMS.writeFile('data/inv.json', '{"v":2}', 'second');
    }).then(function () {
      // Should have re-read from API after cache miss
      var getCalls = MockFetch.callLog.filter(function (c) { return c.method === 'GET'; });
      assert.ok(getCalls.length >= 1, 'Should fall back to readFile after cached SHA mismatch');
    });
  });
});
