/**
 * Default Theme Templates
 * HTML-generating functions for each content section.
 * To create a new theme, copy this file, change the HTML, and register under a new name.
 */
(function () {
  'use strict';

  window.ThemeTemplates = window.ThemeTemplates || {};

  var Templates = {};

  // Shared helper: admin action buttons
  function adminActions(editAction, deleteAction, stopPropagation) {
    if (!(window.CMS && window.CMS.isAdmin)) return '';
    var sp = stopPropagation ? 'event.stopPropagation(); ' : '';
    var html = '<div class="cms-item-actions">';
    html += '<button class="cms-edit-btn" onclick="' + sp + editAction + '" title="Edit">&#9998;</button>';
    html += '<button class="cms-delete-btn" onclick="' + sp + deleteAction + '" title="Delete">&times;</button>';
    html += '</div>';
    return html;
  }

  function adminActionsCard(editAction, deleteAction) {
    if (!(window.CMS && window.CMS.isAdmin)) return '';
    var html = '<div class="cms-item-actions cms-item-actions--card">';
    html += '<button class="cms-edit-btn" onclick="event.stopPropagation(); ' + editAction + '" title="Edit">&#9998;</button>';
    html += '<button class="cms-delete-btn" onclick="event.stopPropagation(); ' + deleteAction + '" title="Delete">&times;</button>';
    html += '</div>';
    return html;
  }

  function addButton(label, onclick) {
    if (!(window.CMS && window.CMS.isAdmin)) return '';
    return '<button class="cms-add-btn" onclick="' + onclick + '">+ ' + label + '</button>';
  }

  // ============================================================
  // NEWS
  // ============================================================
  Templates.news = function (news) {
    var html = addButton('Add News', 'Editor.addNews()');

    news.forEach(function (item) {
      html += '<div class="author-news__item" data-id="' + item.id + '">';
      html += adminActions("Editor.editNews('" + item.id + "')", "Editor.deleteNews('" + item.id + "')");
      html += ' <span class="author-news__date">' + item.date + '</span>';
      html += ' <span class="author-news__content">' + item.content + '</span>';
      html += '</div>';
    });

    return html;
  };

  // ============================================================
  // RESEARCH
  // ============================================================
  Templates.research = function (data) {
    var html = addButton('Add Research Topic', 'Editor.addResearch()');

    data.cards.forEach(function (card) {
      html += '<div class="research-card collapsed" data-id="' + card.id + '">';
      html += '<div class="research-card__header">';
      html += '<h2 class="research-card__title">' + card.title + '</h2>';
      if (window.CMS && window.CMS.isAdmin) {
        html += '<button class="cms-edit-btn cms-edit-btn--header" onclick="event.stopPropagation(); Editor.editResearch(\'' + card.id + '\')" title="Edit">&#9998;</button>';
        html += '<button class="cms-delete-btn cms-delete-btn--header" onclick="event.stopPropagation(); Editor.deleteResearch(\'' + card.id + '\')" title="Delete">&times;</button>';
      }
      html += '<div class="research-card__expand-indicator">+</div>';
      html += '</div>';
      html += '<div class="research-card__expandable">';

      card.sections.forEach(function (section) {
        html += '<div class="research-card__section">';
        html += '<h3 class="research-card__section-title">' + section.title + '</h3>';
        html += '<div class="research-card__content">' + section.content + '</div>';
        html += '</div>';
      });

      html += '</div></div>';
    });

    return html;
  };

  // ============================================================
  // PUBLICATIONS
  // ============================================================
  Templates.publications = function (data) {
    var html = addButton('Add Publication', 'Editor.addPublication()');

    // Publication type filter tabs
    if (data.filterTabs && data.filterTabs.length) {
      html += '<div class="filter-tabs publications-filter">';
      data.filterTabs.forEach(function (tab, i) {
        html += '<button class="filter-tab' + (i === 0 ? ' active' : '') + '" data-filter="' + tab.filter + '">';
        html += tab.label;
        if (tab.count != null) html += ' <span class="count">' + tab.count + '</span>';
        html += '</button>';
      });
      html += '</div>';
    }

    // Keyword filter tabs
    if (data.keywordTabs && data.keywordTabs.length) {
      html += '<div class="filter-tabs keywords-filter">';
      data.keywordTabs.forEach(function (tab, i) {
        html += '<button class="filter-tab keyword-tab' + (i === 0 ? ' active' : '') + '" data-filter="' + tab.filter + '">';
        html += tab.label;
        if (tab.count != null) html += ' <span class="count">' + tab.count + '</span>';
        html += '</button>';
      });
      html += '</div>';
    }

    data.sections.forEach(function (section) {
      html += '<div class="publications-section">';
      html += '<h2 class="publications-section__title">' + section.title + '</h2>';
      html += '<div class="publications-grid">';

      section.publications.forEach(function (pub) {
        html += '<div class="publication-item" data-categories="' + pub.categories + '" data-id="' + pub.id + '">';
        html += adminActions("Editor.editPublication('" + pub.id + "')", "Editor.deletePublication('" + pub.id + "')");

        html += '<h3 class="publication-item__title">';
        if (pub.url) {
          html += ' <a href="' + pub.url + '">' + pub.title + '</a>';
        } else {
          html += ' ' + pub.title;
        }
        html += '</h3>';
        html += '<div class="publication-item__authors">' + pub.authors + '</div>';
        html += '<div class="publication-item__journal">' + pub.journal + '</div>';

        if (pub.tags && pub.tags.length) {
          html += '<div class="publication-item__tags">';
          pub.tags.forEach(function (tag) {
            html += ' <span class="tag" data-tag="' + tag.key + '">' + tag.label + '</span>';
          });
          html += '</div>';
        }

        if (pub.links && pub.links.length) {
          html += '<div class="publication-item__links">';
          pub.links.forEach(function (link) {
            html += ' <a href="' + link.url + '" class="publication-link">' + link.label + '</a>';
          });
          html += '</div>';
        }

        html += '</div>';
      });

      html += '</div></div>';
    });

    return html;
  };

  // ============================================================
  // PEOPLE
  // ============================================================
  Templates.people = function (data) {
    var html = addButton('Add Person', 'Editor.addPerson()');
    var currentMembers = data.members.filter(function (m) { return m.current; });
    var alumni = data.members.filter(function (m) { return !m.current; });

    // People filter tabs
    if (data.filterTabs && data.filterTabs.length) {
      html += '<div class="filter-tabs people-filter">';
      data.filterTabs.forEach(function (tab, i) {
        html += '<button class="filter-tab' + (i === 0 ? ' active' : '') + '" data-filter="' + tab.filter + '">';
        html += tab.label;
        if (tab.count != null) html += ' <span class="count">' + tab.count + '</span>';
        html += '</button>';
      });
      html += '</div>';
    }

    // Current members
    html += '<div class="people-grid">';
    currentMembers.forEach(function (person) {
      html += Templates._personCard(person, false);
    });
    html += '</div>';

    // Alumni
    if (alumni.length > 0) {
      html += '<div class="alumni-section">';
      html += '<div class="people-grid">';
      alumni.forEach(function (person) {
        html += Templates._personCard(person, true);
      });
      html += '</div></div>';
    }

    return html;
  };

  Templates._personCard = function (person, isAlumni) {
    var html = '<div class="person-card collapsed' + (isAlumni ? ' alumni-card' : '') + '" data-position="' + person.positionType + '" data-current="' + person.current + '" data-id="' + person.id + '">';
    html += '<div class="person-card__header">';

    if (!isAlumni && person.photo) {
      html += '<div class="person-card__avatar">';
      html += ' <img src="' + person.photo + '" alt="' + person.name + '" class="person-card__image" />';
      html += '</div>';
    }

    html += '<div class="person-card__info">';
    html += '<h3 class="person-card__name">' + person.name + '</h3>';
    html += '<p class="person-card__position' + (isAlumni ? ' alumni' : '') + '">' + person.position + '</p>';
    html += '</div>';

    html += adminActionsCard("Editor.editPerson('" + person.id + "')", "Editor.deletePerson('" + person.id + "')");

    html += '</div>'; // header

    html += '<div class="person-card__expandable">';
    if (person.description) {
      html += '<div class="person-card__description">' + person.description + '</div>';
    }
    if (person.links && person.links.length) {
      html += '<div class="person-card__links">';
      person.links.forEach(function (link) {
        html += ' <a href="' + link.url + '" class="person-link">' + link.label + '</a>';
      });
      html += '</div>';
    }
    html += '</div>';

    html += '<div class="person-card__expand-indicator">+</div>';
    html += '</div>';
    return html;
  };

  // ============================================================
  // TEACHING
  // ============================================================
  Templates.teaching = function (data) {
    var html = addButton('Add Teaching Item', 'Editor.addTeaching()');

    html += '<div class="teaching-columns">';

    data.columns.forEach(function (column) {
      html += '<div class="teaching-column">';
      html += '<h2 class="teaching-column__title">' + column.title + '</h2>';
      html += '<div class="teaching-grid">';

      column.items.forEach(function (item) {
        html += '<div class="teaching-card collapsed" data-id="' + item.id + '">';
        html += '<div class="teaching-card__header">';
        html += '<h3 class="teaching-card__title">';
        if (item.url && item.url !== '#') {
          html += ' <a href="' + item.url + '">' + item.title + '</a>';
        } else {
          html += item.title;
        }
        html += '</h3>';
        html += '<span class="teaching-card__type">' + item.type + '</span>';

        html += adminActionsCard("Editor.editTeaching('" + item.id + "')", "Editor.deleteTeaching('" + item.id + "')");

        html += '<div class="teaching-card__expand-indicator">+</div>';
        html += '</div>'; // header

        html += '<div class="teaching-card__content">';
        html += '<p>' + item.summary + '</p>';
        html += '<div class="teaching-card__meta">';
        html += ' <span class="teaching-card__venue">' + item.venue + '</span>';
        html += '</div></div>';

        html += '<div class="teaching-card__expandable">';
        html += '<div class="teaching-card__details">' + item.details + '</div>';
        html += '</div>';

        html += '</div>'; // teaching-card
      });

      html += '</div></div>'; // teaching-grid, teaching-column
    });

    html += '</div>'; // teaching-columns

    return html;
  };

  // ============================================================
  // COMMUNITY
  // ============================================================
  Templates.community = function (data) {
    var html = addButton('Add Community Item', 'Editor.addCommunity()');

    data.cards.forEach(function (card) {
      html += '<div class="community-card collapsed" data-id="' + card.id + '">';
      html += '<div class="community-card__header">';
      html += '<h2 class="community-card__title">' + card.title + '</h2>';

      html += adminActionsCard("Editor.editCommunity('" + card.id + "')", "Editor.deleteCommunity('" + card.id + "')");

      html += '<div class="community-card__expand-indicator">+</div>';
      html += '</div>'; // header

      html += '<div class="community-card__expandable">';
      if (card.image) {
        html += '<img src="' + card.image + '" alt="' + (card.imageAlt || '') + '" class="community-card__image" />';
      }
      html += '<div class="community-card__content">' + card.content + '</div>';
      if (card.organizers) {
        html += '<div class="community-card__meta"><strong>Organizers:</strong> ' + card.organizers + '</div>';
      }
      if (card.links && card.links.length) {
        html += '<div class="community-card__links">';
        card.links.forEach(function (link) {
          html += '<a href="' + link.url + '" class="community-link">' + link.label + '</a>';
        });
        html += '</div>';
      }
      html += '</div>'; // expandable

      html += '</div>'; // community-card
    });

    return html;
  };

  window.ThemeTemplates['default'] = Templates;
})();
