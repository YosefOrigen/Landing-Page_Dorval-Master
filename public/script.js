// Contacto verificado de DORVAL.
const SITE_CONFIG = {
  whatsappNumber: '18092650215',
};

const languageButton = document.querySelector('.language');
let currentLanguage = 'es';
function setLanguage(language) {
  currentLanguage = language;
  document.documentElement.lang = language;
  document.querySelectorAll('[data-es][data-en]').forEach((element) => {
    element.innerHTML = element.dataset[language];
  });
  document.querySelectorAll('[data-placeholder-es][data-placeholder-en]').forEach((element) => {
    element.placeholder = element.dataset[`placeholder${language[0].toUpperCase()}${language.slice(1)}`];
  });
  const closeButton = document.querySelector('.dialog-close');
  if (closeButton) closeButton.setAttribute('aria-label', language === 'es' ? 'Cerrar formulario' : 'Close form');
  languageButton.querySelectorAll('span').forEach((span) => {
    span.classList.toggle('active', span.textContent.toLowerCase() === language);
  });
  languageButton.setAttribute('aria-label', language === 'es' ? 'Switch language to English' : 'Cambiar idioma a español');
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
