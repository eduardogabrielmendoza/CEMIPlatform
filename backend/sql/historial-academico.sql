-- ============================================
-- Migración: Historial Académico + Estado en Cursos
-- Ejecutar en la base de datos de producción
-- ============================================

-- 1. Agregar columna estado a cursos (si no existe)
ALTER TABLE cursos ADD COLUMN estado ENUM('activo','inactivo') DEFAULT 'activo';

-- 2. Actualizar ciclo_lectivo de los cursos existentes a 2026 (año actual)
UPDATE cursos SET ciclo_lectivo = 2026 WHERE ciclo_lectivo IS NULL;

-- 3. Crear cursos de años previos para historial de prueba
-- Cursos del ciclo 2025
INSERT INTO cursos (nombre_curso, id_idioma, id_nivel, id_profesor, horario, cupo_maximo, id_aula, ciclo_lectivo, estado)
VALUES 
  ('Ingles Inicial 2025', 1, 1, 2, '19:00', 30, 2, 2025, 'inactivo'),
  ('Frances Inicial 2025', 2, 3, 3, '20:00', 25, 1, 2025, 'inactivo'),
  ('Japones Inicial 2025', 5, 1, 24, '20:30', 20, 4, 2025, 'inactivo');

-- Cursos del ciclo 2024
INSERT INTO cursos (nombre_curso, id_idioma, id_nivel, id_profesor, horario, cupo_maximo, id_aula, ciclo_lectivo, estado)
VALUES 
  ('Ingles Introductorio 2024', 1, 1, 2, '19:00', 30, 2, 2024, 'inactivo'),
  ('Frances Introductorio 2024', 2, 1, 3, '20:00', 25, 1, 2024, 'inactivo');

-- 4. Inscripciones históricas de prueba
-- Obtener los IDs de los cursos recién insertados
-- (Asumiendo AUTO_INCREMENT, los IDs serán 10, 11, 12, 13, 14)
-- Ajustar según los IDs reales si difieren

-- Alumnos en cursos 2025 (ya finalizados)
SET @id_ing_2025 = (SELECT id_curso FROM cursos WHERE nombre_curso = 'Ingles Inicial 2025' LIMIT 1);
SET @id_fra_2025 = (SELECT id_curso FROM cursos WHERE nombre_curso = 'Frances Inicial 2025' LIMIT 1);
SET @id_jap_2025 = (SELECT id_curso FROM cursos WHERE nombre_curso = 'Japones Inicial 2025' LIMIT 1);
SET @id_ing_2024 = (SELECT id_curso FROM cursos WHERE nombre_curso = 'Ingles Introductorio 2024' LIMIT 1);
SET @id_fra_2024 = (SELECT id_curso FROM cursos WHERE nombre_curso = 'Frances Introductorio 2024' LIMIT 1);

-- Alumno 16: Estuvo en Ingles Inicial 2025, y ahora está en Ingles Intermedio 2026
INSERT INTO inscripciones (id_alumno, id_curso, fecha_inscripcion, estado, observaciones) VALUES
  (16, @id_ing_2025, '2025-03-01', 'inactivo', 'Ciclo finalizado'),
  (16, @id_fra_2025, '2025-03-01', 'inactivo', 'Ciclo finalizado'),
  (16, @id_ing_2024, '2024-03-01', 'inactivo', 'Ciclo finalizado');

-- Alumno 15: Estuvo en Frances 2025 y en Ingles 2024
INSERT INTO inscripciones (id_alumno, id_curso, fecha_inscripcion, estado, observaciones) VALUES
  (15, @id_fra_2025, '2025-03-01', 'inactivo', 'Ciclo finalizado'),
  (15, @id_ing_2024, '2024-03-01', 'inactivo', 'Ciclo finalizado'),
  (15, @id_fra_2024, '2024-03-15', 'inactivo', 'Ciclo finalizado');

-- Alumno 6: Estuvo en Japones 2025
INSERT INTO inscripciones (id_alumno, id_curso, fecha_inscripcion, estado, observaciones) VALUES
  (6, @id_jap_2025, '2025-03-10', 'inactivo', 'Ciclo finalizado'),
  (6, @id_ing_2025, '2025-03-10', 'inactivo', 'Ciclo finalizado');

-- Alumno 5: Estuvo en Ingles 2024
INSERT INTO inscripciones (id_alumno, id_curso, fecha_inscripcion, estado, observaciones) VALUES
  (5, @id_ing_2024, '2024-03-05', 'inactivo', 'Ciclo finalizado');

-- 5. Calificaciones de prueba para cursos previos (promedios simulados)
INSERT INTO calificaciones (id_alumno, id_curso, parcial1, parcial2, final) VALUES
  (16, @id_ing_2025, 8.5, 7.0, 9.0),
  (16, @id_fra_2025, 6.5, 7.5, 7.0),
  (16, @id_ing_2024, 7.0, 6.0, 7.5),
  (15, @id_fra_2025, 9.0, 8.5, 9.5),
  (15, @id_ing_2024, 5.5, 6.0, 6.5),
  (15, @id_fra_2024, 8.0, 7.0, 8.5),
  (6, @id_jap_2025, 7.5, 8.0, 7.0),
  (6, @id_ing_2025, 6.0, 7.0, 6.5),
  (5, @id_ing_2024, 8.0, 9.0, 8.5);
