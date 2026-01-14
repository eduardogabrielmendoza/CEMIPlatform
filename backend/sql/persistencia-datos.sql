-- =============================================
-- TABLAS PARA PERSISTENCIA DE DATOS
-- Migración de archivos JSON a MySQL
-- Fecha: 18/12/2025
-- =============================================

-- =============================================
-- 1. COMUNIDAD DE AYUDA (comunidad-ayuda.html)
-- =============================================

-- Tabla de preguntas de la comunidad
CREATE TABLE IF NOT EXISTS comunidad_preguntas (
    id VARCHAR(50) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    categoria ENUM('primeros-pasos', 'tareas', 'comunicacion', 'recursos', 'cuenta', 'otro') NOT NULL,
    autor_tipo ENUM('alumno', 'profesor', 'admin') NOT NULL,
    autor_id INT NOT NULL,
    autor_nombre VARCHAR(100) NOT NULL,
    autor_avatar VARCHAR(255) DEFAULT NULL,
    estado ENUM('abierta', 'resuelta', 'cerrada') DEFAULT 'abierta',
    votos INT DEFAULT 0,
    votantes JSON DEFAULT NULL,
    destacado BOOLEAN DEFAULT FALSE,
    es_anuncio BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_autor (autor_tipo, autor_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha (fecha_creacion),
    INDEX idx_destacado (destacado, es_anuncio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de respuestas de la comunidad
CREATE TABLE IF NOT EXISTS comunidad_respuestas (
    id VARCHAR(50) PRIMARY KEY,
    pregunta_id VARCHAR(50) NOT NULL,
    contenido TEXT NOT NULL,
    autor_tipo ENUM('alumno', 'profesor', 'admin') NOT NULL,
    autor_id INT NOT NULL,
    autor_nombre VARCHAR(100) NOT NULL,
    autor_avatar VARCHAR(255) DEFAULT NULL,
    es_recomendada BOOLEAN DEFAULT FALSE,
    votos INT DEFAULT 0,
    votantes JSON DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pregunta_id) REFERENCES comunidad_preguntas(id) ON DELETE CASCADE,
    INDEX idx_pregunta (pregunta_id),
    INDEX idx_autor (autor_tipo, autor_id),
    INDEX idx_fecha (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de participantes (para estadísticas)
CREATE TABLE IF NOT EXISTS comunidad_participantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participante_tipo ENUM('alumno', 'profesor', 'admin') NOT NULL,
    participante_id INT NOT NULL,
    fecha_primera_participacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_participante (participante_tipo, participante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. ENCUESTAS DE INVESTIGACIÓN
-- =============================================

-- Tabla de encuestas completadas
CREATE TABLE IF NOT EXISTS encuestas_investigacion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    -- Datos personales
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) DEFAULT NULL,
    age INT DEFAULT NULL,
    gender VARCHAR(20) DEFAULT NULL,
    country VARCHAR(10) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    
    -- Datos institucionales
    education VARCHAR(50) DEFAULT NULL,
    institution VARCHAR(255) DEFAULT NULL,
    role VARCHAR(50) DEFAULT NULL,
    
    -- Uso de la plataforma
    frequency VARCHAR(50) DEFAULT NULL,
    products JSON DEFAULT NULL,
    main_purpose TEXT DEFAULT NULL,
    
    -- Satisfacción
    satisfaction INT DEFAULT NULL,
    recommendation INT DEFAULT NULL,
    
    -- Mejoras y features
    improvements JSON DEFAULT NULL,
    improvement_priority TEXT DEFAULT NULL,
    desired_features JSON DEFAULT NULL,
    feature_priority TEXT DEFAULT NULL,
    
    -- Feedback adicional
    positive_feedback TEXT DEFAULT NULL,
    negative_feedback TEXT DEFAULT NULL,
    additional_comments TEXT DEFAULT NULL,
    
    -- Permisos y metadatos
    contact_permission BOOLEAN DEFAULT FALSE,
    newsletter_subscription BOOLEAN DEFAULT FALSE,
    terms_accepted BOOLEAN DEFAULT TRUE,
    
    -- PDF en cloudinary
    pdf_url VARCHAR(500) DEFAULT NULL,
    pdf_public_id VARCHAR(255) DEFAULT NULL,
    
    -- Timestamps
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) DEFAULT NULL,
    user_agent TEXT DEFAULT NULL,
    
    INDEX idx_email (email),
    INDEX idx_fecha (fecha_creacion),
    INDEX idx_country (country),
    INDEX idx_satisfaction (satisfaction)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. STATUS DEL SISTEMA
-- =============================================

-- Tabla de estado global y servicios
CREATE TABLE IF NOT EXISTS sistema_servicios (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) DEFAULT NULL,
    estado ENUM('operational', 'degraded', 'outage', 'maintenance') DEFAULT 'operational',
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_estado (estado),
    INDEX idx_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar servicios por defecto
INSERT INTO sistema_servicios (id, nombre, descripcion, estado, orden) VALUES
('platform', 'Plataforma Principal', 'Acceso al sistema y autenticación', 'operational', 1),
('classroom', 'Classroom', 'Cursos, tareas y entregas', 'operational', 2),
('payments', 'Sistema de Pagos', 'Gestión de cuotas y pagos', 'operational', 3),
('chat', 'Chat de Soporte', 'Comunicación en tiempo real', 'operational', 4),
('api', 'API / Backend', 'Servicios y base de datos', 'operational', 5)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Tabla de incidentes
CREATE TABLE IF NOT EXISTS sistema_incidentes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    mensaje TEXT DEFAULT NULL,
    severidad ENUM('operational', 'degraded', 'outage', 'maintenance') NOT NULL,
    servicios_afectados JSON DEFAULT NULL,
    mostrar_banner BOOLEAN DEFAULT FALSE,
    resuelto BOOLEAN DEFAULT FALSE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_resolucion DATETIME DEFAULT NULL,
    creado_por INT DEFAULT NULL,
    resuelto_por INT DEFAULT NULL,
    INDEX idx_resuelto (resuelto),
    INDEX idx_fecha (fecha_creacion),
    INDEX idx_severidad (severidad)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de actualizaciones de incidentes
CREATE TABLE IF NOT EXISTS sistema_incidentes_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incidente_id INT NOT NULL,
    mensaje TEXT NOT NULL,
    estado ENUM('investigating', 'identified', 'monitoring', 'resolved') NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    creado_por INT DEFAULT NULL,
    FOREIGN KEY (incidente_id) REFERENCES sistema_incidentes(id) ON DELETE CASCADE,
    INDEX idx_incidente (incidente_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de configuración del status
CREATE TABLE IF NOT EXISTS sistema_status_config (
    id INT PRIMARY KEY DEFAULT 1,
    estado_global ENUM('operational', 'degraded', 'outage', 'maintenance') DEFAULT 'operational',
    mensaje_global TEXT DEFAULT NULL,
    ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar configuración por defecto
INSERT INTO sistema_status_config (id, estado_global) VALUES (1, 'operational')
ON DUPLICATE KEY UPDATE id = id;

-- =============================================
-- 4. VISTAS ÚTILES
-- =============================================

-- Vista de estadísticas de la comunidad
CREATE OR REPLACE VIEW v_comunidad_stats AS
SELECT 
    (SELECT COUNT(*) FROM comunidad_preguntas) as total_preguntas,
    (SELECT COUNT(*) FROM comunidad_respuestas) as total_respuestas,
    (SELECT COUNT(*) FROM comunidad_participantes) as total_participantes;

-- Vista de estadísticas de encuestas
CREATE OR REPLACE VIEW v_encuestas_stats AS
SELECT 
    COUNT(*) as total_encuestas,
    AVG(satisfaction) as promedio_satisfaccion,
    AVG(recommendation) as promedio_recomendacion,
    MAX(fecha_creacion) as ultima_encuesta,
    COUNT(CASE WHEN contact_permission = 1 THEN 1 END) as con_permiso_contacto,
    COUNT(CASE WHEN newsletter_subscription = 1 THEN 1 END) as suscriptores_newsletter
FROM encuestas_investigacion;

-- Vista del estado actual del sistema
CREATE OR REPLACE VIEW v_sistema_status AS
SELECT 
    sc.estado_global,
    sc.mensaje_global,
    sc.ultima_actualizacion,
    (SELECT COUNT(*) FROM sistema_incidentes WHERE resuelto = FALSE) as incidentes_activos,
    (SELECT COUNT(*) FROM sistema_servicios WHERE estado != 'operational') as servicios_afectados
FROM sistema_status_config sc
WHERE sc.id = 1;

-- =============================================
-- 5. ÍNDICES ADICIONALES PARA RENDIMIENTO
-- =============================================

-- Índice para búsqueda de texto en preguntas
ALTER TABLE comunidad_preguntas ADD FULLTEXT INDEX ft_pregunta (titulo, descripcion);

-- Índice para búsqueda en encuestas
ALTER TABLE encuestas_investigacion ADD FULLTEXT INDEX ft_encuesta (first_name, last_name, email, institution);
