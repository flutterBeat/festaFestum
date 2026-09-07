const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = 10;
const ALLOWED_SELF_REGISTER_ROLES = ['customer', 'vendor_owner'];

function signToken(user) {
  return jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/v1/auth/register
async function register(req, res, next) {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: 'name, email, phone, dan password wajib diisi' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password minimal 8 karakter' });
    }

    const finalRole = ALLOWED_SELF_REGISTER_ROLES.includes(role) ? role : 'customer';

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, name, email, phone, role, created_at`,
      [name, email, phone, passwordHash, finalRole]
    );

    const user = result.rows[0];
    const token = signToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'email dan password wajib diisi' });
    }

    const result = await pool.query(
      `SELECT user_id, name, email, phone, password_hash, role
       FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    // Pesan generik sengaja dipakai untuk email & password salah,
    // supaya tidak bocorin info email mana saja yang terdaftar.
    if (!user) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Email atau password salah' });
    }

    const token = signToken(user);
    delete user.password_hash;

    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/auth/me (protected)
async function me(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT user_id, name, email, phone, role, created_at
       FROM users WHERE user_id = $1`,
      [req.user.user_id]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
