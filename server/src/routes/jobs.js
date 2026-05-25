const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const { sendSMS } = require('../sms');

// GET jobs for a technician
router.get('/technician/:techId', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { technicianId: Number(req.params.techId) },
      include: { serviceRequest: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH update job status
router.patch('/:id/status', async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['assigned', 'accepted', 'en_route', 'arrived', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const job = await prisma.job.update({
      where: { id: Number(req.params.id) },
      data: { status, notes },
      include: { serviceRequest: true, technician: true },
    });

    // Mirror status to the parent service request
    const requestStatus =
      status === 'completed' ? 'completed' :
      status === 'en_route' ? 'en_route' :
      status === 'arrived' ? 'arrived' :
      'dispatched';

    await prisma.serviceRequest.update({
      where: { id: job.serviceRequestId },
      data: { status: requestStatus },
    });

    const customerPhone = job.serviceRequest.customerPhone;
    const requestId = job.serviceRequest.id;
    const techName = job.technician.name;

    if (status === 'accepted') {
      await sendSMS(customerPhone, `RoadReady: ${techName} has accepted your job #${requestId} and will be on their way soon.`);
    } else if (status === 'en_route') {
      await sendSMS(customerPhone, `RoadReady: ${techName} is on their way to you for job #${requestId}!`);
    } else if (status === 'arrived') {
      await sendSMS(customerPhone, `RoadReady: ${techName} has arrived at your location for job #${requestId}.`);
    } else if (status === 'completed') {
      await sendSMS(customerPhone, `RoadReady: Job #${requestId} is complete! Thank you for choosing RoadReady.`);
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
