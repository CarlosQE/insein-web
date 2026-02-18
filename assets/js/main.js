/**
 * INSEIN SRL — Main JavaScript
 * Módulos: Navbar, Tabs, Contadores, Scroll animations, i18n
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. NAVBAR — scroll + hamburger ──────────────────────────
  const navbar    = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.nav-mobile-link');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav link al hacer scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  const observeSection = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => observeSection.observe(s));


  // ── 2. TABS DE SERVICIOS ─────────────────────────────────────
  const tabBtns  = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.services-grid');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const panel = document.getElementById(`tab-${target}`);
      if (panel) {
        panel.classList.add('active');
        // Reanimar las cards
        panel.querySelectorAll('.service-card').forEach((card, i) => {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, i * 80);
        });
      }
    });
  });


  // ── 3. CONTADORES ANIMADOS ───────────────────────────────────
  function animateCounter(el, target, suffix = '', duration = 1800) {
    const start  = 0;
    const step   = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      const current = Math.floor(ease * target);
      el.textContent = suffix === '%' ? current + suffix : suffix + current;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = suffix === '%' ? target + suffix : suffix + target;
    };
    let startTime = null;
    requestAnimationFrame(step);
  }

  const counterEls = document.querySelectorAll('[data-counter]');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw = el.dataset.counter; // ej: "+50", "100%", "+5"
        const suffix  = raw.includes('%') ? '%' : '';
        const prefix  = raw.startsWith('+') ? '+' : '';
        const numStr  = raw.replace('%', '').replace('+', '');
        const num     = parseInt(numStr, 10);
        animateCounter(el, num, suffix ? suffix : '', 1600);
        if (prefix) {
          // Agregar + al inicio al terminar
          setTimeout(() => { el.textContent = prefix + el.textContent; }, 1650);
        }
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => counterObs.observe(el));


  // ── 4. REVEAL ON SCROLL (Intersection Observer) ─────────────
  const revealEls = document.querySelectorAll('.reveal, .reveal-left');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObs.observe(el));


  // ── 5. INTERNACIONALIZACIÓN ──────────────────────────────────
  const langBtns = document.querySelectorAll('.lang-btn');
  let currentLang = localStorage.getItem('insein-lang') || 'es';

  function setLang(lang) {
    currentLang = lang;
    langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    if (window.i18n) window.i18n.applyTranslations(lang);
  }

  langBtns.forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });

  // Aplicar idioma guardado al cargar
  setLang(currentLang);


  // ── 6. SMOOTH SCROLL para links internos ─────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offsetTop, behavior: 'smooth' });
    });
  });

  // ── 7. Año dinámico en footer ────────────────────────────────
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

});
