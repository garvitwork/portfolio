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
    initExpandableCards();
    initCoverCards();
    initMagneticButtons();
    initHeroGlow();
    initHeroDepth();
    initHeroSignal();
    initBranchPanels();
    initStatCounters();
    initBackToTop();
    initMobileFabCta();
    initTouchCardGlow();
    hardenExternalLinks();
    initFooterYear();
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
    var fabCta = document.getElementById('mobileFabCta');
    var footer = document.querySelector('.footer');
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

      // Keep the persistent mobile CTA out of the way once the real
      // contact section (and its own links) has scrolled into view.
      if (fabCta) {
        var nearFooter = footer ? footer.getBoundingClientRect().top < window.innerHeight : false;
        fabCta.classList.toggle('show', y > 400 && !nearFooter);
      }

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
  /* Touch tap glow: the pointer-tracked spotlight in initCardEffects   */
  /* is skipped on touch (no meaningful hover position), but a brief    */
  /* centred glow + soft lift on tap keeps cards feeling tactile and    */
  /* alive rather than flat on phones — the same kind of feedback CRED  */
  /* gives every card and row it renders.                               */
  /* ---------------------------------------------------------------- */
  function initTouchCardGlow() {
    if (!window.matchMedia('(pointer: coarse)').matches) return;

    var cards = Array.prototype.slice.call(document.querySelectorAll('.fx-card'));
    if (!cards.length) return;

    cards.forEach(function (card) {
      var timeout = null;
      card.addEventListener(
        'touchstart',
        function () {
          card.style.setProperty('--mx', '50%');
          card.style.setProperty('--my', '35%');
          card.classList.add('fx-active');
          if (timeout) window.clearTimeout(timeout);
        },
        { passive: true }
      );
      card.addEventListener(
        'touchend',
        function () {
          timeout = window.setTimeout(function () {
            card.classList.remove('fx-active');
          }, 500);
        },
        { passive: true }
      );
    });
  }

  /* ---------------------------------------------------------------- */
  /* Expandable cards: every project & expertise card ships a short     */
  /* teaser by default. Clicking anywhere on the card (except a real    */
  /* link, the video fullscreen button, or a tech tag) reveals the      */
  /* full write-up for that card only — every other card is untouched.  */
  /* The reveal height is measured from the actual content each time,   */
  /* so it animates cleanly regardless of how long the text is.         */
  /* ---------------------------------------------------------------- */
  function initExpandableCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-expand]'));
    if (!cards.length) return;

    var IGNORE_SELECTOR = 'a, .video-fullscreen-btn, .tech-tag, video, .project-video-panel, .project-cover';

    cards.forEach(function (card) {
      var panel = card.querySelector('.card-expand-panel');
      var btn = card.querySelector('.card-expand-btn');
      if (!panel || !btn) return;

      function setExpanded(expand) {
        card.classList.toggle('is-expanded', expand);
        btn.setAttribute('aria-expanded', String(expand));
        panel.style.maxHeight = expand ? panel.scrollHeight + 'px' : '0px';
      }

      function pulse() {
        if (reduceMotion) return;
        card.classList.remove('card-pulse');
        // Force reflow so the animation restarts if the card is tapped rapidly.
        void card.offsetWidth;
        card.classList.add('card-pulse');
        window.setTimeout(function () { card.classList.remove('card-pulse'); }, 400);
      }

      card.addEventListener('click', function (e) {
        if (e.target.closest(IGNORE_SELECTOR)) return;
        pulse();
        setExpanded(!card.classList.contains('is-expanded'));
      });

      // Keep an expanded panel's measured height correct if content
      // reflows on resize (e.g. rotating a tablet, or a font finishing load).
      window.addEventListener(
        'resize',
        function () {
          if (card.classList.contains('is-expanded')) {
            panel.style.maxHeight = panel.scrollHeight + 'px';
          }
        },
        { passive: true }
      );
    });
  }

  /* ---------------------------------------------------------------- */
  /* Cover-reveal cards: the MediPulse AI card leads with a poster      */
  /* image instead of its usual always-visible copy. Clicking the      */
  /* image toggles the same content every other card shows by default  */
  /* — the reveal itself is pure CSS (grid-template-rows 0fr -> 1fr),   */
  /* so it keeps sizing correctly even while the nested expand panel    */
  /* grows inside it. This click is intercepted before it reaches       */
  /* initExpandableCards' card-wide handler (.project-cover is in that  */
  /* handler's ignore list) so the two reveals never fight each other.  */
  /* ---------------------------------------------------------------- */
  function initCoverCards() {
    var covers = Array.prototype.slice.call(document.querySelectorAll('.project-card.has-cover .project-cover'));
    if (!covers.length) return;

    covers.forEach(function (cover) {
      var card = cover.closest('.project-card');
      var wrap = card && card.querySelector('.project-cover-wrap');
      if (!card || !wrap) return;

      function syncWrapHeight() {
        if (card.classList.contains('is-revealed')) {
          wrap.style.maxHeight = wrap.scrollHeight + 'px';
        }
      }

      cover.addEventListener('click', function (e) {
        e.stopPropagation();
        var revealed = card.classList.toggle('is-revealed');
        wrap.style.maxHeight = revealed ? wrap.scrollHeight + 'px' : '0px';
      });

      // The nested "View details" panel inside the content can grow or
      // shrink after the cover is revealed — keep this outer wrapper's
      // measured height in sync whenever that happens, or the newly
      // grown content would get clipped.
      card.addEventListener('click', function () {
        window.requestAnimationFrame(syncWrapHeight);
      });

      window.addEventListener('resize', syncWrapHeight, { passive: true });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Branch-select panels: same cursor-tracked spotlight as .fx-card,   */
  /* scoped to the two big "AI/ML" vs "Data & BI" choice panels.        */
  /* ---------------------------------------------------------------- */
  function initBranchPanels() {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-branch-panel]'));
    if (!panels.length) return;

    panels.forEach(function (panel) {
      var rect = null;

      panel.addEventListener('pointerenter', function () {
        rect = panel.getBoundingClientRect();
      });
      panel.addEventListener('pointermove', function (e) {
        if (!rect) rect = panel.getBoundingClientRect();
        var px = ((e.clientX - rect.left) / rect.width) * 100;
        var py = ((e.clientY - rect.top) / rect.height) * 100;
        panel.style.setProperty('--mx', px.toFixed(2) + '%');
        panel.style.setProperty('--my', py.toFixed(2) + '%');
      });
      panel.addEventListener('pointerleave', function () {
        rect = null;
        panel.style.removeProperty('--mx');
        panel.style.removeProperty('--my');
      });
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
  /* Hero depth orbs: gentle parallax drift tied to cursor position.   */
  /* ---------------------------------------------------------------- */
  function initHeroDepth() {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;

    var hero = document.getElementById('heroSurface');
    var depth = document.getElementById('heroDepth');
    if (!hero || !depth) return;

    var orbs = Array.prototype.slice.call(depth.querySelectorAll('.hero-orb'));
    var raf = null;

    hero.addEventListener('pointermove', function (e) {
      var rect = hero.getBoundingClientRect();
      var px = (e.clientX - rect.left) / rect.width - 0.5;
      var py = (e.clientY - rect.top) / rect.height - 0.5;

      if (raf) window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(function () {
        orbs.forEach(function (orb, i) {
          var strength = 16 + i * 8;
          orb.style.transform =
            'translate3d(' + (px * strength).toFixed(1) + 'px,' + (py * strength).toFixed(1) + 'px, 0)';
        });
      });
    });

    hero.addEventListener('pointerleave', function () {
      orbs.forEach(function (orb) { orb.style.transform = ''; });
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
  /* Mobile floating CTA: visibility is driven by initNavbarScrollState;  */
  /* this just closes the mobile menu first if it happens to be open,    */
  /* so tapping the FAB always lands the person on #contact cleanly.     */
  /* ---------------------------------------------------------------- */
  function initMobileFabCta() {
    var fab = document.getElementById('mobileFabCta');
    var navLinks = document.getElementById('navLinks');
    var hamburger = document.getElementById('navHamburger');
    if (!fab) return;

    fab.addEventListener('click', function () {
      if (navLinks && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        if (hamburger) {
          hamburger.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
        }
        document.body.style.overflow = '';
      }
    });
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

      var play = function () { video.play().catch(function () { }); };
      var pause = function () { video.pause(); };

      panel.addEventListener('mouseenter', play);
      panel.addEventListener('mouseleave', pause);
      panel.addEventListener('focusin', play);
      panel.addEventListener('focusout', pause);

      var fsBtn = panel.querySelector('.video-fullscreen-btn');
      if (fsBtn) {
        fsBtn.addEventListener('click', function () {
          if (video.requestFullscreen) video.requestFullscreen().catch(function () { });
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
        navigator.clipboard.writeText(address).then(showCopied).catch(function () { });
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

  /* ---------------------------------------------------------------- */
  /* Footer copyright year                                              */
  /* ---------------------------------------------------------------- */
  function initFooterYear() {
    var yearEl = document.getElementById('footerYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }
})();