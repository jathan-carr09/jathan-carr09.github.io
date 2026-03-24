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

  /* ── Cursor ─────────────────────────────── */
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  if (cursor && cursorRing) {
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
    }, { passive: true });

    const LERP = 0.14;
    function rafLoop() {
      cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
      rx += (mx - rx) * LERP;
      ry += (my - ry) * LERP;
      cursorRing.style.transform = `translate(${rx - 18}px, ${ry - 18}px)`;
      requestAnimationFrame(rafLoop);
    }
    requestAnimationFrame(rafLoop);

    document.querySelectorAll('a, button, .project-card, .skill-card, .stat-card').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('cursor--hover');
        cursorRing.classList.add('ring--hover');
      }, { passive: true });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('cursor--hover');
        cursorRing.classList.remove('ring--hover');
      }, { passive: true });
    });
  }

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

  /* ── Active nav (pre-calculated offsets) ── */
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const navAnchors = document.querySelectorAll('.nav-links a');
  let sectionTops = [];
  function calcTops() {
    sectionTops = sections.map(s => ({
      id: s.id,
      top: s.getBoundingClientRect().top + window.scrollY - 220
    }));
  }
  calcTops();
  window.addEventListener('resize', calcTops, { passive: true });

  let navTick = false;
  let currentActive = '';
  function updateNav() {
    if (navTick) return;
    navTick = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      let current = sectionTops[0]?.id || '';
      for (const s of sectionTops) { if (y >= s.top) current = s.id; }
      
      if (current !== currentActive) {
        currentActive = current;
        navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current));
      }
      navTick = false;
    });
  }
  window.addEventListener('scroll', updateNav, { passive: true });

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

  /* ── Particle canvas (hero) ──────────────── */
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W, H;
    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 1920, y: Math.random() * 1080,
      r: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.22,
      dy: (Math.random() - 0.5) * 0.22,
      a: Math.random() * 0.45 + 0.1
    }));

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x = (p.x + p.dx + W) % W;
        p.y = (p.y + p.dy + H) % H;
        ctx.globalAlpha = p.a;
        ctx.fillStyle = '#C9A84C';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineWidth = 0.4; ctx.strokeStyle = '#C9A84C';
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.globalAlpha = (1 - d / 130) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

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

})();
