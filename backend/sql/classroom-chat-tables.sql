-- =====================================================
-- CLASSROOM CHAT - Tablas para chat privado
-- Sistema de mensajería entre profesores y alumnos
-- =====================================================

USE cemi_sistema_educativo;

-- Eliminar tablas si existen para una instalación limpia
DROP TABLE IF EXISTS classroom_mensajes;
DROP TABLE IF EXISTS classroom_conversaciones;

-- Tabla para conversaciones privadas de Classroom
CREATE TABLE IF NOT EXISTS classroom_conversaciones (
  id_conversacion INT PRIMARY KEY AUTO_INCREMENT,
  id_curso INT NOT NULL COMMENT 'Curso donde se conocen los participantes',
  participante1_tipo ENUM('profesor','alumno') NOT NULL,
  participante1_id INT NOT NULL,
  participante2_tipo ENUM('profesor','alumno') NOT NULL,
  participante2_id INT NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ultima_actividad TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  estado ENUM('activa','archivada') DEFAULT 'activa',
  -- Campos para soft delete individual (cada usuario puede ocultar sin afectar al otro)
  oculto_participante1 BOOLEAN DEFAULT FALSE COMMENT 'Si el participante1 ocultó la conversación',
  oculto_participante2 BOOLEAN DEFAULT FALSE COMMENT 'Si el participante2 ocultó la conversación',
  FOREIGN KEY (id_curso) REFERENCES cursos(id_curso) ON DELETE CASCADE,
  -- Índice único para evitar conversaciones duplicadas
  UNIQUE KEY unique_conversacion (id_curso, participante1_tipo, participante1_id, participante2_tipo, participante2_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla para mensajes del chat de Classroom
CREATE TABLE IF NOT EXISTS classroom_mensajes (
  id_mensaje INT PRIMARY KEY AUTO_INCREMENT,
  id_conversacion INT NOT NULL,
  remitente_tipo ENUM('profesor','alumno') NOT NULL,
  remitente_id INT NOT NULL,
  mensaje TEXT,
  archivo_adjunto VARCHAR(500) NULL COMMENT 'URL del archivo adjunto',
  tipo_archivo VARCHAR(50) NULL COMMENT 'Tipo: image/jpeg, image/png, application/pdf, etc.',
  nombre_archivo VARCHAR(255) NULL COMMENT 'Nombre original del archivo',
  leido BOOLEAN DEFAULT FALSE,
  fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_conversacion) REFERENCES classroom_conversaciones(id_conversacion) ON DELETE CASCADE,
  INDEX idx_conversacion (id_conversacion),
  INDEX idx_fecha (fecha_envio),
  INDEX idx_leido (leido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices adicionales para búsquedas eficientes
-- Nota: MySQL no soporta IF NOT EXISTS para CREATE INDEX, solo se crean si la tabla se creó
-- Si necesitas re-ejecutar, primero elimina las tablas: DROP TABLE IF EXISTS classroom_mensajes, classroom_conversaciones;
CREATE INDEX idx_participante1 ON classroom_conversaciones(participante1_tipo, participante1_id);
CREATE INDEX idx_participante2 ON classroom_conversaciones(participante2_tipo, participante2_id);
CREATE INDEX idx_curso ON classroom_conversaciones(id_curso);
CREATE INDEX idx_ultima_actividad ON classroom_conversaciones(ultima_actividad);

-- Verificar creación
SELECT 'Tablas creadas exitosamente' as resultado;
DESCRIBE classroom_conversaciones;
DESCRIBE classroom_mensajes;

-- =====================================================
-- SCRIPT DE ACTUALIZACIÓN (ejecutar si las tablas ya existen)
-- Agrega campos para soft delete individual
-- =====================================================
-- Si ya tienes las tablas creadas, ejecuta esto para agregar los nuevos campos:
-- ALTER TABLE classroom_conversaciones ADD COLUMN oculto_participante1 BOOLEAN DEFAULT FALSE;
-- ALTER TABLE classroom_conversaciones ADD COLUMN oculto_participante2 BOOLEAN DEFAULT FALSE;
