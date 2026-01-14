import express from "express";
import pool from "../utils/db.js";
import { body, param, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import eventLogger from "../utils/eventLogger.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        a.id_alumno, 
        p.nombre, 
        p.apellido, 
        p.mail, 
        p.dni,
        p.telefono,
        p.avatar,
        a.legajo,
        a.estado,
        a.fecha_registro,
        (SELECT COUNT(*) 
         FROM inscripciones i 
         WHERE i.id_alumno = a.id_alumno AND i.estado = 'activo') as cursos_inscritos
      FROM alumnos a
      JOIN personas p ON a.id_alumno = p.id_persona
      ORDER BY a.id_alumno DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener alumnos" });
  }
});

router.get("/:id",
  [
    param('id')
      .isInt({ min: 1 }).withMessage('ID de alumno inválido')
      .toInt()
  ],
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      message: errors.array()[0].msg 
    });
  }

  try {
    const [alumnoRows] = await pool.query(`
      SELECT 
        a.id_alumno,
        p.id_persona,
        p.nombre, 
        p.apellido, 
        p.mail,
        p.dni,
        p.telefono,
        a.legajo,
        a.estado,
        a.fecha_registro,
        u.username as usuario,
        u.password_hash
      FROM alumnos a
      JOIN personas p ON a.id_alumno = p.id_persona
      LEFT JOIN usuarios u ON a.id_persona = u.id_persona
      WHERE a.id_alumno = ?
    `, [req.params.id]);
    
    if (alumnoRows.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    const alumno = alumnoRows[0];

    const [cursosRows] = await pool.query(`
      SELECT 
        c.id_curso,
        c.nombre_curso,
        i.nombre_idioma as nombre_idioma,
        n.descripcion as nivel,
        c.id_nivel,
        c.horario,
        a.nombre_aula as aula,
        cal.parcial1,
        cal.parcial2,
        cal.final,
        (SELECT AVG((COALESCE(parcial1, 0) + COALESCE(parcial2, 0) + COALESCE(final, 0)) / 
                    (CASE WHEN parcial1 IS NOT NULL THEN 1 ELSE 0 END + 
                     CASE WHEN parcial2 IS NOT NULL THEN 1 ELSE 0 END + 
                     CASE WHEN final IS NOT NULL THEN 1 ELSE 0 END))
         FROM calificaciones cal2
         WHERE cal2.id_alumno = ? AND cal2.id_curso = c.id_curso
           AND (parcial1 IS NOT NULL OR parcial2 IS NOT NULL OR final IS NOT NULL)
        ) as promedio
      FROM inscripciones insc
      JOIN cursos c ON insc.id_curso = c.id_curso
      JOIN idiomas i ON c.id_idioma = i.id_idioma
      LEFT JOIN niveles n ON c.id_nivel = n.id_nivel
      LEFT JOIN aulas a ON c.id_aula = a.id_aula
      LEFT JOIN calificaciones cal ON (cal.id_alumno = ? AND cal.id_curso = c.id_curso)
      WHERE insc.id_alumno = ? AND insc.estado = 'activo'
    `, [req.params.id, req.params.id, req.params.id]);

    const [pagosRows] = await pool.query(`
      SELECT 
        COUNT(*) as total_pagos,
        COALESCE(SUM(monto), 0) as total_pagado,
        COALESCE(AVG(monto), 0) as promedio_pago,
        MAX(fecha_pago) as ultimo_pago
      FROM pagos
      WHERE id_alumno = ?
    `, [req.params.id]);

    const [promedioRows] = await pool.query(`
      SELECT AVG((COALESCE(parcial1, 0) + COALESCE(parcial2, 0) + COALESCE(final, 0)) / 
                 (CASE WHEN parcial1 IS NOT NULL THEN 1 ELSE 0 END + 
                  CASE WHEN parcial2 IS NOT NULL THEN 1 ELSE 0 END + 
                  CASE WHEN final IS NOT NULL THEN 1 ELSE 0 END)) as promedio_general
      FROM calificaciones cal
      WHERE cal.id_alumno = ?
        AND (parcial1 IS NOT NULL OR parcial2 IS NOT NULL OR final IS NOT NULL)
    `, [req.params.id]);

    const response = {
      ...alumno,
      cursos: cursosRows,
      cursos_activos: cursosRows.length,
      promedio_general: promedioRows[0]?.promedio_general ? parseFloat(promedioRows[0].promedio_general).toFixed(2) : null,
      total_pagos: pagosRows[0]?.total_pagos || 0,
      total_pagado: pagosRows[0]?.total_pagado || 0,
      promedio_pago: pagosRows[0]?.promedio_pago || 0,
      ultimo_pago: pagosRows[0]?.ultimo_pago || null
    };

    res.json(response);
  } catch (error) {
    console.error('Error al obtener alumno:', error);
    res.status(500).json({ message: "Error al obtener alumno" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre, apellido, dni, mail, telefono, legajo, username, password } = req.body;

    if (!nombre || !apellido || !mail || !legajo) {
      return res.status(400).json({ 
        success: false, 
        message: "Nombre, apellido, mail y legajo son obligatorios" 
      });
    }

    const [existingMail] = await pool.query(
      'SELECT id_persona FROM personas WHERE mail = ?',
      [mail]
    );

    if (existingMail.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "El email ya está registrado en el sistema" 
      });
    }

    if (dni) {
      const [existingDNI] = await pool.query(
        'SELECT id_persona FROM personas WHERE dni = ?',
        [dni]
      );

      if (existingDNI.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: "El DNI ya está registrado en el sistema" 
        });
      }
    }

    const [existingLegajo] = await pool.query(
      'SELECT id_alumno FROM alumnos WHERE legajo = ?',
      [legajo]
    );

    if (existingLegajo.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "El legajo ya existe" 
      });
    }

    const [personaResult] = await pool.query(
      'INSERT INTO personas (nombre, apellido, mail, dni, telefono) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, mail, dni || null, telefono || null]
    );

    const id_persona = personaResult.insertId;

    const [alumnoResult] = await pool.query(
      'INSERT INTO alumnos (id_alumno, id_persona, legajo, estado, fecha_registro) VALUES (?, ?, ?, ?, CURRENT_DATE)',
      [id_persona, id_persona, legajo, 'activo']
    );

    if (username && password) {
      const [perfilRows] = await pool.query(
        'SELECT id_perfil FROM perfiles WHERE nombre_perfil = ?',
        ['alumno']
      );

      if (perfilRows.length > 0) {
        await pool.query(
          'INSERT INTO usuarios (username, password_hash, password_plain, id_persona, id_perfil) VALUES (?, ?, ?, ?, ?)',
          [username, password, username, id_persona, perfilRows[0].id_perfil]
        );
      }
    }

    res.json({ 
      message: "Alumno creado correctamente", 
      success: true,
      id_alumno: id_persona
    });
    
    // Log del evento
    eventLogger.users.created('Admin', `${nombre} ${apellido}`, 'alumno');
    
  } catch (error) {
    console.error("Error al crear alumno:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.message.includes('mail')) {
        return res.status(400).json({ 
          success: false,
          message: "El email ya está registrado en el sistema" 
        });
      }
      if (error.message.includes('legajo')) {
        return res.status(400).json({ 
          success: false,
          message: "El legajo ya existe" 
        });
      }
    }
    
    res.status(500).json({ 
      success: false,
      message: "Error al crear alumno" 
    });
  }
});

