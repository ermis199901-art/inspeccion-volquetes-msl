const bcrypt = require('bcryptjs');
const pool   = require('../config/db');

// ── GET /api/usuarios  (admin) ─────────────────────────────
exports.list = async (req, res) => {
  try {
    const r = await pool.query(
      'SELECT id, username, nombre, rol, activo, created_at FROM usuarios ORDER BY id'
    );
    return res.json(r.rows);
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener usuarios.' });
  }
};

// ── POST /api/usuarios  (admin) ────────────────────────────
exports.create = async (req, res) => {
  const { username, password, nombre, rol } = req.body;
  if (!username || !password || !nombre || !rol)
    return res.status(400).json({ error: 'Faltan campos.' });
  if (!['admin', 'tecnico'].includes(rol))
    return res.status(400).json({ error: 'Rol inválido.' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Contraseña mínimo 6 caracteres.' });

  try {
    const hash = await bcrypt.hash(password, 10);
    const r = await pool.query(
      `INSERT INTO usuarios (username, password_hash, nombre, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, nombre, rol, activo`,
      [username.trim().toLowerCase(), hash, nombre.trim(), rol]
    );
    return res.status(201).json(r.rows[0]);
  } catch (err) {
    if (err.code === '23505')
      return res.status(409).json({ error: 'El nombre de usuario ya existe.' });
    return res.status(500).json({ error: 'Error al crear usuario.' });
  }
};

// ── PUT /api/usuarios/:id  (admin) ─────────────────────────
exports.update = async (req, res) => {
  const { nombre, rol, activo, password } = req.body;
  const { id } = req.params;
  try {
    if (password) {
      if (password.length < 6)
        return res.status(400).json({ error: 'Contraseña mínimo 6 caracteres.' });
      const hash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE usuarios SET nombre=$1, rol=$2, activo=$3, password_hash=$4 WHERE id=$5',
        [nombre, rol, activo, hash, id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nombre=$1, rol=$2, activo=$3 WHERE id=$4',
        [nombre, rol, activo, id]
      );
    }
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar usuario.' });
  }
};

// ── DELETE /api/usuarios/:id  (admin) ──────────────────────
exports.remove = async (req, res) => {
  const { id } = req.params;
  if (Number(id) === req.user.id)
    return res.status(400).json({ error: 'No puede eliminarse a sí mismo.' });
  try {
    await pool.query('UPDATE usuarios SET activo=false WHERE id=$1', [id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar usuario.' });
  }
};
