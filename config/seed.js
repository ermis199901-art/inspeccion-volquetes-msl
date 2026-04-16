// ============================================================
// SEED — Crea usuarios iniciales en la base de datos
// Ejecutar: npm run seed
// ============================================================
require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool   = require('./db');

const USERS = [
  { username: 'admin',   password: 'admin123',   nombre: 'Administrador',   rol: 'admin'   },
  { username: 'tecnico', password: 'tecnico123', nombre: 'Técnico MSL',     rol: 'tecnico' },
  { username: 'ermis',   password: 'ermis123',   nombre: 'Ermis',           rol: 'admin'   },
  { username: 'hulda',   password: 'ermis123',   nombre: 'Hulda',           rol: 'admin'   },
  { username: 'elmer',   password: 'elmer123',   nombre: 'Elmer',           rol: 'admin'   }
];

const VOLQUETES = [
  { codigo: 'VOL-01', modelo: 'Volvo FM' },
  { codigo: 'VOL-04', modelo: 'Volvo FM' },
  { codigo: 'VOL-07', modelo: 'Volvo FM' },
  { codigo: 'VOL-08', modelo: 'Volvo FM' },
  { codigo: 'VOL-09', modelo: 'Volvo FM' },
  { codigo: 'PAY-06', modelo: 'CAT 950L' },
  { codigo: 'PAY-09', modelo: 'CAT 950L' },
  { codigo: 'PAY-10', modelo: 'CAT 962L' }
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

  console.log('\n🚛 Insertando flota de equipos...\n');

  for (const v of VOLQUETES) {
    try {
      await pool.query(
        `INSERT INTO volquetes (codigo, modelo)
         VALUES ($1, $2)
         ON CONFLICT (codigo) DO NOTHING`,
        [v.codigo, v.modelo]
      );
      console.log(`  ✅ Equipo registrado: ${v.codigo} — ${v.modelo}`);
    } catch (err) {
      console.error(`  ❌ Error con ${v.codigo}:`, err.message);
    }
  }

  console.log('\n✅ Seed completado.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Error en seed:', err.message);
  process.exit(1);
});
