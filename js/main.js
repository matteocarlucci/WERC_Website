/* ==========================================================================
   WERC — Western Energy and Resources Club
   main.js — no dependencies, no build step.

   01. Theme (light / dark) with preference memory
   02. Sticky header state + scroll progress bar
   03. Mobile navigation
   04. Scroll-spy nav highlighting
   05. Reveal-on-scroll
   06. Animated stat counters
   07. Event filtering
   08. Member sign-up form
   09. Footer year
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Storage can be unavailable (private windows, blocked cookies), so every
     read and write is guarded and the site works fine without it. */
  function readStore(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function writeStore(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* no-op */ }
  }

  /* ---------- 01. THEME ---------- */
  var themeToggle = document.getElementById('themeToggle');
  var systemDark = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    var set = root.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return systemDark.matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeToggle) {
      var goingDark = theme === 'light';
      themeToggle.setAttribute('aria-pressed', String(theme === 'dark'));
      themeToggle.setAttribute('aria-label', 'Switch to ' + (goingDark ? 'dark' : 'light') + ' theme');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0C1310' : '#1D3422');
  }

  var saved = readStore('werc-theme');
  applyTheme(saved === 'light' || saved === 'dark' ? saved : (systemDark.matches ? 'dark' : 'light'));

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      writeStore('werc-theme', next);
    });
  }

  /* Follow the OS only while the visitor has not made their own choice. */
  systemDark.addEventListener('change', function (e) {
    if (!readStore('werc-theme')) applyTheme(e.matches ? 'dark' : 'light');
  });

  /* ---------- 02. HEADER STATE + PROGRESS ---------- */
  var header = document.getElementById('siteHeader');
  var progress = document.getElementById('scrollProgress');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-stuck', y > 8);
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
  }

  var scrollQueued = false;
  window.addEventListener('scroll', function () {
    if (scrollQueued) return;
    scrollQueued = true;
    window.requestAnimationFrame(function () { onScroll(); scrollQueued = false; });
  }, { passive: true });
  onScroll();

  /* ---------- 03. MOBILE NAV ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('nav');

  function setMenu(open) {
    if (!nav || !menuBtn) return;
    nav.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(!nav.classList.contains('is-open'));
    });

    /* Any link inside closes the panel so the anchor jump is visible. */
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (!nav.contains(e.target) && !menuBtn.contains(e.target)) setMenu(false);
    });

    window.matchMedia('(min-width: 901px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- 04. SCROLL-SPY ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-list a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- 05. REVEAL ON SCROLL ---------- */
  var revealables = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  revealables.forEach(function (el) {
    var d = el.getAttribute('data-delay');
    if (d) el.style.setProperty('--d', d);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealables.forEach(function (el) { revealer.observe(el); });
  }

  /* ---------- 06. STAT COUNTERS ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('.stat-num[data-count]'));

  function runCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }

    var duration = 1100;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(runCounter);
    } else {
      var countObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          countObserver.unobserve(entry.target);
        });
      }, { threshold: 0.5 });
      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ---------- 07. EVENT FILTERING ---------- */
  var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
  var events = Array.prototype.slice.call(document.querySelectorAll('.event'));
  var emptyMsg = document.getElementById('eventEmpty');

  function applyFilter(mode) {
    var shown = 0;
    events.forEach(function (ev) {
      var match = mode === 'all' || ev.getAttribute('data-state') === mode;
      ev.hidden = !match;
      if (match) shown++;
    });
    if (emptyMsg) emptyMsg.hidden = shown !== 0;
  }

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filters.forEach(function (b) {
        var active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      applyFilter(btn.getAttribute('data-filter'));
    });
  });

  if (filters.length) applyFilter('upcoming');

  /* ---------- 08. SIGN-UP FORM ----------
     Ships in "mailto" mode: it opens the visitor's email client with the
     answers filled in. To collect submissions properly, point the form at
     Formspree / Google Forms — see README.md. */
  var form = document.getElementById('joinForm');
  var status = document.getElementById('formStatus');

  function say(message, isError) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle('is-error', !!isError);
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      /* If the form has a real action, let the browser handle the POST. */
      if (form.getAttribute('action')) return;
      e.preventDefault();

      var required = Array.prototype.slice.call(form.querySelectorAll('[required]'));
      var firstBad = null;

      required.forEach(function (input) {
        var ok = input.checkValidity() && input.value.trim() !== '';
        input.setAttribute('aria-invalid', String(!ok));
        if (!ok && !firstBad) firstBad = input;
      });

      if (firstBad) {
        say('Please complete the highlighted fields.', true);
        firstBad.focus();
        return;
      }

      var data = new FormData(form);
      var interests = data.getAll('interest');
      var lines = [
        'Name: ' + data.get('name'),
        'Email: ' + data.get('email'),
        'Faculty: ' + data.get('faculty'),
        'Year: ' + data.get('year'),
        'Interests: ' + (interests.length ? interests.join(', ') : 'Not specified'),
        '',
        'Sent from the WERC website.'
      ];

      var to = form.getAttribute('data-mailto') || 'hello@werc-uwo.ca';
      var href = 'mailto:' + to +
        '?subject=' + encodeURIComponent('WERC membership sign-up — ' + data.get('name')) +
        '&body=' + encodeURIComponent(lines.join('\n'));

      window.location.href = href;
      say('Opening your email app — press send to finish your sign-up.');
    });

    /* Clear the error state as soon as the visitor starts fixing a field. */
    form.addEventListener('input', function (e) {
      if (e.target.hasAttribute('aria-invalid')) e.target.setAttribute('aria-invalid', 'false');
    });
  }

  /* ---------- 09. FOOTER YEAR ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
