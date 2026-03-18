-- =============================================
-- Migración: Sistema CEMI sin Email
-- Fecha: 2025
-- Descripción: Crea las tablas necesarias para:
--   1. Códigos CEMI (registro con código)
--   2. Solicitudes de recuperación (sin email)
--   3. Notificaciones del sistema
-- =============================================

-- 1. Tabla de Códigos CEMI para registro
CREATE TABLE IF NOT EXISTS `codigos_cemi` (
  `id_codigo` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(20) COLLATE utf8mb4_general_ci NOT NULL,
  `rol` enum('alumno','profesor') COLLATE utf8mb4_general_ci NOT NULL,
  `estado` enum('activo','usado','expirado') COLLATE utf8mb4_general_ci DEFAULT 'activo',
  `nombre_destinatario` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `id_admin_generador` int DEFAULT NULL,
  `id_persona_registrada` int DEFAULT NULL,
  `fecha_generacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_uso` datetime DEFAULT NULL,
  PRIMARY KEY (`id_codigo`),
  UNIQUE KEY `uk_codigo` (`codigo`),
  KEY `idx_estado` (`estado`),
  KEY `idx_rol` (`rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. Tabla de Solicitudes de Recuperación de Contraseña
CREATE TABLE IF NOT EXISTS `solicitudes_recuperacion` (
  `id_solicitud` int NOT NULL AUTO_INCREMENT,
  `id_persona` int DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci NOT NULL,
  `dni` varchar(20) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada','completada') COLLATE utf8mb4_general_ci DEFAULT 'pendiente',
  `fecha_solicitud` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_respuesta` datetime DEFAULT NULL,
  `id_admin_aprobador` int DEFAULT NULL,
  PRIMARY KEY (`id_solicitud`),
  KEY `idx_estado` (`estado`),
  KEY `idx_email` (`email`),
  KEY `idx_id_persona` (`id_persona`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. Tabla de Notificaciones del Sistema
CREATE TABLE IF NOT EXISTS `notificaciones_sistema` (
  `id_notificacion` int NOT NULL AUTO_INCREMENT,
  `id_usuario` int NOT NULL,
  `tipo_usuario` varchar(50) COLLATE utf8mb4_general_ci DEFAULT 'alumno',
  `tipo_notificacion` varchar(50) COLLATE utf8mb4_general_ci NOT NULL,
  `titulo` varchar(200) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `mensaje` text COLLATE utf8mb4_general_ci NOT NULL,
  `id_referencia` int DEFAULT NULL,
  `leida` tinyint(1) DEFAULT 0,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_notificacion`),
  KEY `idx_id_usuario` (`id_usuario`),
  KEY `idx_leida` (`leida`),
  KEY `idx_tipo_usuario` (`tipo_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Verificación
SELECT 'Tablas creadas exitosamente' AS resultado;
SELECT TABLE_NAME, TABLE_ROWS FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = DATABASE() 
AND TABLE_NAME IN ('codigos_cemi', 'solicitudes_recuperacion', 'notificaciones_sistema');
