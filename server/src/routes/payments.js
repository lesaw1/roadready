const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const prisma = require('../prisma');
const { sendConfirmationEmail } = require('../email');

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY not set');
  return new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2023-10-16' });
}

// POST /api/payments/create-intent
router.post('/create-intent', async (req, res) => {
  const { requestId } = req.body;
  if (!requestId) return res.status(400).json({ error: 'requestId required' });

  try {
    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id: Number(requestId) },
    });
    if (!serviceRequest) return res.status(404).json({ error: 'Request not found' });

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: serviceRequest.amountCents,
      currency: 'usd',
      metadata: { requestId: String(requestId) },
      automatic_payment_methods: { enabled: true },
    });

    await prisma.serviceRequest.update({
      where: { id: Number(requestId) },
      data: { stripePaymentId: paymentIntent.id },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/confirm — called after successful payment to update status
router.post('/confirm', async (req, res) => {
  const { requestId, paymentIntentId } = req.body;
  try {
    const stripe = getStripe();
    const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== 'succeeded') {
      return res.status(400).json({ error: 'Payment not succeeded' });
    }

    const updated = await prisma.serviceRequest.update({
      where: { id: Number(requestId) },
      data: { status: 'dispatched', stripePaymentId: paymentIntentId },
    });

    await sendConfirmationEmail(updated);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
