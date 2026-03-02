/**
 * Content Loader Module
 * Fetches JSON data files and delegates HTML rendering to theme templates.
 * Public API: fetchData, clearCache, setCache, renderNews, renderResearch,
 *             renderPublications, renderPeople, renderTeaching, renderCommunity
 */
(function () {
  'use strict';

  window.ContentLoader = window.ContentLoader || {};

  // Cache for loaded data
  var dataCache = {};

  // Get the active theme's template functions
  function getTemplates() {
    var themeName = document.documentElement.getAttribute('data-theme-name') || 'default';
    return (window.ThemeTemplates && window.ThemeTemplates[themeName]) || window.ThemeTemplates['default'];
  }

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
      container.innerHTML = getTemplates().news(news);
    });
  };

  // ============================================================
  // RESEARCH RENDERER
  // ============================================================
  window.ContentLoader.renderResearch = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    return fetchData('research.json').then(function (data) {
      container.innerHTML = getTemplates().research(data);
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
      container.innerHTML = getTemplates().publications(data);
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
      container.innerHTML = getTemplates().people(data);
      reinitBehaviors();
    });
  };

  // ============================================================
  // TEACHING RENDERER
  // ============================================================
  window.ContentLoader.renderTeaching = function (containerId) {
    var container = document.getElementById(containerId);
    if (!container) return Promise.resolve();

    return fetchData('teaching.json').then(function (data) {
      container.innerHTML = getTemplates().teaching(data);
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
      container.innerHTML = getTemplates().community(data);
      reinitBehaviors();
    });
  };

})();
