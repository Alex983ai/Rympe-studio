const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, currency = 'usd', description = 'RYMPE Studio — Project Payment' } = req.body;

  const cents = Math.round(parseFloat(amount) * 100);
  if (!cents || cents < 100) return res.status(400).json({ error: 'Minimum amount is $1' });

  try {
    const intent = await stripe.paymentIntents.create({
      amount: cents,
      currency,
      description,
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
