import express from "express";
import pool from "../utils/db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production' || process.env.MYSQLHOST;

// Configuración de Multer para archivos del chat
const chatStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../../uploads/classroom-chat');
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
  const allowedTypes = /jpeg|jpg|png|webp|gif|pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/') || 
                   file.mimetype === 'application/pdf' ||
                   file.mimetype === 'application/msword' ||
                   file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes, PDFs y documentos Word'));
  }
};

const uploadChatFile = multer({
  storage: chatStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  }
});

// =====================================================
// GET /api/classroom-chat/contactos/:tipo/:id
// Obtener lista de profesores y compañeros de curso
// =====================================================
router.get("/contactos/:tipo/:id", async (req, res) => {
  try {
    const { tipo, id } = req.params;
    const { id_curso } = req.query; // Opcional: filtrar por curso específico
    
    let contactos = {
      profesores: [],
      compañeros: []
    };
    
    if (tipo === 'alumno') {
      // Obtener los cursos del alumno
      let cursosQuery = `
        SELECT DISTINCT c.id_curso, c.nombre_curso
        FROM inscripciones i
        JOIN cursos c ON i.id_curso = c.id_curso
        WHERE i.id_alumno = ? AND i.estado = 'activo'
      `;
      let cursosParams = [id];
      
      if (id_curso) {
        cursosQuery += ' AND c.id_curso = ?';
        cursosParams.push(id_curso);
      }
      
      const [cursos] = await pool.query(cursosQuery, cursosParams);
      
      if (cursos.length === 0) {
        return res.json(contactos);
      }
      
      const cursosIds = cursos.map(c => c.id_curso);
      
      // Obtener profesores de esos cursos
      const [profesores] = await pool.query(`
        SELECT DISTINCT
          pr.id_profesor,
          CONCAT(p.nombre, ' ', p.apellido) as nombre_completo,
          p.avatar,
          c.nombre_curso,
          c.id_curso,
          'profesor' as tipo,
          p.nombre as sort_nombre,
          p.apellido as sort_apellido
        FROM cursos c
        JOIN profesores pr ON c.id_profesor = pr.id_profesor
        JOIN personas p ON pr.id_persona = p.id_persona
        WHERE c.id_curso IN (${cursosIds.map(() => '?').join(',')})
        ORDER BY sort_nombre, sort_apellido
      `, cursosIds);
      
      // Obtener compañeros (otros alumnos de los mismos cursos) - SIN duplicados
      const [companeros] = await pool.query(`
        SELECT 
          a.id_alumno,
          CONCAT(p.nombre, ' ', p.apellido) as nombre_completo,
          p.avatar,
          'alumno' as tipo,
          p.nombre as sort_nombre,
          p.apellido as sort_apellido
        FROM inscripciones i
        JOIN alumnos a ON i.id_alumno = a.id_alumno
        JOIN personas p ON a.id_persona = p.id_persona
        WHERE i.id_curso IN (${cursosIds.map(() => '?').join(',')}) 
          AND i.estado = 'activo'
          AND a.id_alumno != ?
        GROUP BY a.id_alumno, p.nombre, p.apellido, p.avatar
        ORDER BY sort_nombre, sort_apellido
      `, [...cursosIds, id]);
      
      contactos.profesores = profesores;
      contactos.compañeros = companeros;
      
    } else if (tipo === 'profesor') {
      // Obtener los cursos del profesor
      let cursosQuery = `
        SELECT DISTINCT id_curso, nombre_curso
        FROM cursos
        WHERE id_profesor = ?
      `;
      let cursosParams = [id];
      
      if (id_curso) {
        cursosQuery += ' AND id_curso = ?';
        cursosParams.push(id_curso);
      }
      
      const [cursos] = await pool.query(cursosQuery, cursosParams);
      
      if (cursos.length === 0) {
        return res.json(contactos);
      }
      
      const cursosIds = cursos.map(c => c.id_curso);
      
      // Para profesores: solo obtener alumnos de sus cursos (sin duplicados)
      const [alumnos] = await pool.query(`
        SELECT 
          a.id_alumno,
          CONCAT(p.nombre, ' ', p.apellido) as nombre_completo,
          p.avatar,
          'alumno' as tipo,
          p.nombre as sort_nombre,
          p.apellido as sort_apellido
        FROM inscripciones i
        JOIN alumnos a ON i.id_alumno = a.id_alumno
        JOIN personas p ON a.id_persona = p.id_persona
        WHERE i.id_curso IN (${cursosIds.map(() => '?').join(',')}) AND i.estado = 'activo'
        GROUP BY a.id_alumno, p.nombre, p.apellido, p.avatar
        ORDER BY sort_nombre, sort_apellido
      `, cursosIds);
      
      // Profesores NO ven otros profesores - solo tienen una lista de alumnos
      contactos.profesores = [];
      contactos.alumnos = alumnos; // Lista única de alumnos para profesores
    }
    
    res.json(contactos);
    
  } catch (error) {
    console.error("Error al obtener contactos:", error);
    res.status(500).json({ message: "Error al obtener contactos" });
  }
});

