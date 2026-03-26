-- Tabla de registros/auditoría de pagos
CREATE TABLE IF NOT EXISTS registros_pagos (
  id_registro INT NOT NULL AUTO_INCREMENT,
  accion VARCHAR(50) NOT NULL,
  id_pago INT DEFAULT NULL,
  id_admin INT DEFAULT NULL,
  nombre_admin VARCHAR(100) DEFAULT NULL,
  nombre_alumno VARCHAR(100) DEFAULT NULL,
  concepto VARCHAR(255) DEFAULT NULL,
  monto DECIMAL(10,2) DEFAULT NULL,
  descripcion TEXT DEFAULT NULL,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_registro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
