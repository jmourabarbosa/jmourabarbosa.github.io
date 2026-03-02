/**
 * Tests for Community editor (add/edit/delete)
 */
describe('Editor.Community', function () {

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

    window.ContentLoader._origRenderCommunity = window.ContentLoader.renderCommunity;
    window.ContentLoader.renderCommunity = function () { return Promise.resolve(); };
  });

  afterEach(function () {
    MockFetch.uninstall();
    window.CMS.saveData = window.CMS._origSaveData;
    window.ContentLoader.renderCommunity = window.ContentLoader._origRenderCommunity;
    var overlay = document.getElementById('cmsEditorOverlay');
    if (overlay) overlay.remove();
  });

  it('addCommunity appends card with all fields', function () {
    var data = {
      cards: [{ id: 'c-1', title: 'Existing', image: '', imageAlt: '', content: '', organizers: '', links: [] }]
    };
    window.ContentLoader.setCache('community.json', data);

    window.Editor.addCommunity();

    document.getElementById('cms-field-title').value = 'New Event';
    document.getElementById('cms-field-image').value = '/images/event.png';
    document.getElementById('cms-field-imageAlt').value = 'Event photo';
    document.getElementById('cms-field-content').value = 'Event description';
    document.getElementById('cms-field-organizers').value = 'Org A, Org B';

    document.getElementById('cmsEditorSave').click();

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.file, 'community.json');
      assert.equal(savedArgs.data.cards.length, 2, 'Should have 2 cards');

      var newCard = savedArgs.data.cards[1];
      assert.equal(newCard.title, 'New Event');
      assert.ok(newCard.id, 'Should have an id');
      assert.equal(newCard.image, '/images/event.png');
      assert.equal(newCard.imageAlt, 'Event photo');
      assert.equal(newCard.content, 'Event description');
      assert.equal(newCard.organizers, 'Org A, Org B');
    });
  });

  it('editCommunity updates fields by id', function () {
    var data = {
      cards: [
        { id: 'c-edit-1', title: 'Old Title', image: '', imageAlt: '', content: 'Old', organizers: '', links: [] },
        { id: 'c-edit-2', title: 'Other', image: '', imageAlt: '', content: '', organizers: '', links: [] }
      ]
    };
    window.ContentLoader.setCache('community.json', data);

    window.Editor.editCommunity('c-edit-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      document.getElementById('cms-field-title').value = 'Updated Title';
      document.getElementById('cms-field-content').value = 'Updated content';

      document.getElementById('cmsEditorSave').click();

      return new Promise(function (resolve) { setTimeout(resolve, 50); });
    }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.data.cards.length, 2);
      var edited = savedArgs.data.cards.find(function (c) { return c.id === 'c-edit-1'; });
      assert.equal(edited.title, 'Updated Title');
      assert.equal(edited.content, 'Updated content');
    });
  });

  it('deleteCommunity removes card by id', function () {
    var data = {
      cards: [
        { id: 'c-del-1', title: 'Card 1', image: '', imageAlt: '', content: '', organizers: '', links: [] },
        { id: 'c-del-2', title: 'Card 2', image: '', imageAlt: '', content: '', organizers: '', links: [] }
      ]
    };
    window.ContentLoader.setCache('community.json', data);

    window.Editor.deleteCommunity('c-del-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.data.cards.length, 1);
      assert.equal(savedArgs.data.cards[0].id, 'c-del-2');
    });
  });
});
