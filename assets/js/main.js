/* AI SOLAR BOSS — interaction layer.
   Requires (CDN, loaded before this file): GSAP 3 + ScrollTrigger, Lenis.
   Everything degrades: reduced-motion users get a static, fully readable page. */

(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';

  /* ---------------- Header ---------------- */
  const head = document.getElementById('siteHead');
  let lastY = 0;
  function onScrollHead(y) {
    if (!head) return;
    head.classList.toggle('scrolled', y > 40);
    head.classList.toggle('hidden', y > 300 && y > lastY && !document.querySelector('.nav-menu.open'));
    lastY = y;
  }

  /* Mobile nav */
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('navMenu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Menu';
      document.body.style.overflow = '';
    }));
  }

  /* ---------------- Smooth scroll (Lenis) ---------------- */
  let lenis = null;
  if (!reduced && typeof window.Lenis !== 'undefined') {
    lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', (e) => onScrollHead(e.scroll));
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on('scroll', window.ScrollTrigger.update);
      window.gsap.ticker.add((t) => lenis.raf(t * 1000));
      window.gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  } else {
    addEventListener('scroll', () => onScrollHead(scrollY), { passive: true });
  }

  /* ---------------- Custom cursor ---------------- */
  if (!touch && !reduced) {
    const dot = document.createElement('div');
    const ring = document.createElement('div');
    dot.className = 'cursor-dot'; ring.className = 'cursor-ring';
    dot.setAttribute('aria-hidden', 'true'); ring.setAttribute('aria-hidden', 'true');
    document.body.append(dot, ring);
    let rx = -100, ry = -100, tx = -100, ty = -100;
    addEventListener('pointermove', (e) => {
      tx = e.clientX; ty = e.clientY;
      dot.style.transform = `translate(${tx}px,${ty}px) translate(-50%,-50%)`;
    }, { passive: true });
    (function loop() {
      rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, summary, input, select, textarea').forEach(el => {
      el.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ---------------- Magnetic buttons ---------------- */
  if (!touch && !reduced && hasGSAP) {
    document.querySelectorAll('[data-magnetic]').forEach(el => {
      const strength = 0.35;
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        window.gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * strength,
          y: (e.clientY - r.top - r.height / 2) * strength,
          duration: 0.4, ease: 'power3.out',
        });
      });
      el.addEventListener('pointerleave', () => {
        window.gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' });
      });
    });
  }

  /* ---------------- Hero title: char split + load choreography ---------------- */
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    heroTitle.querySelectorAll('.line').forEach(line => {
      const accent = line.classList.contains('accent-line');
      const words = line.textContent.trim().split(/\s+/);
      line.textContent = '';
      words.forEach((word, wi) => {
        const w = document.createElement('span');
        w.className = 'word' + (accent && wi === words.length - 1 ? ' accent' : '');
        [...word].forEach(ch => {
          const c = document.createElement('span');
          c.className = 'char';
          c.textContent = ch;
          w.appendChild(c);
        });
        line.appendChild(w);
        if (wi < words.length - 1) line.appendChild(document.createTextNode(' '));
      });
    });

    if (!reduced && hasGSAP) {
      const tl = window.gsap.timeline({ delay: 0.15 });
      tl.to('.hero-title .char', {
        y: 0, duration: 1.1, ease: 'expo.out',
        stagger: { each: 0.016, from: 'start' },
      })
      .from('.hero-topline', { opacity: 0, y: -16, duration: 0.7, ease: 'power2.out' }, '-=0.7')
      .from('.hero-lead',    { opacity: 0, y: 24,  duration: 0.8, ease: 'power2.out' }, '-=0.6')
      .from('.hero-ctas',    { opacity: 0, y: 24,  duration: 0.8, ease: 'power2.out' }, '-=0.65')
      .from('.hero-scrollhint', { opacity: 0, duration: 0.9 }, '-=0.4');
    } else {
      document.querySelectorAll('.hero-title .char').forEach(c => { c.style.transform = 'none'; });
    }
  }

  /* ---------------- Scroll reveals ---------------- */
  if (!reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => io.observe(el));
  } else {
    document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => el.classList.add('in'));
  }

  /* ---------------- Counters ---------------- */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const fmt = (v, dec) => dec > 0 ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      if (reduced) { el.textContent = fmt(target, dec); return; }
      const dur = 1600, t0 = performance.now();
      (function step(t) {
        const p = Math.min((t - t0) / dur, 1);
        const e = 1 - Math.pow(1 - p, 4); /* easeOutQuart */
        el.textContent = fmt(target * e, dec);
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { run(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.5 });
    counters.forEach(el => cio.observe(el));
  }

  /* ---------------- Card cursor-glow ---------------- */
  if (!touch) {
    document.querySelectorAll('.disc-card').forEach(card => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }, { passive: true });
    });
  }

  /* ---------------- Daybreak: scroll-scrubbed sunrise ---------------- */
  const daybreak = document.querySelector('.daybreak');
  if (daybreak && !reduced && hasGSAP && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    const sticky = daybreak.querySelector('.daybreak-sticky');
    const sunEl = daybreak.querySelector('.daybreak-sun');

    window.gsap.timeline({
      scrollTrigger: {
        trigger: daybreak, start: 'top top', end: 'bottom bottom', scrub: 0.6,
        onUpdate(self) { sticky.classList.toggle('lit', self.progress > 0.5); },
      },
    })
    .fromTo(sunEl, { scale: 0.08, yPercent: 40 }, { scale: 1, yPercent: 0, ease: 'none', duration: 0.55 })
    .to(sunEl, { scale: 14, ease: 'power1.in', duration: 0.45 }, 0.55);
  }

  /* ---------------- Kinetic CTA: outline text fills on scrub ---------------- */
  const ghost = document.querySelector('.cta-kinetic .ghost');
  if (ghost && !reduced && hasGSAP && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.to(ghost, {
      backgroundSize: '100% 100%',
      ease: 'none',
      scrollTrigger: { trigger: ghost, start: 'top 85%', end: 'top 30%', scrub: 0.5 },
    });
  } else if (ghost) {
    /* Reduced motion or GSAP unavailable: show the filled state. */
    ghost.style.backgroundSize = '100% 100%';
  }

  /* ---------------- Hero exit scrub ---------------- */
  const heroInner = document.querySelector('.hero-inner');
  if (heroInner && !reduced && hasGSAP && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.to(heroInner, {
      opacity: 0.12, y: -70, ease: 'none',
      scrollTrigger: { trigger: '.hero', start: '35% top', end: 'bottom top', scrub: true },
    });
  }

  /* ---------------- Section parallax accents ---------------- */
  if (!reduced && hasGSAP && window.ScrollTrigger) {
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const amt = parseFloat(el.dataset.parallax) || 40;
      window.gsap.fromTo(el, { y: amt }, {
        y: -amt, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }

  /* ---------------- Footer year ---------------- */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
