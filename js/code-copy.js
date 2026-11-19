(function () {
  'use strict';

  var blocks = document.querySelectorAll('.prose pre');
  if (!blocks.length) return;

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy') ? resolve() : reject();
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(area);
      }
    });
  }

  blocks.forEach(function (pre) {
    var host = pre.closest('.highlight') || pre;
    if (host.classList.contains('has-copy')) return;
    host.classList.add('has-copy');

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code to clipboard');

    var timer;
    button.addEventListener('click', function () {
      var code = pre.querySelector('code') || pre;
      copyText(code.innerText.replace(/\n$/, '')).then(function () {
        button.textContent = 'Copied';
        button.classList.add('is-copied');
      }, function () {
        button.textContent = 'Press Ctrl+C';
      }).then(function () {
        clearTimeout(timer);
        timer = setTimeout(function () {
          button.textContent = 'Copy';
          button.classList.remove('is-copied');
        }, 2000);
      });
    });

    host.appendChild(button);
  });
})();
