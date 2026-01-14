import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        i.id_inscripcion, 
        i.id_alumno,
        CONCAT(p.nombre, ' ', p.apellido) AS alumno,
        a.legajo,
        c.nombre_curso, 
        i.fecha_inscripcion, 
        i.estado
      FROM inscripciones i
      JOIN alumnos a ON i.id_alumno = a.id_alumno
      JOIN personas p ON a.id_persona = p.id_persona
      JOIN cursos c ON i.id_curso = c.id_curso
      ORDER BY i.fecha_inscripcion DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener inscripciones" });
  }
});

router.get("/alumno/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(`
      SELECT 
        i.id_inscripcion,
        i.id_curso,
        i.fecha_inscripcion,
        i.estado,
        c.nombre_curso,
        idioma.nombre_idioma AS idioma,
        nivel.descripcion AS nivel,
        15000 AS costo_mensual,
        CONCAT(prof_p.nombre, ' ', prof_p.apellido) AS profesor
      FROM inscripciones i
      JOIN cursos c ON i.id_curso = c.id_curso
      JOIN idiomas idioma ON c.id_idioma = idioma.id_idioma
      JOIN niveles nivel ON c.id_nivel = nivel.id_nivel
      JOIN profesores prof ON c.id_profesor = prof.id_profesor
      JOIN personas prof_p ON prof.id_persona = prof_p.id_persona
      WHERE i.id_alumno = ?
      ORDER BY i.fecha_inscripcion DESC
    `, [id]);

    res.json(rows);
  } catch (error) {
    console.error('Error al obtener inscripciones del alumno:', error);
    res.status(500).json({ message: "Error al obtener inscripciones del alumno" });
  }
});

router.get("/curso/:id", async (req, res) => {
  try {
    const id_profesor = req.query.id_profesor;
    
    let query = `
      SELECT 
        a.id_alumno,
        p.nombre,
        p.apellido,
        p.mail,
        c.parcial1,
        c.parcial2,
        c.final
      FROM inscripciones i
      JOIN alumnos a ON i.id_alumno = a.id_alumno
      JOIN personas p ON a.id_persona = p.id_persona
      LEFT JOIN calificaciones c ON (c.id_alumno = a.id_alumno AND c.id_curso = i.id_curso)
      WHERE i.id_curso = ? 
      AND i.estado = 'activo'
    `;
    
    const params = [req.params.id];
    
    if (id_profesor) {
      query += ` AND EXISTS (SELECT 1 FROM cursos cu WHERE cu.id_curso = i.id_curso AND cu.id_profesor = ?)`;
      params.push(id_profesor);
    }
    
    const [rows] = await pool.query(query, params);
    
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener alumnos del curso:', error);
    res.status(500).json({ message: "Error al obtener alumnos del curso" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id_curso, alumnos } = req.body;

    if (!id_curso) return res.status(400).json({ message: "id_curso es requerido" });
    if (!alumnos || (Array.isArray(alumnos) && alumnos.length === 0)) {
      return res.status(400).json({ message: "Debe enviar al menos un alumno" });
    }

    const lista = Array.isArray(alumnos) ? alumnos : [alumnos];

    const values = lista.map(id_alumno => [id_alumno, id_curso, new Date(), 'activo']);

    const [result] = await pool.query(
      `INSERT INTO inscripciones (id_alumno, id_curso, fecha_inscripcion, estado) VALUES ?`,
      [values]
    );

    const [cursoInfo] = await pool.query(
      `SELECT c.nombre_curso, c.id_profesor
       FROM cursos c
       WHERE c.id_curso = ?`,
      [id_curso]
    );

    if (cursoInfo.length > 0) {
      const curso = cursoInfo[0];
      
      for (const id_alumno of lista) {
        const [alumnoInfo] = await pool.query(
          `SELECT CONCAT(p.nombre, ' ', p.apellido) AS nombre
           FROM alumnos a
           INNER JOIN personas p ON a.id_persona = p.id_persona
           WHERE a.id_alumno = ?`,
          [id_alumno]
        );

        if (alumnoInfo.length > 0) {
          await pool.query(
            `INSERT INTO notificaciones 
             (id_usuario, tipo_usuario, tipo_notificacion, titulo, mensaje, link, id_referencia) 
             VALUES (?, 'profesor', 'nueva_inscripcion', ?, ?, ?, ?)`,
            [
              curso.id_profesor,
              'Nueva inscripción',
              `${alumnoInfo[0].nombre} se inscribió en ${curso.nombre_curso}`,
              `/cursos/${id_curso}`,
              id_curso
            ]
          );
        }
      }
    }

    res.status(201).json({ message: 'inscripciones creadas', inserted: result.affectedRows });
  } catch (error) {
    console.error('Error al crear inscripciones:', error);
    res.status(500).json({ message: 'Error al crear inscripciones' });
  }
});

router.delete("/:id_curso/:id_alumno", async (req, res) => {
  try {
    const { id_curso, id_alumno } = req.params;

    const [result] = await pool.query(
      `UPDATE inscripciones 
       SET estado = 'inactivo' 
       WHERE id_curso = ? AND id_alumno = ?`,
      [id_curso, id_alumno]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Inscripción no encontrada" });
    }

    res.json({ message: 'Alumno dado de baja correctamente', success: true });
  } catch (error) {
    console.error('Error al dar de baja inscripción:', error);
    res.status(500).json({ message: 'Error al dar de baja inscripción' });
  }
});

export default router;



