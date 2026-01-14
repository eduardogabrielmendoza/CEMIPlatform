import express from 'express';
import pool from "../utils/db.js";

const router = express.Router();

router.get('/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;
    const { limit = 20 } = req.query;

    const [notificaciones] = await pool.query(
      `SELECT * FROM notificaciones 
       WHERE id_usuario = ? AND tipo_usuario = ?
       ORDER BY fecha_creacion DESC
       LIMIT ?`,
      [id, tipo, parseInt(limit)]
    );

    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
});

router.get('/:tipo/:id/sin-leer', async (req, res) => {
  try {
    const { tipo, id } = req.params;

    const [result] = await pool.query(
      `SELECT COUNT(*) as total FROM notificaciones 
       WHERE id_usuario = ? AND tipo_usuario = ? AND leida = 0`,
      [id, tipo]
    );

    res.json({ total: result[0].total });
  } catch (error) {
    console.error('Error al contar notificaciones:', error);
    res.status(500).json({ message: 'Error al contar notificaciones' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id_usuario, tipo_usuario, tipo_notificacion, titulo, mensaje, link, id_referencia } = req.body;

    const [result] = await pool.query(
      `INSERT INTO notificaciones 
       (id_usuario, tipo_usuario, tipo_notificacion, titulo, mensaje, link, id_referencia) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_usuario, tipo_usuario, tipo_notificacion, titulo, mensaje, link, id_referencia]
    );

    res.json({
      success: true,
      message: 'Notificación creada',
      id_notificacion: result.insertId
    });
  } catch (error) {
    console.error('Error al crear notificación:', error);
    res.status(500).json({ message: 'Error al crear notificación' });
  }
});

router.put('/:id/marcar-leida', async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE notificaciones SET leida = 1 WHERE id_notificacion = ?',
      [id]
    );

    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar notificación:', error);
    res.status(500).json({ message: 'Error al marcar notificación' });
  }
});

router.put('/:tipo/:id/marcar-todas-leidas', async (req, res) => {
  try {
    const { tipo, id } = req.params;

    await pool.query(
      'UPDATE notificaciones SET leida = 1 WHERE id_usuario = ? AND tipo_usuario = ? AND leida = 0',
      [id, tipo]
    );

    res.json({ success: true, message: 'Todas las notificaciones marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    res.status(500).json({ message: 'Error al marcar notificaciones' });
  }
});

router.delete('/limpiar/:tipo/:id', async (req, res) => {
  try {
    const { tipo, id } = req.params;

    await pool.query(
      `DELETE FROM notificaciones 
       WHERE id_usuario = ? AND tipo_usuario = ? 
       AND fecha_creacion < DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [id, tipo]
    );

    res.json({ success: true, message: 'Notificaciones antiguas eliminadas' });
  } catch (error) {
    console.error('Error al limpiar notificaciones:', error);
    res.status(500).json({ message: 'Error al limpiar notificaciones' });
  }
});

export default router;


