-- Agregar columna bandera a la tabla idiomas para almacenar emoji de bandera
ALTER TABLE idiomas ADD COLUMN bandera VARCHAR(10) DEFAULT NULL AFTER nombre_idioma;

-- Poblar banderas para idiomas existentes
UPDATE idiomas SET bandera = '🇬🇧' WHERE LOWER(nombre_idioma) IN ('ingles', 'inglés', 'english');
UPDATE idiomas SET bandera = '🇫🇷' WHERE LOWER(nombre_idioma) IN ('frances', 'francés', 'french');
UPDATE idiomas SET bandera = '🇩🇪' WHERE LOWER(nombre_idioma) IN ('aleman', 'alemán', 'german');
UPDATE idiomas SET bandera = '🇮🇹' WHERE LOWER(nombre_idioma) IN ('italiano', 'italian');
UPDATE idiomas SET bandera = '🇧🇷' WHERE LOWER(nombre_idioma) IN ('portugues', 'portugués', 'portuguese');
UPDATE idiomas SET bandera = '🇯🇵' WHERE LOWER(nombre_idioma) IN ('japones', 'japonés', 'japanese');
UPDATE idiomas SET bandera = '🇨🇳' WHERE LOWER(nombre_idioma) IN ('chino mandarin', 'chino', 'chinese', 'mandarín', 'mandarin');
UPDATE idiomas SET bandera = '🇰🇷' WHERE LOWER(nombre_idioma) IN ('coreano', 'korean');
UPDATE idiomas SET bandera = '🇷🇺' WHERE LOWER(nombre_idioma) IN ('ruso', 'russian');
UPDATE idiomas SET bandera = '🇸🇦' WHERE LOWER(nombre_idioma) IN ('arabe', 'árabe', 'arabic');
UPDATE idiomas SET bandera = '🇮🇳' WHERE LOWER(nombre_idioma) IN ('hindi');
UPDATE idiomas SET bandera = '🇹🇷' WHERE LOWER(nombre_idioma) IN ('turco', 'turkish');
UPDATE idiomas SET bandera = '🇪🇸' WHERE LOWER(nombre_idioma) IN ('español', 'espanol', 'spanish');
UPDATE idiomas SET bandera = '🏛️' WHERE LOWER(nombre_idioma) IN ('latin', 'latín');
