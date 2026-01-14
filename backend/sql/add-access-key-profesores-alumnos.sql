-- Agregar columna access_key a profesores
ALTER TABLE profesores 
ADD COLUMN access_key VARCHAR(64) NULL UNIQUE;

-- Agregar columna access_key a alumnos
ALTER TABLE alumnos 
ADD COLUMN access_key VARCHAR(64) NULL UNIQUE;
