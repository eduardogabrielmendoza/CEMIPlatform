
ALTER TABLE anuncios 
  ADD COLUMN es_recurso TINYINT(1) DEFAULT 0 AFTER notificar,
  ADD COLUMN tipo_recurso VARCHAR(20) DEFAULT NULL AFTER es_recurso,
  ADD COLUMN archivo_recurso VARCHAR(255) DEFAULT NULL AFTER tipo_recurso,
  ADD COLUMN descargas INT DEFAULT 0 AFTER archivo_recurso;

ALTER TABLE anuncios ADD INDEX idx_es_recurso (es_recurso);

ALTER TABLE anuncios MODIFY id_curso INT NULL;

-- (es_recurso = 1, id_curso = NULL significa biblioteca general)
INSERT INTO anuncios (id_curso, id_profesor, titulo, contenido, link_url, importante, notificar, es_recurso, tipo_recurso, archivo_recurso, descargas) VALUES
(NULL, 2, 'Google Translate', 'Traductor de Google para múltiples idiomas', 'https://translate.google.com', 0, 0, 1, 'enlace', NULL, 0),
(NULL, 2, 'WordReference', 'Diccionario y traductor online', 'https://www.wordreference.com', 0, 0, 1, 'enlace', NULL, 0),
(NULL, 2, 'Forvo - Pronunciación', 'Guía de pronunciación con hablantes nativos', 'https://forvo.com', 0, 0, 1, 'enlace', NULL, 0),
(NULL, 2, 'Conjugador de verbos', 'Conjugación de verbos en varios idiomas', 'https://www.conjugacion.es', 0, 0, 1, 'enlace', NULL, 0);


-- Obtener solo anuncios normales (sin recursos):



