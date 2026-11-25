// Contacto verificado de DORVAL.
const SITE_CONFIG = {
  whatsappNumber: '18092650215',
};

const languageButton = document.querySelector('.language');
let currentLanguage = 'es';
const photoDialog = document.querySelector('.property-lightbox');
const photoControls = [...document.querySelectorAll('.property-gallery [data-photo-index]')];
const lightboxImage = document.querySelector('.lightbox-image');
const lightboxDescription = document.querySelector('.lightbox-description');
const lightboxCount = document.querySelector('.lightbox-count');
let activePhotoIndex = 0;
function showPropertyPhoto(index) {
  activePhotoIndex = (index + photoControls.length) % photoControls.length;
  const control = photoControls[activePhotoIndex];
  const photo = control.querySelector('img');
  lightboxImage.src = photo.src;
  lightboxImage.alt = control.dataset[`caption${currentLanguage[0].toUpperCase()}${currentLanguage.slice(1)}`];
  lightboxDescription.textContent = lightboxImage.alt;
  lightboxCount.textContent = currentLanguage === 'es'
    ? `Foto ${activePhotoIndex + 1} de ${photoControls.length}`
    : `Photo ${activePhotoIndex + 1} of ${photoControls.length}`;
}
photoControls.forEach((control) => control.addEventListener('click', () => {
  showPropertyPhoto(Number(control.dataset.photoIndex));
  photoDialog.showModal();
}));
document.querySelector('.lightbox-close').addEventListener('click', () => photoDialog.close());
document.querySelector('.lightbox-prev').addEventListener('click', () => showPropertyPhoto(activePhotoIndex - 1));
document.querySelector('.lightbox-next').addEventListener('click', () => showPropertyPhoto(activePhotoIndex + 1));
photoDialog.addEventListener('click', (event) => {
  if (event.target === photoDialog) photoDialog.close();
});
photoDialog.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') showPropertyPhoto(activePhotoIndex - 1);
  if (event.key === 'ArrowRight') showPropertyPhoto(activePhotoIndex + 1);
});
function syncServiceMoreButtons() {
  document.querySelectorAll('.service-list').forEach((list) => {
    const toggle = list.nextElementSibling;
    if (!toggle?.classList.contains('service-more-toggle')) return;
    const wasExpanded = !list.classList.contains('is-collapsed');
    list.classList.add('is-collapsed');
    const hasOverflow = list.scrollHeight > list.clientHeight + 1;
    if (wasExpanded && hasOverflow) list.classList.remove('is-collapsed');
    const isExpanded = wasExpanded && hasOverflow;
    toggle.hidden = !hasOverflow;
    toggle.setAttribute('aria-expanded', String(isExpanded));
    toggle.textContent = isExpanded
      ? (currentLanguage === 'es' ? 'Leer menos' : 'Read less')
      : (currentLanguage === 'es' ? 'Leer más' : 'Read more');
  });
}
document.querySelectorAll('.service-more-toggle').forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const list = toggle.previousElementSibling;
    const isExpanded = list.classList.toggle('is-collapsed') === false;
    toggle.setAttribute('aria-expanded', String(isExpanded));
    toggle.textContent = isExpanded
      ? (currentLanguage === 'es' ? 'Leer menos' : 'Read less')
      : (currentLanguage === 'es' ? 'Leer más' : 'Read more');
  });
});
window.addEventListener('resize', syncServiceMoreButtons);
function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-es][data-en]').forEach((element) => {
    element.innerHTML = element.dataset[language];
  });
  document.querySelectorAll('[data-placeholder-es][data-placeholder-en]').forEach((element) => {
    element.placeholder = element.dataset[`placeholder${language[0].toUpperCase()}${language.slice(1)}`];
  });
  const aboutVisual = document.querySelector('.about-visual');
  if (aboutVisual) aboutVisual.setAttribute('aria-label', aboutVisual.dataset[language === 'es' ? 'labelEs' : 'labelEn']);
  const closeButton = document.querySelector('.dialog-close');
  if (closeButton) closeButton.setAttribute('aria-label', language === 'es' ? 'Cerrar formulario' : 'Close form');
  languageButton.querySelectorAll('span').forEach((span) => {
    span.classList.toggle('active', span.textContent.toLowerCase() === language);
  });
  languageButton.setAttribute('aria-label', language === 'es' ? 'Switch language to English' : 'Cambiar idioma a español');
  syncServiceMoreButtons();
  photoControls.forEach((control) => {
    control.setAttribute('aria-label', control.dataset[`label${language[0].toUpperCase()}${language.slice(1)}`]);
  });
  photoDialog.setAttribute('aria-label', photoDialog.dataset[`label${language[0].toUpperCase()}${language.slice(1)}`]);
  photoDialog.querySelectorAll('[data-label-es][data-label-en]').forEach((control) => {
    control.setAttribute('aria-label', control.dataset[`label${language[0].toUpperCase()}${language.slice(1)}`]);
  });
  if (photoDialog.open) showPropertyPhoto(activePhotoIndex);
  const propertyWhatsAppLink = document.querySelector('[data-whatsapp-property]');
  if (propertyWhatsAppLink) {
    const message = propertyWhatsAppLink.dataset[`message${language[0].toUpperCase()}${language.slice(1)}`];
    propertyWhatsAppLink.href = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  }
}
languageButton.addEventListener('click', () => setLanguage(currentLanguage === 'es' ? 'en' : 'es'));

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
menuToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

