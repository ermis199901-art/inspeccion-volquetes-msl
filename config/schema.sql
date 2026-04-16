-- ============================================================
-- SCHEMA — Sistema de Inspección Técnica MSL Huanzala
-- Ejecutar: psql $DATABASE_URL -f config/schema.sql
-- ============================================================

-- ── Extensiones ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tabla: usuarios ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id            SERIAL PRIMARY KEY,
  username      VARCHAR(50)  UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  nombre        VARCHAR(100) NOT NULL,
  rol           VARCHAR(20)  NOT NULL CHECK (rol IN ('admin','tecnico')),
  activo        BOOLEAN      DEFAULT true,
  created_at    TIMESTAMP    DEFAULT NOW()
);

-- ── Tabla: volquetes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS volquetes (
  id     SERIAL PRIMARY KEY,
  codigo VARCHAR(20) UNIQUE NOT NULL,
  modelo VARCHAR(100) DEFAULT 'Volvo FM'
);

-- ── Tabla: inspecciones ──────────────────────────────────────
-- Una inspección por (volquete + fecha)
-- ficha_json   → datos técnicos del equipo (motor, serie, horómetro, km)
-- sistemas_json → estado de todos los ítems (condición, observación, imágenes)
CREATE TABLE IF NOT EXISTS inspecciones (
  id            SERIAL PRIMARY KEY,
  volquete      VARCHAR(20)  NOT NULL,
  fecha         DATE         NOT NULL,
  usuario_id    INTEGER      REFERENCES usuarios(id),
  tecnico       VARCHAR(100) DEFAULT '',
  ficha_json    JSONB        DEFAULT '{}',
  sistemas_json JSONB        DEFAULT '{}',
  created_at    TIMESTAMP    DEFAULT NOW(),
  updated_at    TIMESTAMP    DEFAULT NOW(),
  UNIQUE (volquete, fecha)
);

-- ── Índices ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_insp_fecha    ON inspecciones (fecha);
CREATE INDEX IF NOT EXISTS idx_insp_volquete ON inspecciones (volquete);
CREATE INDEX IF NOT EXISTS idx_insp_usuario  ON inspecciones (usuario_id);

-- ── Datos iniciales: flota ───────────────────────────────────
INSERT INTO volquetes (codigo, modelo) VALUES
  ('VOL-01', 'Volvo FM'),
  ('VOL-04', 'Volvo FM'),
  ('VOL-07', 'Volvo FM'),
  ('VOL-08', 'Volvo FM'),
  ('VOL-09', 'Volvo FM')
ON CONFLICT (codigo) DO NOTHING;
