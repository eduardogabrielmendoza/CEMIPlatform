ALTER TABLE aulas
  ADD COLUMN estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER capacidad;

