import express from 'express';
import pool from '../utils/db.js';
import bcrypt from 'bcryptjs';
import { verificarToken } from '../utils/authMiddleware.js';

const router = express.Router();

// POST /recuperacion/solicitar - Crear solicitud de recuperación (NO requiere token)
router.post('/solicitar', async (req, res) => {
  try {
    const { email, dni } = req.body;

    if (!email || !dni) {
      return res.status(400).json({ success: false, message: 'Email y DNI son obligatorios' });
    }

    // Verificar que email y DNI coincidan con una persona
    const [personas] = await pool.query(
      `SELECT p.id_persona, p.nombre, p.apellido, p.mail, p.dni,
              u.id_usuario, u.username, perf.nombre_perfil as rol
       FROM personas p
       JOIN usuarios u ON p.id_persona = u.id_persona
       JOIN perfiles perf ON u.id_perfil = perf.id_perfil
       WHERE LOWER(p.mail) = LOWER(?) AND p.dni = ?`,
      [email.trim(), dni.trim()]
    );

    if (personas.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Los datos ingresados no coinciden con ninguna cuenta registrada'
      });
    }

    const persona = personas[0];

    // Verificar si ya existe una solicitud pendiente o aprobada
    const [existentes] = await pool.query(
      `SELECT * FROM solicitudes_recuperacion 
       WHERE id_persona = ? AND estado IN ('pendiente', 'aprobada')`,
      [persona.id_persona]
    );

    if (existentes.length > 0) {
      const solicitud = existentes[0];
      return res.json({
        success: true,
        estado: solicitud.estado,
        message: solicitud.estado === 'pendiente' 
          ? 'Ya existe una solicitud pendiente. Un administrador la revisará pronto.'
          : 'Tu solicitud fue aprobada. Ya puedes cambiar tu contraseña.',
        id_solicitud: solicitud.id_solicitud,
        admin_nombre: solicitud.admin_nombre || null
      });
    }

    // Crear nueva solicitud
    const [result] = await pool.query(
      `INSERT INTO solicitudes_recuperacion (id_persona, email, dni)
       VALUES (?, ?, ?)`,
      [persona.id_persona, email.trim(), dni.trim()]
    );

    // Crear notificación para todos los admins
    const [admins] = await pool.query(
      `SELECT u.id_usuario, p.nombre, p.apellido
       FROM administradores a
       JOIN personas p ON a.id_persona = p.id_persona
       JOIN usuarios u ON a.id_persona = u.id_persona
       WHERE a.estado = 'activo'`
    );

    for (const admin of admins) {
      await pool.query(
        `INSERT INTO notificaciones_sistema 
         (id_usuario, tipo_usuario, tipo_notificacion, titulo, mensaje, id_referencia)
         VALUES (?, 'administrador', 'solicitud_password', 
                 'Solicitud de cambio de contraseña', 
                 ?, ?)`,
        [
          admin.id_usuario,
          `${persona.nombre} ${persona.apellido} (${persona.rol}) ha solicitado un cambio de contraseña.`,
          result.insertId
        ]
      );
    }

    res.json({
      success: true,
      estado: 'pendiente',
      message: 'Solicitud enviada. Un administrador la revisará pronto.',
      id_solicitud: result.insertId
    });
  } catch (error) {
    console.error('Error al crear solicitud de recuperación:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// POST /recuperacion/verificar - Verificar estado de solicitud por email (NO requiere token)
router.post('/verificar', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email es obligatorio' });
    }

    const [personas] = await pool.query(
      `SELECT id_persona FROM personas WHERE LOWER(mail) = LOWER(?)`,
      [email.trim()]
    );

    if (personas.length === 0) {
      return res.status(404).json({ success: false, message: 'Email no encontrado' });
    }

    const [solicitudes] = await pool.query(
      `SELECT sr.*, CONCAT(pa.nombre, ' ', pa.apellido) as admin_nombre
       FROM solicitudes_recuperacion sr
       LEFT JOIN personas pa ON sr.id_admin_aprobador = pa.id_persona
       WHERE sr.id_persona = ? AND sr.estado IN ('pendiente', 'aprobada')
       ORDER BY sr.fecha_solicitud DESC LIMIT 1`,
      [personas[0].id_persona]
    );

    if (solicitudes.length === 0) {
      return res.json({ success: true, tiene_solicitud: false });
    }

    const solicitud = solicitudes[0];
    res.json({
      success: true,
      tiene_solicitud: true,
      estado: solicitud.estado,
      id_solicitud: solicitud.id_solicitud,
      admin_nombre: solicitud.admin_nombre || null,
      fecha_respuesta: solicitud.fecha_respuesta
    });
  } catch (error) {
    console.error('Error al verificar solicitud:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// POST /recuperacion/cambiar-password - Cambiar contraseña tras aprobación (NO requiere token)
router.post('/cambiar-password', async (req, res) => {
  try {
    const { email, nueva_password } = req.body;

    if (!email || !nueva_password) {
      return res.status(400).json({ success: false, message: 'Datos incompletos' });
    }

    if (nueva_password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Buscar persona por email
    const [personas] = await pool.query(
      `SELECT id_persona FROM personas WHERE LOWER(mail) = LOWER(?)`,
      [email.trim()]
    );

    if (personas.length === 0) {
      return res.status(404).json({ success: false, message: 'Email no encontrado' });
    }

    // Verificar que la solicitud esté aprobada
    const [solicitudes] = await pool.query(
      `SELECT sr.*, p.nombre, p.apellido
       FROM solicitudes_recuperacion sr
       JOIN personas p ON sr.id_persona = p.id_persona
       WHERE sr.id_persona = ? AND sr.estado = 'aprobada'
       ORDER BY sr.fecha_solicitud DESC LIMIT 1`,
      [personas[0].id_persona]
    );

    if (solicitudes.length === 0) {
      return res.status(404).json({ success: false, message: 'No hay solicitud aprobada para este email' });
    }

    const solicitud = solicitudes[0];

    // Hashear nueva contraseña
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(nueva_password.trim(), salt);

    // Actualizar contraseña del usuario
    await pool.query(
      `UPDATE usuarios SET password_hash = ?, password_plain = ? 
       WHERE id_persona = ?`,
      [passwordHash, nueva_password.trim(), solicitud.id_persona]
    );

    // Marcar solicitud como completada
    await pool.query(
      `UPDATE solicitudes_recuperacion SET estado = 'completada' WHERE id_solicitud = ?`,
      [solicitud.id_solicitud]
    );

    // Obtener id_usuario para la notificación
    const [usuarios] = await pool.query(
      `SELECT u.id_usuario, perf.nombre_perfil as rol 
       FROM usuarios u 
       JOIN perfiles perf ON u.id_perfil = perf.id_perfil
       WHERE u.id_persona = ?`,
      [solicitud.id_persona]
    );

    if (usuarios.length > 0) {
      const usuario = usuarios[0];
      const tipoUsuario = usuario.rol === 'admin' || usuario.rol === 'administrador' ? 'administrador' : usuario.rol;
      
      // Notificar al usuario que su contraseña fue cambiada
      const [adminInfo] = await pool.query(
        `SELECT CONCAT(p.nombre, ' ', p.apellido) as nombre 
         FROM personas p WHERE p.id_persona = ?`,
        [solicitud.id_admin_aprobador]
      );

      const adminNombre = adminInfo.length > 0 ? adminInfo[0].nombre : 'Un administrador';

      await pool.query(
        `INSERT INTO notificaciones_sistema 
         (id_usuario, tipo_usuario, tipo_notificacion, titulo, mensaje, id_referencia)
         VALUES (?, ?, 'password_cambiada', 
                 'Contraseña actualizada', 
                 ?, ?)`,
        [
          usuario.id_usuario,
          tipoUsuario,
          `Tu contraseña fue actualizada exitosamente. Aprobado por: ${adminNombre}.`,
          solicitud.id_solicitud
        ]
      );
    }

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente. Ya puedes iniciar sesión.'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// GET /recuperacion/pendientes - Listar todas las solicitudes (para admin)
router.get('/pendientes', verificarToken, async (req, res) => {
  try {
    const [solicitudes] = await pool.query(
      `SELECT sr.*, p.nombre, p.apellido, p.mail as email, p.dni,
              u.username, perf.nombre_perfil as rol,
              CONCAT(pa.nombre, ' ', pa.apellido) as admin_nombre
       FROM solicitudes_recuperacion sr
       JOIN personas p ON sr.id_persona = p.id_persona
       JOIN usuarios u ON sr.id_persona = u.id_persona
       JOIN perfiles perf ON u.id_perfil = perf.id_perfil
       LEFT JOIN personas pa ON sr.id_admin_aprobador = pa.id_persona
       ORDER BY sr.fecha_solicitud DESC`
    );

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
});

// PUT /recuperacion/:id/aprobar - Aprobar solicitud
router.put('/:id/aprobar', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id_admin } = req.body;

    const [result] = await pool.query(
      `UPDATE solicitudes_recuperacion 
       SET estado = 'aprobada', id_admin_aprobador = ?, fecha_respuesta = NOW()
       WHERE id_solicitud = ? AND estado = 'pendiente'`,
      [id_admin || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    res.json({ success: true, message: 'Solicitud aprobada' });
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// PUT /recuperacion/:id/rechazar - Rechazar solicitud
router.put('/:id/rechazar', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { id_admin } = req.body;

    const [result] = await pool.query(
      `UPDATE solicitudes_recuperacion 
       SET estado = 'rechazada', id_admin_aprobador = ?, fecha_respuesta = NOW()
       WHERE id_solicitud = ? AND estado = 'pendiente'`,
      [id_admin || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    // Notificar al usuario
    const [solicitud] = await pool.query(
      `SELECT sr.id_persona FROM solicitudes_recuperacion sr WHERE sr.id_solicitud = ?`, [id]
    );

    if (solicitud.length > 0) {
      const [usuarios] = await pool.query(
        `SELECT u.id_usuario, perf.nombre_perfil as rol 
         FROM usuarios u JOIN perfiles perf ON u.id_perfil = perf.id_perfil
         WHERE u.id_persona = ?`,
        [solicitud[0].id_persona]
      );

      if (usuarios.length > 0) {
        const tipoUsuario = usuarios[0].rol === 'admin' || usuarios[0].rol === 'administrador' ? 'administrador' : usuarios[0].rol;
        await pool.query(
          `INSERT INTO notificaciones_sistema 
           (id_usuario, tipo_usuario, tipo_notificacion, titulo, mensaje, id_referencia)
           VALUES (?, ?, 'password_cambiada', 'Solicitud de cambio rechazada', 
                   'Tu solicitud de cambio de contraseña fue rechazada. Contacta con un administrador si necesitas ayuda.', ?)`,
          [usuarios[0].id_usuario, tipoUsuario, id]
        );
      }
    }

    res.json({ success: true, message: 'Solicitud rechazada' });
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    res.status(500).json({ success: false, message: 'Error del servidor' });
  }
});

// GET /recuperacion/notificaciones/:id_usuario - Obtener notificaciones del sistema por id_usuario
router.get('/notificaciones/:id_usuario', async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { limit = 20 } = req.query;

    const [notificaciones] = await pool.query(
      `SELECT * FROM notificaciones_sistema 
       WHERE id_usuario = ?
       ORDER BY fecha_creacion DESC LIMIT ?`,
      [id_usuario, parseInt(limit)]
    );

    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ message: 'Error al obtener notificaciones' });
  }
});

// PUT /recuperacion/notificaciones/:id/leer - Marcar notificación como leída
router.put('/notificaciones/:id/leer', async (req, res) => {
  try {
    await pool.query('UPDATE notificaciones_sistema SET leida = 1 WHERE id_notificacion = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
});

export default router;
