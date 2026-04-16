// ============================================================
// SEED — Crea usuarios iniciales en la base de datos
// Ejecutar: npm run seed
// ============================================================
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./db');

const USERS = [
  { username: 'admin',   password: 'admin123',   nombre: 'Administrador',   rol: 'admin'   },
  { username: 'tecnico', password: 'tecnico123', nombre: 'Técnico MSL',     rol: 'tecnico' }
];

async function seed() {
  console.log('🌱 Iniciando seed de usuarios...\n');

  for (const u of USERS) {
    const hash = await bcrypt.hash(u.password, 10);
    try {
      await pool.query(
        `INSERT INTO usuarios (username, password_hash, nombre, rol)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (username) DO NOTHING`,
        [u.username, hash, u.nombre, u.rol]
      );
      console.log(`  ✅ Usuario creado: ${u.username} / ${u.password}  [${u.rol}]`);
    } catch (err) {
      console.error(`  ❌ Error con ${u.username}:`, err.message);
    }
  }

  console.log('\n✅ Seed completado. Puedes iniciar sesión con las credenciales indicadas.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});
