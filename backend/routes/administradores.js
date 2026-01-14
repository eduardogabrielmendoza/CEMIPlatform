import express from "express";
import pool from "../utils/db.js";
import bcrypt from "bcryptjs";
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        per.id_persona,
        per.nombre,
        per.apellido,
        per.mail,
        per.dni,
        per.telefono,
        per.avatar,
        u.username,
        u.fecha_creacion,
        CASE 
          WHEN u.id_usuario IS NOT NULL THEN 'activo'
          ELSE 'sin_acceso'
        END as estado
      FROM personas per
      JOIN usuarios u ON per.id_persona = u.id_persona
      JOIN perfiles p ON u.id_perfil = p.id_perfil
      WHERE p.nombre_perfil = 'admin' OR p.nombre_perfil = 'administrador'
      ORDER BY per.id_persona DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los administradores:", error);
    res.status(500).json({ message: "Error al obtener los administradores" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        per.id_persona,
        per.nombre,
        per.apellido,
        per.mail,
        per.dni,
        per.telefono,
        u.username as usuario,
        u.password_hash,
        adm.nivel_acceso,
        adm.fecha_registro
      FROM personas per
      LEFT JOIN usuarios u ON per.id_persona = u.id_persona
      LEFT JOIN administradores adm ON per.id_persona = adm.id_persona
      WHERE per.id_persona = ?
    `, [req.params.id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener administrador:', error);
    res.status(500).json({ message: "Error al obtener administrador" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, mail, dni, telefono } = req.body;

    if (!nombre || !apellido || !mail) {
      return res.status(400).json({ 
        success: false, 
        message: "Nombre, apellido y mail son obligatorios" 
      });
    }

    const [existingMail] = await pool.query(
      'SELECT id_persona FROM personas WHERE mail = ? AND id_persona != ?',
      [mail, id]
    );

    if (existingMail.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "El email ya está registrado por otra persona" 
      });
    }

    if (dni) {
      const [existingDNI] = await pool.query(
        'SELECT id_persona FROM personas WHERE dni = ? AND id_persona != ?',
        [dni, id]
      );

      if (existingDNI.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: "El DNI ya está registrado por otra persona" 
        });
      }
    }

    const [result] = await pool.query(
      'UPDATE personas SET nombre = ?, apellido = ?, mail = ?, dni = ?, telefono = ? WHERE id_persona = ?',
      [nombre, apellido, mail, dni || null, telefono || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Administrador no encontrado" 
      });
    }

    res.json({ message: "Administrador actualizado correctamente", success: true });
  } catch (error) {
    console.error("Error al actualizar administrador:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar administrador" 
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre, apellido, dni, mail, telefono, username, password } = req.body;

    if (!nombre || !apellido || !mail || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Nombre, apellido, mail, usuario y contraseña son obligatorios" 
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

    const [existingUser] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE username = ?',
      [username]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "El nombre de usuario ya está en uso" 
      });
    }

    const [existingAdmin] = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE username = ?',
      [username]
    );

    if (existingAdmin.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "El nombre de usuario ya está en uso" 
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

    const [perfilRows] = await pool.query(
      'SELECT id_perfil FROM perfiles WHERE nombre_perfil IN (?, ?)',
      ['admin', 'administrador']
    );

    if (perfilRows.length === 0) {
      return res.status(500).json({ 
        success: false, 
        message: "No se encontró el perfil de administrador en el sistema" 
      });
    }

    const id_perfil = perfilRows[0].id_perfil;

    const hashedPassword = bcrypt.hashSync(password, 10);

    const [personaResult] = await pool.query(
      'INSERT INTO personas (nombre, apellido, mail, dni, telefono) VALUES (?, ?, ?, ?, ?)',
      [nombre, apellido, mail, dni || null, telefono || null]
    );

    const id_persona = personaResult.insertId;

    await pool.query(
      'INSERT INTO administradores (id_persona, usuario, password_hash, nivel_acceso, estado) VALUES (?, ?, ?, ?, ?)',
      [id_persona, username, hashedPassword, 'admin', 'activo']
    );

    await pool.query(
      'INSERT INTO usuarios (username, password_hash, password_plain, id_persona, id_perfil) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, password, id_persona, id_perfil]
    );

    res.json({ 
      message: "Administrador creado correctamente", 
      success: true,
      id_persona: id_persona
    });
  } catch (error) {
    console.error("Error al crear administrador:", error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false,
        message: "El email o usuario ya está registrado en el sistema" 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: error.message || "Error al crear administrador" 
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [checkRows] = await pool.query(
      'SELECT id_persona FROM personas WHERE id_persona = ?',
      [id]
    );

    if (checkRows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Administrador no encontrado" 
      });
    }

    await pool.query('DELETE FROM usuarios WHERE id_persona = ?', [id]);

    const [result] = await pool.query('DELETE FROM personas WHERE id_persona = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: "No se pudo eliminar el administrador" 
      });
    }

    res.json({ 
      message: "Administrador eliminado correctamente", 
      success: true 
    });
  } catch (error) {
    console.error("Error al eliminar administrador:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar administrador" 
    });
  }
});

router.put("/:id/password", async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const [result] = await pool.query(
      'UPDATE usuarios SET password_hash = ?, password_plain = ? WHERE id_persona = ?',
      [hashedPassword, password, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado" 
      });
    }

    res.json({ 
      message: "Contraseña actualizada correctamente", 
      success: true 
    });
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar contraseña" 
    });
  }
});

router.patch("/:id/usuario", async (req, res) => {
  try {
    const { id } = req.params;
    const { usuario } = req.body;

    if (!usuario || !usuario.trim()) {
      return res.status(400).json({ message: "El usuario es obligatorio" });
    }

    const [existenteUsuarios] = await pool.query(
      `SELECT u.id_usuario 
       FROM usuarios u 
       WHERE u.username = ? 
       AND u.id_persona != ?`,
      [usuario.trim(), id]
    );

    if (existenteUsuarios.length > 0) {
      return res.status(400).json({ 
        message: "Este usuario ya está en uso" 
      });
    }

    const [result] = await pool.query(
      "UPDATE usuarios SET username = ? WHERE id_persona = ?",
      [usuario.trim(), id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar usuario" });
  }
});

router.post("/:id/cambiar-password", async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.trim().length < 6) {
      return res.status(400).json({ 
        message: "La contraseña debe tener al menos 6 caracteres" 
      });
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);

    await pool.query(
      "UPDATE usuarios SET password_hash = ?, password_plain = ? WHERE id_persona = ?",
      [passwordHash, password.trim(), id]
    );

    const [result] = await pool.query(
      "UPDATE administradores SET password_hash = ? WHERE id_persona = ?",
      [passwordHash, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Administrador no encontrado" });
    }

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar contraseña:", error);
    res.status(500).json({ message: "Error al actualizar contraseña" });
  }
});

router.patch("/:id/access-key", async (req, res) => {
  try {
    const { id } = req.params;
    const { accessKey } = req.body;

    if (accessKey && accessKey.trim().length > 0) {
      const [existing] = await pool.query(
        'SELECT id_administrador FROM administradores WHERE access_key = ? AND id_persona != ?',
        [accessKey.trim(), id]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Esta clave de acceso ya esta en uso por otro administrador"
        });
      }
    }

    const keyValue = accessKey && accessKey.trim().length > 0 ? accessKey.trim() : null;

    const [result] = await pool.query(
      'UPDATE administradores SET access_key = ? WHERE id_persona = ?',
      [keyValue, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Administrador no encontrado"
      });
    }

    res.json({
      success: true,
      message: keyValue ? "Clave de acceso actualizada correctamente" : "Clave de acceso eliminada"
    });
  } catch (error) {
    console.error("Error al actualizar clave de acceso:", error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar clave de acceso"
    });
  }
});

router.get("/:id/access-key", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT access_key FROM administradores WHERE id_persona = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Administrador no encontrado"
      });
    }

    res.json({
      success: true,
      accessKey: rows[0].access_key || null
    });
  } catch (error) {
    console.error("Error al obtener clave de acceso:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener clave de acceso"
    });
  }
});

export default router;


