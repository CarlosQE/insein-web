/**
 * INSEIN SRL — Módulo de Contacto
 * EmailJS + hCaptcha + Rate Limiting
 *
 */

const EMAILJS_CONFIG = {
  publicKey:  'N1z16qLqUaa2_wsTf',
  serviceId:  'service_tqu5101',
  templateId: 'template_1rty73q',
  demoMode:   false,
  toEmail:    'info@inseinsrl.com',
};

// ─── Rate limiting — máx 3 envíos por hora por sesión ────────
const RATE_LIMIT = {
  max:      3,
  windowMs: 60 * 60 * 1000, // 1 hora
  key:      'insein_form_sends',
};

function getRateData() {
  try {
    return JSON.parse(sessionStorage.getItem(RATE_LIMIT.key) || '{"count":0,"firstAt":0}');
  } catch { return { count: 0, firstAt: 0 }; }
}

function checkRateLimit() {
  const data = getRateData();
  const now  = Date.now();
  if (now - data.firstAt > RATE_LIMIT.windowMs) {
    sessionStorage.setItem(RATE_LIMIT.key, JSON.stringify({ count: 0, firstAt: now }));
    return true;
  }
  return data.count < RATE_LIMIT.max;
}

function incrementRate() {
  const data = getRateData();
  const now  = Date.now();
  sessionStorage.setItem(RATE_LIMIT.key, JSON.stringify({
    count:   data.count + 1,
    firstAt: data.firstAt || now,
  }));
}

// ─── Init + Formulario ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Inicializar EmailJS
  if (typeof emailjs === 'undefined') {
    console.error('[INSEIN] ❌ EmailJS SDK no encontrado.');
  } else if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
    console.info('[INSEIN] ⚠️  Modo DEMO activo — reemplazar credenciales en contact.js');
  } else {
    emailjs.init(EMAILJS_CONFIG.publicKey);
    console.info('[INSEIN] ✅ EmailJS inicializado → ' + EMAILJS_CONFIG.toEmail);
  }

  const form       = document.getElementById('contact-form');
  const submitBtn  = document.getElementById('form-submit');
  const statusEl   = document.getElementById('form-status');
  const captchaErr = document.getElementById('captcha-error');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const lang = localStorage.getItem('insein-lang') || 'es';
    const t    = window.i18n?.translations?.[lang] || {};

    // ── 1. Rate limiting ──────────────────────────────────────
    if (!checkRateLimit()) {
      showStatus(
        lang === 'es'
          ? '✗ Demasiados intentos. Espere un momento antes de volver a enviar.'
          : '✗ Too many attempts. Please wait before sending again.',
        'error'
      );
      return;
    }

    // ── 2. Validar hCaptcha ───────────────────────────────────
    const captchaResponse = hcaptcha.getResponse();
    if (captchaErr) captchaErr.style.display = 'none';

    if (!captchaResponse) {
      if (captchaErr) captchaErr.style.display = 'block';
      return;
    }

    // ── 3. Limpiar errores de campos ──────────────────────────
    form.querySelectorAll('.field-error').forEach(el => el.remove());
    form.querySelectorAll('.form-control.error').forEach(el => el.classList.remove('error'));

    // ── 4. Validar campos requeridos ──────────────────────────
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

    // ── 5. Enviar ─────────────────────────────────────────────
    submitBtn.disabled    = true;
    submitBtn.textContent = lang === 'es' ? 'Enviando...' : 'Sending...';
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
        hcaptcha.reset();
        return;
      }

      if (typeof emailjs === 'undefined') throw new Error('EmailJS SDK no disponible');

      await emailjs.sendForm(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templateId, form);

      incrementRate(); // Contar solo envíos exitosos
      showStatus(
        t.form_success || '✓ Solicitud recibida. Un especialista se contactará pronto.',
        'success'
      );
      form.reset();
      hcaptcha.reset();

    } catch (err) {
      console.error('[INSEIN] ❌ Error al enviar:', {
        message: err?.message || err?.text || 'Sin detalle',
        status:  err?.status,
      });

      let errMsg = `✗ Error al enviar. Escríbanos a ${EMAILJS_CONFIG.toEmail}`;
      if (err?.status === 400) errMsg = '✗ Configuración incorrecta (400). Contactar administrador.';
      if (err?.status === 401) errMsg = '✗ Public Key inválida (401). Verificar credenciales.';
      if (err?.status === 412) errMsg = '✗ Servicio desconectado (412). Verificar EmailJS.';
      if (err?.status === 429) errMsg = '✗ Límite mensual alcanzado (429). Intente más tarde.';

      showStatus(errMsg, 'error');
      hcaptcha.reset(); // Forzar nueva verificación tras error

    } finally {
      submitBtn.disabled    = false;
      submitBtn.textContent = t.form_submit || (lang === 'es' ? 'Enviar Solicitud' : 'Send Request');
    }
  });

  // ─── Helpers UI ─────────────────────────────────────────────
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
