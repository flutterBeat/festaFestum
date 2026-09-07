// Error handler global, dipasang paling akhir di app.js
function errorHandler(err, req, res, next) {
  console.error(err);

  // Duplicate key error dari PostgreSQL (mis. email sudah terdaftar)
  if (err.code === '23505') {
    return res.status(409).json({ message: 'Data sudah terdaftar (duplikat)' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan pada server',
  });
}

module.exports = errorHandler;
