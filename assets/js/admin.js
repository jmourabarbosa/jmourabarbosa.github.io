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
    renderAdminButton();
  };

  // --- Login ---
  window.CMS.login = function (token) {
    return validateToken(token).then(function (valid) {
      if (valid) {
        window.CMS.token = token;
        window.CMS.isAdmin = true;
        localStorage.setItem(STORAGE_KEY, token);
        document.body.classList.add('cms-admin');
        closeLoginModal();
        // Reload to show edit buttons
        window.location.reload();
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

  // --- GitHub API: Write file ---
  window.CMS.writeFile = function (path, content, message) {
    // First get the current file to get its SHA
    return window.CMS.readFile(path).then(function (file) {
      return fetch('https://api.github.com/repos/' + REPO_OWNER + '/' + REPO_NAME + '/contents/' + path, {
        method: 'PUT',
        headers: {
          'Authorization': 'token ' + window.CMS.token,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message || 'Update ' + path,
          content: btoa(unescape(encodeURIComponent(content))),
          sha: file.sha,
          branch: BRANCH
        })
      });
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

  // --- UI: Admin button in footer ---
  function renderAdminButton() {
    var footer = document.querySelector('.page__footer-copyright');
    if (!footer) return;

    if (window.CMS.isAdmin) {
      // Show logout button
      var logoutBtn = document.createElement('button');
      logoutBtn.className = 'cms-admin-btn cms-logout-btn';
      logoutBtn.innerHTML = '&#x1f513; Logout';
      logoutBtn.title = 'Logout from CMS';
      logoutBtn.addEventListener('click', function () {
        if (confirm('Logout from admin mode?')) {
          window.CMS.logout();
        }
      });
      footer.appendChild(logoutBtn);
    } else {
      // Show login button
      var loginBtn = document.createElement('button');
      loginBtn.className = 'cms-admin-btn cms-login-btn';
      loginBtn.innerHTML = '&#x1f512;';
      loginBtn.title = 'Admin login';
      loginBtn.addEventListener('click', function () {
        showLoginModal();
      });
      footer.appendChild(loginBtn);
    }
  }

  // --- UI: Login Modal ---
  function showLoginModal() {
    var overlay = document.createElement('div');
    overlay.className = 'cms-modal-overlay';
    overlay.id = 'cmsLoginOverlay';

    var modal = document.createElement('div');
    modal.className = 'cms-modal';
    modal.innerHTML =
      '<h2 class="cms-modal__title">Admin Login</h2>' +
      '<p class="cms-modal__desc">Enter your GitHub Personal Access Token to enable editing. The token needs <code>repo</code> scope.</p>' +
      '<input type="password" id="cmsTokenInput" class="cms-input" placeholder="ghp_xxxxxxxxxxxx" autocomplete="off" />' +
      '<div id="cmsLoginError" class="cms-error" style="display:none;">Invalid token or insufficient permissions.</div>' +
      '<div class="cms-modal__actions">' +
      '  <button id="cmsLoginCancel" class="cms-btn cms-btn--secondary">Cancel</button>' +
      '  <button id="cmsLoginSubmit" class="cms-btn cms-btn--primary">Login</button>' +
      '</div>';

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Focus input
    setTimeout(function () {
      document.getElementById('cmsTokenInput').focus();
    }, 100);

    // Events
    document.getElementById('cmsLoginCancel').addEventListener('click', closeLoginModal);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeLoginModal();
    });

    document.getElementById('cmsLoginSubmit').addEventListener('click', handleLogin);
    document.getElementById('cmsTokenInput').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') handleLogin();
    });
  }

  function handleLogin() {
    var input = document.getElementById('cmsTokenInput');
    var errorEl = document.getElementById('cmsLoginError');
    var submitBtn = document.getElementById('cmsLoginSubmit');
    var token = input.value.trim();

    if (!token) {
      errorEl.textContent = 'Please enter a token.';
      errorEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
    errorEl.style.display = 'none';

    window.CMS.login(token).then(function (success) {
      if (!success) {
        errorEl.textContent = 'Invalid token or insufficient permissions.';
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
      }
    }).catch(function () {
      errorEl.textContent = 'Connection error. Please try again.';
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    });
  }

  function closeLoginModal() {
    var overlay = document.getElementById('cmsLoginOverlay');
    if (overlay) overlay.remove();
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
