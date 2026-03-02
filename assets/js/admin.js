/**
 * Admin Authentication & GitHub API Module
 * Uses GitHub Personal Access Token for authentication.
 * Only the repo owner (with a valid PAT) can edit content.
 */
(function () {
  'use strict';

  var REPO_OWNER = 'jmourabarbosa';
  var REPO_NAME = 'jmourabarbosa.github.io';
  var BRANCH = 'master';
  var STORAGE_KEY = 'cms_github_pat';

  window.CMS = window.CMS || {};

  // --- State ---
  window.CMS.isAdmin = false;
  window.CMS.token = null;

  // --- Init ---
  window.CMS.init = function () {
    var savedToken = localStorage.getItem(STORAGE_KEY);
    if (savedToken) {
      window.CMS.token = savedToken;
      window.CMS.isAdmin = true;
      document.body.classList.add('cms-admin');
    }
    renderNavAuthLink();
    renderFooterLogout();
  };

  // --- Login ---
  window.CMS.login = function (token) {
    return validateToken(token).then(function (valid) {
      if (valid) {
        window.CMS.token = token;
        window.CMS.isAdmin = true;
        localStorage.setItem(STORAGE_KEY, token);
        document.body.classList.add('cms-admin');
        window.location.href = '/';
        return true;
      }
      return false;
    });
  };

  // --- Logout ---
  window.CMS.logout = function () {
    window.CMS.token = null;
    window.CMS.isAdmin = false;
    localStorage.removeItem(STORAGE_KEY);
    document.body.classList.remove('cms-admin');
    window.location.reload();
  };

  // --- Validate token by checking repo access ---
  function validateToken(token) {
    return fetch('https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME, {
      headers: {
        'Authorization': 'token ' + token,
        'Accept': 'application/vnd.github.v3+json'
      }
    }).then(function (resp) {
      if (!resp.ok) return false;
      return resp.json().then(function (data) {
        return data.permissions && data.permissions.push;
      });
    }).catch(function () {
      return false;
    });
  }

  // --- GitHub API: Read file ---
  window.CMS.readFile = function (path) {
    return fetch('https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + path + '?ref=' + BRANCH, {
      headers: {
        'Authorization': 'token ' + window.CMS.token,
        'Accept': 'application/vnd.github.v3+json'
      }
    }).then(function (resp) {
      if (!resp.ok) throw new Error('Failed to read file: ' + path);
      return resp.json();
    });
  };

  // --- GitHub API: Write file (creates if it doesn't exist) ---
  window.CMS.writeFile = function (path, content, message) {
    var encodedContent = btoa(encodeURIComponent(content).replace(/%([0-9A-F]{2})/g, function(match, p1) { return String.fromCharCode(parseInt(p1, 16)); }));
    var url = 'https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + path;
    var headers = {
      'Authorization': 'token ' + window.CMS.token,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
    var body = {
      message: message || 'Update ' + path,
      content: encodedContent,
      branch: BRANCH
    };

    // Try to get existing file SHA; if file doesn't exist, create without SHA
    return window.CMS.readFile(path).then(function (file) {
      body.sha = file.sha;
      return fetch(url, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
    }).catch(function () {
      return fetch(url, { method: 'PUT', headers: headers, body: JSON.stringify(body) });
    }).then(function (resp) {
      if (!resp.ok) throw new Error('Failed to write file: ' + path);
      return resp.json();
    });
  };

  // --- Save JSON data ---
  window.CMS.saveData = function (dataFile, data) {
    var path = 'data/' + dataFile;
    var content = JSON.stringify(data, null, 2) + '\n';
    var message = 'Update ' + dataFile + ' via CMS';
    return window.CMS.writeFile(path, content, message);
  };

  // --- UI: Login/Logout link in navigation bar ---
  function renderNavAuthLink() {
    var nav = document.querySelector('.greedy-nav .visible-links');
    if (!nav) return;

    var li = document.createElement('li');
    li.className = 'masthead__menu-item';
    var link = document.createElement('a');

    if (window.CMS.isAdmin) {
      link.href = '#';
      link.textContent = 'Logout';
      link.addEventListener('click', function (e) {
        e.preventDefault();
        window.CMS.logout();
      });
    } else {
      link.href = '/login/';
      link.textContent = 'Login';
    }

    li.appendChild(link);
    nav.appendChild(li);
  }

  // --- UI: Logout link in footer (only when logged in) ---
  function renderFooterLogout() {
    if (!window.CMS.isAdmin) return;
    var footer = document.querySelector('.page__footer-copyright');
    if (!footer) return;

    var sep = document.createTextNode(' | ');
    var link = document.createElement('a');
    link.href = '#';
    link.textContent = 'Logout';
    link.style.cursor = 'pointer';
    link.addEventListener('click', function (e) {
      e.preventDefault();
      window.CMS.logout();
    });
    footer.appendChild(sep);
    footer.appendChild(link);
  }

  // --- Utility: Generate unique ID ---
  window.CMS.generateId = function (prefix) {
    return (prefix || 'item') + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  };

  // Auto-init when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { window.CMS.init(); });
  } else {
    window.CMS.init();
  }

})();
