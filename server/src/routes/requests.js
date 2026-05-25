const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { sendSMS } = require('../sms');

const SERVICE_PRICES = {
  battery: 7500,
  tire: 6000,
  fuel: 5000,
  other: 8000,
};

// GET all requests
router.get('/', async (req, res) => {
  try {
    const requests = await prisma.serviceRequest.findMany({
      include: { technician: true, jobs: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single request
router.get('/:id', async (req, res) => {
  try {
    const request = await prisma.serviceRequest.findUnique({
      where: { id: Number(req.params.id) },
      include: { technician: true, jobs: true },
    });
    if (!request) return res.status(404).json({ error: 'Not found' });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create new request
router.post('/', async (req, res) => {
  const {
    customerName, customerPhone, customerEmail,
    vehicleMake, vehicleModel, vehicleYear, vehicleColor,
    serviceType, description,
    locationLat, locationLng, locationAddress,
  } = req.body;

  if (!customerName || !customerPhone || !vehicleMake || !vehicleModel || !vehicleYear || !serviceType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const amountCents = SERVICE_PRICES[serviceType] ?? SERVICE_PRICES.other;
    const request = await prisma.serviceRequest.create({
      data: {
        customerName, customerPhone, customerEmail,
        vehicleMake, vehicleModel, vehicleYear, vehicleColor,
        serviceType, description,
        locationLat: locationLat ? Number(locationLat) : null,
        locationLng: locationLng ? Number(locationLng) : null,
        locationAddress,
        status: 'pending',
        amountCents,
      },
    });

    await sendSMS(
      customerPhone,
      `RoadReady: Your ${serviceType} request has been received! Request #${request.id}. We'll dispatch a technician shortly.`
    );

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update status
router.patch('/:id/status', async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'dispatched', 'en_route', 'arrived', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const request = await prisma.serviceRequest.update({
      where: { id: Number(req.params.id) },
      data: { status },
      include: { technician: true },
    });

    if (status === 'dispatched') {
      await sendSMS(
        request.customerPhone,
        `RoadReady: A technician has been dispatched for your request #${request.id}. ETA ~30 minutes.`
      );
    } else if (status === 'completed') {
      await sendSMS(
        request.customerPhone,
        `RoadReady: Your service request #${request.id} is complete. Thank you for choosing RoadReady!`
      );
    }

    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
