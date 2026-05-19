module.exports = (req, res) => {
  res.json({ stripePk: process.env.STRIPE_PUBLISHABLE_KEY || '' });
};
