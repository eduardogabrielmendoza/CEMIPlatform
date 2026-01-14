import express from "express";
import pool from "../utils/db.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function ensureBannerColumn() {
  try {
    const [columns] = await pool.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'personas' AND COLUMN_NAME = 'banner'`
    );
    if (columns.length === 0) {
      await pool.query('ALTER TABLE personas ADD COLUMN banner VARCHAR(500) DEFAULT NULL');
      console.log(' Campo banner agregado a tabla personas');
    }
  } catch (error) {
    console.error(' Error verificando campo banner:', error.message);
  }
}
ensureBannerColumn();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-u${req.params.userId}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    console.log(' Validando archivo:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    });
    
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    console.log('  → Extensión válida:', extname);
    console.log('  → Mimetype válido:', mimetype);
    
    if (extname && mimetype) {
      console.log('   Archivo aceptado');
      return cb(null, true);
    } else {
      console.log('   Archivo rechazado');
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, GIF, WebP, AVIF)'));
    }
  }
});


router.get("/perfil/:userId", async (req, res) => {
  const { userId } = req.params;
  const { tipo } = req.query; // Obtener tipo de la query string
  console.log(` [GET /perfil/:userId] Buscando perfil para userId: ${userId}, tipo: ${tipo || 'no especificado'}`);

  try {
    let usuarios = [];
    
    if (tipo === 'alumno') {
      console.log('  → Buscando por id_alumno (tipo especificado)...');
      [usuarios] = await pool.query(
        `SELECT u.id_usuario, u.username, u.id_persona, u.fecha_creacion,
                p.nombre, p.apellido, 
                p.mail as email, 
                p.telefono, p.fecha_nacimiento, 
                p.direccion, p.biografia, p.avatar,
                per.nombre_perfil as rol,
                alum.id_alumno,
                NULL as id_profesor
         FROM alumnos alum
         JOIN personas p ON alum.id_persona = p.id_persona
         JOIN usuarios u ON p.id_persona = u.id_persona
         JOIN perfiles per ON u.id_perfil = per.id_perfil
         WHERE alum.id_alumno = ?`,
        [userId]
      );
    } else if (tipo === 'profesor') {
      console.log('  → Buscando por id_profesor (tipo especificado)...');
      [usuarios] = await pool.query(
        `SELECT u.id_usuario, u.username, u.id_persona, u.fecha_creacion,
                p.nombre, p.apellido, 
                p.mail as email, 
                p.telefono, p.fecha_nacimiento, 
                p.direccion, p.biografia, p.avatar,
                per.nombre_perfil as rol,
                NULL as id_alumno,
                prof.id_profesor
         FROM profesores prof
         JOIN personas p ON prof.id_persona = p.id_persona
         JOIN usuarios u ON p.id_persona = u.id_persona
         JOIN perfiles per ON u.id_perfil = per.id_perfil
         WHERE prof.id_profesor = ?`,
        [userId]
      );
    }
    
    if (usuarios.length === 0) {
      console.log('  → Intentando buscar por id_usuario...');
      [usuarios] = await pool.query(
        `SELECT u.id_usuario, u.username, u.id_persona, u.fecha_creacion,
                p.nombre, p.apellido, 
                p.mail as email, 
                p.telefono, p.fecha_nacimiento, 
                p.direccion, p.biografia, p.avatar,
                per.nombre_perfil as rol,
                alum.id_alumno,
                prof.id_profesor
         FROM usuarios u
         JOIN personas p ON u.id_persona = p.id_persona
         JOIN perfiles per ON u.id_perfil = per.id_perfil
         LEFT JOIN alumnos alum ON p.id_persona = alum.id_persona
         LEFT JOIN profesores prof ON p.id_persona = prof.id_persona
         WHERE u.id_usuario = ?`,
        [userId]
      );
    }

    if (usuarios.length === 0) {
      console.log('  → No encontrado por id_usuario, intentando por id_persona...');
      [usuarios] = await pool.query(
        `SELECT u.id_usuario, u.username, u.id_persona, u.fecha_creacion,
                p.nombre, p.apellido, 
                p.mail as email, 
                p.telefono, p.fecha_nacimiento, 
                p.direccion, p.biografia, p.avatar,
                per.nombre_perfil as rol,
                alum.id_alumno,
                prof.id_profesor
         FROM usuarios u
         JOIN personas p ON u.id_persona = p.id_persona
         JOIN perfiles per ON u.id_perfil = per.id_perfil
         LEFT JOIN alumnos alum ON p.id_persona = alum.id_persona
         LEFT JOIN profesores prof ON p.id_persona = prof.id_persona
         WHERE p.id_persona = ?`,
        [userId]
      );
    }

    if (usuarios.length === 0) {
      console.log('  → No encontrado por id_persona, intentando por id_profesor...');
      [usuarios] = await pool.query(
        `SELECT u.id_usuario, u.username, u.id_persona, u.fecha_creacion,
                p.nombre, p.apellido, 
                p.mail as email, 
                p.telefono, p.fecha_nacimiento, 
                p.direccion, p.biografia, p.avatar,
                per.nombre_perfil as rol,
                NULL as id_alumno,
                prof.id_profesor
         FROM profesores prof
         JOIN personas p ON prof.id_persona = p.id_persona
         JOIN usuarios u ON p.id_persona = u.id_persona
         JOIN perfiles per ON u.id_perfil = per.id_perfil
         WHERE prof.id_profesor = ?`,
        [userId]
      );
    }

    if (usuarios.length === 0) {
      console.log('  → No encontrado por id_profesor, intentando por id_alumno...');
      [usuarios] = await pool.query(
        `SELECT u.id_usuario, u.username, u.id_persona, u.fecha_creacion,
                p.nombre, p.apellido, 
                p.mail as email, 
                p.telefono, p.fecha_nacimiento, 
                p.direccion, p.biografia, p.avatar,
                per.nombre_perfil as rol,
                alum.id_alumno,
                NULL as id_profesor
         FROM alumnos alum
         JOIN personas p ON alum.id_persona = p.id_persona
         JOIN usuarios u ON p.id_persona = u.id_persona
         JOIN perfiles per ON u.id_perfil = per.id_perfil
         WHERE alum.id_alumno = ?`,
        [userId]
      );
    }

    if (usuarios.length === 0) {
      console.log('   Usuario no encontrado en ninguna tabla');
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    const perfil = usuarios[0];
    console.log('   Perfil encontrado:', {
      id_usuario: perfil.id_usuario,
      id_persona: perfil.id_persona,
      id_alumno: perfil.id_alumno,
      id_profesor: perfil.id_profesor,
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      rol: perfil.rol,
      avatar: perfil.avatar
    });

    return res.json({
      success: true,
      perfil: {
        id_usuario: perfil.id_usuario,
        id_persona: perfil.id_persona,
        id_alumno: perfil.id_alumno,
        id_profesor: perfil.id_profesor,
        username: perfil.username,
        nombre: perfil.nombre,
        apellido: perfil.apellido,
        email: perfil.email,
        telefono: perfil.telefono,
        fecha_nacimiento: perfil.fecha_nacimiento,
        direccion: perfil.direccion,
        biografia: perfil.biografia,
        avatar: perfil.avatar,
        rol: perfil.rol,
        fecha_creacion: perfil.fecha_creacion
      }
    });

  } catch (error) {
    console.error(" Error al obtener perfil:", error);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor al obtener el perfil'
    });
  }
});


router.put("/perfil/:userId", async (req, res) => {
  const { userId } = req.params;
  const { nombre, apellido, email, telefono, fecha_nacimiento, direccion, biografia } = req.body;
  
  console.log(` [PUT /perfil/:userId] Actualizando perfil para userId: ${userId}`);
  console.log('   Datos recibidos:', { nombre, apellido, email, telefono, fecha_nacimiento, direccion, biografia });

  try {
    let id_persona = userId;
    
    console.log('  → Buscando id_persona...');
    const [checkUsuario] = await pool.query(
      'SELECT u.id_persona, p.mail FROM usuarios u LEFT JOIN personas p ON u.id_persona = p.id_persona WHERE u.id_usuario = ?',
      [userId]
    );

    let emailActual = null;
    if (checkUsuario.length > 0) {
      id_persona = checkUsuario[0].id_persona;
      emailActual = checkUsuario[0].mail;
      console.log(`   id_persona encontrado: ${id_persona}`);
      console.log(`   Email actual: ${emailActual}`);
    } else {
      console.log(`  ️ No se encontró usuario con id_usuario=${userId}, asumiendo que userId es id_persona`);
      id_persona = userId;
      
      const [personaDirecta] = await pool.query(
        'SELECT mail FROM personas WHERE id_persona = ?',
        [userId]
      );
      
      if (personaDirecta.length > 0) {
        emailActual = personaDirecta[0].mail;
        console.log(`   Email obtenido directamente de personas: ${emailActual}`);
      }
    }

    console.log('  → Verificando columnas de la tabla personas...');
    const [columnas] = await pool.query('SHOW COLUMNS FROM personas');
    const columnasExistentes = columnas.map(col => col.Field);
    console.log('  → Columnas existentes en personas:', columnasExistentes.join(', '));

    const updates = [];
    const values = [];

    if (nombre !== undefined && columnasExistentes.includes('nombre')) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    if (apellido !== undefined && columnasExistentes.includes('apellido')) {
      updates.push('apellido = ?');
      values.push(apellido);
    }
    if (email !== undefined) {
      const emailNormalizado = email ? email.trim().toLowerCase() : '';
      const emailActualNormalizado = emailActual ? emailActual.trim().toLowerCase() : '';
      
      console.log(`  → Comparando emails: "${emailNormalizado}" vs "${emailActualNormalizado}"`);
      
      if (emailNormalizado !== emailActualNormalizado && columnasExistentes.includes('mail')) {
        console.log('  ️ Email cambió, agregando a UPDATE');
        updates.push('mail = ?');
        values.push(email);
      } else if (emailNormalizado === emailActualNormalizado) {
        console.log('  ℹ️ Email no cambió, omitiendo actualización');
      } else {
        console.log('  ️ Columna mail no existe en la tabla');
      }
    }
    if (telefono !== undefined && columnasExistentes.includes('telefono')) {
      updates.push('telefono = ?');
      values.push(telefono || null);
    }
    if (fecha_nacimiento !== undefined && columnasExistentes.includes('fecha_nacimiento')) {
      updates.push('fecha_nacimiento = ?');
      values.push(fecha_nacimiento && fecha_nacimiento.trim() !== '' ? fecha_nacimiento : null);
    }
    if (direccion !== undefined && columnasExistentes.includes('direccion')) {
      updates.push('direccion = ?');
      values.push(direccion || null);
    }
    if (biografia !== undefined && columnasExistentes.includes('biografia')) {
      updates.push('biografia = ?');
      values.push(biografia);
    }

    if (updates.length === 0) {
      console.log('  ️ No hay datos para actualizar o las columnas no existen');
      return res.status(400).json({
        success: false,
        message: 'No hay datos para actualizar o las columnas no existen en la tabla'
      });
    }

    const [personaExists] = await pool.query(
      'SELECT id_persona FROM personas WHERE id_persona = ?',
      [id_persona]
    );

    if (personaExists.length === 0) {
      console.log(`   No existe persona con id_persona=${id_persona}`);
      return res.status(404).json({
        success: false,
        message: 'Persona no encontrada en la base de datos'
      });
    }

    values.push(id_persona);

    const query = `UPDATE personas SET ${updates.join(', ')} WHERE id_persona = ?`;
    console.log('  → Ejecutando query:', query);
    console.log('  → Valores:', values);
    
    const [result] = await pool.query(query, values);
    console.log('  → Resultado:', result);
    console.log('  → Filas afectadas:', result.affectedRows);

    if (result.affectedRows === 0) {
      console.log('  ️ No se actualizó ninguna fila');
      return res.status(400).json({
        success: false,
        message: 'No se pudo actualizar el perfil'
      });
    }

    console.log(`   Perfil actualizado exitosamente para id_persona=${id_persona}`);

    return res.json({
      success: true,
      message: 'Perfil actualizado correctamente'
    });

  } catch (error) {
    console.error(" Error al actualizar perfil:", error);
    console.error(" Error completo:", error.message);
    console.error(" Stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: 'Error del servidor al actualizar el perfil',
      error: error.message
    });
  }
});


router.post("/perfil/:userId/avatar", (req, res) => {
  console.log(` [POST /perfil/:userId/avatar] Subiendo avatar para userId: ${req.params.userId}`);
  
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.error(' ERROR: Credenciales de Cloudinary no configuradas');
    console.log('  CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Configurado' : 'NO configurado');
    console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Configurado' : 'NO configurado');
    console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'Configurado' : 'NO configurado');
    return res.status(500).json({
      success: false,
      message: 'Cloudinary no configurado. Contacta al administrador.'
    });
  }
  
  upload.single('avatar')(req, res, async (err) => {
    if (err) {
      console.error(' Error en multer:', err.message);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    const { userId } = req.params;

    if (!req.file) {
      console.log('️ No se recibió archivo');
      return res.status(400).json({
        success: false,
        message: 'No se recibió ningún archivo'
      });
    }

    try {
      console.log(' Archivo recibido:', req.file.filename);
      console.log(' Tamaño:', req.file.size, 'bytes');
      console.log(' Tipo:', req.file.mimetype);
      
      let id_persona = userId;
      
      console.log('  Buscando id_persona para userId:', userId);
      const [checkUsuario] = await pool.query(
        'SELECT id_persona FROM usuarios WHERE id_usuario = ?',
        [userId]
      );

      if (checkUsuario.length > 0) {
        id_persona = checkUsuario[0].id_persona;
        console.log(`   id_persona encontrado: ${id_persona}`);
      } else {
        console.log(`  No se encontro usuario en tabla usuarios con id_usuario=${userId}, asumiendo userId es id_persona`);
      }

      const [oldAvatar] = await pool.query(
        'SELECT avatar FROM personas WHERE id_persona = ?',
        [id_persona]
      );

      if (oldAvatar.length > 0 && oldAvatar[0].avatar) {
        const oldUrl = oldAvatar[0].avatar;
        if (oldUrl.includes('cloudinary.com')) {
          const publicId = oldUrl.split('/').pop().split('.')[0];
          const folder = `avatars/avatar-u${userId}`;
          try {
            await cloudinary.uploader.destroy(`${folder}/${publicId}`);
            console.log('  Avatar anterior eliminado de Cloudinary');
          } catch (err) {
            console.log('  Error eliminando avatar anterior:', err.message);
          }
        }
      }

      console.log('  Subiendo a Cloudinary...');
      console.log('  Cloudinary config:', {
        cloud_name: cloudinary.config().cloud_name,
        api_key: cloudinary.config().api_key ? 'Configurado' : 'NO configurado'
      });
      
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'avatars',
        public_id: `avatar-u${userId}`,
        overwrite: true,
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' }
        ]
      });

      const avatarUrl = result.secure_url;
      console.log('  Avatar subido a Cloudinary:', avatarUrl);

      fs.unlinkSync(req.file.path);
      console.log('  Archivo temporal eliminado');

      console.log('  Actualizando avatar en BD...');
      const [updateResult] = await pool.query(
        'UPDATE personas SET avatar = ? WHERE id_persona = ?',
        [avatarUrl, id_persona]
      );
      
      console.log('  Resultado UPDATE:', updateResult);
      console.log(`   Avatar actualizado para id_persona=${id_persona}`);

      return res.json({
        success: true,
        message: 'Avatar actualizado correctamente',
        avatar: avatarUrl
      });

    } catch (error) {
      console.error(" Error al subir avatar:", error);
      console.error(" Error message:", error.message);
      console.error(" Error name:", error.name);
      if (error.http_code) {
        console.error(" Cloudinary HTTP code:", error.http_code);
      }
      console.error(" Stack:", error.stack);
      return res.status(500).json({
        success: false,
        message: 'Error del servidor al subir el avatar',
        error: error.message,
        details: error.http_code || error.name
      });
    }
  });
});


const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/banners');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `banner-${req.params.tipo}-${req.params.userId}${ext}`);
  }
});

const uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imagenes (JPEG, PNG, GIF, WebP)'));
  }
});

router.post("/banner/:tipo/:userId", uploadBanner.single('banner'), async (req, res) => {
  const { tipo, userId } = req.params;
  console.log(` [POST /banner/:tipo/:userId] Subiendo banner para ${tipo} ${userId}`);
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se proporciono archivo' });
    }

    let id_persona = null;
    if (tipo === 'alumno') {
      const [alumno] = await pool.query('SELECT id_persona FROM alumnos WHERE id_alumno = ?', [userId]);
      if (alumno.length > 0) id_persona = alumno[0].id_persona;
    } else if (tipo === 'profesor') {
      const [profesor] = await pool.query('SELECT id_persona FROM profesores WHERE id_profesor = ?', [userId]);
      if (profesor.length > 0) id_persona = profesor[0].id_persona;
    }

    if (!id_persona) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const [oldBanner] = await pool.query('SELECT banner FROM personas WHERE id_persona = ?', [id_persona]);
    if (oldBanner.length > 0 && oldBanner[0].banner && oldBanner[0].banner.includes('cloudinary.com')) {
      try {
        const urlParts = oldBanner[0].banner.split('/');
        const publicIdWithExt = urlParts.slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicIdWithExt);
        console.log('  Banner anterior eliminado de Cloudinary');
      } catch (err) {
        console.log('  Error eliminando banner anterior:', err.message);
      }
    }

    console.log('  Subiendo banner a Cloudinary...');
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'banners',
      public_id: `banner-${tipo}-${userId}`,
      overwrite: true,
      transformation: [
        { width: 1200, height: 300, crop: 'fill', gravity: 'center' },
        { quality: 'auto:good' }
      ]
    });

    const bannerUrl = result.secure_url;
    console.log('  Banner subido a Cloudinary:', bannerUrl);

    fs.unlinkSync(req.file.path);

    await pool.query('UPDATE personas SET banner = ? WHERE id_persona = ?', [bannerUrl, id_persona]);
    console.log(`   Banner actualizado en BD para id_persona=${id_persona}`);
    
    return res.json({
      success: true,
      message: 'Banner actualizado correctamente',
      banner: bannerUrl
    });
  } catch (error) {
    console.error(" Error al subir banner:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(500).json({
      success: false,
      message: 'Error del servidor al subir el banner'
    });
  }
});

router.get("/banner/:tipo/:userId", async (req, res) => {
  const { tipo, userId } = req.params;
  
  try {
    let id_persona = null;
    if (tipo === 'alumno') {
      const [alumno] = await pool.query('SELECT id_persona FROM alumnos WHERE id_alumno = ?', [userId]);
      if (alumno.length > 0) id_persona = alumno[0].id_persona;
    } else if (tipo === 'profesor') {
      const [profesor] = await pool.query('SELECT id_persona FROM profesores WHERE id_profesor = ?', [userId]);
      if (profesor.length > 0) id_persona = profesor[0].id_persona;
    }

    if (!id_persona) {
      return res.json({ success: true, banner: null });
    }

    const [persona] = await pool.query('SELECT banner FROM personas WHERE id_persona = ?', [id_persona]);
    
    if (persona.length > 0 && persona[0].banner) {
      return res.json({
        success: true,
        banner: persona[0].banner
      });
    }
    
    return res.json({
      success: true,
      banner: null
    });
  } catch (error) {
    console.error(' Error al obtener banner:', error);
    return res.json({ success: true, banner: null });
  }
});


export default router;


