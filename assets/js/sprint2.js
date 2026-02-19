/**
 * INSEIN SRL — Sprint 2 JavaScript
 * Módulos: Cursor custom, Scroll progress, Lightbox galería, Partículas hero
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. BARRA DE PROGRESO DE SCROLL ────────────────────────
  const progressBar = document.getElementById('scroll-progress');

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrollTop  = window.scrollY;
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
      const progress   = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }, { passive: true });
  }


  // ── 2. CURSOR PERSONALIZADO ───────────────────────────────
  const cursorDot  = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');

  if (cursorDot && cursorRing && window.matchMedia('(hover: hover)').matches) {
    let mouseX = 0, mouseY = 0;
    let ringX  = 0, ringY  = 0;

    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top  = `${mouseY}px`;
    });

    // Ring con lag suave
    function animateRing() {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = `${ringX}px`;
      cursorRing.style.top  = `${ringY}px`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    // Hover state en elementos interactivos
    const hoverTargets = document.querySelectorAll(
      'a, button, .service-card, .gallery-item-s2, .blog-card, .cert-card, .why-item, .tab-btn'
    );

    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });

    // Ocultar cursor al salir de la ventana
    document.addEventListener('mouseleave', () => {
      cursorDot.style.opacity  = '0';
      cursorRing.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.style.opacity  = '1';
      cursorRing.style.opacity = '1';
    });
  }


  // ── 3. LIGHTBOX DE GALERÍA ────────────────────────────────
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lb-img');
  const lbCaption   = document.getElementById('lb-caption');
  const lbClose     = document.getElementById('lb-close');
  const lbPrev      = document.getElementById('lb-prev');
  const lbNext      = document.getElementById('lb-next');
  const galleryItems = document.querySelectorAll('.gallery-item-s2[data-src]');

  if (!lightbox || galleryItems.length === 0) return;

  let currentIndex = 0;

  const galleryData = Array.from(galleryItems).map(item => ({
    src:     item.dataset.src,
    caption: item.dataset.caption || '',
    cat:     item.dataset.cat || '',
  }));

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    const item = galleryData[currentIndex];
    lbImg.src = item.src;
    lbImg.alt = item.caption;
    if (lbCaption) {
      lbCaption.textContent = item.cat
        ? `${item.cat} — ${item.caption}`
        : item.caption;
    }
  }

  function prevItem() {
    currentIndex = (currentIndex - 1 + galleryData.length) % galleryData.length;
    updateLightbox();
  }

  function nextItem() {
    currentIndex = (currentIndex + 1) % galleryData.length;
    updateLightbox();
  }

  galleryItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  lbClose?.addEventListener('click', closeLightbox);
  lbPrev?.addEventListener('click', prevItem);
  lbNext?.addEventListener('click', nextItem);

  // Cerrar al hacer click fuera de la imagen
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });

  // Navegación con teclado
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')       closeLightbox();
    if (e.key === 'ArrowLeft')    prevItem();
    if (e.key === 'ArrowRight')   nextItem();
  });

  // Swipe en mobile
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextItem() : prevItem();
    }
  }, { passive: true });


  // ── 4. PARTÍCULAS DECORATIVAS EN HERO ────────────────────
  const particlesContainer = document.getElementById('hero-particles');

  if (particlesContainer) {
    const COUNT = 12;

    for (let i = 0; i < COUNT; i++) {
      const p = document.createElement('div');
      p.className = 'particle';

      const left     = Math.random() * 100;
      const height   = Math.random() * 60 + 40;   // 40px–100px
      const duration = Math.random() * 8 + 6;      // 6s–14s
      const delay    = Math.random() * 10;          // 0s–10s
      const opacity  = Math.random() * 0.4 + 0.1;

      p.style.cssText = `
        left: ${left}%;
        height: ${height}px;
        animation-duration: ${duration}s;
        animation-delay: -${delay}s;
        opacity: ${opacity};
      `;

      particlesContainer.appendChild(p);
    }
  }


  // ── 5. TICKER DUPLICADO (loop infinito) ───────────────────
  const tickerTrack = document.querySelector('.ticker-track');

  if (tickerTrack) {
    // Duplicar el contenido para el loop seamless
    const originalContent = tickerTrack.innerHTML;
    tickerTrack.innerHTML = originalContent + originalContent;
  }

});
