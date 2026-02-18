/**
 * INSEIN SRL — Módulo de Contacto con EmailJS
 *
 * CONFIGURACIÓN REQUERIDA:
 * 1. Crear cuenta en https://www.emailjs.com (gratis hasta 200 emails/mes)
 * 2. Crear un servicio de email conectado a info@inseinsrl.com
 * 3. Crear un template con las variables: {{from_name}}, {{company}}, {{from_email}},
 *    {{phone}}, {{service}}, {{message}}
 * 4. Reemplazar los 3 valores de configuración abajo
 *
 * PARA TESTING LOCAL: Se puede simular el envío con DEMO_MODE = true
 */

const EMAILJS_CONFIG = {
  publicKey:  'N1z16qLqUaa2_wsTf',   // ← Reemplazar con tu Public Key de EmailJS
  serviceId:  'service_ed241d5',   // ← Reemplazar con tu Service ID
  templateId: 'template_1rty73q',  // ← Reemplazar con tu Template ID
  demoMode:   true,                // ← Cambiar a false en producción
};

// Inicializar EmailJS
(function initEmailJS() {
  if (typeof emailjs === 'undefined') {
    console.warn('[INSEIN Contact] EmailJS no cargado. Verifique la conexión a internet.');
    return;
  }
  if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
    console.info('[INSEIN Contact] Modo DEMO activo. Configure las credenciales de EmailJS.');
    return;
  }
  emailjs.init(EMAILJS_CONFIG.publicKey);
  console.info('[INSEIN Contact] EmailJS inicializado correctamente.');
})();


document.addEventListener('DOMContentLoaded', () => {
  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('form-submit');
  const statusEl   = document.getElementById('form-status');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const lang = localStorage.getItem('insein-lang') || 'es';
    const t    = window.i18n?.translations?.[lang] || {};

    // Validación básica
    const name    = form.querySelector('[name="from_name"]').value.trim();
    const email   = form.querySelector('[name="from_email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      showStatus(lang === 'es' ? 'Por favor complete los campos requeridos.' : 'Please fill in required fields.', 'error');
      return;
    }

    // Estado: enviando
    submitBtn.disabled = true;
    submitBtn.textContent = t.form_sending || 'Enviando...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      // ── MODO DEMO (para pruebas locales) ──
      if (EMAILJS_CONFIG.demoMode || EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        await simulateSend();
        showStatus(t.form_success || '✓ Solicitud recibida. Un especialista se contactará pronto.', 'success');
        form.reset();
        return;
      }

      // ── ENVÍO REAL con EmailJS ──
      await emailjs.sendForm(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        form
      );

      showStatus(t.form_success || '✓ Solicitud recibida. Un especialista se contactará pronto.', 'success');
      form.reset();

    } catch (error) {
      console.error('[INSEIN Contact] Error EmailJS:', error);
      showStatus(t.form_error || '✗ Error al enviar. Contáctenos a info@inseinsrl.com', 'error');
    } finally {
      submitBtn.disabled = false;
      const submitText = document.querySelector('[data-i18n="form_submit"]');
      submitBtn.textContent = submitText?.textContent || (lang === 'es' ? 'Enviar Solicitud' : 'Send Request');
    }
  });

  function showStatus(message, type) {
    statusEl.textContent = message;
    statusEl.className = `form-status ${type}`;
    // Auto-limpiar después de 8 segundos en éxito
    if (type === 'success') {
      setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'form-status';
      }, 8000);
    }
  }

  function simulateSend() {
    return new Promise(resolve => setTimeout(resolve, 1500));
  }
});
