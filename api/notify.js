export default async function handler(req, res) {
  // CORS preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY environment variable');
    return res.status(500).json({ error: 'Email service not configured' });
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  const { name, email, score, category, answers = {} } = body;

  if (!name || !email || score === undefined || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Build suitability note
  const suitabilityNotes = {
    'AI Newcomer':  'HIGH priority lead. Brand new to AI — significant opportunity, excellent fit for full onboarding package.',
    'AI Curious':   'STRONG lead. Has awareness and intent but lacks structure. Ideal candidate for blueprint + implementation.',
    'AI Explorer':  'QUALIFIED lead. Already experimenting — ready to systematize. Good candidate for scaling engagement.',
    'AI Operator':  'PREMIUM lead. Sophisticated user. Position advanced optimisation and team training offerings.',
  };
  const suitability = suitabilityNotes[category] || 'Review score for context.';

  // Format Q answers for email
  const answerRows = [
    { q: 'Q4 — AI reaction',          k: 'reaction' },
    { q: 'Q5 — AI frequency',         k: 'frequency' },
    { q: 'Q6 — Time sinks (multi)',    k: 'timeSinks' },
    { q: 'Q7 — Off-brand usage',       k: 'offBrand' },
    { q: 'Q8 — SOPs / processes',      k: 'sops' },
    { q: 'Q9 — After-hours response',  k: 'afterHours' },
    { q: 'Q10 — Growth blocker',       k: 'blocker' },
  ].map(({ q, k }) => `
    <tr>
      <td style="padding:10px 14px; color:#6b7280; font-size:13px; border-bottom:1px solid #f0f0f0; white-space:nowrap;">${q}</td>
      <td style="padding:10px 14px; color:#0d0d0d; font-size:13px; border-bottom:1px solid #f0f0f0;">${answers[k] || '—'}</td>
    </tr>`).join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New AI Readiness Lead</title>
</head>
<body style="margin:0; padding:0; background:#f7f6f3; font-family:'Inter', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f3; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#0d0d0d; border-radius:8px 8px 0 0; padding:28px 32px;">
              <p style="margin:0; color:#fea316; font-family:'Arial', sans-serif; font-size:11px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;">Touchpoint Creative</p>
              <h1 style="margin:8px 0 0; color:#ffffff; font-size:22px; font-weight:700; font-family:'Arial', sans-serif;">New AI Readiness Lead</h1>
            </td>
          </tr>

          <!-- Score banner -->
          <tr>
            <td style="background:#fea316; padding:20px 32px; display:block;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0; color:rgba(13,13,13,0.65); font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">AI Readiness Score</p>
                    <p style="margin:4px 0 0; color:#0d0d0d; font-size:28px; font-weight:800; font-family:'Arial', sans-serif;">${score} <span style="font-size:16px; font-weight:400; color:rgba(13,13,13,0.6);">/ 14</span></p>
                  </td>
                  <td align="right">
                    <p style="margin:0; color:rgba(13,13,13,0.65); font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:0.08em;">Category</p>
                    <p style="margin:4px 0 0; color:#0d0d0d; font-size:20px; font-weight:800; font-family:'Arial', sans-serif;">${category}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff; padding:32px; border-radius:0 0 8px 8px;">

              <!-- Contact info -->
              <h2 style="margin:0 0 16px; color:#0d0d0d; font-size:15px; font-weight:700; font-family:'Arial', sans-serif; text-transform:uppercase; letter-spacing:0.06em;">Contact</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0; border-radius:6px; overflow:hidden; margin-bottom:28px;">
                <tr style="background:#f7f6f3;">
                  <td style="padding:10px 14px; color:#6b7280; font-size:13px; border-bottom:1px solid #f0f0f0; white-space:nowrap;">Name</td>
                  <td style="padding:10px 14px; color:#0d0d0d; font-size:13px; font-weight:600; border-bottom:1px solid #f0f0f0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px; color:#6b7280; font-size:13px;">Email</td>
                  <td style="padding:10px 14px; font-size:13px;"><a href="mailto:${email}" style="color:#fea316;">${email}</a></td>
                </tr>
              </table>

              <!-- Business profile -->
              <h2 style="margin:0 0 16px; color:#0d0d0d; font-size:15px; font-weight:700; font-family:'Arial', sans-serif; text-transform:uppercase; letter-spacing:0.06em;">Business Profile</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0; border-radius:6px; overflow:hidden; margin-bottom:28px;">
                <tr style="background:#f7f6f3;">
                  <td style="padding:10px 14px; color:#6b7280; font-size:13px; border-bottom:1px solid #f0f0f0; white-space:nowrap;">Industry</td>
                  <td style="padding:10px 14px; color:#0d0d0d; font-size:13px; border-bottom:1px solid #f0f0f0;">${answers.industry || '—'}</td>
                </tr>
                <tr style="background:#f7f6f3;">
                  <td style="padding:10px 14px; color:#6b7280; font-size:13px; border-bottom:1px solid #f0f0f0; white-space:nowrap;">Team size</td>
                  <td style="padding:10px 14px; color:#0d0d0d; font-size:13px; border-bottom:1px solid #f0f0f0;">${answers.teamSize || '—'}</td>
                </tr>
                <tr>
                  <td style="padding:10px 14px; color:#6b7280; font-size:13px; white-space:nowrap;">Role</td>
                  <td style="padding:10px 14px; color:#0d0d0d; font-size:13px;">${answers.role || '—'}</td>
                </tr>
              </table>

              <!-- Scored responses -->
              <h2 style="margin:0 0 16px; color:#0d0d0d; font-size:15px; font-weight:700; font-family:'Arial', sans-serif; text-transform:uppercase; letter-spacing:0.06em;">AI Readiness Responses (Q4–Q10)</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0; border-radius:6px; overflow:hidden; margin-bottom:28px;">
                ${answerRows}
              </table>

              <!-- Suitability note -->
              <div style="background:#fff8ec; border-left:3px solid #fea316; border-radius:0 6px 6px 0; padding:16px 20px; margin-bottom:24px;">
                <p style="margin:0 0 4px; color:#0d0d0d; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em;">Suitability Assessment</p>
                <p style="margin:0; color:#0d0d0d; font-size:14px;">${suitability}</p>
              </div>

              <!-- CTA -->
              <div style="text-align:center; padding-top:8px;">
                <a href="mailto:${email}" style="display:inline-block; background:#fea316; color:#0d0d0d; text-decoration:none; font-weight:700; font-size:14px; padding:14px 28px; border-radius:999px;">Reply to ${name.split(' ')[0]} →</a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 0; text-align:center;">
              <p style="margin:0; color:#9ca3af; font-size:12px;">Touchpoint Creative · <a href="https://touchpointcreative.ca" style="color:#9ca3af;">touchpointcreative.ca</a></p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Send via Resend
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Touchpoint Creative <onboarding@resend.dev>',
        to: ['mikey@touchpointcreative.ca'],
        reply_to: email,
        subject: `New AI Lead: ${name} — ${category} (${score}/14)`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