// =====================================================
// GET /api/classroom-chat/curso-comun/:tipo1/:id1/:tipo2/:id2
// Buscar el primer curso en común entre dos usuarios
// =====================================================
router.get("/curso-comun/:tipo1/:id1/:tipo2/:id2", async (req, res) => {
  try {
    const { tipo1, id1, tipo2, id2 } = req.params;
    
    let query = '';
    let params = [];
    
    if (tipo1 === 'alumno' && tipo2 === 'alumno') {
      // Buscar cursos en común entre dos alumnos
      query = `
        SELECT i1.id_curso 
        FROM inscripciones i1
        JOIN inscripciones i2 ON i1.id_curso = i2.id_curso
        WHERE i1.id_alumno = ? AND i2.id_alumno = ?
          AND i1.estado = 'activo' AND i2.estado = 'activo'
        LIMIT 1
      `;
      params = [id1, id2];
    } else if (tipo1 === 'alumno' && tipo2 === 'profesor') {
      // Buscar cursos del alumno donde el profesor enseña
      query = `
        SELECT i.id_curso 
        FROM inscripciones i
        JOIN cursos c ON i.id_curso = c.id_curso
        WHERE i.id_alumno = ? AND c.id_profesor = ? AND i.estado = 'activo'
        LIMIT 1
      `;
      params = [id1, id2];
    } else if (tipo1 === 'profesor' && tipo2 === 'alumno') {
      // Buscar cursos del profesor donde el alumno está inscrito
      query = `
        SELECT c.id_curso 
        FROM cursos c
        JOIN inscripciones i ON c.id_curso = i.id_curso
        WHERE c.id_profesor = ? AND i.id_alumno = ? AND i.estado = 'activo'
        LIMIT 1
      `;
      params = [id1, id2];
    } else if (tipo1 === 'profesor' && tipo2 === 'profesor') {
      // No debería haber comunicación entre profesores según los requisitos
      return res.status(400).json({ message: "No se permite comunicación entre profesores" });
    }
    
    const [result] = await pool.query(query, params);
    
    if (result.length === 0) {
      return res.status(404).json({ message: "No se encontró un curso en común" });
    }
    
    res.json({ id_curso: result[0].id_curso });
    
  } catch (error) {
    console.error("Error al buscar curso en común:", error);
    res.status(500).json({ message: "Error al buscar curso en común" });
  }
});

