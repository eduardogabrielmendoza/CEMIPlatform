
import express from "express";
import pool from "../utils/db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

let chatServerInstance = null;

export function setChatServer(chatServer) {
  chatServerInstance = chatServer;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production' || process.env.MYSQLHOST;

console.log(` Modo de chat: ${isProduction ? 'PRODUCCIÓN (Cloudinary)' : 'DESARROLLO (Local)'}`);
console.log(` NODE_ENV: ${process.env.NODE_ENV}`);
console.log(` MYSQLHOST: ${process.env.MYSQLHOST ? 'definido' : 'no definido'}`);

const chatStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/chat-files');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, WEBP) y PDF'));
  }
};

const uploadChatFile = multer({
  storage: chatStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});


router.post("/iniciar", async (req, res) => {
  try {
    let { tipo_usuario, id_usuario, nombre, mensaje_inicial } = req.body;
    
    if (id_usuario === 'null' || id_usuario === 'undefined' || id_usuario === '') {
      id_usuario = null;
    }
    
    if (!id_usuario && nombre && tipo_usuario !== 'invitado') {
      try {
        const [usuarioBuscado] = await pool.query(`
          SELECT u.id_usuario
          FROM usuarios u
          JOIN personas p ON u.id_persona = p.id_persona
          WHERE CONCAT(p.nombre, ' ', p.apellido) = ?
          LIMIT 1
        `, [nombre]);
        
        if (usuarioBuscado.length > 0) {
          id_usuario = usuarioBuscado[0].id_usuario;
          console.log(` id_usuario encontrado automáticamente: ${id_usuario} para ${nombre}`);
        }
      } catch (err) {
        console.warn('️ No se pudo buscar id_usuario automáticamente:', err.message);
      }
    }
    
    if (!tipo_usuario || !nombre || !mensaje_inicial) {
      return res.status(400).json({ 
        success: false, 
        message: "Faltan datos requeridos" 
      });
    }
    
    let id_conversacion;
    
    if (tipo_usuario !== 'invitado' && id_usuario) {
      const [existentes] = await pool.query(`
        SELECT id_conversacion 
        FROM chat_conversaciones 
        WHERE tipo_usuario = ? AND id_usuario = ? AND estado IN ('pendiente', 'activa')
        LIMIT 1
      `, [tipo_usuario, id_usuario]);
      
      if (existentes.length > 0) {
        id_conversacion = existentes[0].id_conversacion;
        console.log(` Conversación existente encontrada: ${id_conversacion} para ${nombre}`);
      }
    }
    
    if (!id_conversacion) {
      const [conversacion] = await pool.query(`
        INSERT INTO chat_conversaciones (tipo_usuario, id_usuario, nombre_invitado, estado)
        VALUES (?, ?, ?, 'pendiente')
      `, [
        tipo_usuario,
        tipo_usuario === 'invitado' ? null : id_usuario,
        tipo_usuario === 'invitado' ? nombre : null
      ]);
      
      id_conversacion = conversacion.insertId;
      console.log(` Nueva conversación creada: ${id_conversacion} para ${nombre}`);
      
      await pool.query(`
        INSERT INTO chat_estadisticas (id_conversacion, total_mensajes, mensajes_usuario)
        VALUES (?, 0, 0)
      `, [id_conversacion]);
    }
    
    await pool.query(`
      INSERT INTO chat_mensajes (
        id_conversacion, 
        tipo_remitente, 
        id_remitente, 
        nombre_remitente, 
        mensaje
      ) VALUES (?, ?, ?, ?, ?)
    `, [
      id_conversacion,
      tipo_usuario,
      tipo_usuario === 'invitado' ? null : id_usuario,
      nombre,
      mensaje_inicial
    ]);
    
    await pool.query(`
      UPDATE chat_conversaciones
      SET mensajes_no_leidos_admin = mensajes_no_leidos_admin + 1,
          ultima_actividad = CURRENT_TIMESTAMP
      WHERE id_conversacion = ?
    `, [id_conversacion]);
    
    console.log(` Mensaje agregado a conversación: ${id_conversacion} por ${nombre}`);
    
    res.json({
      success: true,
      message: "Conversación iniciada exitosamente",
      data: {
        id_conversacion,
        tipo_usuario,
        nombre
      }
    });
    
  } catch (error) {
    console.error("Error al iniciar conversación:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al iniciar conversación" 
    });
  }
});


