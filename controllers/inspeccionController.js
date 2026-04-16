const pool = require('../config/db');

// ── GET /api/inspecciones/volquetes ────────────────────────
exports.getVolquetes = async (req, res) => {
  try {
    const r = await pool.query('SELECT codigo, modelo FROM volquetes ORDER BY codigo');
    return res.json(r.rows);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Error al obtener flota.' });
  }
};

// ── GET /api/inspecciones/dia/:fecha ──────────────────────
// Devuelve todas las inspecciones de una fecha (para el dashboard)
exports.getDia = async (req, res) => {
  const { fecha } = req.params;
  try {
    const r = await pool.query(
      `SELECT i.volquete, i.tecnico, i.sistemas_json, i.updated_at,
              u.nombre AS usuario_nombre, u.username
       FROM inspecciones i
       LEFT JOIN usuarios u ON i.usuario_id = u.id
       WHERE i.fecha = $1
       ORDER BY i.volquete`,
      [fecha]
    );
    return res.json(r.rows);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Error al obtener inspecciones.' });
  }
};

// ── GET /api/inspecciones/:volquete/:fecha ─────────────────
exports.getOne = async (req, res) => {
  const { volquete, fecha } = req.params;
  try {
    const r = await pool.query(
      `SELECT i.*, u.nombre AS usuario_nombre
       FROM inspecciones i
       LEFT JOIN usuarios u ON i.usuario_id = u.id
       WHERE i.volquete = $1 AND i.fecha = $2`,
      [volquete, fecha]
    );
    if (r.rows.length === 0) return res.json(null);
    return res.json(r.rows[0]);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Error al obtener inspección.' });
  }
};

// ── POST /api/inspecciones ─────────────────────────────────
exports.save = async (req, res) => {
  const { volquete, fecha, tecnico, ficha, sistemas } = req.body;

  if (!volquete || !fecha)
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });

  // Técnico solo puede modificar SUS propias inspecciones del día
  if (req.user.role === 'tecnico') {
    const existing = await pool.query(
      'SELECT usuario_id FROM inspecciones WHERE volquete = $1 AND fecha = $2',
      [volquete, fecha]
    );
    if (existing.rows.length > 0 && existing.rows[0].usuario_id !== req.user.id) {
      return res.status(403).json({ error: 'Este volquete ya fue asignado a otro técnico.' });
    }
  }

  try {
    await pool.query(
      `INSERT INTO inspecciones
         (volquete, fecha, usuario_id, tecnico, ficha_json, sistemas_json, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (volquete, fecha)
       DO UPDATE SET
         tecnico      = EXCLUDED.tecnico,
         ficha_json   = EXCLUDED.ficha_json,
         sistemas_json = EXCLUDED.sistemas_json,
         updated_at   = NOW()`,
      [
        volquete,
        fecha,
        req.user.id,
        tecnico || '',
        JSON.stringify(ficha   || {}),
        JSON.stringify(sistemas || {})
      ]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error al guardar inspección:', err.message);
    return res.status(500).json({ error: 'Error al guardar.' });
  }
};

// ── DELETE /api/inspecciones/:volquete/:fecha ─────────────
// Solo admin puede borrar
exports.remove = async (req, res) => {
  const { volquete, fecha } = req.params;
  try {
    await pool.query(
      'DELETE FROM inspecciones WHERE volquete = $1 AND fecha = $2',
      [volquete, fecha]
    );
    return res.json({ ok: true });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Error al eliminar.' });
  }
};

// ── GET /api/inspecciones/historial/:volquete ──────────────
exports.historial = async (req, res) => {
  const { volquete } = req.params;
  try {
    const r = await pool.query(
      `SELECT i.fecha, i.tecnico, i.updated_at,
              u.nombre AS usuario_nombre,
              (SELECT COUNT(*) FROM jsonb_each(i.sistemas_json)) AS sistemas_count
       FROM inspecciones i
       LEFT JOIN usuarios u ON i.usuario_id = u.id
       WHERE i.volquete = $1
       ORDER BY i.fecha DESC
       LIMIT 30`,
      [volquete]
    );
    return res.json(r.rows);
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: 'Error al obtener historial.' });
  }
};
