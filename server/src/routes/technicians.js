const express = require('express');
const router = express.Router();
const prisma = require('../prisma');

router.get('/', async (req, res) => {
  try {
    const techs = await prisma.technician.findMany({ orderBy: { name: 'asc' } });
    res.json(techs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const tech = await prisma.technician.findUnique({
      where: { id: Number(req.params.id) },
      include: { jobs: { include: { serviceRequest: true } }, requests: true },
    });
    if (!tech) return res.status(404).json({ error: 'Not found' });
    res.json(tech);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, phone, email, specialty } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'name and phone required' });
  try {
    const tech = await prisma.technician.create({ data: { name, phone, email, specialty } });
    res.status(201).json(tech);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Assign a technician to a request
router.post('/:id/assign/:requestId', async (req, res) => {
  const techId = Number(req.params.id);
  const requestId = Number(req.params.requestId);
  try {
    const job = await prisma.job.create({
      data: { technicianId: techId, serviceRequestId: requestId, status: 'assigned' },
    });
    await prisma.serviceRequest.update({
      where: { id: requestId },
      data: { technicianId: techId, status: 'dispatched' },
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
