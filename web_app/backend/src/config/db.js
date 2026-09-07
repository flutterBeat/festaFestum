const { Pool } = require('pg');
require('dotenv').config();

// Pool koneksi ke PostgreSQL. Semua query di controller pakai pool.query(...)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

pool.on('error', (err) => {
  console.error('Unexpected error pada PostgreSQL pool', err);
  process.exit(1);
});

module.exports = pool;
