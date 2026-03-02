/**
 * Content Loader Module
 * Fetches JSON data files and renders HTML for each section.
 * Preserves all existing CSS classes and structure.
 */
(function () {
  'use strict';

  window.ContentLoader = window.ContentLoader || {};

  // Cache for loaded data
  var dataCache = {};

  // Re-init all interactive behaviors after dynamic rendering
  function reinitBehaviors() {
    if (typeof window.initCustomAccordion === 'function') {
      window.initCustomAccordion();
    }
    if (typeof window.initFiltering === 'function') {
      window.initFiltering();
    }
  }

  // --- Fetch JSON data ---
  function fetchData(file) {
    if (dataCache[file]) {
      return Promise.resolve(dataCache[file]);
    }
    return fetch('/data/' + file + '?t=' + Date.now())
      .then(function (resp) {
        if (!resp.ok) throw new Error('Failed to load ' + file);
        return resp.json();
      })
      .then(function (data) {
        dataCache[file] = data;
        return data;
      });
  }

  window.ContentLoader.fetchData = fetchData;

  // Clear cache for a specific file (after editing)
  window.ContentLoader.clearCache = function (file) {
    delete dataCache[file];
  };

  // Set cache directly (used after saving to avoid stale GitHub Pages fetch)
  window.ContentLoader.setCache = function (file, data) {
    dataCache[file] = data;
  };

  // ============================================================
  // NEWS RENDERER
  // ============================================================
  window.ContentLoader.renderNews = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    return fetchData('news.json').then(function (news) {
      var html = '';

      // Sort by date descending (most recent first)
      var monthOrder = {jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,sept:8,oct:9,nov:10,dec:11};
      news.sort(function (a, b) {
        var pa = a.date.trim().split(/\s+/), pb = b.date.trim().split(/\s+/);
        var ya = parseInt(pa[pa.length - 1]) || 0, yb = parseInt(pb[pb.length - 1]) || 0;
        if (yb !== ya) return yb - ya;
        var ma = monthOrder[(pa[0] || '').toLowerCase().replace(/[^a-z]/g, '').slice(0,4)] || 0;
        var mb = monthOrder[(pb[0] || '').toLowerCase().replace(/[^a-z]/g, '').slice(0,4)] || 0;
        return mb - ma;
      });

      if (window.CMS && window.CMS.isAdmin) {
        html += '<button class="cms-add-btn" onclick="Editor.addNews()">+ Add News</button>';
      }

      news.forEach(function (item) {
        html += '<div class="author-news__item" data-id="' + item.id + '">';
        if (window.CMS && window.CMS.isAdmin) {
          html += '<div class="cms-item-actions">';
          html += '<button class="cms-edit-btn" onclick="Editor.editNews(\'' + item.id + '\')" title="Edit">&#9998;</button>';
          html += '<button class="cms-delete-btn" onclick="Editor.deleteNews(\'' + item.id + '\')" title="Delete">&times;</button>';
          html += '</div>';
        }
        html += ' <span class="author-news__date">' + item.date + '</span>';
        html += ' <span class="author-news__content">' + item.content + '</span>';
        html += '</div>';
      });

      container.innerHTML = html;
    });
  };

  // ============================================================
  // RESEARCH RENDERER
  // ============================================================
  window.ContentLoader.renderResearch = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    return fetchData('research.json').then(function (data) {
      var html = '';

      if (window.CMS && window.CMS.isAdmin) {
        html += '<button class="cms-add-btn" onclick="Editor.addResearch()">+ Add Research Topic</button>';
      }

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

      container.innerHTML = html;

      reinitBehaviors();
    });
  };

  // ============================================================
  // PUBLICATIONS RENDERER
  // ============================================================
  window.ContentLoader.renderPublications = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    return fetchData('publications.json').then(function (data) {
      var html = '';

      if (window.CMS && window.CMS.isAdmin) {
        html += '<button class="cms-add-btn" onclick="Editor.addPublication()">+ Add Publication</button>';
      }

      // Render publication type filter tabs
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

      // Render keyword filter tabs
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

          if (window.CMS && window.CMS.isAdmin) {
            html += '<div class="cms-item-actions">';
            html += '<button class="cms-edit-btn" onclick="Editor.editPublication(\'' + pub.id + '\')" title="Edit">&#9998;</button>';
            html += '<button class="cms-delete-btn" onclick="Editor.deletePublication(\'' + pub.id + '\')" title="Delete">&times;</button>';
            html += '</div>';
          }

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

      container.innerHTML = html;

      reinitBehaviors();
    });
  };

  // ============================================================
  // PEOPLE RENDERER
  // ============================================================
  window.ContentLoader.renderPeople = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    return fetchData('people.json').then(function (data) {
      var html = '';
      var currentMembers = data.members.filter(function (m) { return m.current; });
      var alumni = data.members.filter(function (m) { return !m.current; });

      if (window.CMS && window.CMS.isAdmin) {
        html += '<button class="cms-add-btn" onclick="Editor.addPerson()">+ Add Person</button>';
      }

      // Render filter tabs (Current / Alumni)
      if (data.filterTabs && data.filterTabs.length) {
        html += '<div class="filter-tabs people-filter">';
        data.filterTabs.forEach(function (tab, i) {
          html += '<button class="filter-tab' + (i === 0 ? ' active' : '') + '" data-filter="' + tab.filter + '">';
          html += tab.label;
          html += '</button>';
        });
        html += '</div>';
      }

      // Current members - single column, always open
      html += '<div class="people-list" data-section="current">';
      currentMembers.forEach(function (person) {
        html += renderPersonCard(person, false);
      });
      html += '</div>';

      // Alumni section
      if (alumni.length > 0) {
        html += '<div class="people-list alumni-section" data-section="alumni">';
        alumni.forEach(function (person) {
          html += renderPersonCard(person, true);
        });
        html += '</div>';
      }

      container.innerHTML = html;

      // Filter tab logic
      var tabs = container.querySelectorAll('.filter-tab');
      var currentSection = container.querySelector('[data-section="current"]');
      var alumniSection = container.querySelector('[data-section="alumni"]');
      tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          tabs.forEach(function (t) { t.classList.remove('active'); });
          tab.classList.add('active');
          var filter = tab.getAttribute('data-filter');
          if (filter === 'current') {
            if (currentSection) currentSection.style.display = '';
            if (alumniSection) alumniSection.style.display = 'none';
          } else if (filter === 'alumni') {
            if (currentSection) currentSection.style.display = 'none';
            if (alumniSection) alumniSection.style.display = '';
          }
        });
      });
      // Default: show current, hide alumni
      if (alumniSection) alumniSection.style.display = 'none';
    });
  };

  function renderPersonCard(person, isAlumni) {
    var html = '<div class="person-card expanded' + (isAlumni ? ' alumni-card' : '') + '" data-position="' + person.positionType + '" data-current="' + person.current + '" data-id="' + person.id + '">';

    if (person.photo) {
      html += '<div class="person-card__avatar person-card__avatar--large">';
      html += ' <img src="' + person.photo + '" alt="' + person.name + '" class="person-card__image" />';
      html += '</div>';
    }

    html += '<div class="person-card__body">';
    html += '<h3 class="person-card__name">' + person.name + '</h3>';
    html += '<p class="person-card__position' + (isAlumni ? ' alumni' : '') + '">' + person.position + '</p>';

    if (window.CMS && window.CMS.isAdmin) {
      html += '<div class="cms-item-actions cms-item-actions--card">';
      html += '<button class="cms-edit-btn" onclick="event.stopPropagation(); Editor.editPerson(\'' + person.id + '\')" title="Edit">&#9998;</button>';
      html += '<button class="cms-delete-btn" onclick="event.stopPropagation(); Editor.deletePerson(\'' + person.id + '\')" title="Delete">&times;</button>';
      html += '</div>';
    }

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
    html += '</div>'; // body

    html += '</div>';
    return html;
  }

  // ============================================================
  // TEACHING RENDERER
  // ============================================================
  window.ContentLoader.renderTeaching = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    return fetchData('teaching.json').then(function (data) {
      var html = '';

      if (window.CMS && window.CMS.isAdmin) {
        html += '<button class="cms-add-btn" onclick="Editor.addTeaching()">+ Add Teaching Item</button>';
      }

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

          if (window.CMS && window.CMS.isAdmin) {
            html += '<div class="cms-item-actions cms-item-actions--card">';
            html += '<button class="cms-edit-btn" onclick="event.stopPropagation(); Editor.editTeaching(\'' + item.id + '\')" title="Edit">&#9998;</button>';
            html += '<button class="cms-delete-btn" onclick="event.stopPropagation(); Editor.deleteTeaching(\'' + item.id + '\')" title="Delete">&times;</button>';
            html += '</div>';
          }

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

      container.innerHTML = html;

      reinitBehaviors();
    });
  };

  // ============================================================
  // COMMUNITY RENDERER
  // ============================================================
  window.ContentLoader.renderCommunity = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    return fetchData('community.json').then(function (data) {
      var html = '';

      if (window.CMS && window.CMS.isAdmin) {
        html += '<button class="cms-add-btn" onclick="Editor.addCommunity()">+ Add Community Item</button>';
      }

      data.cards.forEach(function (card) {
        html += '<div class="community-card collapsed" data-id="' + card.id + '">';
        html += '<div class="community-card__header">';
        html += '<h2 class="community-card__title">' + card.title + '</h2>';

        if (window.CMS && window.CMS.isAdmin) {
          html += '<div class="cms-item-actions cms-item-actions--card">';
          html += '<button class="cms-edit-btn" onclick="event.stopPropagation(); Editor.editCommunity(\'' + card.id + '\')" title="Edit">&#9998;</button>';
          html += '<button class="cms-delete-btn" onclick="event.stopPropagation(); Editor.deleteCommunity(\'' + card.id + '\')" title="Delete">&times;</button>';
          html += '</div>';
        }

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

      container.innerHTML = html;

      reinitBehaviors();
    });
  };

})();