router.get("/conversacion/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [conversaciones] = await pool.query(`
      SELECT c.*, 
             CASE 
               WHEN c.atendido_por IS NOT NULL THEN CONCAT(p.nombre, ' ', p.apellido)
               ELSE NULL
             END as nombre_admin
      FROM chat_conversaciones c
      LEFT JOIN usuarios u ON c.atendido_por = u.id_usuario
      LEFT JOIN personas p ON u.id_persona = p.id_persona
      WHERE c.id_conversacion = ?
    `, [id]);
    
    if (conversaciones.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversación no encontrada"
      });
    }
    
    const conversacion = conversaciones[0];
    
    const [mensajes] = await pool.query(`
      SELECT 
        cm.*,
        COALESCE(
          p_alumno.avatar, 
          p_profesor.avatar, 
          p_admin.avatar,
          p_usuario.avatar,
          CASE WHEN cm.tipo_remitente = 'admin' THEN '/images/logo.png' ELSE NULL END
        ) as avatar_remitente
      FROM chat_mensajes cm
      LEFT JOIN alumnos a ON cm.tipo_remitente = 'alumno' AND a.id_alumno = cm.id_remitente
      LEFT JOIN personas p_alumno ON a.id_persona = p_alumno.id_persona
      LEFT JOIN profesores pr ON cm.tipo_remitente = 'profesor' AND pr.id_profesor = cm.id_remitente
      LEFT JOIN personas p_profesor ON pr.id_persona = p_profesor.id_persona
      LEFT JOIN administradores adm ON cm.tipo_remitente = 'admin' AND adm.id_administrador = cm.id_remitente
      LEFT JOIN personas p_admin ON adm.id_persona = p_admin.id_persona
      LEFT JOIN usuarios u ON u.id_usuario = cm.id_remitente
      LEFT JOIN personas p_usuario ON u.id_persona = p_usuario.id_persona
      WHERE cm.id_conversacion = ?
      ORDER BY cm.fecha_envio ASC
    `, [id]);
    
    console.log(` Conversación ${id} - Total mensajes: ${mensajes.length}`);
    const mensajesConArchivos = mensajes.filter(m => m.archivo_adjunto);
    if (mensajesConArchivos.length > 0) {
      console.log(` Mensajes con archivos adjuntos:`, mensajesConArchivos.map(m => ({
        id: m.id_mensaje,
        archivo: m.archivo_adjunto,
        tipo: m.tipo_archivo
      })));
    }
    
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json({
      success: true,
      data: {
        conversacion,
        mensajes
      }
    });
    
  } catch (error) {
    console.error("Error al obtener conversación:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar conversación"
    });
  }
});


router.get("/conversaciones", async (req, res) => {
  try {
    const { estado, atendido_por } = req.query;
    
    let query = `
      SELECT 
        c.*,
        COUNT(m.id_mensaje) as total_mensajes,
        (SELECT mensaje FROM chat_mensajes 
         WHERE id_conversacion = c.id_conversacion 
         ORDER BY fecha_envio DESC LIMIT 1) as ultimo_mensaje,
        (SELECT fecha_envio FROM chat_mensajes 
         WHERE id_conversacion = c.id_conversacion 
         ORDER BY fecha_envio DESC LIMIT 1) as fecha_ultimo_mensaje,
        (SELECT tipo_remitente FROM chat_mensajes 
         WHERE id_conversacion = c.id_conversacion 
         ORDER BY fecha_envio DESC LIMIT 1) as tipo_ultimo_remitente,
        CASE 
          WHEN c.atendido_por IS NOT NULL THEN CONCAT(p_admin.nombre, ' ', p_admin.apellido)
          ELSE NULL
        END as nombre_admin,
        CASE
          WHEN c.id_usuario IS NOT NULL THEN CONCAT(p_usuario.nombre, ' ', p_usuario.apellido)
          ELSE c.nombre_invitado
        END as nombre_completo_usuario,
        p_usuario.avatar as avatar_usuario,
        p_admin.avatar as avatar_admin
      FROM chat_conversaciones c
      LEFT JOIN chat_mensajes m ON c.id_conversacion = m.id_conversacion
      LEFT JOIN usuarios u_admin ON c.atendido_por = u_admin.id_usuario
      LEFT JOIN personas p_admin ON u_admin.id_persona = p_admin.id_persona
      LEFT JOIN usuarios u_usuario ON c.id_usuario = u_usuario.id_usuario
      LEFT JOIN personas p_usuario ON u_usuario.id_persona = p_usuario.id_persona
      WHERE 1=1
    `;
    
    const params = [];
    
    if (estado) {
      query += ` AND c.estado = ?`;
      params.push(estado);
    }
    
    if (atendido_por) {
      query += ` AND c.atendido_por = ?`;
      params.push(atendido_por);
    }
    
    query += `
      GROUP BY c.id_conversacion
      ORDER BY c.ultima_actividad DESC
    `;
    
    const [conversaciones] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: conversaciones
    });
    
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar conversaciones"
    });
  }
});


router.put("/conversacion/:id/tomar", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_admin } = req.body;
    
    if (!id_admin) {
      return res.status(400).json({
        success: false,
        message: "ID de admin requerido"
      });
    }
    
    await pool.query(`
      UPDATE chat_conversaciones
      SET atendido_por = ?, estado = 'activa'
      WHERE id_conversacion = ?
    `, [id_admin, id]);
    
    res.json({
      success: true,
      message: "Conversación tomada exitosamente"
    });
    
  } catch (error) {
    console.error("Error al tomar conversación:", error);
    res.status(500).json({
      success: false,
      message: "Error al tomar conversación"
    });
  }
});


router.put("/conversacion/:id/cerrar", async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query(`
      UPDATE chat_conversaciones
      SET estado = 'cerrada', fecha_cierre = CURRENT_TIMESTAMP
      WHERE id_conversacion = ?
    `, [id]);
    
    const [stats] = await pool.query(`
      SELECT 
        MIN(fecha_envio) as fecha_inicio,
        MAX(fecha_envio) as fecha_fin
      FROM chat_mensajes
      WHERE id_conversacion = ?
    `, [id]);
    
    if (stats.length > 0 && stats[0].fecha_inicio && stats[0].fecha_fin) {
      const tiempoTotal = Math.floor(
        (new Date(stats[0].fecha_fin) - new Date(stats[0].fecha_inicio)) / 1000
      );
      
      await pool.query(`
        UPDATE chat_estadisticas
        SET tiempo_total_conversacion = ?
        WHERE id_conversacion = ?
      `, [tiempoTotal, id]);
    }
    
    res.json({
      success: true,
      message: "Conversación cerrada exitosamente"
    });
    
  } catch (error) {
    console.error("Error al cerrar conversación:", error);
    res.status(500).json({
      success: false,
      message: "Error al cerrar conversación"
    });
  }
});


router.post("/mensaje", async (req, res) => {
  try {
    const { id_conversacion, tipo_remitente, id_remitente, nombre_remitente, mensaje } = req.body;
    
    if (!id_conversacion || !tipo_remitente || !nombre_remitente || !mensaje) {
      return res.status(400).json({
        success: false,
        message: "Faltan datos requeridos"
      });
    }
    
    const [result] = await pool.query(`
      INSERT INTO chat_mensajes (
        id_conversacion, 
        tipo_remitente, 
        id_remitente, 
        nombre_remitente, 
        mensaje
      ) VALUES (?, ?, ?, ?, ?)
    `, [id_conversacion, tipo_remitente, id_remitente, nombre_remitente, mensaje]);
    
    await pool.query(`
      UPDATE chat_conversaciones 
      SET ultima_actividad = CURRENT_TIMESTAMP
      WHERE id_conversacion = ?
    `, [id_conversacion]);
    
    res.json({
      success: true,
      message: "Mensaje enviado",
      data: {
        id_mensaje: result.insertId
      }
    });
    
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({
      success: false,
      message: "Error al enviar mensaje"
    });
  }
});


router.put("/conversacion/:id/leer", async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo_lector } = req.body; // 'admin' o 'usuario'
    
    if (tipo_lector === 'admin') {
      await pool.query(`
        UPDATE chat_mensajes 
        SET leido_por_admin = 1, leido = 1
        WHERE id_conversacion = ? 
          AND tipo_remitente != 'admin'
          AND leido_por_admin = 0
      `, [id]);
      
      await pool.query(`
        UPDATE chat_conversaciones
        SET mensajes_no_leidos_admin = 0
        WHERE id_conversacion = ?
      `, [id]);
    } else {
      await pool.query(`
        UPDATE chat_mensajes 
        SET leido_por_usuario = 1, leido = 1
        WHERE id_conversacion = ? 
          AND tipo_remitente = 'admin'
          AND leido_por_usuario = 0
      `, [id]);
      
      await pool.query(`
        UPDATE chat_conversaciones
        SET mensajes_no_leidos_usuario = 0
        WHERE id_conversacion = ?
      `, [id]);
    }
    
    res.json({
      success: true,
      message: "Mensajes marcados como leídos"
    });
    
  } catch (error) {
    console.error("Error al marcar como leído:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar estado"
    });
  }
});


router.get("/estadisticas", async (req, res) => {
  try {
    const [stats] = await pool.query(`
      SELECT 
        COUNT(*) as total_conversaciones,
        SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
        SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as activas,
        SUM(CASE WHEN estado = 'cerrada' THEN 1 ELSE 0 END) as cerradas,
        SUM(CASE WHEN tipo_usuario = 'invitado' THEN 1 ELSE 0 END) as invitados,
        SUM(CASE WHEN tipo_usuario = 'alumno' THEN 1 ELSE 0 END) as alumnos,
        SUM(CASE WHEN tipo_usuario = 'profesor' THEN 1 ELSE 0 END) as profesores
      FROM chat_conversaciones
    `);
    
    const [avgTime] = await pool.query(`
      SELECT 
        AVG(tiempo_primera_respuesta) as tiempo_promedio_respuesta,
        AVG(tiempo_total_conversacion) as tiempo_promedio_conversacion
      FROM chat_estadisticas
      WHERE tiempo_primera_respuesta IS NOT NULL
    `);
    
    res.json({
      success: true,
      data: {
        ...stats[0],
        ...avgTime[0]
      }
    });
    
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar estadísticas"
    });
  }
});


router.get("/mi-conversacion", async (req, res) => {
  try {
    const { tipo_usuario, id_usuario } = req.query;
    
    if (!tipo_usuario || !id_usuario) {
      return res.status(400).json({
        success: false,
        message: "Parámetros requeridos: tipo_usuario, id_usuario"
      });
    }
    
    const [conversaciones] = await pool.query(`
      SELECT 
        c.*,
        (SELECT mensaje FROM chat_mensajes 
         WHERE id_conversacion = c.id_conversacion 
         ORDER BY fecha_envio DESC LIMIT 1) as ultimo_mensaje,
        (SELECT fecha_envio FROM chat_mensajes 
         WHERE id_conversacion = c.id_conversacion 
         ORDER BY fecha_envio DESC LIMIT 1) as fecha_ultimo_mensaje
      FROM chat_conversaciones c
      WHERE tipo_usuario = ? AND id_usuario = ?
        AND estado IN ('pendiente', 'activa')
      ORDER BY fecha_inicio DESC
      LIMIT 1
    `, [tipo_usuario, id_usuario]);
    
    if (conversaciones.length === 0) {
      return res.json({
        success: true,
        data: null,
        message: "No hay conversación activa"
      });
    }
    
    const conversacion = conversaciones[0];
    
    const [mensajes] = await pool.query(`
      SELECT 
        cm.*,
        COALESCE(
          p_alumno.avatar, 
          p_profesor.avatar, 
          p_admin.avatar,
          p_usuario.avatar,
          CASE WHEN cm.tipo_remitente = 'admin' THEN '/images/logo.png' ELSE NULL END
        ) as avatar_remitente
      FROM chat_mensajes cm
      LEFT JOIN alumnos a ON cm.tipo_remitente = 'alumno' AND a.id_alumno = cm.id_remitente
      LEFT JOIN personas p_alumno ON a.id_persona = p_alumno.id_persona
      LEFT JOIN profesores pr ON cm.tipo_remitente = 'profesor' AND pr.id_profesor = cm.id_remitente
      LEFT JOIN personas p_profesor ON pr.id_persona = p_profesor.id_persona
      LEFT JOIN administradores adm ON cm.tipo_remitente = 'admin' AND adm.id_administrador = cm.id_remitente
      LEFT JOIN personas p_admin ON adm.id_persona = p_admin.id_persona
      LEFT JOIN usuarios u ON u.id_usuario = cm.id_remitente
      LEFT JOIN personas p_usuario ON u.id_persona = p_usuario.id_persona
      WHERE cm.id_conversacion = ?
      ORDER BY cm.fecha_envio ASC
    `, [conversacion.id_conversacion]);

    console.log(` Mi conversación - Mensajes con avatares:`, mensajes.map(m => ({
      id: m.id_mensaje,
      tipo: m.tipo_remitente,
      id_rem: m.id_remitente,
      avatar: m.avatar_remitente
    })));
    
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    res.json({
      success: true,
      data: {
        conversacion,
        mensajes
      }
    });
    
  } catch (error) {
    console.error("Error al obtener conversación del usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al cargar conversación"
    });
  }
});


router.delete("/conversacion/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_admin } = req.body; // ID del administrador que elimina
    
    console.log(`️ Admin ${id_admin} eliminando conversación ${id}`);
    
    const [conversacion] = await pool.query(`
      SELECT * FROM chat_conversaciones WHERE id_conversacion = ?
    `, [id]);
    
    if (conversacion.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversación no encontrada"
      });
    }
    
    await pool.query(`
      DELETE FROM chat_conversaciones WHERE id_conversacion = ?
    `, [id]);
    
    console.log(` Conversación ${id} eliminada exitosamente`);
    
    res.json({
      success: true,
      message: "Conversación eliminada exitosamente",
      data: {
        id_conversacion: id,
        tipo_usuario: conversacion[0].tipo_usuario,
        id_usuario: conversacion[0].id_usuario
      }
    });
    
  } catch (error) {
    console.error("Error al eliminar conversación:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar conversación"
    });
  }
});


router.post("/upload", uploadChatFile.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No se recibió ningún archivo"
      });
    }
    
    const { id_conversacion, tipo_remitente, id_remitente, nombre_remitente } = req.body;
    
    if (!id_conversacion || !tipo_remitente || !nombre_remitente) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error al eliminar archivo:', err);
      }
      return res.status(400).json({
        success: false,
        message: "Faltan datos requeridos"
      });
    }
    
    const ext = path.extname(req.file.originalname).toLowerCase();
    let tipoArchivo = 'file';
    if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
      tipoArchivo = 'image';
    } else if (ext === '.pdf') {
      tipoArchivo = 'pdf';
    }
    
    let rutaArchivo;
    
    if (isProduction) {
      const resourceType = tipoArchivo === 'pdf' ? 'raw' : 'image';
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'cemi/chat-files',
        resource_type: resourceType,
        access_mode: 'public',
        type: 'upload',
        public_id: `chat-${Date.now()}-${path.basename(req.file.originalname, ext)}`
      });
      
      rutaArchivo = uploadResult.secure_url;
      
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Error al eliminar archivo temporal:', err);
      }
      
      console.log(' Archivo subido a Cloudinary:', rutaArchivo);
    } else {
      rutaArchivo = `/uploads/chat-files/${req.file.filename}`;
      console.log(' Archivo guardado localmente:', rutaArchivo);
    }
    
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM chat_mensajes LIKE 'archivo_adjunto'
    `);
    
    if (columns.length === 0) {
      console.log('️ Creando columnas archivo_adjunto y tipo_archivo...');
      await pool.query(`
        ALTER TABLE chat_mensajes 
        ADD COLUMN archivo_adjunto VARCHAR(500) NULL,
        ADD COLUMN tipo_archivo VARCHAR(50) NULL
      `);
      console.log(' Columnas creadas exitosamente');
    }
    
    const [result] = await pool.query(`
      INSERT INTO chat_mensajes (
        id_conversacion,
        tipo_remitente,
        id_remitente,
        nombre_remitente,
        mensaje,
        archivo_adjunto,
        tipo_archivo
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id_conversacion,
      tipo_remitente,
      id_remitente || null,
      nombre_remitente,
      `[Archivo adjunto: ${req.file.originalname}]`, // Mensaje descriptivo
      rutaArchivo,
      tipoArchivo
    ]);
    
    const isAdmin = tipo_remitente === 'admin';
    if (!isAdmin) {
      await pool.query(`
        UPDATE chat_conversaciones
        SET mensajes_no_leidos_admin = mensajes_no_leidos_admin + 1,
            ultima_actividad = CURRENT_TIMESTAMP
        WHERE id_conversacion = ?
      `, [id_conversacion]);
    } else {
      await pool.query(`
        UPDATE chat_conversaciones
        SET mensajes_no_leidos_usuario = mensajes_no_leidos_usuario + 1,
            ultima_actividad = CURRENT_TIMESTAMP
        WHERE id_conversacion = ?
      `, [id_conversacion]);
    }
    
    console.log(` Archivo subido: ${req.file.originalname} (${tipoArchivo}) en conversación ${id_conversacion}`);
    
    if (chatServerInstance) {
      const mensajeWS = {
        id_mensaje: result.insertId,
        id_conversacion: parseInt(id_conversacion),
        tipo_remitente,
        id_remitente: id_remitente || null,
        nombre_remitente,
        mensaje: `[Archivo adjunto: ${req.file.originalname}]`,
        archivo_adjunto: rutaArchivo,
        tipo_archivo: tipoArchivo,
        fecha_envio: new Date().toISOString()
      };
      
      chatServerInstance.broadcastToConversation(id_conversacion, {
        type: 'message',
        data: mensajeWS
      });
      
    }
    
    res.json({
      success: true,
      message: "Archivo subido exitosamente",
      data: {
        id_mensaje: result.insertId,
        archivo_adjunto: rutaArchivo,
        tipo_archivo: tipoArchivo,
        nombre_archivo: req.file.originalname,
        tamano: req.file.size
      }
    });
    
  } catch (error) {
    console.error("Error al subir archivo:", error);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: "Error al subir archivo"
    });
  }
});

export default router;



