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
    initNavIndicator();
    initRevealAnimations();
    initVideoHoverPlay();
    initEmailProtection();
    initEmailCopy();
    initCardEffects();
    initMagneticButtons();
    initHeroGlow();
    initHeroSignal();
    initStatCounters();
    initBackToTop();
    hardenExternalLinks();
  });

  /* ---------------------------------------------------------------- */
  /* Navbar background on scroll + scroll progress bar                 */
  /* Both driven off the same rAF-throttled scroll listener so we      */
  /* only pay for one scroll handler on the page.                      */
  /* ---------------------------------------------------------------- */
  function initNavbarScrollState() {
    var navbar = document.getElementById('navbar');
    var progress = document.getElementById('scrollProgress');
    var backToTop = document.getElementById('backToTop');
    if (!navbar) return;

    var ticking = false;
    function update() {
      var y = window.scrollY;
      navbar.classList.toggle('scrolled', y > 20);

      if (progress) {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        var ratio = docHeight > 0 ? Math.min(Math.max(y / docHeight, 0), 1) : 0;
        progress.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      }

      if (backToTop) backToTop.classList.toggle('show', y > 600);

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
    window.addEventListener('resize', update, { passive: true });
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
  /* Sliding nav indicator: a soft pill that glides beneath whichever   */
  /* link is hovered, and settles under the active link otherwise.     */
  /* ---------------------------------------------------------------- */
  function initNavIndicator() {
    var wrap = document.querySelector('.nav-links-wrap');
    var indicator = document.getElementById('navIndicator');
    if (!wrap || !indicator) return;

    var links = Array.prototype.slice.call(wrap.querySelectorAll('.nav-link'));
    if (!links.length) return;

    function activeLink() {
      return wrap.querySelector('.nav-link.active');
    }

    function moveTo(link) {
      if (!link) {
        indicator.style.opacity = '0';
        return;
      }
      var wrapRect = wrap.getBoundingClientRect();
      var linkRect = link.getBoundingClientRect();
      indicator.style.opacity = '1';
      indicator.style.width = linkRect.width + 'px';
      indicator.style.height = linkRect.height + 'px';
      indicator.style.transform =
        'translate(' + (linkRect.left - wrapRect.left) + 'px,' + (linkRect.top - wrapRect.top) + 'px)';
    }

    links.forEach(function (link) {
      link.addEventListener('mouseenter', function () { moveTo(link); });
    });
    wrap.addEventListener('mouseleave', function () { moveTo(activeLink()); });

    // The active link's class is toggled by scroll-spy; watch for that
    // instead of coupling the two modules together.
    var mo = new MutationObserver(function () { moveTo(activeLink()); });
    links.forEach(function (link) {
      mo.observe(link, { attributes: true, attributeFilter: ['class'] });
    });

    window.addEventListener('resize', function () { moveTo(activeLink()); }, { passive: true });
    moveTo(activeLink());
  }

  /* ---------------------------------------------------------------- */
  /* Card physicality: a soft 3D tilt toward the cursor plus a         */
  /* spotlight that follows it, tinted by the section's accent.        */
  /* Skipped on touch devices (no meaningful pointer position) and     */
  /* when the person prefers reduced motion.                           */
  /* ---------------------------------------------------------------- */
  function initCardEffects() {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll('.fx-card'));
    if (!cards.length) return;

    var maxTilt = 5; // degrees — subtle, not a gimmick

    cards.forEach(function (card) {
      var rect = null;
      var raf = null;

      function handleEnter() {
        rect = card.getBoundingClientRect();
        card.classList.add('fx-active');
      }

      function handleMove(e) {
        if (!rect) rect = card.getBoundingClientRect();
        var px = (e.clientX - rect.left) / rect.width;
        var py = (e.clientY - rect.top) / rect.height;
        var rotY = (px - 0.5) * (maxTilt * 2);
        var rotX = (0.5 - py) * (maxTilt * 2);

        if (raf) window.cancelAnimationFrame(raf);
        raf = window.requestAnimationFrame(function () {
          card.style.setProperty('--mx', (px * 100).toFixed(2) + '%');
          card.style.setProperty('--my', (py * 100).toFixed(2) + '%');
          card.style.transform =
            'perspective(900px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateY(-4px)';
        });
      }

      function handleLeave() {
        rect = null;
        card.classList.remove('fx-active');
        card.style.transform = '';
        card.style.removeProperty('--mx');
        card.style.removeProperty('--my');
      }

      card.addEventListener('pointerenter', handleEnter);
      card.addEventListener('pointermove', handleMove);
      card.addEventListener('pointerleave', handleLeave);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Magnetic buttons: primary CTAs drift gently toward the cursor      */
  /* while it's nearby, and spring back on leave.                       */
  /* ---------------------------------------------------------------- */
  function initMagneticButtons() {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-magnetic]'));
    if (!buttons.length) return;

    var strength = 0.28;

    buttons.forEach(function (btn) {
      function move(e) {
        var rect = btn.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform =
          'translate(' + (x * strength).toFixed(1) + 'px,' + (y * strength - 2).toFixed(1) + 'px)';
      }
      function reset() { btn.style.transform = ''; }

      btn.addEventListener('pointermove', move);
      btn.addEventListener('pointerleave', reset);
    });
  }

  /* ---------------------------------------------------------------- */
  /* Hero ambient glow: follows the cursor within the hero only.       */
  /* ---------------------------------------------------------------- */
  function initHeroGlow() {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

    var hero = document.getElementById('heroSurface');
    var glow = document.getElementById('heroGlow');
    if (!hero || !glow) return;

    var raf = null;
    hero.addEventListener('pointermove', function (e) {
      var rect = hero.getBoundingClientRect();
      var hx = ((e.clientX - rect.left) / rect.width) * 100;
      var hy = ((e.clientY - rect.top) / rect.height) * 100;

      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(function () {
        glow.style.setProperty('--hx', hx.toFixed(2) + '%');
        glow.style.setProperty('--hy', hy.toFixed(2) + '%');
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Hero signal: a small dot travels along the ambient curve path,     */
  /* echoing the "signal models" language in the hero copy. Pauses      */
  /* automatically off-screen isn't needed since it's cheap (one        */
  /* getPointAtLength call per frame), but it does respect              */
  /* prefers-reduced-motion like every other motion effect here.        */
  /* ---------------------------------------------------------------- */
  function initHeroSignal() {
    if (reduceMotion) return;

    var path = document.getElementById('heroSignalPath');
    var dot = document.getElementById('heroSignalDot');
    var halo = document.getElementById('heroSignalHalo');
    if (!path || !dot || typeof path.getTotalLength !== 'function') return;

    var length = path.getTotalLength();
    var duration = 8000; // ms per lap
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var elapsed = (ts - start) % duration;
      var pt = path.getPointAtLength((elapsed / duration) * length);
      dot.setAttribute('cx', pt.x.toFixed(2));
      dot.setAttribute('cy', pt.y.toFixed(2));
      if (halo) {
        halo.setAttribute('cx', pt.x.toFixed(2));
        halo.setAttribute('cy', pt.y.toFixed(2));
      }
      window.requestAnimationFrame(frame);
    }
    window.requestAnimationFrame(frame);
  }

  /* ---------------------------------------------------------------- */
  /* Stat counters: count up from zero once scrolled into view.         */
  /* The static markup already shows the final value, so this is a      */
  /* pure progressive enhancement — nothing breaks if it never runs.    */
  /* ---------------------------------------------------------------- */
  function initStatCounters() {
    if (reduceMotion) return;

    var stats = Array.prototype.slice.call(document.querySelectorAll('.stat-value[data-count]'));
    if (!stats.length) return;

    var animated = new WeakSet();

    function animate(el) {
      var target = parseInt(el.getAttribute('data-count'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;

      var duration = 1100;
      var start = null;

      function frame(ts) {
        if (start === null) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) window.requestAnimationFrame(frame);
        else el.textContent = target + suffix;
      }
      window.requestAnimationFrame(frame);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting || animated.has(entry.target)) return;
          animated.add(entry.target);
          animate(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    stats.forEach(function (el) { observer.observe(el); });
  }

  /* ---------------------------------------------------------------- */
  /* Back to top                                                        */
  /* ---------------------------------------------------------------- */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
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
  /* Copy email address to the clipboard with brief visual feedback     */
  /* ---------------------------------------------------------------- */
  function initEmailCopy() {
    var btn = document.getElementById('copyEmailBtn');
    var link = document.getElementById('emailLink');
    if (!btn || !link) return;

    btn.addEventListener('click', function () {
      var address = link.textContent.trim();
      if (!address || address.indexOf('@') === -1) return;

      function showCopied() {
        var icon = btn.querySelector('i');
        btn.classList.add('copied');
        if (icon) icon.className = 'fas fa-check';
        window.setTimeout(function () {
          btn.classList.remove('copied');
          if (icon) icon.className = 'fas fa-copy';
        }, 1600);
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(showCopied).catch(function () {});
      }
    });
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