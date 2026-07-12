/* ==========================================================================
   Garvit Gupta — Portfolio
   Vanilla JS only. No eval, no innerHTML writes of dynamic/user data,
   no third-party trackers. Respects prefers-reduced-motion throughout.
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initNavbarScrollState();
    initMobileMenu();
    initScrollSpy();
    initRevealAnimations();
    initVideoHoverPlay();
    initEmailProtection();
    hardenExternalLinks();
  });

  /* ---------------------------------------------------------------- */
  /* Navbar background on scroll                                       */
  /* ---------------------------------------------------------------- */
  function initNavbarScrollState() {
    var navbar = document.getElementById('navbar');
    if (!navbar) return;

    var ticking = false;
    function update() {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
      ticking = false;
    }
    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );
    update();
  }

  /* ---------------------------------------------------------------- */
  /* Mobile hamburger menu                                             */
  /* ---------------------------------------------------------------- */
  function initMobileMenu() {
    var hamburger = document.getElementById('navHamburger');
    var navLinks = document.getElementById('navLinks');
    if (!hamburger || !navLinks) return;

    hamburger.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    navLinks.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Scroll-spy: highlight the nav link for the section in view        */
  /* ---------------------------------------------------------------- */
  function initScrollSpy() {
    var sections = Array.prototype.slice.call(document.querySelectorAll('main [id]'));
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    if (!sections.length || !navLinks.length) return;

    var linkById = {};
    navLinks.forEach(function (link) {
      var href = link.getAttribute('href') || '';
      if (href.charAt(0) === '#') linkById[href.slice(1)] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          var activeLink = linkById[id];
          if (!activeLink) return;
          navLinks.forEach(function (l) { l.classList.remove('active'); });
          activeLink.classList.add('active');
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );

    sections.forEach(function (section) { observer.observe(section); });
  }

  /* ---------------------------------------------------------------- */
  /* Scroll reveal animation for cards/sections                        */
  /* ---------------------------------------------------------------- */
  function initRevealAnimations() {
    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (reduceMotion) {
      targets.forEach(function (el) { el.classList.add('in-view'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );

    targets.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------- */
  /* Play project demo videos on hover / focus, pause on leave          */
  /* ---------------------------------------------------------------- */
  function initVideoHoverPlay() {
    document.querySelectorAll('.project-video-panel video').forEach(function (video) {
      var panel = video.closest('.project-video-panel');
      if (!panel) return;

      var play = function () { video.play().catch(function () {}); };
      var pause = function () { video.pause(); };

      panel.addEventListener('mouseenter', play);
      panel.addEventListener('mouseleave', pause);
      panel.addEventListener('focusin', play);
      panel.addEventListener('focusout', pause);

      var fsBtn = panel.querySelector('.video-fullscreen-btn');
      if (fsBtn) {
        fsBtn.addEventListener('click', function () {
          if (video.requestFullscreen) video.requestFullscreen().catch(function () {});
        });
      }
    });
  }

  /* ---------------------------------------------------------------- */
  /* Lightweight email de-obfuscation                                  */
  /* Keeps the address out of the raw page source to cut down on the   */
  /* lowest-effort scraper bots, while staying fully accessible:       */
  /* the mailto link is built client-side from two joined parts.       */
  /* ---------------------------------------------------------------- */
  function initEmailProtection() {
    var target = document.querySelector('[data-email-user]');
    if (!target) return;
    var user = target.getAttribute('data-email-user');
    var domain = target.getAttribute('data-email-domain');
    if (!user || !domain) return;
    var address = user + '@' + domain;
    target.textContent = address;
    target.setAttribute('href', 'mailto:' + address);
  }

  /* ---------------------------------------------------------------- */
  /* Security hygiene: force rel="noopener noreferrer" on every        */
  /* target="_blank" link so external pages can never get a handle     */
  /* back to window.opener (tab-nabbing protection).                   */
  /* ---------------------------------------------------------------- */
  function hardenExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach(function (link) {
      var rel = (link.getAttribute('rel') || '').split(/\s+/).filter(Boolean);
      ['noopener', 'noreferrer'].forEach(function (token) {
        if (rel.indexOf(token) === -1) rel.push(token);
      });
      link.setAttribute('rel', rel.join(' '));
    });
  }
})();