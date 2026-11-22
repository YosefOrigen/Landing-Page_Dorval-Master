const requiredFields = ['submittedAt', 'name', 'phone', 'propertyType', 'goal', 'zone', 'timing'];

function json(data, status = 200, headers = {}) {
  return Response.json(data, { status, headers });
}

function boundedText(value, maxLength = 500) {
  if (typeof value !== 'string') return '';
  const text = value.trim().slice(0, maxLength);
  // Prevent spreadsheet formula injection from untrusted form submissions.
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

async function handleLead(request, env) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405, { Allow: 'POST' });
  }

  const flowUrl = env.POWER_AUTOMATE_URL;
  if (!flowUrl) return json({ error: 'Lead storage is not configured' }, 503);

  let parsed;
  try {
    parsed = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return json({ error: 'Invalid lead data' }, 400);
  }
  if (requiredFields.some((field) => typeof parsed[field] !== 'string' || !parsed[field].trim()) || parsed.consent !== true) {
    return json({ error: 'Required lead fields or consent are missing' }, 400);
  }

  let destination;
  try {
    destination = new URL(flowUrl);
  } catch {
    return json({ error: 'Lead storage endpoint is invalid' }, 500);
  }
  if (destination.protocol !== 'https:') {
    return json({ error: 'Lead storage endpoint must use HTTPS' }, 500);
  }

  const lead = {
    submittedAt: boundedText(parsed.submittedAt, 40),
    name: boundedText(parsed.name, 120),
    phone: boundedText(parsed.phone, 40),
    email: boundedText(parsed.email, 200),
    propertyType: boundedText(parsed.propertyType, 100),
    goal: boundedText(parsed.goal, 100),
    zone: boundedText(parsed.zone, 180),
    budget: boundedText(parsed.budget, 80),
    timing: boundedText(parsed.timing, 100),
    consent: true,
    language: boundedText(parsed.language, 5),
    source: 'Web',
  };

  try {
    const upstream = await fetch(destination, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(12000),
    });
    if (!upstream.ok) return json({ error: 'Lead storage rejected the request' }, 502);
    return json({ saved: true }, 202);
  } catch {
    return json({ error: 'Lead storage is temporarily unavailable' }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/leads') return handleLead(request, env);
    if (url.pathname.startsWith('/api/')) return json({ error: 'Not found' }, 404);
    return env.ASSETS.fetch(request);
  },
};