router.post("/:id/credenciales", async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son obligatorios"
      });
    }

    const [alumno] = await pool.query(
      'SELECT id_alumno FROM alumnos WHERE id_alumno = ?',
      [id]
    );

    if (alumno.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Alumno no encontrado"
      });
    }

    const [usuarioExistente] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE id_persona = ?',
      [id]
    );

    if (usuarioExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Este alumno ya tiene credenciales de acceso"
      });
    }

    const [usernameExistente] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE username = ?',
      [username]
    );

    if (usernameExistente.length > 0) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario ya está en uso"
      });
    }

    const [perfilRows] = await pool.query(
      'SELECT id_perfil FROM perfiles WHERE nombre_perfil = ?',
      ['alumno']
    );

    if (perfilRows.length === 0) {
      return res.status(500).json({
        success: false,
        message: "No se encontró el perfil de alumno en el sistema"
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    await pool.query(
      'INSERT INTO usuarios (username, password_hash, password_plain, id_persona, id_perfil) VALUES (?, ?, ?, ?, ?)',
      [username, passwordHash, password, id, perfilRows[0].id_perfil]
    );

    res.json({
      success: true,
      message: "Credenciales creadas exitosamente"
    });

  } catch (error) {
    console.error("Error al crear credenciales:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Error al crear credenciales"
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nombre, apellido, mail, dni, telefono, legajo, estado } = req.body;
    const id_alumno = req.params.id;

    if (!nombre || !apellido || !mail || !legajo) {
      return res.status(400).json({ 
        success: false, 
        message: "Nombre, apellido, mail y legajo son obligatorios" 
      });
    }

    const [existingLegajo] = await pool.query(
      'SELECT id_alumno FROM alumnos WHERE legajo = ? AND id_alumno != ?',
      [legajo, id_alumno]
    );

    if (existingLegajo.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "El legajo ya existe en otro alumno" 
      });
    }

    await pool.query(
      'UPDATE personas SET nombre = ?, apellido = ?, mail = ?, dni = ?, telefono = ? WHERE id_persona = ?',
      [nombre, apellido, mail, dni || null, telefono || null, id_alumno]
    );

    const [result] = await pool.query(
      'UPDATE alumnos SET legajo = ?, estado = ? WHERE id_alumno = ?',
      [legajo, estado || 'activo', id_alumno]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Alumno no encontrado" 
      });
    }

    res.json({ 
      message: "Alumno actualizado correctamente", 
      success: true 
    });
    
    // Log del evento
    eventLogger.users.updated('Admin', `Alumno #${id_alumno}`);
    
  } catch (error) {
    console.error("Error al actualizar alumno:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar alumno" 
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id_alumno = req.params.id;

    const [inscripciones] = await pool.query(
      'SELECT COUNT(*) as total FROM inscripciones WHERE id_alumno = ? AND estado = "activo"',
      [id_alumno]
    );

    if (inscripciones[0].total > 0) {
      return res.status(400).json({ 
        success: false,
        message: "No se puede eliminar: el alumno tiene inscripciones activas" 
      });
    }

    await pool.query('DELETE FROM calificaciones WHERE id_alumno = ?', [id_alumno]);
    await pool.query('DELETE FROM asistencias WHERE id_alumno = ?', [id_alumno]);
    await pool.query('DELETE FROM pagos WHERE id_alumno = ?', [id_alumno]);
    await pool.query('DELETE FROM inscripciones WHERE id_alumno = ?', [id_alumno]);
    
    await pool.query('DELETE FROM usuarios WHERE id_persona = ?', [id_alumno]);
    
    await pool.query('DELETE FROM alumnos WHERE id_alumno = ?', [id_alumno]);
    
    const [result] = await pool.query('DELETE FROM personas WHERE id_persona = ?', [id_alumno]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Alumno no encontrado" 
      });
    }

    res.json({ 
      message: "Alumno eliminado correctamente", 
      success: true 
    });
    
    // Log del evento
    eventLogger.users.deleted('Admin', `Alumno #${id_alumno}`);
    
  } catch (error) {
    console.error("Error al eliminar alumno:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar alumno" 
    });
  }
});

