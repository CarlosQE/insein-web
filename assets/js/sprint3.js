/**
 * INSEIN SRL — Sprint 3 JavaScript
 * Módulos: Tabs Misión/Visión/Valores, Acordeón de certificaciones
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── 1. TABS MISIÓN / VISIÓN / VALORES ─────────────────────
  const mvvTabs   = document.querySelectorAll('.mvv-tab');
  const mvvPanels = document.querySelectorAll('.mvv-panel');

  mvvTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.mvv;

      mvvTabs.forEach(t => t.classList.remove('active'));
      mvvPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const panel = document.getElementById(`mvv-${target}`);
      if (panel) panel.classList.add('active');
    });
  });


  // ── 2. ACORDEÓN DE CERTIFICACIONES ───────────────────────
  const certItems = document.querySelectorAll('.cert-item');

  certItems.forEach(item => {
    const header = item.querySelector('.cert-item-header');

    header?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Cerrar todos
      certItems.forEach(ci => ci.classList.remove('open'));

      // Abrir el clickeado (si no estaba abierto)
      if (!isOpen) item.classList.add('open');
    });
  });

  // Abrir el primero por defecto
  if (certItems.length > 0) certItems[0].classList.add('open');

});
