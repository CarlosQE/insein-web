/**
 * INSEIN SRL — Módulo de Contacto (Sprint 4)
 * EmailJS integrado, validación completa, UX de estado mejorada
 *
 * CONFIGURACIÓN:
 * 1. Crear cuenta en https://www.emailjs.com (gratis: 200 emails/mes)
 * 2. Conectar servicio con info@inseinsrl.com
 * 3. Crear template con: {{from_name}}, {{company}}, {{from_email}},
 *    {{phone}}, {{service}}, {{message}}
 * 4. Reemplazar los 3 valores de abajo y cambiar demoMode: false
 */

const EMAILJS_CONFIG = {
  publicKey:  'YOUR_PUBLIC_KEY',
  serviceId:  'YOUR_SERVICE_ID',
  templateId: 'YOUR_TEMPLATE_ID',
  demoMode:   true,
  toEmail:    'info@inseinsrl.com',
};

(function init() {
  if (typeof emailjs === 'undefined') { console.warn('[INSEIN] EmailJS SDK no encontrado.'); return; }
  if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') { console.info('[INSEIN] Modo DEMO activo.'); return; }
  emailjs.init(EMAILJS_CONFIG.publicKey);
  console.info('[INSEIN] EmailJS listo → ' + EMAILJS_CONFIG.toEmail);
})();

document.addEventListener('DOMContentLoaded', () => {
  const form      = document.getElementById('contact-form');
  const submitBtn = document.getElementById('form-submit');
  const statusEl  = document.getElementById('form-status');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const lang = localStorage.getItem('insein-lang') || 'es';
    const t    = window.i18n?.translations?.[lang] || {};

    // Limpiar errores previos
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));

    // Validar campos requeridos
    const checks = [
      { name: 'from_name',  msg: lang === 'es' ? 'Ingrese su nombre.' : 'Enter your name.' },
      { name: 'from_email', msg: lang === 'es' ? 'Ingrese un correo válido.' : 'Enter a valid email.', email: true },
      { name: 'service',    msg: lang === 'es' ? 'Seleccione un servicio.' : 'Select a service.' },
      { name: 'message',    msg: lang === 'es' ? 'Escriba su mensaje.' : 'Write your message.' },
    ];

    let valid = true;
    checks.forEach(({ name, msg, email }) => {
      const field = form.querySelector(`[name="${name}"]`);
      const val   = field?.value?.trim();
      const ok    = email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) : !!val;
      if (!ok) {
        valid = false;
        field?.classList.add('error');
        const err = document.createElement('span');
        err.className = 'field-error';
        err.textContent = msg;
        err.style.cssText = 'display:block;font-size:0.7rem;color:#ff4d4d;margin-top:4px;';
        field?.parentNode?.appendChild(err);
      }
    });

    if (!valid) return;

    submitBtn.disabled    = true;
    submitBtn.textContent = t.form_sending || 'Enviando...';
    clearStatus();

    try {
      if (EMAILJS_CONFIG.demoMode || EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        await new Promise(r => setTimeout(r, 1600));
        showStatus(t.form_success || '✓ Solicitud recibida. Un especialista se contactará pronto.', 'success');
        form.reset();
      } else {
        await emailjs.sendForm(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, form);
        showStatus(t.form_success || '✓ Solicitud recibida.', 'success');
        form.reset();
      }
    } catch (err) {
      console.error('[INSEIN] Error EmailJS:', err);
      showStatus(t.form_error || '✗ Error al enviar. Escríbanos a info@inseinsrl.com', 'error');
    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = t.form_submit || (lang === 'es' ? 'Enviar Solicitud' : 'Send Request');
    }
  });

  function showStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className   = 'form-status ' + type;
    if (type === 'success') setTimeout(clearStatus, 9000);
  }
  function clearStatus() {
    statusEl.textContent = '';
    statusEl.className   = 'form-status';
  }

  // Limpiar errores al tipear
  form.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      input.parentNode?.querySelector('.field-error')?.remove();
    });
  });
});
