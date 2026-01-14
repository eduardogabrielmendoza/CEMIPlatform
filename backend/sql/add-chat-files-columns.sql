
USE cemi_sistema_educativo;


ALTER TABLE chat_mensajes 
ADD COLUMN archivo_adjunto VARCHAR(500) NULL COMMENT 'Ruta del archivo adjunto (imagen o PDF)';

ALTER TABLE chat_mensajes 
ADD COLUMN tipo_archivo VARCHAR(50) NULL COMMENT 'Tipo de archivo: image, pdf';

DESCRIBE chat_mensajes;

SELECT 'Columnas agregadas exitosamente' as resultado;
