-- Arreglar vista problemática de classroom conversaciones
-- Este error aparece porque la vista referencia tablas/columnas que no existen

-- Eliminar la vista problemática
DROP VIEW IF EXISTS vista_classroom_conversaciones;

-- Si necesitas recrearla, asegúrate que las tablas y columnas existan
-- Ejemplo (ajusta según tu estructura real):
-- CREATE OR REPLACE VIEW vista_classroom_conversaciones AS
-- SELECT 
--     c.id,
--     c.curso_id,
--     c.participante1_id,
--     c.participante2_id,
--     c.fecha_creacion
-- FROM classroom_conversaciones c;
