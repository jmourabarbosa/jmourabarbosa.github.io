/**
 * Tests for Teaching editor (add/edit/delete)
 */
describe('Editor.Teaching', function () {

  var savedArgs;

  beforeEach(function () {
    savedArgs = null;
    MockFetch.install();
    window.CMS.token = 'test-token';
    window.CMS.isAdmin = true;
    if (window.CMS._clearShaCache) window.CMS._clearShaCache();

    window.CMS._origSaveData = window.CMS.saveData;
    window.CMS.saveData = function (file, data) {
      savedArgs = { file: file, data: JSON.parse(JSON.stringify(data)) };
      return Promise.resolve({ content: { sha: 'test' } });
    };

    window.ContentLoader._origRenderTeaching = window.ContentLoader.renderTeaching;
    window.ContentLoader.renderTeaching = function () { return Promise.resolve(); };
  });

  afterEach(function () {
    MockFetch.uninstall();
    window.CMS.saveData = window.CMS._origSaveData;
    window.ContentLoader.renderTeaching = window.ContentLoader._origRenderTeaching;
    var overlay = document.getElementById('cmsEditorOverlay');
    if (overlay) overlay.remove();
  });

  it('addTeaching adds item to correct column', function () {
    var data = {
      columns: [
        { id: 'col-1', title: 'Courses', items: [] },
        { id: 'col-2', title: 'Tutorials', items: [] }
      ]
    };
    window.ContentLoader.setCache('teaching.json', data);

    window.Editor.addTeaching();

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      document.getElementById('cms-field-title').value = 'New Course';
      document.getElementById('cms-field-url').value = 'https://example.com';
      document.getElementById('cms-field-type').value = 'Graduate Course';
      document.getElementById('cms-field-column').value = 'col-1';
      document.getElementById('cms-field-summary').value = 'A summary';
      document.getElementById('cms-field-venue').value = 'ENS Paris (2025)';
      document.getElementById('cms-field-details').value = '<p>Details</p>';

      document.getElementById('cmsEditorSave').click();

      return new Promise(function (resolve) { setTimeout(resolve, 50); });
    }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.file, 'teaching.json');

      var col1 = savedArgs.data.columns.find(function (c) { return c.id === 'col-1'; });
      assert.equal(col1.items.length, 1, 'Item added to col-1');
      assert.equal(col1.items[0].title, 'New Course');
      assert.ok(col1.items[0].id, 'Should have an id');

      var col2 = savedArgs.data.columns.find(function (c) { return c.id === 'col-2'; });
      assert.equal(col2.items.length, 0, 'col-2 should be empty');
    });
  });

  it('editTeaching updates fields and moves column if changed', function () {
    var data = {
      columns: [
        { id: 'col-1', title: 'Courses', items: [
          { id: 'teach-edit-1', title: 'Old Title', url: '', type: 'Course', summary: '', venue: '', details: '' }
        ]},
        { id: 'col-2', title: 'Tutorials', items: [] }
      ]
    };
    window.ContentLoader.setCache('teaching.json', data);

    window.Editor.editTeaching('teach-edit-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      document.getElementById('cms-field-title').value = 'Updated Title';
      document.getElementById('cms-field-column').value = 'col-2';

      document.getElementById('cmsEditorSave').click();

      return new Promise(function (resolve) { setTimeout(resolve, 50); });
    }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');

      var col1 = savedArgs.data.columns.find(function (c) { return c.id === 'col-1'; });
      var col2 = savedArgs.data.columns.find(function (c) { return c.id === 'col-2'; });
      assert.equal(col1.items.length, 0, 'Moved out of col-1');
      assert.equal(col2.items.length, 1, 'Moved into col-2');
      assert.equal(col2.items[0].title, 'Updated Title');
    });
  });

  it('deleteTeaching removes item from column', function () {
    var data = {
      columns: [
        { id: 'col-1', title: 'Courses', items: [
          { id: 'teach-del-1', title: 'Item 1', url: '', type: '', summary: '', venue: '', details: '' },
          { id: 'teach-del-2', title: 'Item 2', url: '', type: '', summary: '', venue: '', details: '' }
        ]}
      ]
    };
    window.ContentLoader.setCache('teaching.json', data);

    window.Editor.deleteTeaching('teach-del-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.data.columns[0].items.length, 1);
      assert.equal(savedArgs.data.columns[0].items[0].id, 'teach-del-2');
    });
  });
});
