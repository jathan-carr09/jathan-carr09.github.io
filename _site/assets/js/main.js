/* =========================================
   PERFORMANCE-FIRST JS
   - All cursor movement via transform (GPU)
   - Scroll listeners throttled with RAF
   - Passive event listeners throughout
   - Single RAF loop for cursor
   - IntersectionObserver for all reveals
   - No layout thrashing
========================================= */

(function () {
  'use strict';

  /* ── Premium Cursor & Ambient Glow ──────── */
  const cursor = document.getElementById('cursor');
  const heroGlow = document.getElementById('heroGlow');
  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let gx = window.innerWidth / 2, gy = window.innerHeight / 2;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
  }, { passive: true });

  const GLOW_LERP = 0.04;
  function rafLoop() {
    if (cursor) {
      cursor.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    }
    if (heroGlow) {
      gx += (mx - gx) * GLOW_LERP;
      gy += (my - gy) * GLOW_LERP;
      heroGlow.style.transform = `translate3d(${gx - 300}px, ${gy - 300}px, 0)`;
    }
    requestAnimationFrame(rafLoop);
  }
  requestAnimationFrame(rafLoop);

  document.querySelectorAll('a, button, .project-card, .skill-card, .stat-card, .modal-trigger, .modal-close').forEach(el => {
    el.addEventListener('mouseenter', () => cursor?.classList.add('cursor--hover'), { passive: true });
    el.addEventListener('mouseleave', () => cursor?.classList.remove('cursor--hover'), { passive: true });
  });

  /* ── Navbar (RAF-throttled) ─────────────── */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0, scrollTick = false;
  function onScroll() {
    lastScroll = window.scrollY;
    if (!scrollTick) {
      requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', lastScroll > 50);
        scrollTick = false;
      });
      scrollTick = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Mobile nav ──────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('is-active', isOpen);
    });
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.classList.remove('is-active');
      });
    });
  }

  /* ── Scroll Reveal ───────────────────────── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => entry.target.classList.add('visible'), delay);
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* ── Skill bars (scaleX transform — GPU) ── */
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const pct = parseFloat(entry.target.dataset.pct) || 0;
        setTimeout(() => {
          entry.target.style.transform = `scaleX(${pct})`;
        }, 200);
        barObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.skill-bar-fill').forEach(bar => barObs.observe(bar));

  /* ── Tab System ──────────────────────────── */
  const allSections = document.querySelectorAll('section');
  const navAnchors = document.querySelectorAll('.nav-links a');
  
  function switchTab(hash) {
    if (!hash || hash === '#') hash = '#home';
    
    document.body.classList.toggle('is-home', hash === '#home');

    allSections.forEach(sec => {
      if (sec.id === hash.substring(1)) {
        sec.classList.add('tab-active');
        
        // Re-trigger reveals for premium feel
        sec.querySelectorAll('.reveal').forEach(el => {
          el.classList.remove('visible');
          setTimeout(() => {
            const delay = parseInt(el.dataset.delay) || 0;
            setTimeout(() => el.classList.add('visible'), delay + 50);
          }, 15);
        });

        // Re-trigger skill bars
        sec.querySelectorAll('.skill-bar-fill').forEach(bar => {
          bar.style.transform = 'scaleX(0)';
          setTimeout(() => {
            const pct = parseFloat(bar.dataset.pct) || 0;
            bar.style.transform = `scaleX(${pct})`;
          }, 250);
        });

      } else {
        sec.classList.remove('tab-active');
      }
    });

    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === hash);
    });
    
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  // Handle nav clicks
  navAnchors.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const hash = link.getAttribute('href');
      history.pushState(null, null, hash);
      switchTab(hash);
    });
  });

  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) {
    navLogo.addEventListener('click', (e) => {
      e.preventDefault();
      history.pushState(null, null, '#home');
      switchTab('#home');
    });
  }

  window.addEventListener('popstate', () => {
    switchTab(window.location.hash);
  });

  // Initial tab load
  switchTab(window.location.hash);

  /* ── Typing effect ───────────────────────── */
  const typeEl = document.getElementById('heroType');
  if (typeEl) {
    const words = ['Engineer', 'Developer', 'Cybersecurity Student', 'Creator', 'Innovator'];
    let wi = 0, ci = 0, deleting = false;
    function type() {
      const word = words[wi];
      typeEl.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
      let delay = deleting ? 55 : 100;
      if (!deleting && ci > word.length) { delay = 1800; deleting = true; }
      if (deleting && ci < 0) { deleting = false; wi = (wi + 1) % words.length; delay = 400; }
      setTimeout(type, delay);
    }
    setTimeout(type, 1400);
  }

  /* ── Counter animation ───────────────────── */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      if (isNaN(target)) return;
      const dur = 1400, start = performance.now();
      function tick(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target) + (el.dataset.suffix || '');
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

  /* ── Card tilt ───────────────────────────── */
  document.querySelectorAll('.project-card').forEach(card => {
    let rect;
    card.addEventListener('mouseenter', () => {
      rect = card.getBoundingClientRect();
    }, { passive: true });
    
    card.addEventListener('mousemove', (e) => {
      if (!rect) rect = card.getBoundingClientRect();
      const rx2 = ((e.clientY - rect.top - rect.height / 2) / rect.height) * -7;
      const ry2 = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 7;
      card.style.transform = `perspective(700px) rotateX(${rx2}deg) rotateY(${ry2}deg) translateY(-6px)`;
    }, { passive: true });
    
    
    card.addEventListener('mouseleave', () => { 
      rect = null;
      card.style.transform = ''; 
    }, { passive: true });
  });

  /* ── Modal Logic ─────────────────────────── */
  const modalOverlay = document.getElementById('modalOverlay');
  const mTitle = document.getElementById('mTitle');
  const mMeta = document.getElementById('mMeta');
  const mDesc = document.getElementById('mDesc');
  const modalClose = document.getElementById('modalClose');

  if (modalOverlay) {
    document.querySelectorAll('.modal-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        // Prevent clicking child links from opening modal if necessary
        if(e.target.tagName.toLowerCase() === 'a') return;
        
        mTitle.textContent = trigger.getAttribute('data-title');
        mMeta.textContent = trigger.getAttribute('data-meta');
        mDesc.textContent = trigger.getAttribute('data-details');
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
      });
      // Add cursor pointer logic via class
      trigger.style.cursor = 'none'; // custom cursor
    });

    const closeModal = () => {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    });
  }

})();
