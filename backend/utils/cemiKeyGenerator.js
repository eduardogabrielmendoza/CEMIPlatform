/**
 * CemiKey Generator
 * Genera claves de acceso únicas en formato "XXXX-XXXX-XXXX"
 * Caracteres: Mayúsculas y números, excluyendo caracteres confusos (0, O, 1, I, L)
 */

import pool from './db.js';

// Caracteres permitidos (sin 0, O, 1, I, L para evitar confusiones)
const ALLOWED_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Genera un segmento aleatorio de 4 caracteres
 * @returns {string} Segmento de 4 caracteres
 */
function generateSegment() {
  let segment = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * ALLOWED_CHARS.length);
    segment += ALLOWED_CHARS[randomIndex];
  }
  return segment;
}

/**
 * Genera una CemiKey en formato "XXXX-XXXX-XXXX"
 * @returns {string} CemiKey generada
 */
function generateCemiKey() {
  return `${generateSegment()}-${generateSegment()}-${generateSegment()}`;
}

/**
 * Verifica si una CemiKey ya existe en alguna de las tablas
 * @param {string} key - CemiKey a verificar
 * @returns {Promise<boolean>} true si existe, false si no
 */
async function keyExists(key) {
  try {
    // Verificar en administradores
    const [admins] = await pool.query(
      'SELECT id_administrador FROM administradores WHERE access_key = ?',
      [key]
    );
    if (admins.length > 0) return true;

    // Verificar en profesores
    const [profesores] = await pool.query(
      'SELECT id_profesor FROM profesores WHERE access_key = ?',
      [key]
    );
    if (profesores.length > 0) return true;

    // Verificar en alumnos
    const [alumnos] = await pool.query(
      'SELECT id_alumno FROM alumnos WHERE access_key = ?',
      [key]
    );
    if (alumnos.length > 0) return true;

    return false;
  } catch (error) {
    console.error('Error verificando existencia de CemiKey:', error);
    throw error;
  }
}

/**
 * Genera una CemiKey única verificando que no exista en la base de datos
 * @param {number} maxAttempts - Número máximo de intentos (default: 10)
 * @returns {Promise<string>} CemiKey única
 */
async function generateUniqueCemiKey(maxAttempts = 10) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const key = generateCemiKey();
    const exists = await keyExists(key);
    
    if (!exists) {
      return key;
    }
    
    console.log(`CemiKey ${key} ya existe, reintentando... (intento ${attempt + 1}/${maxAttempts})`);
  }
  
  throw new Error('No se pudo generar una CemiKey única después de múltiples intentos');
}

export { generateCemiKey, generateUniqueCemiKey, keyExists };
export default { generateCemiKey, generateUniqueCemiKey, keyExists };