router.get("/:id/asistencias", async (req, res) => {
  try {
    const { id } = req.params;

    const [asistenciasPorCurso] = await pool.query(`
      SELECT 
        c.id_curso,
        c.nombre_curso,
        i.nombre_idioma,
        COUNT(DISTINCT a.fecha) as total_clases,
        SUM(CASE WHEN a.estado = 'presente' THEN 1 ELSE 0 END) as presentes,
        SUM(CASE WHEN a.estado = 'ausente' THEN 1 ELSE 0 END) as ausentes,
        SUM(CASE WHEN a.estado = 'tardanza' THEN 1 ELSE 0 END) as tardanzas,
        SUM(CASE WHEN a.estado = 'justificado' THEN 1 ELSE 0 END) as justificados,
        ROUND(
          (SUM(CASE WHEN a.estado IN ('presente', 'tardanza', 'justificado') THEN 1 ELSE 0 END) / 
          COUNT(DISTINCT a.fecha)) * 100, 1
        ) as porcentaje_asistencia
      FROM inscripciones ins
      JOIN cursos c ON ins.id_curso = c.id_curso
      LEFT JOIN idiomas i ON c.id_idioma = i.id_idioma
      LEFT JOIN asistencias a ON (a.id_curso = c.id_curso AND a.id_alumno = ins.id_alumno)
      WHERE ins.id_alumno = ? AND ins.estado = 'activo'
      GROUP BY c.id_curso, c.nombre_curso, i.nombre_idioma
      ORDER BY c.nombre_curso
    `, [id]);

    const totalClases = asistenciasPorCurso.reduce((sum, c) => sum + c.total_clases, 0);
    const totalPresentes = asistenciasPorCurso.reduce((sum, c) => sum + c.presentes, 0);
    const totalAusentes = asistenciasPorCurso.reduce((sum, c) => sum + c.ausentes, 0);
    const totalTardanzas = asistenciasPorCurso.reduce((sum, c) => sum + c.tardanzas, 0);
    const porcentajeGeneral = totalClases > 0 
      ? ((totalPresentes + totalTardanzas) / totalClases * 100).toFixed(1)
      : 0;

    res.json({
      por_curso: asistenciasPorCurso,
      estadisticas_generales: {
        total_clases: totalClases,
        total_presentes: totalPresentes,
        total_ausentes: totalAusentes,
        total_tardanzas: totalTardanzas,
        porcentaje_general: porcentajeGeneral
      }
    });

  } catch (error) {
    console.error("Error al obtener asistencias del alumno:", error);
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
});

router.get("/:id/perfil", async (req, res) => {
  try {
    const { id } = req.params;

    const [alumno] = await pool.query(`
      SELECT 
        a.id_alumno,
        p.nombre,
        p.apellido,
        p.mail,
        p.dni,
        p.telefono,
        p.direccion as domicilio,
        p.fecha_nacimiento,
        a.legajo,
        a.estado,
        a.fecha_registro
      FROM alumnos a
      JOIN personas p ON a.id_alumno = p.id_persona
      WHERE a.id_alumno = ?
    `, [id]);

    if (alumno.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    console.log("Datos del perfil obtenidos:", alumno[0]); // Debug

    res.json(alumno[0]);

  } catch (error) {
    console.error("Error al obtener perfil:", error);
    res.status(500).json({ message: "Error al obtener perfil" });
  }
});

router.put("/:id/perfil", async (req, res) => {
  try {
    const { id } = req.params;
    const { telefono, domicilio } = req.body;

    await pool.query(`
      UPDATE alumnos 
      SET telefono = ?, domicilio = ?
      WHERE id_alumno = ?
    `, [telefono, domicilio, id]);

    res.json({ 
      success: true,
      message: "Perfil actualizado correctamente" 
    });

  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar perfil" 
    });
  }
});

