import express from "express";
import db from "../utils/db.js";

const router = express.Router();

router.get("/curso/:id_curso/fecha/:fecha", async (req, res) => {
  try {
    const { id_curso, fecha } = req.params;

    const [alumnos] = await db.query(`
      SELECT 
        a.id_alumno,
        CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
        p.mail,
        i.fecha_inscripcion
      FROM inscripciones i
      JOIN alumnos a ON i.id_alumno = a.id_alumno
      JOIN personas p ON a.id_persona = p.id_persona
      WHERE i.id_curso = ? AND i.estado = 'activo'
      ORDER BY p.apellido, p.nombre
    `, [id_curso]);

    const [asistencias] = await db.query(`
      SELECT 
        id_asistencia,
        id_alumno,
        estado,
        observaciones
      FROM asistencias
      WHERE id_curso = ? AND fecha = ?
    `, [id_curso, fecha]);

    const asistenciasMap = {};
    asistencias.forEach(asist => {
      asistenciasMap[asist.id_alumno] = asist;
    });

    const resultado = alumnos.map(alumno => ({
      ...alumno,
      id_asistencia: asistenciasMap[alumno.id_alumno]?.id_asistencia || null,
      estado: asistenciasMap[alumno.id_alumno]?.estado || 'ausente',
      observaciones: asistenciasMap[alumno.id_alumno]?.observaciones || ''
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Error al obtener asistencias:", error);
    res.status(500).json({ message: "Error al obtener asistencias" });
  }
});

router.get("/curso/:id_curso/estadisticas", async (req, res) => {
  try {
    const { id_curso } = req.params;

    const [estadisticas] = await db.query(`
      SELECT 
        a.id_alumno,
        CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
        COUNT(*) AS total_clases,
        SUM(CASE WHEN asist.estado = 'presente' THEN 1 ELSE 0 END) AS presentes,
        SUM(CASE WHEN asist.estado = 'ausente' THEN 1 ELSE 0 END) AS ausentes,
        SUM(CASE WHEN asist.estado = 'tardanza' THEN 1 ELSE 0 END) AS tardanzas,
        SUM(CASE WHEN asist.estado = 'justificado' THEN 1 ELSE 0 END) AS justificados,
        ROUND((SUM(CASE WHEN asist.estado IN ('presente', 'tardanza') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) AS porcentaje_asistencia
      FROM inscripciones i
      JOIN alumnos a ON i.id_alumno = a.id_alumno
      JOIN personas p ON a.id_persona = p.id_persona
      LEFT JOIN asistencias asist ON (asist.id_alumno = a.id_alumno AND asist.id_curso = i.id_curso)
      WHERE i.id_curso = ? AND i.estado = 'activo'
      GROUP BY a.id_alumno, p.nombre, p.apellido
      ORDER BY porcentaje_asistencia DESC
    `, [id_curso]);

    const [generales] = await db.query(`
      SELECT 
        COUNT(DISTINCT fecha) AS total_clases_dictadas,
        COUNT(*) AS total_registros,
        SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) AS total_presentes,
        SUM(CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END) AS total_ausentes,
        SUM(CASE WHEN estado = 'tardanza' THEN 1 ELSE 0 END) AS total_tardanzas,
        SUM(CASE WHEN estado = 'justificado' THEN 1 ELSE 0 END) AS total_justificados,
        ROUND((SUM(CASE WHEN estado IN ('presente', 'tardanza') THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 2) AS porcentaje_asistencia_general
      FROM asistencias
      WHERE id_curso = ?
    `, [id_curso]);

    res.json({
      por_alumno: estadisticas,
      generales: generales[0] || {
        total_clases_dictadas: 0,
        total_registros: 0,
        total_presentes: 0,
        total_ausentes: 0,
        total_tardanzas: 0,
        total_justificados: 0,
        porcentaje_asistencia_general: 0
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({ message: "Error al obtener estadísticas" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { id_curso, id_alumno, fecha, estado, observaciones } = req.body;

    const [existe] = await db.query(`
      SELECT id_asistencia FROM asistencias
      WHERE id_curso = ? AND id_alumno = ? AND fecha = ?
    `, [id_curso, id_alumno, fecha]);

    if (existe.length > 0) {
      await db.query(`
        UPDATE asistencias
        SET estado = ?, observaciones = ?
        WHERE id_asistencia = ?
      `, [estado, observaciones || null, existe[0].id_asistencia]);

      res.json({ 
        message: "Asistencia actualizada",
        id_asistencia: existe[0].id_asistencia
      });
    } else {
      const [result] = await db.query(`
        INSERT INTO asistencias (id_curso, id_alumno, fecha, estado, observaciones)
        VALUES (?, ?, ?, ?, ?)
      `, [id_curso, id_alumno, fecha, estado, observaciones || null]);

      res.json({ 
        message: "Asistencia registrada",
        id_asistencia: result.insertId
      });
    }
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    res.status(500).json({ message: "Error al registrar asistencia" });
  }
});

router.post("/lote", async (req, res) => {
  try {
    const { id_curso, fecha, asistencias } = req.body;

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      for (const asist of asistencias) {
        const [existe] = await connection.query(`
          SELECT id_asistencia FROM asistencias
          WHERE id_curso = ? AND id_alumno = ? AND fecha = ?
        `, [id_curso, asist.id_alumno, fecha]);

        if (existe.length > 0) {
          await connection.query(`
            UPDATE asistencias
            SET estado = ?, observaciones = ?
            WHERE id_asistencia = ?
          `, [asist.estado, asist.observaciones || null, existe[0].id_asistencia]);
        } else {
          await connection.query(`
            INSERT INTO asistencias (id_curso, id_alumno, fecha, estado, observaciones)
            VALUES (?, ?, ?, ?, ?)
          `, [id_curso, asist.id_alumno, fecha, asist.estado, asist.observaciones || null]);
        }
      }

      await connection.commit();
      connection.release();

      res.json({ message: "Asistencias registradas exitosamente" });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error("Error al registrar asistencias en lote:", error);
    res.status(500).json({ message: "Error al registrar asistencias" });
  }
});

router.get("/curso/:id_curso/fechas", async (req, res) => {
  try {
    const { id_curso } = req.params;

    const [fechas] = await db.query(`
      SELECT DISTINCT fecha
      FROM asistencias
      WHERE id_curso = ?
      ORDER BY fecha DESC
    `, [id_curso]);

    res.json(fechas.map(f => f.fecha));
  } catch (error) {
    console.error("Error al obtener fechas:", error);
    res.status(500).json({ message: "Error al obtener fechas" });
  }
});

router.delete("/curso/:id_curso", async (req, res) => {
  try {
    const { id_curso } = req.params;

    const [result] = await db.query(`
      DELETE FROM asistencias
      WHERE id_curso = ?
    `, [id_curso]);

    res.json({ 
      message: "Asistencias eliminadas exitosamente",
      registros_eliminados: result.affectedRows
    });
  } catch (error) {
    console.error("Error al eliminar asistencias:", error);
    res.status(500).json({ message: "Error al eliminar asistencias" });
  }
});

router.delete("/curso/:id_curso/fecha/:fecha", async (req, res) => {
  try {
    const { id_curso, fecha } = req.params;

    const [result] = await db.query(`
      DELETE FROM asistencias
      WHERE id_curso = ? AND fecha = ?
    `, [id_curso, fecha]);

    res.json({ 
      message: "Asistencias de la fecha eliminadas",
      registros_eliminados: result.affectedRows
    });
  } catch (error) {
    console.error("Error al eliminar asistencias:", error);
    res.status(500).json({ message: "Error al eliminar asistencias" });
  }
});

router.get("/alumno/:id_alumno/curso/:id_curso/estadisticas", async (req, res) => {
  try {
    const { id_alumno, id_curso } = req.params;

    const [asistencias] = await db.query(`
      SELECT estado
      FROM asistencias
      WHERE id_alumno = ? AND id_curso = ?
    `, [id_alumno, id_curso]);

    const totalClases = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === 'presente').length;
    const ausentes = asistencias.filter(a => a.estado === 'ausente').length;
    const tardanzas = asistencias.filter(a => a.estado === 'tardanza').length;
    const justificados = asistencias.filter(a => a.estado === 'justificado').length;
    const porcentajeAsistencia = totalClases > 0 
      ? ((presentes + tardanzas + justificados) / totalClases * 100).toFixed(1)
      : 0;

    res.json({
      total_clases: totalClases,
      presentes: presentes,
      ausentes: ausentes,
      tardanzas: tardanzas,
      justificados: justificados,
      porcentaje_asistencia: parseFloat(porcentajeAsistencia)
    });

  } catch (error) {
    console.error("Error al obtener estadísticas de asistencias:", error);
    res.status(500).json({ 
      message: "Error al obtener estadísticas de asistencias",
      error: error.message 
    });
  }
});

router.get("/alumno/:id_alumno/curso/:id_curso/historial", async (req, res) => {
  try {
    const { id_alumno, id_curso } = req.params;
    console.log(' GET /historial - Params:', { id_alumno, id_curso });

    const [alumno] = await db.query(`
      SELECT 
        a.id_alumno,
        CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
        p.mail,
        a.legajo
      FROM alumnos a
      JOIN personas p ON a.id_persona = p.id_persona
      WHERE a.id_alumno = ?
    `, [id_alumno]);
    
    console.log(' Alumno encontrado:', alumno.length > 0 ? alumno[0].nombre_completo : 'NO ENCONTRADO');

    if (alumno.length === 0) {
      return res.status(404).json({ message: "Alumno no encontrado" });
    }

    const [curso] = await db.query(`
      SELECT 
        c.id_curso,
        c.nombre_curso,
        COALESCE(i.nombre_idioma, 'Sin idioma') as nombre_idioma,
        COALESCE(n.nivel, 'Sin nivel') as nivel
      FROM cursos c
      LEFT JOIN idiomas i ON c.id_idioma = i.id_idioma
      LEFT JOIN niveles n ON c.id_nivel = n.id_nivel
      WHERE c.id_curso = ?
    `, [id_curso]);
    
    console.log(' Curso encontrado:', curso.length > 0 ? curso[0].nombre_curso : 'NO ENCONTRADO');

    if (curso.length === 0) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    const [asistencias] = await db.query(`
      SELECT 
        DATE_FORMAT(fecha, '%Y-%m-%d') as fecha,
        DATE_FORMAT(fecha, '%d/%m/%Y') as fecha_formato,
        estado,
        observaciones
      FROM asistencias
      WHERE id_alumno = ? AND id_curso = ?
      ORDER BY fecha DESC
    `, [id_alumno, id_curso]);

    const totalClases = asistencias.length;
    const presentes = asistencias.filter(a => a.estado === 'presente').length;
    const ausentes = asistencias.filter(a => a.estado === 'ausente').length;
    const tardanzas = asistencias.filter(a => a.estado === 'tardanza').length;
    const justificados = asistencias.filter(a => a.estado === 'justificado').length;
    const porcentajeAsistencia = totalClases > 0 
      ? ((presentes + tardanzas + justificados) / totalClases * 100).toFixed(1)
      : 0;

    console.log(' Historial completo - Total clases:', totalClases, 'Asistencias:', asistencias.length);
    
    res.json({
      alumno: alumno[0],
      curso: curso[0],
      asistencias: asistencias,
      estadisticas: {
        total_clases: totalClases,
        presentes: presentes,
        ausentes: ausentes,
        tardanzas: tardanzas,
        justificados: justificados,
        porcentaje_asistencia: porcentajeAsistencia
      }
    });

  } catch (error) {
    console.error(" Error al obtener historial de asistencias:");
    console.error("Error completo:", error);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      message: "Error al obtener historial de asistencias",
      error: error.message,
      details: error.toString()
    });
  }
});

export default router;


