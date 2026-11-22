const requiredFields = ['submittedAt', 'name', 'phone', 'propertyType', 'goal', 'zone', 'timing'];

function boundedText(value, maxLength = 500) {
  if (typeof value !== 'string') return '';
  const text = value.trim().slice(0, maxLength);
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

export async function onRequestPost({ request, env }) {
  const flowUrl = env.POWER_AUTOMATE_URL;
  if (!flowUrl) return Response.json({ error: 'Lead storage is not configured' }, { status: 503 });

  let parsed;
  try {
    parsed = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return Response.json({ error: 'Invalid lead data' }, { status: 400 });
  }
  if (requiredFields.some((field) => typeof parsed[field] !== 'string' || !parsed[field].trim()) || parsed.consent !== true) {
    return Response.json({ error: 'Required lead fields or consent are missing' }, { status: 400 });
  }

  let destination;
  try {
    destination = new URL(flowUrl);
  } catch {
    return Response.json({ error: 'Lead storage endpoint is invalid' }, { status: 500 });
  }
  if (destination.protocol !== 'https:') {
    return Response.json({ error: 'Lead storage endpoint must use HTTPS' }, { status: 500 });
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
    if (!upstream.ok) return Response.json({ error: 'Lead storage rejected the request' }, { status: 502 });
    return Response.json({ saved: true }, { status: 202 });
  } catch {
    return Response.json({ error: 'Lead storage is temporarily unavailable' }, { status: 502 });
  }
}
