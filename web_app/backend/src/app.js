const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
// Route lain (vendors, services, bookings, dst) akan ditambah di sini
// seiring pengerjaan Core CRUD Vendor & Scheduling Lock.

app.use(errorHandler);

module.exports = app;
