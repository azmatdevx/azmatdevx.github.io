(function () {
  'use strict';

  /* Theme toggle: light by default, remembered in localStorage (head script sets data-theme before paint) */
  var root = document.documentElement;
  var toggle = document.querySelector('.theme-toggle');

  function syncToggle() {
    if (!toggle) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    toggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
      syncToggle();
    });
    syncToggle();
  }

  /* Post search on the blog index */
  var input = document.getElementById('search-input');
  var results = document.getElementById('search-results');
  if (!input || !results) return;

  var posts = null;
  var loading = null;

  function load() {
    if (!loading) {
      loading = fetch('/search.json')
        .then(function (r) { return r.json(); })
        .then(function (data) { posts = data; })
        .catch(function () { posts = []; });
    }
    return loading;
  }

  function render(query) {
    results.textContent = '';
    if (!query) return;
    var q = query.toLowerCase();
    var hits = posts.filter(function (p) {
      return (p.title + ' ' + p.content).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 6);

    if (!hits.length) {
      var empty = document.createElement('li');
      empty.className = 'search__empty';
      empty.textContent = 'No results found';
      results.appendChild(empty);
      return;
    }

    hits.forEach(function (p) {
      var li = document.createElement('li');
      li.className = 'search__result';
      var a = document.createElement('a');
      a.href = p.url;
      var title = document.createElement('span');
      title.className = 'search__result-title';
      title.textContent = p.title;
      var meta = document.createElement('span');
      meta.className = 'search__result-meta';
      meta.textContent = p.date;
      a.appendChild(title);
      a.appendChild(meta);
      li.appendChild(a);
      results.appendChild(li);
    });
  }

  input.addEventListener('focus', load);
  input.addEventListener('input', function () {
    var query = input.value.trim();
    load().then(function () { render(query); });
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { input.value = ''; results.textContent = ''; }
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.search')) results.textContent = '';
  });
})();
