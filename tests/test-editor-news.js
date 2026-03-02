/**
 * Tests for News editor (add/edit/delete)
 */
describe('Editor.News', function () {

  var savedArgs;

  beforeEach(function () {
    savedArgs = null;
    MockFetch.install();
    window.CMS.token = 'test-token';
    window.CMS.isAdmin = true;
    if (window.CMS._clearShaCache) window.CMS._clearShaCache();

    // Stub saveData to capture arguments
    window.CMS._origSaveData = window.CMS.saveData;
    window.CMS.saveData = function (file, data) {
      savedArgs = { file: file, data: JSON.parse(JSON.stringify(data)) };
      return Promise.resolve({ content: { sha: 'test' } });
    };

    // Stub renderers to no-op
    window.ContentLoader._origRenderNews = window.ContentLoader.renderNews;
    window.ContentLoader.renderNews = function () { return Promise.resolve(); };
  });

  afterEach(function () {
    MockFetch.uninstall();
    window.CMS.saveData = window.CMS._origSaveData;
    window.ContentLoader.renderNews = window.ContentLoader._origRenderNews;
    // Clean up any modals
    var overlay = document.getElementById('cmsEditorOverlay');
    if (overlay) overlay.remove();
  });

  it('addNews prepends a new item with id, date, and content', function () {
    var existingNews = [
      { id: 'news-1', date: 'Jan 2026', content: 'Existing item' }
    ];
    window.ContentLoader.setCache('news.json', existingNews);

    window.Editor.addNews();

    // Fill form fields
    document.getElementById('cms-field-date').value = 'Feb 2026';
    document.getElementById('cms-field-content').value = 'New news item';

    // Trigger save
    document.getElementById('cmsEditorSave').click();

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.file, 'news.json');
      assert.equal(savedArgs.data.length, 2, 'Should have 2 items');
      assert.equal(savedArgs.data[0].date, 'Feb 2026', 'New item should be first');
      assert.equal(savedArgs.data[0].content, 'New news item');
      assert.ok(savedArgs.data[0].id, 'New item should have an id');
    });
  });

  it('editNews updates fields by id', function () {
    var news = [
      { id: 'news-edit-1', date: 'Jan 2026', content: 'Original content' },
      { id: 'news-edit-2', date: 'Dec 2025', content: 'Other item' }
    ];
    window.ContentLoader.setCache('news.json', news);

    window.Editor.editNews('news-edit-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      document.getElementById('cms-field-date').value = 'Mar 2026';
      document.getElementById('cms-field-content').value = 'Updated content';
      document.getElementById('cmsEditorSave').click();

      return new Promise(function (resolve) { setTimeout(resolve, 50); });
    }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.data.length, 2, 'Array length unchanged');
      var edited = savedArgs.data.find(function (n) { return n.id === 'news-edit-1'; });
      assert.equal(edited.date, 'Mar 2026');
      assert.equal(edited.content, 'Updated content');
    });
  });

  it('deleteNews removes item by id', function () {
    var news = [
      { id: 'news-del-1', date: 'Jan 2026', content: 'Item 1' },
      { id: 'news-del-2', date: 'Dec 2025', content: 'Item 2' }
    ];
    window.ContentLoader.setCache('news.json', news);

    window.Editor.deleteNews('news-del-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.data.length, 1, 'Should have 1 item after delete');
      assert.equal(savedArgs.data[0].id, 'news-del-2', 'Remaining item should be the other one');
    });
  });
});
