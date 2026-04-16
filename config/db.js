const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
});

// Test de conexión al arrancar
pool.query('SELECT 1').then(() => {
  console.log('✅ Conectado a PostgreSQL');
}).catch(err => {
  console.error('❌ No se pudo conectar a PostgreSQL:', err.message);
  console.error('   Verifique DATABASE_URL en el archivo .env');
});

module.exports = pool;
