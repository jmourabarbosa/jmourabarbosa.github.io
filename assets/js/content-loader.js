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

  // --- localStorage bridge for CMS edits ---
  // GitHub Pages CDN takes 1-2 min to rebuild after a save.
  // We store edits in localStorage so they survive page refresh.
  var LS_PREFIX = 'cms_data_';
  var LS_TTL = 5 * 60 * 1000; // keep for 5 minutes

  function lsGet(file) {
    try {
      var raw = localStorage.getItem(LS_PREFIX + file);
      if (!raw) return null;
      var entry = JSON.parse(raw);
      if (Date.now() - entry.ts > LS_TTL) {
        localStorage.removeItem(LS_PREFIX + file);
        return null;
      }
      return entry.data;
    } catch (e) { return null; }
  }

  function lsSet(file, data) {
    try {
      localStorage.setItem(LS_PREFIX + file, JSON.stringify({ ts: Date.now(), data: data }));
    } catch (e) { /* quota exceeded, ignore */ }
  }

  function lsClear(file) {
    try { localStorage.removeItem(LS_PREFIX + file); } catch (e) {}
  }

  // --- Fetch JSON data ---
  function fetchData(file) {
    if (dataCache[file]) {
      return Promise.resolve(dataCache[file]);
    }
    // Check localStorage bridge first (survives refresh)
    var lsData = lsGet(file);
    if (lsData) {
      dataCache[file] = lsData;
      return Promise.resolve(lsData);
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
    lsClear(file);
  };

  // Set cache directly (used after saving to avoid stale GitHub Pages fetch)
  window.ContentLoader.setCache = function (file, data) {
    dataCache[file] = data;
    lsSet(file, data);
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
      news.sort(function (a, b) {
        return (b.date || '').localeCompare(a.date || '');
      });

      // Format ISO date to "Month YYYY"
      var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      function formatDate(iso) {
        var parts = iso.split('-');
        var m = parseInt(parts[1], 10) - 1;
        return monthNames[m] + ' ' + parts[0];
      }

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
        html += ' <span class="author-news__date">' + formatDate(item.date) + '</span>';
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
      var isAdmin = window.CMS && window.CMS.isAdmin;
      var cards = isAdmin ? data.cards : data.cards.filter(function (card) {
        return card.visible !== false;
      });

      if (isAdmin) {
        html += '<button class="cms-add-btn" onclick="Editor.addResearch()">+ Add Research Topic</button>';
      }

      cards.forEach(function (card) {
        var isVisible = card.visible !== false;
        html += '<div class="research-card expanded' + (!isVisible && isAdmin ? ' research-card--hidden' : '') + '" data-id="' + card.id + '">';
        html += '<div class="research-card__header">';
        html += '<h2 class="research-card__title">' + card.title;
        if (!isVisible && isAdmin) {
          html += ' <span class="research-card__status">(Hidden)</span>';
        }
        html += '</h2>';
        if (isAdmin) {
          html += '<button class="cms-edit-btn cms-edit-btn--header" onclick="event.stopPropagation(); Editor.toggleResearchVisibility(\'' + card.id + '\')" title="' + (isVisible ? 'Hide from public page' : 'Show on public page') + '">' + (isVisible ? 'Hide' : 'Show') + '</button>';
          html += '<button class="cms-edit-btn cms-edit-btn--header" onclick="event.stopPropagation(); Editor.editResearch(\'' + card.id + '\')" title="Edit">&#9998;</button>';
          html += '<button class="cms-delete-btn cms-delete-btn--header" onclick="event.stopPropagation(); Editor.deleteResearch(\'' + card.id + '\')" title="Delete">&times;</button>';
        }
        html += '</div>';
        html += '<div class="research-card__expandable expanded">';

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
    var aboutLink = null;

    if (person.links && person.links.length) {
      aboutLink = person.links.find(function (link) {
        return link.label === 'About' && link.url === '/about/';
      });
    }

    if (person.photo) {
      html += '<div class="person-card__avatar person-card__avatar--large">';
      html += ' <img src="' + person.photo + '" alt="' + person.name + '" class="person-card__image" />';
      html += '</div>';
    }

    html += '<div class="person-card__body">';
    html += '<h3 class="person-card__name">';
    if (aboutLink) {
      html += '<a href="' + aboutLink.url + '">' + person.name + '</a>';
    } else {
      html += person.name;
    }
    html += '</h3>';
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
          html += '<div class="teaching-card expanded" data-id="' + item.id + '">';
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

          html += '</div>'; // header

          html += '<div class="teaching-card__content">';
          html += '<p>' + item.summary + '</p>';
          html += '<div class="teaching-card__meta">';
          html += ' <span class="teaching-card__venue">' + item.venue + '</span>';
          html += '</div></div>';

          html += '<div class="teaching-card__details">' + item.details + '</div>';

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
        html += '<div class="community-card expanded" data-id="' + card.id + '">';
        html += '<div class="community-card__header">';
        html += '<h2 class="community-card__title">' + card.title + '</h2>';

        if (window.CMS && window.CMS.isAdmin) {
          html += '<div class="cms-item-actions cms-item-actions--card">';
          html += '<button class="cms-edit-btn" onclick="event.stopPropagation(); Editor.editCommunity(\'' + card.id + '\')" title="Edit">&#9998;</button>';
          html += '<button class="cms-delete-btn" onclick="event.stopPropagation(); Editor.deleteCommunity(\'' + card.id + '\')" title="Delete">&times;</button>';
          html += '</div>';
        }

        html += '</div>'; // header

        html += '<div class="community-card__expandable expanded">';
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
