const bcrypt    = require('bcryptjs');
const jwt       = require('jsonwebtoken');
const pool      = require('../config/db');

const JWT_SECRET  = process.env.JWT_SECRET || 'dev_secret_cambiar_en_produccion';
const COOKIE_NAME = 'insp_token';
const COOKIE_OPTS = {
  httpOnly : true,
  secure   : process.env.NODE_ENV === 'production',
  sameSite : 'lax',
  maxAge   : 8 * 60 * 60 * 1000   // 8 horas
};

// ── POST /api/auth/login ────────────────────────────────────
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Ingrese usuario y contraseña.' });

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE username = $1 AND activo = true',
      [username.trim().toLowerCase()]
    );
    const user = result.rows[0];

    if (!user) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Usuario o contraseña incorrectos.' });

    const token = jwt.sign(
      { id: user.id, username: user.username, nombre: user.nombre, role: user.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    return res.json({ username: user.username, nombre: user.nombre, role: user.rol });

  } catch (err) {
    console.error('Error en login:', err.message);
    return res.status(500).json({ error: 'Error del servidor.' });
  }
};

// ── POST /api/auth/logout ───────────────────────────────────
exports.logout = (req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.json({ ok: true });
};

// ── GET /api/auth/me ────────────────────────────────────────
exports.me = (req, res) => {
  const { id, username, nombre, role } = req.user;
  return res.json({ id, username, nombre, role });
};

// ── PUT /api/auth/password ──────────────────────────────────
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 6)
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres.' });

  try {
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE id = $1',
      [req.user.id]
    );
    const user = result.rows[0];

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Contraseña actual incorrecta.' });

    const hash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [hash, req.user.id]);

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error al cambiar contraseña:', err.message);
    return res.status(500).json({ error: 'Error del servidor.' });
  }
};