const whatsappLink = document.querySelector('[data-whatsapp]');
if (SITE_CONFIG.whatsappNumber) whatsappLink.href = `https://wa.me/${SITE_CONFIG.whatsappNumber}`;
document.getElementById('year').textContent = new Date().getFullYear();
setLanguage('es');

const propertyDialog = document.querySelector('.property-dialog');
const propertyForm = document.querySelector('.property-form');
const formSteps = [...document.querySelectorAll('.form-step')];
const progressBar = document.querySelector('.form-progress span');
const backButton = document.querySelector('.form-back');
const nextButton = document.querySelector('.form-next');
const submitButton = document.querySelector('.form-submit');
const doneButton = document.querySelector('.form-done');
const errorMessage = document.querySelector('.form-error');
const formStatus = document.querySelector('[data-form-status]');
const formWhatsappFallback = document.querySelector('.form-whatsapp-fallback');
let activeStep = 0;

function renderFormStep() {
  formSteps.forEach((step, index) => { step.hidden = index !== activeStep; });
  progressBar.style.width = `${Math.min(activeStep, 5) * 20}%`;
  backButton.hidden = activeStep === 0 || activeStep >= 6;
  nextButton.hidden = activeStep >= 5;
  submitButton.hidden = activeStep !== 5;
  doneButton.hidden = activeStep !== 6;
  errorMessage.hidden = true;
  const title = formSteps[activeStep].querySelector('h2');
  if (title) title.focus?.({ preventScroll: true });
}

function validCurrentStep() {
  if (activeStep === 0 || activeStep === 1 || activeStep === 4) {
    const radio = propertyForm.querySelector(`input[name="${['property', 'goal', '', '', 'timing'][activeStep]}"]:checked`);
    if (radio) return true;
  }
  if (activeStep === 2 && propertyForm.elements.zone.value.trim()) return true;
  if (activeStep === 3) return true;
  if (activeStep === 5) {
    const fields = [...propertyForm.querySelectorAll('[data-step="5"] input')];
    const invalidField = fields.find((field) => (field.required && (field.type === 'checkbox' ? !field.checked : !field.value.trim())) || (field.type === 'email' && field.value && !field.validity.valid));
    if (!invalidField) return true;
    invalidField.focus();
    invalidField.reportValidity();
    return false;
  }
  errorMessage.textContent = currentLanguage === 'es' ? 'Elige una opción o completa este campo para continuar.' : 'Choose an option or complete this field to continue.';
  errorMessage.hidden = false;
  return false;
}

