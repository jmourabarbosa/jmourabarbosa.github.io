/**
 * Tests for People editor (add/edit/delete)
 */
describe('Editor.People', function () {

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

    window.ContentLoader._origRenderPeople = window.ContentLoader.renderPeople;
    window.ContentLoader.renderPeople = function () { return Promise.resolve(); };
  });

  afterEach(function () {
    MockFetch.uninstall();
    window.CMS.saveData = window.CMS._origSaveData;
    window.ContentLoader.renderPeople = window.ContentLoader._origRenderPeople;
    var overlay = document.getElementById('cmsEditorOverlay');
    if (overlay) overlay.remove();
  });

  it('addPerson appends member with current as boolean', function () {
    var data = {
      members: [
        { id: 'p-1', name: 'Existing', position: 'PhD', positionType: 'phd', current: true, photo: '', description: '', links: [] }
      ]
    };
    window.ContentLoader.setCache('people.json', data);

    window.Editor.addPerson();

    document.getElementById('cms-field-name').value = 'New Person';
    document.getElementById('cms-field-position').value = 'Postdoc';
    document.getElementById('cms-field-positionType').value = 'phd';
    document.getElementById('cms-field-current').value = 'true';
    document.getElementById('cms-field-photo').value = '/images/people/new.jpg';
    document.getElementById('cms-field-description').value = 'A new member';

    document.getElementById('cmsEditorSave').click();

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.file, 'people.json');
      assert.equal(savedArgs.data.members.length, 2, 'Should have 2 members');

      var newMember = savedArgs.data.members[1];
      assert.equal(newMember.name, 'New Person');
      assert.ok(newMember.id, 'Should have an id');
      assert.equal(newMember.current, true, 'current should be boolean true');
      assert.equal(typeof newMember.current, 'boolean', 'current should be boolean type');
    });
  });

  it('editPerson updates fields by id', function () {
    var data = {
      members: [
        { id: 'p-edit-1', name: 'Old Name', position: 'PhD Student', positionType: 'phd', current: true, photo: '', description: '', links: [] },
        { id: 'p-edit-2', name: 'Other', position: 'Eng', positionType: 'engineer', current: true, photo: '', description: '', links: [] }
      ]
    };
    window.ContentLoader.setCache('people.json', data);

    window.Editor.editPerson('p-edit-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      document.getElementById('cms-field-name').value = 'Updated Name';
      document.getElementById('cms-field-position').value = 'Postdoc';

      document.getElementById('cmsEditorSave').click();

      return new Promise(function (resolve) { setTimeout(resolve, 50); });
    }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.data.members.length, 2, 'Member count unchanged');
      var edited = savedArgs.data.members.find(function (m) { return m.id === 'p-edit-1'; });
      assert.equal(edited.name, 'Updated Name');
      assert.equal(edited.position, 'Postdoc');
    });
  });

  it('deletePerson removes member by id', function () {
    var data = {
      members: [
        { id: 'p-del-1', name: 'Person 1', position: '', positionType: 'phd', current: true, photo: '', description: '', links: [] },
        { id: 'p-del-2', name: 'Person 2', position: '', positionType: 'phd', current: true, photo: '', description: '', links: [] }
      ]
    };
    window.ContentLoader.setCache('people.json', data);

    window.Editor.deletePerson('p-del-1');

    return new Promise(function (resolve) { setTimeout(resolve, 50); }).then(function () {
      assert.ok(savedArgs, 'saveData should have been called');
      assert.equal(savedArgs.data.members.length, 1);
      assert.equal(savedArgs.data.members[0].id, 'p-del-2');
    });
  });
});
