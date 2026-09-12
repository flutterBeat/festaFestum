const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const vendorRoutes = require('./routes/vendor.routes');
const serviceRoutes = require('./routes/service.routes');
const scheduleRoutes = require('./routes/schedule.routes');
const bookingRoutes = require('./routes/booking.routes');
const payoutRoutes = require('./routes/payout.routes');
const adminRoutes = require('./routes/admin.routes');
const paymentRoutes = require('./routes/payment.routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/services', serviceRoutes);
app.use('/api/v1/schedules', scheduleRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/payouts', payoutRoutes);
app.use('/api/v1/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;