// =====================================================
// POST /api/classroom-chat/conversacion
// Iniciar o obtener conversación existente con un usuario
// =====================================================
router.post("/conversacion", async (req, res) => {
  try {
    const { 
      mi_tipo, 
      mi_id, 
      contacto_tipo, 
      contacto_id, 
      id_curso 
    } = req.body;
    
    if (!mi_tipo || !mi_id || !contacto_tipo || !contacto_id || !id_curso) {
      return res.status(400).json({ 
        success: false, 
        message: "Faltan datos requeridos" 
      });
    }
    
    // Ordenar participantes para evitar duplicados
    let p1_tipo, p1_id, p2_tipo, p2_id;
    if (mi_tipo === 'profesor' || (mi_tipo === 'alumno' && contacto_tipo === 'alumno' && mi_id < contacto_id)) {
      p1_tipo = mi_tipo;
      p1_id = mi_id;
      p2_tipo = contacto_tipo;
      p2_id = contacto_id;
    } else {
      p1_tipo = contacto_tipo;
      p1_id = contacto_id;
      p2_tipo = mi_tipo;
      p2_id = mi_id;
    }
    
    // Buscar conversación existente
    const [existente] = await pool.query(`
      SELECT id_conversacion, oculto_participante1, oculto_participante2,
             participante1_tipo, participante1_id
      FROM classroom_conversaciones
      WHERE id_curso = ?
        AND participante1_tipo = ? AND participante1_id = ?
        AND participante2_tipo = ? AND participante2_id = ?
    `, [id_curso, p1_tipo, p1_id, p2_tipo, p2_id]);
    
    let id_conversacion;
    
    if (existente.length > 0) {
      id_conversacion = existente[0].id_conversacion;
      
      // Si el usuario actual tenía la conversación oculta, reactivarla
      const esParticipante1 = existente[0].participante1_tipo === mi_tipo && 
                              existente[0].participante1_id == mi_id;
      
      if (esParticipante1 && existente[0].oculto_participante1) {
        await pool.query(`
          UPDATE classroom_conversaciones 
          SET oculto_participante1 = FALSE 
          WHERE id_conversacion = ?
        `, [id_conversacion]);
      } else if (!esParticipante1 && existente[0].oculto_participante2) {
        await pool.query(`
          UPDATE classroom_conversaciones 
          SET oculto_participante2 = FALSE 
          WHERE id_conversacion = ?
        `, [id_conversacion]);
      }
    } else {
      // Crear nueva conversación
      const [result] = await pool.query(`
        INSERT INTO classroom_conversaciones 
        (id_curso, participante1_tipo, participante1_id, participante2_tipo, participante2_id)
        VALUES (?, ?, ?, ?, ?)
      `, [id_curso, p1_tipo, p1_id, p2_tipo, p2_id]);
      
      id_conversacion = result.insertId;
    }
    
    // Obtener datos del contacto
    let contactoQuery;
    if (contacto_tipo === 'profesor') {
      contactoQuery = `
        SELECT CONCAT(p.nombre, ' ', p.apellido) as nombre, p.avatar
        FROM profesores pr
        JOIN personas p ON pr.id_persona = p.id_persona
        WHERE pr.id_profesor = ?
      `;
    } else {
      contactoQuery = `
        SELECT CONCAT(p.nombre, ' ', p.apellido) as nombre, p.avatar
        FROM alumnos a
        JOIN personas p ON a.id_persona = p.id_persona
        WHERE a.id_alumno = ?
      `;
    }
    
    const [contactoData] = await pool.query(contactoQuery, [contacto_id]);
    
    res.json({
      success: true,
      id_conversacion,
      contacto: contactoData[0] || { nombre: 'Usuario', avatar: null }
    });
    
  } catch (error) {
    console.error("Error al iniciar conversación:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al iniciar conversación" 
    });
  }
});

