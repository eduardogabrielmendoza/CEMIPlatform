-- =====================================================
-- Migración: Renombrar niveles CEFR a nombres descriptivos
-- =====================================================

-- Cambiar niveles de estilo CEFR (A1, A2, B1, B2...) a nombres descriptivos en español
UPDATE niveles SET descripcion = 'Base' WHERE descripcion = 'A1';
UPDATE niveles SET descripcion = 'Pre-Intermedio' WHERE descripcion = 'A2';
UPDATE niveles SET descripcion = 'Intermedio' WHERE descripcion = 'B1';
UPDATE niveles SET descripcion = 'Intermedio-Alto' WHERE descripcion = 'B2';
UPDATE niveles SET descripcion = 'Avanzado' WHERE descripcion = 'C1';
UPDATE niveles SET descripcion = 'Superior' WHERE descripcion = 'C2';
