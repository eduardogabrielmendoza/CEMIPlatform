import express from 'express';
import pool from '../utils/db.js';
import crypto from 'crypto';

const router = express.Router();

// Generar código CEMI único
function generarCodigoCemi(rol) {
  const prefix = rol === 'alumno' ? 'CEMI-A' : 'CEMI-P';
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `${prefix}${code}`;
}

// GET /codigos-cemi - Listar todos los códigos (para admin)
router.get('/', async (req, res) => {
  try {
    const [codigos] = await pool.query(
      `SELECT cc.*, 
        CONCAT(pa.nombre, ' ', pa.apellido) as admin_nombre
       FROM codigos_cemi cc
       LEFT JOIN personas pa ON cc.id_admin_generador = pa.id_persona
       ORDER BY cc.fecha_generacion DESC`
    );
    res.json(codigos);
  } catch (error) {
    console.error('Error al obtener códigos CEMI:', error);
    res.status(500).json({ message: 'Error al obtener códigos' });
  }
});

// POST /codigos-cemi/generar - Generar un nuevo código
router.post('/generar', async (req, res) => {
  try {
    const { rol, nombre_destinatario, id_admin } = req.body;

    if (!rol || !['alumno', 'profesor'].includes(rol)) {
      return res.status(400).json({ success: false, message: 'Rol inválido' });
    }

    if (!nombre_destinatario || nombre_destinatario.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'El nombre es obligatorio' });
    }

    // Generar código único
    let codigo;
    let intentos = 0;
    do {
      codigo = generarCodigoCemi(rol);
      const [existing] = await pool.query('SELECT id_codigo FROM codigos_cemi WHERE codigo = ?', [codigo]);
      if (existing.length === 0) break;
      intentos++;
    } while (intentos < 10);

    if (intentos >= 10) {
      return res.status(500).json({ success: false, message: 'No se pudo generar un código único' });
    }

    const [result] = await pool.query(
      `INSERT INTO codigos_cemi (codigo, rol, nombre_destinatario, id_admin_generador) 
       VALUES (?, ?, ?, ?)`,
      [codigo, rol, nombre_destinatario.trim(), id_admin || null]
    );

    res.json({
      success: true,
      message: 'Código CEMI generado exitosamente',
      codigo,
      id_codigo: result.insertId,
      rol,
      nombre_destinatario: nombre_destinatario.trim()
    });
  } catch (error) {
    console.error('Error al generar código CEMI:', error);
    res.status(500).json({ success: false, message: 'Error al generar código' });
  }
});

// POST /codigos-cemi/validar - Validar un código (usado en registro)
router.post('/validar', async (req, res) => {
  try {
    const { codigo } = req.body;

    if (!codigo || codigo.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'El código es obligatorio' });
    }

    const [rows] = await pool.query(
      `SELECT * FROM codigos_cemi WHERE codigo = ? AND estado = 'activo'`,
      [codigo.trim().toUpperCase()]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Código inválido o ya utilizado'
      });
    }

    const codigoCemi = rows[0];

    res.json({
      success: true,
      rol: codigoCemi.rol,
      nombre_destinatario: codigoCemi.nombre_destinatario
    });
  } catch (error) {
    console.error('Error al validar código CEMI:', error);
    res.status(500).json({ success: false, message: 'Error al validar código' });
  }
});

// DELETE /codigos-cemi/:id - Eliminar un código pendiente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.query(
      `DELETE FROM codigos_cemi WHERE id_codigo = ? AND estado = 'activo'`,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Código no encontrado o ya utilizado' });
    }

    res.json({ success: true, message: 'Código eliminado' });
  } catch (error) {
    console.error('Error al eliminar código:', error);
    res.status(500).json({ success: false, message: 'Error al eliminar código' });
  }
});

export default router;
