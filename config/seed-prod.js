// ============================================================
// SEED PRODUCCIÓN — Inserta usuarios en la BD de Railway
// Ejecutar: npm run seed:prod
// ============================================================
require('dotenv').config();
process.env.DATABASE_URL = process.env.DATABASE_URL_PROD;
require('./seed');