// =====================================================
// GET /api/classroom-chat/conversacion/:id
// Obtener mensajes de una conversación
// =====================================================
router.get("/conversacion/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { mi_tipo, mi_id } = req.query;
    
    // Verificar que el usuario es participante
    const [conv] = await pool.query(`
      SELECT * FROM classroom_conversaciones WHERE id_conversacion = ?
    `, [id]);
    
    if (conv.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Conversación no encontrada" 
      });
    }
    
    const conversacion = conv[0];
    
    // Verificar participación
    const esParticipante = 
      (conversacion.participante1_tipo === mi_tipo && conversacion.participante1_id == mi_id) ||
      (conversacion.participante2_tipo === mi_tipo && conversacion.participante2_id == mi_id);
    
    if (!esParticipante) {
      return res.status(403).json({ 
        success: false, 
        message: "No tienes acceso a esta conversación" 
      });
    }
    
    // Obtener mensajes con información del remitente
    const [mensajes] = await pool.query(`
      SELECT 
        m.*,
        CASE 
          WHEN m.remitente_tipo = 'profesor' THEN (
            SELECT CONCAT(p.nombre, ' ', p.apellido) 
            FROM profesores pr 
            JOIN personas p ON pr.id_persona = p.id_persona 
            WHERE pr.id_profesor = m.remitente_id
          )
          ELSE (
            SELECT CONCAT(p.nombre, ' ', p.apellido) 
            FROM alumnos a 
            JOIN personas p ON a.id_persona = p.id_persona 
            WHERE a.id_alumno = m.remitente_id
          )
        END as nombre_remitente,
        CASE 
          WHEN m.remitente_tipo = 'profesor' THEN (
            SELECT p.avatar 
            FROM profesores pr 
            JOIN personas p ON pr.id_persona = p.id_persona 
            WHERE pr.id_profesor = m.remitente_id
          )
          ELSE (
            SELECT p.avatar 
            FROM alumnos a 
            JOIN personas p ON a.id_persona = p.id_persona 
            WHERE a.id_alumno = m.remitente_id
          )
        END as avatar_remitente
      FROM classroom_mensajes m
      WHERE m.id_conversacion = ?
      ORDER BY m.fecha_envio ASC
    `, [id]);
    
    res.json({
      success: true,
      conversacion,
      mensajes
    });
    
  } catch (error) {
    console.error("Error al obtener conversación:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener conversación" 
    });
  }
});

