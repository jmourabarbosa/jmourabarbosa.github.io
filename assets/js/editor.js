/**
 * Editor Module
 * Provides inline editing UI for all content sections.
 * Edit/Add/Delete operations with modal forms.
 * Saves via GitHub API through the CMS module.
 */
(function () {
  'use strict';

  window.Editor = window.Editor || {};

  // ============================================================
  // MODAL HELPERS
  // ============================================================
  function showModal(title, formHtml, onSave) {
    closeModal();

    var overlay = document.createElement('div');
    overlay.className = 'cms-modal-overlay';
    overlay.id = 'cmsEditorOverlay';

    var modal = document.createElement('div');
    modal.className = 'cms-modal cms-modal--editor';
    modal.innerHTML =
      '<h2 class="cms-modal__title">' + title + '</h2>' +
      '<div class="cms-modal__form">' + formHtml + '</div>' +
      '<div id="cmsEditorError" class="cms-error" style="display:none;"></div>' +
      '<div class="cms-modal__actions">' +
      '  <button id="cmsEditorCancel" class="cms-btn cms-btn--secondary">Cancel</button>' +
      '  <button id="cmsEditorSave" class="cms-btn cms-btn--primary">Save</button>' +
      '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('cmsEditorCancel').addEventListener('click', closeModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    document.getElementById('cmsEditorSave').addEventListener('click', function () {
      var saveBtn = document.getElementById('cmsEditorSave');
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving...';

      try {
        onSave();
      } catch (err) {
        showEditorError(err.message);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
      }
    });
  }

  function closeModal() {
    var overlay = document.getElementById('cmsEditorOverlay');
    if (overlay) overlay.remove();
  }

  function showEditorError(msg) {
    var errorEl = document.getElementById('cmsEditorError');
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  }

  function saveAndReload(dataFile, data, renderFn, containerId) {
    return window.CMS.saveData(dataFile, data).then(function () {
      window.ContentLoader.clearCache(dataFile);
      closeModal();
      // Re-fetch from local cache and re-render
      return renderFn(containerId);
    }).catch(function (err) {
      showEditorError('Save failed: ' + err.message);
      var saveBtn = document.getElementById('cmsEditorSave');
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save';
      }
    });
  }

  function fieldHtml(label, name, value, type) {
    type = type || 'text';
    var id = 'cms-field-' + name;
    if (type === 'textarea') {
      return '<div class="cms-field"><label for="' + id + '">' + label + '</label>' +
        '<textarea id="' + id + '" name="' + name + '" class="cms-input cms-textarea">' + (value || '') + '</textarea></div>';
    }
    if (type === 'richtext') {
      return '<div class="cms-field"><label for="' + id + '">' + label + ' <small>(HTML allowed)</small></label>' +
        '<textarea id="' + id + '" name="' + name + '" class="cms-input cms-textarea cms-richtext">' + (value || '') + '</textarea></div>';
    }
    if (type === 'select') {
      return ''; // handled separately
    }
    return '<div class="cms-field"><label for="' + id + '">' + label + '</label>' +
      '<input type="' + type + '" id="' + id + '" name="' + name + '" class="cms-input" value="' + escapeAttr(value || '') + '" /></div>';
  }

  function selectHtml(label, name, options, selectedValue) {
    var id = 'cms-field-' + name;
    var html = '<div class="cms-field"><label for="' + id + '">' + label + '</label>';
    html += '<select id="' + id + '" name="' + name + '" class="cms-input">';
    options.forEach(function (opt) {
      html += '<option value="' + opt.value + '"' + (opt.value === selectedValue ? ' selected' : '') + '>' + opt.label + '</option>';
    });
    html += '</select></div>';
    return html;
  }

  function getFieldValue(name) {
    var el = document.getElementById('cms-field-' + name);
    return el ? el.value : '';
  }

  function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ============================================================
  // SHARED CONSTANTS
  // ============================================================
  var POSITION_OPTIONS = [
    { value: 'leader', label: 'Group Leader' },
    { value: 'phd', label: 'PhD Student' },
    { value: 'engineer', label: 'Research Engineer' },
    { value: 'master', label: 'Master Student' },
    { value: 'alumni', label: 'Alumni' }
  ];

  var SECTION_OPTIONS = [
    { value: 'peer-reviewed', label: 'Peer-reviewed' },
    { value: 'conference', label: 'Conference' },
    { value: 'preprint', label: 'Pre-print' },
    { value: 'review', label: 'Review' },
    { value: 'thesis', label: 'PhD Thesis' },
    { value: 'in-progress', label: 'In Progress' }
  ];

  // Render existing links into the links editor area
  function renderExistingLinks(links) {
    var html = '';
    if (links) {
      links.forEach(function (link, i) {
        html += renderLinkFields(i, link.label, link.url);
      });
    }
    return html;
  }

  // ============================================================
  // NEWS EDITOR
  // ============================================================
  window.Editor.addNews = function () {
    var form = fieldHtml('Date (e.g. "Feb 2026")', 'date', '') +
      fieldHtml('Content', 'content', '', 'richtext');

    showModal('Add News Item', form, function () {
      var date = getFieldValue('date');
      var content = getFieldValue('content');
      if (!date || !content) { showEditorError('All fields are required.'); throw new Error('Validation'); }

      window.ContentLoader.fetchData('news.json').then(function (news) {
        var newItem = {
          id: window.CMS.generateId('news'),
          date: date,
          content: content
        };
        news.unshift(newItem);
        return saveAndReload('news.json', news, window.ContentLoader.renderNews, 'cms-news');
      });
    });
  };

  window.Editor.editNews = function (id) {
    window.ContentLoader.fetchData('news.json').then(function (news) {
      var item = news.find(function (n) { return n.id === id; });
      if (!item) return;

      var form = fieldHtml('Date', 'date', item.date) +
        fieldHtml('Content', 'content', item.content, 'richtext');

      showModal('Edit News Item', form, function () {
        item.date = getFieldValue('date');
        item.content = getFieldValue('content');
        if (!item.date || !item.content) { showEditorError('All fields are required.'); throw new Error('Validation'); }
        saveAndReload('news.json', news, window.ContentLoader.renderNews, 'cms-news');
      });
    });
  };

  window.Editor.deleteNews = function (id) {
    if (!confirm('Delete this news item?')) return;
    window.ContentLoader.fetchData('news.json').then(function (news) {
      var filtered = news.filter(function (n) { return n.id !== id; });
      saveAndReload('news.json', filtered, window.ContentLoader.renderNews, 'cms-news');
    });
  };

  // ============================================================
  // RESEARCH EDITOR
  // ============================================================
  window.Editor.addResearch = function () {
    var form = fieldHtml('Title', 'title', '') +
      '<div class="cms-sections-editor" id="cmsSectionsEditor">' +
      '<h3 class="cms-field-group-title">Sections</h3>' +
      renderSectionFields(0, '', '') +
      '</div>' +
      '<button type="button" class="cms-btn cms-btn--secondary cms-btn--small" onclick="Editor._addSectionField()">+ Add Section</button>';

    showModal('Add Research Topic', form, function () {
      var title = getFieldValue('title');
      if (!title) { showEditorError('Title is required.'); throw new Error('Validation'); }

      var sections = collectSections();

      window.ContentLoader.fetchData('research.json').then(function (data) {
        data.cards.push({
          id: window.CMS.generateId('research'),
          title: title,
          sections: sections
        });
        return saveAndReload('research.json', data, window.ContentLoader.renderResearch, 'cms-research');
      });
    });
  };

  window.Editor.editResearch = function (id) {
    window.ContentLoader.fetchData('research.json').then(function (data) {
      var card = data.cards.find(function (c) { return c.id === id; });
      if (!card) return;

      var sectionsHtml = '';
      card.sections.forEach(function (sec, i) {
        sectionsHtml += renderSectionFields(i, sec.title, sec.content);
      });

      var form = fieldHtml('Title', 'title', card.title) +
        '<div class="cms-sections-editor" id="cmsSectionsEditor">' +
        '<h3 class="cms-field-group-title">Sections</h3>' +
        sectionsHtml +
        '</div>' +
        '<button type="button" class="cms-btn cms-btn--secondary cms-btn--small" onclick="Editor._addSectionField()">+ Add Section</button>';

      showModal('Edit Research Topic', form, function () {
        card.title = getFieldValue('title');
        if (!card.title) { showEditorError('Title is required.'); throw new Error('Validation'); }
        card.sections = collectSections();
        saveAndReload('research.json', data, window.ContentLoader.renderResearch, 'cms-research');
      });
    });
  };

  window.Editor.deleteResearch = function (id) {
    if (!confirm('Delete this research topic?')) return;
    window.ContentLoader.fetchData('research.json').then(function (data) {
      data.cards = data.cards.filter(function (c) { return c.id !== id; });
      saveAndReload('research.json', data, window.ContentLoader.renderResearch, 'cms-research');
    });
  };

  // Research section helpers
  var sectionCounter = 0;

  function renderSectionFields(index, title, content) {
    var i = index || sectionCounter++;
    return '<div class="cms-section-group" data-section-index="' + i + '">' +
      '<div class="cms-section-group__header">' +
      '<strong>Section ' + (i + 1) + '</strong>' +
      '<button type="button" class="cms-btn cms-btn--danger cms-btn--tiny" onclick="this.closest(\'.cms-section-group\').remove()">Remove</button>' +
      '</div>' +
      '<div class="cms-field"><label>Section Title</label><input type="text" class="cms-input cms-section-title" value="' + escapeAttr(title || '') + '" /></div>' +
      '<div class="cms-field"><label>Content <small>(HTML allowed)</small></label><textarea class="cms-input cms-textarea cms-section-content">' + (content || '') + '</textarea></div>' +
      '</div>';
  }

  window.Editor._addSectionField = function () {
    var container = document.getElementById('cmsSectionsEditor');
    if (!container) return;
    var count = container.querySelectorAll('.cms-section-group').length;
    var div = document.createElement('div');
    div.innerHTML = renderSectionFields(count, '', '');
    container.appendChild(div.firstChild);
  };

  function collectSections() {
    var groups = document.querySelectorAll('#cmsSectionsEditor .cms-section-group');
    var sections = [];
    groups.forEach(function (group) {
      var title = group.querySelector('.cms-section-title').value;
      var content = group.querySelector('.cms-section-content').value;
      if (title || content) {
        sections.push({ title: title, content: content });
      }
    });
    return sections;
  }

  // ============================================================
  // PUBLICATIONS EDITOR
  // ============================================================
  window.Editor.addPublication = function () {
    var form = fieldHtml('Title', 'title', '') +
      fieldHtml('URL', 'url', '') +
      fieldHtml('Authors', 'authors', '', 'richtext') +
      fieldHtml('Journal / Venue', 'journal', '') +
      selectHtml('Section', 'section', SECTION_OPTIONS, 'peer-reviewed') +
      fieldHtml('Tags (comma-separated keys: working-memory, spiking-networks, meeg, decision-making, ephys, normative-models, neural-geometry, schizophrenia)', 'tags', '') +
      '<div class="cms-links-editor" id="cmsLinksEditor">' +
      '<h3 class="cms-field-group-title">Links</h3>' +
      '</div>' +
      '<button type="button" class="cms-btn cms-btn--secondary cms-btn--small" onclick="Editor._addLinkField()">+ Add Link</button>';

    showModal('Add Publication', form, function () {
      var title = getFieldValue('title');
      if (!title) { showEditorError('Title is required.'); throw new Error('Validation'); }

      var sectionId = getFieldValue('section');
      var tagsStr = getFieldValue('tags');
      var tags = parseTags(tagsStr);
      var categories = sectionId + (tagsStr ? ' ' + tagsStr.split(',').map(function (t) { return t.trim(); }).join(' ') : '');

      window.ContentLoader.fetchData('publications.json').then(function (data) {
        var section = data.sections.find(function (s) { return s.id === sectionId; });
        if (!section) {
          section = { id: sectionId, title: sectionId, publications: [] };
          data.sections.push(section);
        }

        var newPub = {
          id: window.CMS.generateId('pub'),
          title: title,
          url: getFieldValue('url'),
          authors: getFieldValue('authors'),
          journal: getFieldValue('journal'),
          categories: categories,
          tags: tags,
          links: collectLinks()
        };

        section.publications.unshift(newPub);
        return saveAndReload('publications.json', data, window.ContentLoader.renderPublications, 'cms-publications');
      });
    });
  };

  window.Editor.editPublication = function (id) {
    window.ContentLoader.fetchData('publications.json').then(function (data) {
      var pub = null;
      var currentSection = null;
      data.sections.forEach(function (sec) {
        sec.publications.forEach(function (p) {
          if (p.id === id) { pub = p; currentSection = sec; }
        });
      });
      if (!pub) return;

      var tagsStr = pub.tags ? pub.tags.map(function (t) { return t.key; }).join(', ') : '';

      var form = fieldHtml('Title', 'title', pub.title) +
        fieldHtml('URL', 'url', pub.url) +
        fieldHtml('Authors', 'authors', pub.authors, 'richtext') +
        fieldHtml('Journal / Venue', 'journal', pub.journal) +
        selectHtml('Section', 'section', SECTION_OPTIONS, currentSection.id) +
        fieldHtml('Tags (comma-separated keys)', 'tags', tagsStr) +
        '<div class="cms-links-editor" id="cmsLinksEditor">' +
        '<h3 class="cms-field-group-title">Links</h3>' +
        renderExistingLinks(pub.links) +
        '</div>' +
        '<button type="button" class="cms-btn cms-btn--secondary cms-btn--small" onclick="Editor._addLinkField()">+ Add Link</button>';

      showModal('Edit Publication', form, function () {
        var newTitle = getFieldValue('title');
        if (!newTitle) { showEditorError('Title is required.'); throw new Error('Validation'); }

        var newSectionId = getFieldValue('section');
        var newTagsStr = getFieldValue('tags');
        var newTags = parseTags(newTagsStr);

        pub.title = newTitle;
        pub.url = getFieldValue('url');
        pub.authors = getFieldValue('authors');
        pub.journal = getFieldValue('journal');
        pub.tags = newTags;
        pub.categories = newSectionId + (newTagsStr ? ' ' + newTagsStr.split(',').map(function (t) { return t.trim(); }).join(' ') : '');
        pub.links = collectLinks();

        // Move to different section if changed
        if (newSectionId !== currentSection.id) {
          currentSection.publications = currentSection.publications.filter(function (p) { return p.id !== id; });
          var targetSection = data.sections.find(function (s) { return s.id === newSectionId; });
          if (targetSection) {
            targetSection.publications.push(pub);
          }
        }

        saveAndReload('publications.json', data, window.ContentLoader.renderPublications, 'cms-publications');
      });
    });
  };

  window.Editor.deletePublication = function (id) {
    if (!confirm('Delete this publication?')) return;
    window.ContentLoader.fetchData('publications.json').then(function (data) {
      data.sections.forEach(function (sec) {
        sec.publications = sec.publications.filter(function (p) { return p.id !== id; });
      });
      saveAndReload('publications.json', data, window.ContentLoader.renderPublications, 'cms-publications');
    });
  };

  // Publication link helpers
  function renderLinkFields(index, label, url) {
    return '<div class="cms-link-group">' +
      '<input type="text" class="cms-input cms-input--half cms-link-label" placeholder="Label (e.g. code)" value="' + escapeAttr(label || '') + '" />' +
      '<input type="text" class="cms-input cms-input--half cms-link-url" placeholder="URL" value="' + escapeAttr(url || '') + '" />' +
      '<button type="button" class="cms-btn cms-btn--danger cms-btn--tiny" onclick="this.closest(\'.cms-link-group\').remove()">x</button>' +
      '</div>';
  }

  window.Editor._addLinkField = function () {
    var container = document.getElementById('cmsLinksEditor');
    if (!container) return;
    var count = container.querySelectorAll('.cms-link-group').length;
    var div = document.createElement('div');
    div.innerHTML = renderLinkFields(count, '', '');
    container.appendChild(div.firstChild);
  };

  function collectLinks() {
    var groups = document.querySelectorAll('#cmsLinksEditor .cms-link-group');
    var links = [];
    groups.forEach(function (group) {
      var label = group.querySelector('.cms-link-label').value.trim();
      var url = group.querySelector('.cms-link-url').value.trim();
      if (label && url) {
        links.push({ label: label, url: url });
      }
    });
    return links;
  }

  var TAG_MAP = {
    'working-memory': 'Working Memory',
    'spiking-networks': 'Spiking Networks',
    'meeg': 'M/EEG',
    'decision-making': 'Decision Making',
    'ephys': 'E-phys',
    'normative-models': 'RNN',
    'neural-geometry': 'Neural Geometry',
    'schizophrenia': 'Computational Psychiatry'
  };

  function parseTags(tagsStr) {
    if (!tagsStr) return [];
    return tagsStr.split(',').map(function (t) {
      var key = t.trim();
      return { label: TAG_MAP[key] || key, key: key };
    }).filter(function (t) { return t.key; });
  }

  // ============================================================
  // PEOPLE EDITOR
  // ============================================================
  window.Editor.addPerson = function () {
    var form = fieldHtml('Name', 'name', '') +
      fieldHtml('Position Title', 'position', '') +
      selectHtml('Position Type', 'positionType', POSITION_OPTIONS, 'phd') +
      '<div class="cms-field"><label>Current member?</label>' +
      '<select id="cms-field-current" class="cms-input"><option value="true">Yes</option><option value="false">No</option></select></div>' +
      fieldHtml('Photo URL (e.g. /images/people/name.jpg)', 'photo', '') +
      fieldHtml('Description', 'description', '', 'richtext') +
      '<div class="cms-links-editor" id="cmsLinksEditor">' +
      '<h3 class="cms-field-group-title">Links</h3>' +
      '</div>' +
      '<button type="button" class="cms-btn cms-btn--secondary cms-btn--small" onclick="Editor._addLinkField()">+ Add Link</button>';

    showModal('Add Person', form, function () {
      var name = getFieldValue('name');
      if (!name) { showEditorError('Name is required.'); throw new Error('Validation'); }

      window.ContentLoader.fetchData('people.json').then(function (data) {
        var newPerson = {
          id: window.CMS.generateId('person'),
          name: name,
          position: getFieldValue('position'),
          positionType: getFieldValue('positionType'),
          current: getFieldValue('current') === 'true',
          photo: getFieldValue('photo'),
          description: getFieldValue('description'),
          links: collectLinks()
        };
        data.members.push(newPerson);
        return saveAndReload('people.json', data, window.ContentLoader.renderPeople, 'cms-people');
      });
    });
  };

  window.Editor.editPerson = function (id) {
    window.ContentLoader.fetchData('people.json').then(function (data) {
      var person = data.members.find(function (m) { return m.id === id; });
      if (!person) return;

      var form = fieldHtml('Name', 'name', person.name) +
        fieldHtml('Position Title', 'position', person.position) +
        selectHtml('Position Type', 'positionType', POSITION_OPTIONS, person.positionType) +
        '<div class="cms-field"><label>Current member?</label>' +
        '<select id="cms-field-current" class="cms-input"><option value="true"' + (person.current ? ' selected' : '') + '>Yes</option><option value="false"' + (!person.current ? ' selected' : '') + '>No</option></select></div>' +
        fieldHtml('Photo URL', 'photo', person.photo) +
        fieldHtml('Description', 'description', person.description, 'richtext') +
        '<div class="cms-links-editor" id="cmsLinksEditor">' +
        '<h3 class="cms-field-group-title">Links</h3>' +
        renderExistingLinks(person.links) +
        '</div>' +
        '<button type="button" class="cms-btn cms-btn--secondary cms-btn--small" onclick="Editor._addLinkField()">+ Add Link</button>';

      showModal('Edit Person', form, function () {
        person.name = getFieldValue('name');
        if (!person.name) { showEditorError('Name is required.'); throw new Error('Validation'); }
        person.position = getFieldValue('position');
        person.positionType = getFieldValue('positionType');
        person.current = getFieldValue('current') === 'true';
        person.photo = getFieldValue('photo');
        person.description = getFieldValue('description');
        person.links = collectLinks();
        saveAndReload('people.json', data, window.ContentLoader.renderPeople, 'cms-people');
      });
    });
  };

  window.Editor.deletePerson = function (id) {
    if (!confirm('Delete this person?')) return;
    window.ContentLoader.fetchData('people.json').then(function (data) {
      data.members = data.members.filter(function (m) { return m.id !== id; });
      saveAndReload('people.json', data, window.ContentLoader.renderPeople, 'cms-people');
    });
  };

  // ============================================================
  // TEACHING EDITOR
  // ============================================================
  window.Editor.addTeaching = function () {
    window.ContentLoader.fetchData('teaching.json').then(function (data) {
      var columnOptions = data.columns.map(function (col) {
        return { value: col.id, label: col.title };
      });

      var form = fieldHtml('Title', 'title', '') +
        fieldHtml('URL', 'url', '') +
        fieldHtml('Type (e.g. Graduate Course, Workshop Tutorial)', 'type', '') +
        selectHtml('Column', 'column', columnOptions, columnOptions[0].value) +
        fieldHtml('Summary', 'summary', '', 'textarea') +
        fieldHtml('Venue (e.g. ENS Paris (2025-present))', 'venue', '') +
        fieldHtml('Expandable Details', 'details', '', 'richtext');

      showModal('Add Teaching Item', form, function () {
        var title = getFieldValue('title');
        if (!title) { showEditorError('Title is required.'); throw new Error('Validation'); }

        var columnId = getFieldValue('column');
        var column = data.columns.find(function (c) { return c.id === columnId; });
        if (!column) return;

        column.items.push({
          id: window.CMS.generateId('teach'),
          title: title,
          url: getFieldValue('url'),
          type: getFieldValue('type'),
          summary: getFieldValue('summary'),
          venue: getFieldValue('venue'),
          details: getFieldValue('details')
        });

        saveAndReload('teaching.json', data, window.ContentLoader.renderTeaching, 'cms-teaching');
      });
    });
  };

  window.Editor.editTeaching = function (id) {
    window.ContentLoader.fetchData('teaching.json').then(function (data) {
      var item = null;
      var currentColumn = null;
      data.columns.forEach(function (col) {
        col.items.forEach(function (t) {
          if (t.id === id) { item = t; currentColumn = col; }
        });
      });
      if (!item) return;

      var columnOptions = data.columns.map(function (col) {
        return { value: col.id, label: col.title };
      });

      var form = fieldHtml('Title', 'title', item.title) +
        fieldHtml('URL', 'url', item.url) +
        fieldHtml('Type', 'type', item.type) +
        selectHtml('Column', 'column', columnOptions, currentColumn.id) +
        fieldHtml('Summary', 'summary', item.summary, 'textarea') +
        fieldHtml('Venue', 'venue', item.venue) +
        fieldHtml('Expandable Details', 'details', item.details, 'richtext');

      showModal('Edit Teaching Item', form, function () {
        item.title = getFieldValue('title');
        if (!item.title) { showEditorError('Title is required.'); throw new Error('Validation'); }
        item.url = getFieldValue('url');
        item.type = getFieldValue('type');
        item.summary = getFieldValue('summary');
        item.venue = getFieldValue('venue');
        item.details = getFieldValue('details');

        // Move to different column if changed
        var newColumnId = getFieldValue('column');
        if (newColumnId !== currentColumn.id) {
          currentColumn.items = currentColumn.items.filter(function (t) { return t.id !== id; });
          var targetColumn = data.columns.find(function (c) { return c.id === newColumnId; });
          if (targetColumn) {
            targetColumn.items.push(item);
          }
        }

        saveAndReload('teaching.json', data, window.ContentLoader.renderTeaching, 'cms-teaching');
      });
    });
  };

  window.Editor.deleteTeaching = function (id) {
    if (!confirm('Delete this teaching item?')) return;
    window.ContentLoader.fetchData('teaching.json').then(function (data) {
      data.columns.forEach(function (col) {
        col.items = col.items.filter(function (t) { return t.id !== id; });
      });
      saveAndReload('teaching.json', data, window.ContentLoader.renderTeaching, 'cms-teaching');
    });
  };

  // ============================================================
  // COMMUNITY EDITOR
  // ============================================================
  window.Editor.addCommunity = function () {
    var form = fieldHtml('Title', 'title', '') +
      fieldHtml('Image URL (e.g. /images/my-image.png)', 'image', '') +
      fieldHtml('Image Alt Text', 'imageAlt', '') +
      fieldHtml('Content', 'content', '', 'richtext') +
      fieldHtml('Organizers', 'organizers', '') +
      '<div class="cms-links-editor" id="cmsLinksEditor">' +
      '<h3 class="cms-field-group-title">Links</h3>' +
      '</div>' +
      '<button type="button" class="cms-btn cms-btn--secondary cms-btn--small" onclick="Editor._addLinkField()">+ Add Link</button>';

    showModal('Add Community Item', form, function () {
      var title = getFieldValue('title');
      if (!title) { showEditorError('Title is required.'); throw new Error('Validation'); }

      window.ContentLoader.fetchData('community.json').then(function (data) {
        data.cards.push({
          id: window.CMS.generateId('community'),
          title: title,
          image: getFieldValue('image'),
          imageAlt: getFieldValue('imageAlt'),
          content: getFieldValue('content'),
          organizers: getFieldValue('organizers'),
          links: collectLinks()
        });
        return saveAndReload('community.json', data, window.ContentLoader.renderCommunity, 'cms-community');
      });
    });
  };

  window.Editor.editCommunity = function (id) {
    window.ContentLoader.fetchData('community.json').then(function (data) {
      var card = data.cards.find(function (c) { return c.id === id; });
      if (!card) return;

      var form = fieldHtml('Title', 'title', card.title) +
        fieldHtml('Image URL', 'image', card.image) +
        fieldHtml('Image Alt Text', 'imageAlt', card.imageAlt) +
        fieldHtml('Content', 'content', card.content, 'richtext') +
        fieldHtml('Organizers', 'organizers', card.organizers) +
        '<div class="cms-links-editor" id="cmsLinksEditor">' +
        '<h3 class="cms-field-group-title">Links</h3>' +
        renderExistingLinks(card.links) +
        '</div>' +
        '<button type="button" class="cms-btn cms-btn--secondary cms-btn--small" onclick="Editor._addLinkField()">+ Add Link</button>';

      showModal('Edit Community Item', form, function () {
        card.title = getFieldValue('title');
        if (!card.title) { showEditorError('Title is required.'); throw new Error('Validation'); }
        card.image = getFieldValue('image');
        card.imageAlt = getFieldValue('imageAlt');
        card.content = getFieldValue('content');
        card.organizers = getFieldValue('organizers');
        card.links = collectLinks();
        saveAndReload('community.json', data, window.ContentLoader.renderCommunity, 'cms-community');
      });
    });
  };

  window.Editor.deleteCommunity = function (id) {
    if (!confirm('Delete this community item?')) return;
    window.ContentLoader.fetchData('community.json').then(function (data) {
      data.cards = data.cards.filter(function (c) { return c.id !== id; });
      saveAndReload('community.json', data, window.ContentLoader.renderCommunity, 'cms-community');
    });
  };

})();