router.post('/:id/cambiar-password-dashboard', async (req, res) => {
  try {
    const { password } = req.body;
    const id_alumno = req.params.id;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña es obligatoria'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres'
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    await pool.query(
      'UPDATE usuarios SET password_hash = ?, password_plain = ? WHERE id_persona = ?',
      [passwordHash, password, id_alumno]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente para Dashboard y Classroom'
    });

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar contraseña'
    });
  }
});

router.patch("/:id/usuario", async (req, res) => {
  try {
    const { usuario } = req.body;
    const idAlumno = req.params.id;

    if (!usuario || usuario.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "El usuario es obligatorio"
      });
    }

    const [existente] = await pool.query(
      "SELECT id_usuario FROM usuarios WHERE username = ? AND id_persona != ?",
      [usuario.trim(), idAlumno]
    );

    if (existente.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Este usuario ya está en uso"
      });
    }

    await pool.query(
      "UPDATE usuarios SET username = ? WHERE id_persona = ?",
      [usuario.trim(), idAlumno]
    );

    res.json({
      success: true,
      message: "Usuario actualizado correctamente para Dashboard y Classroom"
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar el usuario"
    });
  }
});

// ============================================
// CEMIKEY - Access Key Management
// ============================================

// Obtener access key de un alumno
router.get("/:id/access-key", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT access_key FROM alumnos WHERE id_alumno = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Alumno no encontrado"
      });
    }

    res.json({
      success: true,
      access_key: rows[0].access_key || null
    });
  } catch (error) {
    console.error("Error al obtener access key:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener la clave de acceso"
    });
  }
});

// Actualizar access key de un alumno
router.patch("/:id/access-key", async (req, res) => {
  try {
    const { id } = req.params;
    const { access_key } = req.body;

    // Validar que la clave no esté vacía si se proporciona
    if (access_key !== null && access_key !== undefined) {
      const trimmedKey = String(access_key).trim();
      
      if (trimmedKey.length > 0 && trimmedKey.length < 4) {
        return res.status(400).json({
          success: false,
          message: "La clave debe tener al menos 4 caracteres"
        });
      }

      if (trimmedKey.length > 64) {
        return res.status(400).json({
          success: false,
          message: "La clave no puede exceder 64 caracteres"
        });
      }

      // Verificar unicidad en todas las tablas
      const [existingAdmin] = await pool.query(
        "SELECT id_administrador FROM administradores WHERE access_key = ? AND access_key IS NOT NULL",
        [trimmedKey]
      );
      const [existingProf] = await pool.query(
        "SELECT id_profesor FROM profesores WHERE access_key = ? AND access_key IS NOT NULL",
        [trimmedKey]
      );
      const [existingAlum] = await pool.query(
        "SELECT id_alumno FROM alumnos WHERE access_key = ? AND id_alumno != ?",
        [trimmedKey, id]
      );

      if (existingAdmin.length > 0 || existingProf.length > 0 || existingAlum.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Esta clave de acceso ya está en uso"
        });
      }

      await pool.query(
        "UPDATE alumnos SET access_key = ? WHERE id_alumno = ?",
        [trimmedKey.length > 0 ? trimmedKey : null, id]
      );
    } else {
      // Si es null, eliminar la clave
      await pool.query(
        "UPDATE alumnos SET access_key = NULL WHERE id_alumno = ?",
        [id]
      );
    }

    res.json({
      success: true,
      message: "Clave de acceso actualizada correctamente"
    });
  } catch (error) {
    console.error("Error al actualizar access key:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la clave de acceso"
    });
  }
});

export default router;


