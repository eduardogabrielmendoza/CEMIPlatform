CREATE TABLE IF NOT EXISTS depuraciones_backup (
  id_depuracion INT NOT NULL AUTO_INCREMENT,
  secciones JSON NOT NULL,
  backup_json JSON NOT NULL,
  total_registros INT NOT NULL DEFAULT 0,
  creado_por INT DEFAULT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expira_en TIMESTAMP NOT NULL,
  restaurado_en TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id_depuracion),
  KEY idx_depuraciones_expira (expira_en),
  KEY idx_depuraciones_restaurado (restaurado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
