
ALTER TABLE anuncios 
  ADD COLUMN es_recurso TINYINT(1) DEFAULT 0 AFTER notificar,
  ADD COLUMN tipo_recurso VARCHAR(20) DEFAULT NULL AFTER es_recurso,
  ADD COLUMN archivo_recurso VARCHAR(255) DEFAULT NULL AFTER tipo_recurso,
  ADD COLUMN descargas INT DEFAULT 0 AFTER archivo_recurso;

ALTER TABLE anuncios ADD INDEX idx_es_recurso (es_recurso);
ALTER TABLE anuncios ADD COLUMN id_idioma INT NULL AFTER id_curso;
ALTER TABLE anuncios ADD INDEX idx_anuncios_id_idioma (id_idioma);

ALTER TABLE anuncios MODIFY id_curso INT NULL;

-- (es_recurso = 1, id_curso = NULL significa biblioteca general)
-- id_idioma indica en que seccion de idioma aparece el recurso.
INSERT INTO anuncios (id_curso, id_idioma, id_profesor, titulo, contenido, link_url, importante, notificar, es_recurso, tipo_recurso, archivo_recurso, descargas) VALUES
(NULL, 1, 2, 'Google Translate', 'Traductor de Google para multiples idiomas', 'https://translate.google.com', 0, 0, 1, 'enlace', NULL, 0),
(NULL, 1, 2, 'WordReference', 'Diccionario y traductor online', 'https://www.wordreference.com', 0, 0, 1, 'enlace', NULL, 0),
(NULL, 1, 2, 'Forvo - Pronunciacion', 'Guia de pronunciacion con hablantes nativos', 'https://forvo.com', 0, 0, 1, 'enlace', NULL, 0),
(NULL, 1, 2, 'Conjugador de verbos', 'Conjugacion de verbos en varios idiomas', 'https://www.conjugacion.es', 0, 0, 1, 'enlace', NULL, 0);


-- Obtener solo anuncios normales (sin recursos):



