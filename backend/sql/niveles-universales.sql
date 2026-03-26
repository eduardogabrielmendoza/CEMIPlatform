-- ============================================
-- Migración: Niveles Universales
-- Los niveles aplican para CUALQUIER idioma
-- Compatible con MySQL < 8.0.13
-- ============================================

-- 1. Verificar y eliminar FK constraints de id_idioma
-- Primero consultar: SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'niveles' AND COLUMN_NAME = 'id_idioma';
-- Si devuelve alguna constraint, ejecutar:
-- ALTER TABLE niveles DROP FOREIGN KEY <nombre_constraint>;

-- 2. Verificar si existe la columna id_idioma
-- SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'niveles' AND COLUMN_NAME = 'id_idioma';
-- Si existe, ejecutar:
-- ALTER TABLE niveles DROP COLUMN id_idioma;

-- 3. Limpiar niveles y dejar solo los universales
DELETE FROM niveles;

INSERT INTO niveles (id_nivel, descripcion) VALUES
  (1, 'Base'),
  (2, 'Pre-Intermedio'),
  (3, 'Intermedio'),
  (4, 'Avanzado');

-- ============================================
-- INSTRUCCIONES PASO A PASO:
-- ============================================
-- PASO 1: Ejecutar esta consulta para ver las FK:
--   SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
--   WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'niveles' AND COLUMN_NAME = 'id_idioma' AND REFERENCED_TABLE_NAME IS NOT NULL;
--
-- PASO 2: Por cada constraint que aparezca, ejecutar:
--   ALTER TABLE niveles DROP FOREIGN KEY <nombre>;
--
-- PASO 3: Ejecutar:
--   ALTER TABLE niveles DROP COLUMN id_idioma;
--
-- PASO 4: Ejecutar las líneas DELETE + INSERT de arriba.
-- ============================================
