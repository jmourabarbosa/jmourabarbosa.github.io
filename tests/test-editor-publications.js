/**
 * Tests for Publications editor (add/edit/delete)
 */
describe('Editor.Publications', function () {

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

    window.ContentLoader._origRenderPublications = window.ContentLoader.renderPublications;
    window.ContentLoader.renderPublications = function () { return Promise.resolve(); };
  });

  afterEach(function () {
    MockFetch.uninstall();
    window.CMS.saveData = window.CMS._origSaveData;
    window.ContentLoader.renderPublications = window.ContentLoader._origRenderPublications;
    var overlay = document.getElementById('cmsEditorOverlay');
    if (overlay) overlay.remove();
  });

  it('addPublication adds pub to correct section with parsed tags and categories', function () {
    var data = {
      sections: [
        { id: 'peer-reviewed', title: 'Peer-reviewed', publications: [] },
        { id: 'preprint', title: 'Pre-print', publications: [] }
      ]
    };
    window.ContentLoader.setCache('publications.json', data);

    window.Editor.addPublication();

    document.getElementById('cms-field-title').value = 'Test Paper';
    document.getElementById('cms-field-url').value = 'https://example.com';
    document.getElementById('cms-field-authors').value = 'Author A, Author B';
    document.getElementById('cms-field-journal').value = 'Nature';
    document.getElementById('cms-field-section').value = 'peer-reviewed';
    document.getElementById('cms-field-tags').value = 'working-memory, meeg';

    document.getElementById('cmsEditorSave').click();

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.file, 'publications.json');

      var section = savedArgs.data.sections.find(function (s) { return s.id === 'peer-reviewed'; });
      assert.equal(section.publications.length, 1, 'Pub added to peer-reviewed section');

      var pub = section.publications[0];
      assert.equal(pub.title, 'Test Paper');
      assert.ok(pub.id, 'Should have an id');
      assert.equal(pub.tags.length, 2, 'Should have 2 tags');
      assert.equal(pub.tags[0].key, 'working-memory');
      assert.ok(pub.categories.indexOf('peer-reviewed') !== -1, 'Categories should include section');
    });
  });

  it('editPublication updates fields and moves to new section if changed', function () {
    var data = {
      sections: [
        { id: 'peer-reviewed', title: 'Peer-reviewed', publications: [
          { id: 'pub-edit-1', title: 'Old Title', url: '', authors: 'A', journal: 'J', categories: 'peer-reviewed', tags: [], links: [] }
        ]},
        { id: 'preprint', title: 'Pre-print', publications: [] }
      ]
    };
    window.ContentLoader.setCache('publications.json', data);

    window.Editor.editPublication('pub-edit-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      document.getElementById('cms-field-title').value = 'Updated Title';
      document.getElementById('cms-field-section').value = 'preprint';

      document.getElementById('cmsEditorSave').click();

      return new Promise(function (resolve) { setTimeout(resolve, 50); });
    }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');

      var peerReviewed = savedArgs.data.sections.find(function (s) { return s.id === 'peer-reviewed'; });
      var preprint = savedArgs.data.sections.find(function (s) { return s.id === 'preprint'; });
      assert.equal(peerReviewed.publications.length, 0, 'Moved out of peer-reviewed');
      assert.equal(preprint.publications.length, 1, 'Moved into preprint');
      assert.equal(preprint.publications[0].title, 'Updated Title');
    });
  });

  it('deletePublication removes pub from its section', function () {
    var data = {
      sections: [
        { id: 'peer-reviewed', title: 'Peer-reviewed', publications: [
          { id: 'pub-del-1', title: 'Paper 1', url: '', authors: '', journal: '', categories: '', tags: [], links: [] },
          { id: 'pub-del-2', title: 'Paper 2', url: '', authors: '', journal: '', categories: '', tags: [], links: [] }
        ]}
      ]
    };
    window.ContentLoader.setCache('publications.json', data);

    window.Editor.deletePublication('pub-del-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      var section = savedArgs.data.sections[0];
      assert.equal(section.publications.length, 1);
      assert.equal(section.publications[0].id, 'pub-del-2');
    });
  });
});
