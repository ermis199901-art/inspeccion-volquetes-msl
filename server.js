require('dotenv').config();
const express      = require('express');
const cookieParser = require('cookie-parser');
const cors         = require('cors');
const path         = require('path');

const authRoutes        = require('./routes/auth');
const inspeccionRoutes  = require('./routes/inspecciones');
const usuarioRoutes     = require('./routes/usuarios');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));   // límite alto para imágenes Base64
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ── Rutas API ───────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/inspecciones', inspeccionRoutes);
app.use('/api/usuarios',     usuarioRoutes);

// ── Health check (Railway / Render) ────────────────────────
app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Catch-all → frontend ────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Iniciar servidor ────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
