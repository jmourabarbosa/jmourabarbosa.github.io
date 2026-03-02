/**
 * Tests for Research editor (add/edit/delete)
 */
describe('Editor.Research', function () {

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

    window.ContentLoader._origRenderResearch = window.ContentLoader.renderResearch;
    window.ContentLoader.renderResearch = function () { return Promise.resolve(); };
  });

  afterEach(function () {
    MockFetch.uninstall();
    window.CMS.saveData = window.CMS._origSaveData;
    window.ContentLoader.renderResearch = window.ContentLoader._origRenderResearch;
    var overlay = document.getElementById('cmsEditorOverlay');
    if (overlay) overlay.remove();
  });

  it('addResearch appends card with title and sections', function () {
    var data = { cards: [{ id: 'r-1', title: 'Existing', sections: [] }] };
    window.ContentLoader.setCache('research.json', data);

    window.Editor.addResearch();

    document.getElementById('cms-field-title').value = 'New Topic';
    // Fill section fields
    var titleInputs = document.querySelectorAll('.cms-section-title');
    var contentInputs = document.querySelectorAll('.cms-section-content');
    if (titleInputs.length > 0) {
      titleInputs[0].value = 'Section A';
      contentInputs[0].value = 'Section A content';
    }

    document.getElementById('cmsEditorSave').click();

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.file, 'research.json');
      assert.equal(savedArgs.data.cards.length, 2, 'Should have 2 cards');
      var newCard = savedArgs.data.cards[1];
      assert.equal(newCard.title, 'New Topic');
      assert.ok(newCard.id, 'New card should have an id');
      assert.ok(newCard.sections.length > 0, 'Should have sections');
      assert.equal(newCard.sections[0].title, 'Section A');
    });
  });

  it('editResearch updates title and sections by id', function () {
    var data = {
      cards: [
        { id: 'r-edit-1', title: 'Old Title', sections: [{ title: 'S1', content: 'C1' }] },
        { id: 'r-edit-2', title: 'Other', sections: [] }
      ]
    };
    window.ContentLoader.setCache('research.json', data);

    window.Editor.editResearch('r-edit-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      document.getElementById('cms-field-title').value = 'Updated Title';
      var sectionTitles = document.querySelectorAll('.cms-section-title');
      if (sectionTitles.length > 0) {
        sectionTitles[0].value = 'Updated Section';
      }

      document.getElementById('cmsEditorSave').click();

      return new Promise(function (resolve) { setTimeout(resolve, 50); });
    }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.data.cards.length, 2, 'Card count unchanged');
      var edited = savedArgs.data.cards.find(function (c) { return c.id === 'r-edit-1'; });
      assert.equal(edited.title, 'Updated Title');
    });
  });

  it('deleteResearch removes card by id', function () {
    var data = {
      cards: [
        { id: 'r-del-1', title: 'Card 1', sections: [] },
        { id: 'r-del-2', title: 'Card 2', sections: [] }
      ]
    };
    window.ContentLoader.setCache('research.json', data);

    window.Editor.deleteResearch('r-del-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.data.cards.length, 1);
      assert.equal(savedArgs.data.cards[0].id, 'r-del-2');
    });
  });
});
