const SHEET_NAME = 'Leads';
const SCRIPT_PROPERTY_SPREADSHEET_ID = 'SPREADSHEET_ID';
const SCRIPT_PROPERTY_WEBHOOK_TOKEN = 'WEBHOOK_TOKEN';

const HEADERS = [
  'Fecha y hora (UTC)',
  'Nombre',
  'WhatsApp',
  'Correo electrónico',
  'Tipo de propiedad',
  'Objetivo',
  'Zona / ciudad',
  'Presupuesto aproximado',
  'Plazo',
  'Consentimiento',
  'Idioma',
  'Origen',
  'Estado comercial',
  'Notas internas',
];

/** Run once from the Apps Script editor after setting SPREADSHEET_ID. */
function setup() {
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty(SCRIPT_PROPERTY_SPREADSHEET_ID);
  if (!spreadsheetId) throw new Error('Set SPREADSHEET_ID in Script properties first.');

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
  ensureHeaders(sheet);
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  try {
    const properties = PropertiesService.getScriptProperties();
    const expectedToken = properties.getProperty(SCRIPT_PROPERTY_WEBHOOK_TOKEN);
    if (!expectedToken) return respond({ ok: false, error: 'Webhook is not configured.' });

    const raw = event && event.postData && event.postData.contents;
    if (!raw) return respond({ ok: false, error: 'Request body is required.' });

    let lead;
    try {
      lead = JSON.parse(raw);
    } catch {
      return respond({ ok: false, error: 'Invalid JSON.' });
    }
    if (!lead || typeof lead !== 'object' || Array.isArray(lead) || lead.token !== expectedToken) {
      return respond({ ok: false, error: 'Unauthorized or invalid request.' });
    }

    const required = ['submittedAt', 'name', 'phone', 'propertyType', 'goal', 'zone', 'timing'];
    if (required.some((key) => typeof lead[key] !== 'string' || !lead[key].trim()) || lead.consent !== true) {
      return respond({ ok: false, error: 'Required fields or consent are missing.' });
    }

    const spreadsheetId = properties.getProperty(SCRIPT_PROPERTY_SPREADSHEET_ID);
    if (!spreadsheetId) return respond({ ok: false, error: 'Spreadsheet is not configured.' });
    lock.waitLock(10000);

    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) return respond({ ok: false, error: 'Leads sheet was not initialized.' });
    ensureHeaders(sheet);

    sheet.appendRow([
      safeCell(lead.submittedAt, 40),
      safeCell(lead.name, 120),
      safeCell(lead.phone, 40),
      safeCell(lead.email, 200),
      safeCell(lead.propertyType, 100),
      safeCell(lead.goal, 100),
      safeCell(lead.zone, 180),
      safeCell(lead.budget, 80),
      safeCell(lead.timing, 100),
      true,
      safeCell(lead.language, 5),
      'Web',
      'Nuevo',
      '',
    ]);
    return respond({ ok: true });
  } catch (error) {
    console.error(error);
    return respond({ ok: false, error: 'Unable to save the lead.' });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    return;
  }

  const existing = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (!HEADERS.every((header, index) => existing[index] === header)) {
    throw new Error('The Leads sheet headers do not match the expected format.');
  }
}

function safeCell(value, maxLength) {
  if (typeof value !== 'string') return '';
  const text = value.trim().slice(0, maxLength);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function respond(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
