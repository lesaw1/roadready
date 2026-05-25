require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');

const requestsRouter = require('./routes/requests');
const techniciansRouter = require('./routes/technicians');
const paymentsRouter = require('./routes/payments');
const jobsRouter = require('./routes/jobs');

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProd ? false : 'http://localhost:5173',
}));
app.use(express.json());

app.use('/api/requests', requestsRouter);
app.use('/api/technicians', techniciansRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/jobs', jobsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve Vite build in production
if (isProd) {
  const clientDist = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`RoadReady server running on http://localhost:${PORT}`);
});
