// Vercel serverless function — proxies brief form to Telegram
// Keeps bot token server-side; prevents token exposure in client JS.
//
// Required env variable in Vercel Dashboard → Settings → Environment Variables:
//   TELEGRAM_BOT_TOKEN = <your bot token>
//   TELEGRAM_CHAT_ID   = <your chat id>

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, type, budget, description } = req.body || {};

  if (!name || !email || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const token   = process.env.TELEGRAM_BOT_TOKEN;
  const chat_id = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chat_id) {
    console.error('Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const text = `📬 New brief from RYMPE site

👤 ${name}
📧 ${email}
🎬 ${type  || '—'}
💰 ${budget || '—'}

📝 ${description}`;

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id, text }),
      }
    );

    if (!tgRes.ok) {
      const err = await tgRes.text();
      console.error('Telegram error:', err);
      return res.status(502).json({ error: 'Failed to send message' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Network error:', err);
    return res.status(500).json({ error: 'Network error' });
  }
};
