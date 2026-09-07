require('dotenv').config();
const app = require('./app');
const { expireStaleBookings } = require('./controllers/booking.controller');

const PORT = process.env.PORT || 4000;
const EXPIRY_SWEEP_MS = 5 * 60 * 1000;

app.listen(PORT, () => {
  console.log(`Festa Festum backend jalan di http://localhost:${PORT}`);
});

// Bebaskan slot dari booking yang DP-nya tidak dibayar dalam 24 jam.
expireStaleBookings();
setInterval(expireStaleBookings, EXPIRY_SWEEP_MS).unref();
