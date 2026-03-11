/**
 * INSEIN SRL — Módulo de Contacto
 * EmailJS con Outlook / Microsoft 365
 *
 * CONFIGURACIÓN (reemplazar con tus credenciales reales):
 *   publicKey  → Account > General > Public Key
 *   serviceId  → Email Services > nombre del servicio
 *   templateId → Email Templates > nombre de la plantilla
 *   demoMode   → false para envío real
 */

const EMAILJS_CONFIG = {
  publicKey:  'N1z16qLqUaa2_wsTf',
  serviceId:  'service_ed241d5',
  templateId: 'template_1rty73q',
  demoMode:   false,
  toEmail:    'info@inseinsrl.com',
};

// ─── Init + Formulario ───────────────────────────────────────
// Todo dentro de DOMContentLoaded para garantizar que el SDK
// (cargado sin defer en <head>) ya esté disponible.
document.addEventListener('DOMContentLoaded', () => {

  // Inicializar EmailJS
  if (typeof emailjs === 'undefined') {
    console.error('[INSEIN] ❌ EmailJS SDK no encontrado. Verificar el <script> en index.html.');
  } else if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
    console.info('[INSEIN] ⚠️  Modo DEMO activo — reemplazar credenciales en contact.js');
  } else {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.info('[INSEIN] ✅ EmailJS inicializado → ' + EMAILJS_CONFIG.toEmail);
  }

  // ─── Formulario ─────────────────────────────────────────────
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
      { name: 'from_name',  msg: lang === 'es' ? 'Ingrese su nombre.'        : 'Enter your name.' },
      { name: 'from_email', msg: lang === 'es' ? 'Ingrese un correo válido.' : 'Enter a valid email.', email: true },
      { name: 'service',    msg: lang === 'es' ? 'Seleccione un servicio.'   : 'Select a service.' },
      { name: 'message',    msg: lang === 'es' ? 'Escriba su mensaje.'       : 'Write your message.' },
    ];

    let valid = true;
    checks.forEach(({ name, msg, email }) => {
      const field = form.querySelector(`[name="${name}"]`);
      const val   = field?.value?.trim();
      const ok    = email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) : !!val;
      if (!ok) {
        valid = false;
        field?.classList.add('error');
        const err       = document.createElement('span');
        err.className   = 'field-error';
        err.textContent = msg;
        err.style.cssText = 'display:block;font-size:0.7rem;color:#ff4d4d;margin-top:4px;';
        field?.parentNode?.appendChild(err);
      }
    });

    if (!valid) return;

    // Estado: enviando
    submitBtn.disabled    = true;
    submitBtn.textContent = t.form_sending || (lang === 'es' ? 'Enviando...' : 'Sending...');
    clearStatus();

    try {
      // Modo DEMO
      if (EMAILJS_CONFIG.demoMode || EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        await new Promise(r => setTimeout(r, 1600));
        showStatus(
          t.form_success || '✓ Solicitud recibida. Un especialista se contactará pronto.',
          'success'
        );
        form.reset();
        return;
      }

      if (typeof emailjs === 'undefined') throw new Error('EmailJS SDK no disponible');

      // Envío real
      const result = await emailjs.sendForm(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        form
      );

      console.info('[INSEIN] ✅ Enviado. Status:', result.status, result.text);
      showStatus(
        t.form_success || '✓ Solicitud recibida. Un especialista se contactará pronto.',
        'success'
      );
      form.reset();

    } catch (err) {
      console.error('[INSEIN] ❌ Error al enviar:', {
        message: err?.message || err?.text || 'Sin detalle',
        status:  err?.status,
      });

      let errMsg = t.form_error || `✗ Error al enviar. Escríbanos a ${EMAILJS_CONFIG.toEmail}`;
      if (err?.status === 400) errMsg = '✗ Credenciales incorrectas (error 400). Contactar administrador.';
      if (err?.status === 401) errMsg = '✗ Public Key inválida (error 401). Verificar credenciales.';
      if (err?.status === 412) errMsg = '✗ Servicio de correo desconectado (error 412). Verificar EmailJS.';
      if (err?.status === 429) errMsg = '✗ Límite mensual alcanzado (error 429). Intente más tarde.';

      showStatus(errMsg, 'error');

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

  form.querySelectorAll('.form-control').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('error');
      input.parentNode?.querySelector('.field-error')?.remove();
    });
  });

});
