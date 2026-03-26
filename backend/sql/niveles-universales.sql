-- ============================================
-- Migración: Niveles Universales
-- Los niveles aplican para CUALQUIER idioma
-- ============================================

-- 1. Eliminar constraint FK de id_idioma si existe
ALTER TABLE niveles DROP FOREIGN KEY IF EXISTS niveles_ibfk_1;
ALTER TABLE niveles DROP FOREIGN KEY IF EXISTS fk_niveles_idioma;

-- 2. Eliminar columna id_idioma de niveles
ALTER TABLE niveles DROP COLUMN IF EXISTS id_idioma;

-- 3. Limpiar niveles duplicados y dejar solo los universales
DELETE FROM niveles;

INSERT INTO niveles (id_nivel, descripcion) VALUES
  (1, 'Base'),
  (2, 'Pre-Intermedio'),
  (3, 'Intermedio'),
  (4, 'Avanzado');