document.querySelector('[data-open-property-form]').addEventListener('click', () => {
  activeStep = 0;
  renderFormStep();
  propertyDialog.showModal();
});
document.querySelector('.dialog-close').addEventListener('click', () => propertyDialog.close());
doneButton.addEventListener('click', () => propertyDialog.close());
propertyDialog.addEventListener('click', (event) => {
  if (event.target === propertyDialog) propertyDialog.close();
});
propertyDialog.addEventListener('close', () => {
  propertyForm.reset();
  formWhatsappFallback.hidden = true;
  activeStep = 0;
  renderFormStep();
});
nextButton.addEventListener('click', () => {
  if (!validCurrentStep()) return;
  activeStep += 1;
  renderFormStep();
});
backButton.addEventListener('click', () => {
  activeStep = Math.max(0, activeStep - 1);
  renderFormStep();
});
document.querySelectorAll('[data-zone]').forEach((button) => button.addEventListener('click', () => {
  propertyForm.elements.zone.value = button.dataset.zone;
  document.querySelectorAll('[data-zone]').forEach((choice) => choice.classList.toggle('selected', choice === button));
}));
document.querySelector('#property-zone').addEventListener('input', () => {
  document.querySelectorAll('[data-zone]').forEach((choice) => choice.classList.remove('selected'));
});
propertyForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (activeStep !== 5 || !validCurrentStep()) return;
  const answers = new FormData(propertyForm);
  const selected = (name) => propertyForm.querySelector(`input[name="${name}"]:checked`)?.nextElementSibling?.textContent.trim() || '';
  const lead = {
    name: answers.get('name')?.toString().trim(),
    phone: answers.get('phone')?.toString().trim(),
    email: answers.get('email')?.toString().trim() || '',
    propertyType: selected('property'),
    goal: selected('goal'),
    zone: answers.get('zone')?.toString().trim(),
    budget: answers.get('budget')?.toString().trim() || '',
    timing: selected('timing'),
  };
  const summary = Object.entries({
    Nombre: lead.name,
    WhatsApp: lead.phone,
    Correo: lead.email,
    Propiedad: lead.propertyType,
    Objetivo: lead.goal,
    Zona: lead.zone,
    Presupuesto: lead.budget,
    Plazo: lead.timing,
  }).map(([label, value]) => `${label}: ${value || 'Sin especificar'}`).join('\n');
  const whatsappUrl = `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(summary)}`;
  formWhatsappFallback.href = whatsappUrl;

  const whatsappWindow = window.open(whatsappUrl, '_blank');
  if (whatsappWindow) {
    whatsappWindow.opener = null;
    formWhatsappFallback.hidden = true;
  } else {
    formWhatsappFallback.hidden = false;
  }

  formStatus.dataset.es = 'WhatsApp se abrió con tu solicitud preparada. Revisa el mensaje y pulsa Enviar para compartirlo con DORVAL.';
  formStatus.dataset.en = 'WhatsApp opened with your request ready. Review the message and press Send to share it with DORVAL.';
  submitButton.disabled = false;
  submitButton.querySelector('span').textContent = currentLanguage === 'es' ? 'Enviar por WhatsApp' : 'Send via WhatsApp';
  setLanguage(currentLanguage);
  activeStep = 6;
  renderFormStep();
});

// Motion that respects the visitor’s reduced-motion preference.
const revealNodes = document.querySelectorAll('[data-reveal]');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('motion-ready');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -36px 0px' });
  revealNodes.forEach((node) => revealObserver.observe(node));
} else {
  revealNodes.forEach((node) => node.classList.add('is-visible'));
}

// Add a light sticky-header response while scrolling.
const siteHeader = document.querySelector('.site-header');
const syncHeaderDepth = () => document.body.classList.toggle('has-scrolled', window.scrollY > 12);
window.addEventListener('scroll', syncHeaderDepth, { passive: true });
syncHeaderDepth();