// =====================================================
// POST /api/classroom-chat/mensaje
// Enviar mensaje (con soporte para archivos)
// =====================================================
router.post("/mensaje", uploadChatFile.single('archivo'), async (req, res) => {
  try {
    const { id_conversacion, remitente_tipo, remitente_id, mensaje } = req.body;
    
    if (!id_conversacion || !remitente_tipo || !remitente_id) {
      return res.status(400).json({ 
        success: false, 
        message: "Faltan datos requeridos" 
      });
    }
    
    if (!mensaje && !req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "Debe enviar un mensaje o archivo" 
      });
    }
    
    let archivo_adjunto = null;
    let tipo_archivo = null;
    let nombre_archivo = null;
    
    // Procesar archivo si existe
    if (req.file) {
      nombre_archivo = req.file.originalname;
      tipo_archivo = req.file.mimetype;
      
      if (isProduction) {
        // Subir a Cloudinary en producción
        try {
          const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'classroom-chat',
            resource_type: 'auto'
          });
          archivo_adjunto = result.secure_url;
          
          // Eliminar archivo temporal
          fs.unlinkSync(req.file.path);
        } catch (uploadError) {
          console.error('Error al subir a Cloudinary:', uploadError);
          return res.status(500).json({ 
            success: false, 
            message: "Error al subir archivo" 
          });
        }
      } else {
        // En desarrollo, usar ruta local
        archivo_adjunto = `/uploads/classroom-chat/${req.file.filename}`;
      }
    }
    
    // Insertar mensaje
    const [result] = await pool.query(`
      INSERT INTO classroom_mensajes 
      (id_conversacion, remitente_tipo, remitente_id, mensaje, archivo_adjunto, tipo_archivo, nombre_archivo)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [id_conversacion, remitente_tipo, remitente_id, mensaje || '', archivo_adjunto, tipo_archivo, nombre_archivo]);
    
    const id_mensaje = result.insertId;
    
    // Actualizar última actividad de la conversación
    await pool.query(`
      UPDATE classroom_conversaciones 
      SET ultima_actividad = CURRENT_TIMESTAMP 
      WHERE id_conversacion = ?
    `, [id_conversacion]);
    
    // Obtener datos del remitente
    let remitenteQuery;
    if (remitente_tipo === 'profesor') {
      remitenteQuery = `
        SELECT CONCAT(p.nombre, ' ', p.apellido) as nombre, p.avatar
        FROM profesores pr
        JOIN personas p ON pr.id_persona = p.id_persona
        WHERE pr.id_profesor = ?
      `;
    } else {
      remitenteQuery = `
        SELECT CONCAT(p.nombre, ' ', p.apellido) as nombre, p.avatar
        FROM alumnos a
        JOIN personas p ON a.id_persona = p.id_persona
        WHERE a.id_alumno = ?
      `;
    }
    
    const [remitenteData] = await pool.query(remitenteQuery, [remitente_id]);
    
    const mensajeCompleto = {
      id_mensaje,
      id_conversacion: parseInt(id_conversacion),
      remitente_tipo,
      remitente_id: parseInt(remitente_id),
      mensaje: mensaje || '',
      archivo_adjunto,
      tipo_archivo,
      nombre_archivo,
      leido: false,
      fecha_envio: new Date(),
      nombre_remitente: remitenteData[0]?.nombre || 'Usuario',
      avatar_remitente: remitenteData[0]?.avatar || null
    };
    
    res.json({
      success: true,
      mensaje: mensajeCompleto
    });
    
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al enviar mensaje" 
    });
  }
});

// =====================================================
// GET /api/classroom-chat/no-leidos/:tipo/:id
// Contar mensajes no leídos del usuario
// =====================================================
router.get("/no-leidos/:tipo/:id", async (req, res) => {
  try {
    const { tipo, id } = req.params;
    
    // Obtener todas las conversaciones donde participa el usuario
    const [conversaciones] = await pool.query(`
      SELECT id_conversacion
      FROM classroom_conversaciones
      WHERE (participante1_tipo = ? AND participante1_id = ?)
         OR (participante2_tipo = ? AND participante2_id = ?)
    `, [tipo, id, tipo, id]);
    
    if (conversaciones.length === 0) {
      return res.json({ total: 0, por_conversacion: [] });
    }
    
    const convIds = conversaciones.map(c => c.id_conversacion);
    
    // Contar mensajes no leídos que NO fueron enviados por el usuario
    const [noLeidos] = await pool.query(`
      SELECT 
        id_conversacion,
        COUNT(*) as cantidad
      FROM classroom_mensajes
      WHERE id_conversacion IN (?)
        AND leido = FALSE
        AND NOT (remitente_tipo = ? AND remitente_id = ?)
      GROUP BY id_conversacion
    `, [convIds, tipo, id]);
    
    const total = noLeidos.reduce((sum, c) => sum + c.cantidad, 0);
    
    res.json({
      total,
      por_conversacion: noLeidos
    });
    
  } catch (error) {
    console.error("Error al contar no leídos:", error);
    res.status(500).json({ message: "Error al contar mensajes no leídos" });
  }
});

// =====================================================
// PUT /api/classroom-chat/marcar-leido/:id
// Marcar mensajes como leídos
// =====================================================
router.put("/marcar-leido/:id", async (req, res) => {
  try {
    const { id } = req.params; // id de la conversación
    const { mi_tipo, mi_id } = req.body;
    
    // Marcar como leídos todos los mensajes que NO son míos
    await pool.query(`
      UPDATE classroom_mensajes
      SET leido = TRUE
      WHERE id_conversacion = ?
        AND NOT (remitente_tipo = ? AND remitente_id = ?)
        AND leido = FALSE
    `, [id, mi_tipo, mi_id]);
    
    res.json({ success: true });
    
  } catch (error) {
    console.error("Error al marcar como leído:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al marcar como leído" 
    });
  }
});

// =====================================================
// GET /api/classroom-chat/conversaciones/:tipo/:id
// Obtener todas las conversaciones del usuario (excluyendo las ocultas)
// =====================================================
router.get("/conversaciones/:tipo/:id", async (req, res) => {
  try {
    const { tipo, id } = req.params;
    
    const [conversaciones] = await pool.query(`
      SELECT 
        cc.*,
        c.nombre_curso,
        -- Datos del otro participante
        CASE 
          WHEN cc.participante1_tipo = ? AND cc.participante1_id = ? THEN cc.participante2_tipo
          ELSE cc.participante1_tipo
        END as contacto_tipo,
        CASE 
          WHEN cc.participante1_tipo = ? AND cc.participante1_id = ? THEN cc.participante2_id
          ELSE cc.participante1_id
        END as contacto_id,
        -- Último mensaje
        (SELECT mensaje FROM classroom_mensajes 
         WHERE id_conversacion = cc.id_conversacion 
         ORDER BY fecha_envio DESC LIMIT 1) as ultimo_mensaje,
        (SELECT fecha_envio FROM classroom_mensajes 
         WHERE id_conversacion = cc.id_conversacion 
         ORDER BY fecha_envio DESC LIMIT 1) as fecha_ultimo_mensaje,
        -- Si el último mensaje tiene archivo adjunto
        (SELECT archivo_adjunto FROM classroom_mensajes 
         WHERE id_conversacion = cc.id_conversacion 
         ORDER BY fecha_envio DESC LIMIT 1) as ultimo_archivo,
        -- Mensajes no leídos
        (SELECT COUNT(*) FROM classroom_mensajes 
         WHERE id_conversacion = cc.id_conversacion 
         AND leido = FALSE 
         AND NOT (remitente_tipo = ? AND remitente_id = ?)) as no_leidos
      FROM classroom_conversaciones cc
      JOIN cursos c ON cc.id_curso = c.id_curso
      WHERE ((cc.participante1_tipo = ? AND cc.participante1_id = ? AND cc.oculto_participante1 = FALSE)
         OR (cc.participante2_tipo = ? AND cc.participante2_id = ? AND cc.oculto_participante2 = FALSE))
      ORDER BY cc.ultima_actividad DESC
    `, [tipo, id, tipo, id, tipo, id, tipo, id, tipo, id]);
    
    // Obtener nombres y avatares de los contactos
    for (let conv of conversaciones) {
      let contactoQuery;
      if (conv.contacto_tipo === 'profesor') {
        contactoQuery = `
          SELECT CONCAT(p.nombre, ' ', p.apellido) as nombre, p.avatar
          FROM profesores pr
          JOIN personas p ON pr.id_persona = p.id_persona
          WHERE pr.id_profesor = ?
        `;
      } else {
        contactoQuery = `
          SELECT CONCAT(p.nombre, ' ', p.apellido) as nombre, p.avatar
          FROM alumnos a
          JOIN personas p ON a.id_persona = p.id_persona
          WHERE a.id_alumno = ?
        `;
      }
      
      const [contactoData] = await pool.query(contactoQuery, [conv.contacto_id]);
      conv.contacto_nombre = contactoData[0]?.nombre || 'Usuario';
      conv.contacto_avatar = contactoData[0]?.avatar || null;
    }
    
    res.json(conversaciones);
    
  } catch (error) {
    console.error("Error al obtener conversaciones:", error);
    res.status(500).json({ message: "Error al obtener conversaciones" });
  }
});

// =====================================================
// DELETE /api/classroom-chat/conversacion/:id
// Ocultar conversación para un usuario (soft delete individual)
// =====================================================
router.delete("/conversacion/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { mi_tipo, mi_id } = req.body;
    
    // Verificar que el usuario es parte de la conversación y obtener su posición
    const [conversacion] = await pool.query(`
      SELECT id_conversacion,
             participante1_tipo, participante1_id,
             participante2_tipo, participante2_id
      FROM classroom_conversaciones
      WHERE id_conversacion = ?
        AND ((participante1_tipo = ? AND participante1_id = ?)
          OR (participante2_tipo = ? AND participante2_id = ?))
    `, [id, mi_tipo, mi_id, mi_tipo, mi_id]);
    
    if (conversacion.length === 0) {
      return res.status(403).json({ 
        success: false, 
        message: "No tienes permiso para eliminar esta conversación" 
      });
    }
    
    const conv = conversacion[0];
    
    // Determinar si es participante1 o participante2
    const esParticipante1 = conv.participante1_tipo === mi_tipo && conv.participante1_id == mi_id;
    
    // Hacer soft delete solo para este usuario
    if (esParticipante1) {
      await pool.query(`
        UPDATE classroom_conversaciones 
        SET oculto_participante1 = TRUE 
        WHERE id_conversacion = ?
      `, [id]);
    } else {
      await pool.query(`
        UPDATE classroom_conversaciones 
        SET oculto_participante2 = TRUE 
        WHERE id_conversacion = ?
      `, [id]);
    }
    
    res.json({ success: true, message: "Conversación eliminada de tu bandeja" });
    
  } catch (error) {
    console.error("Error al eliminar conversación:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al eliminar conversación" 
    });
  }
});

export default router;
