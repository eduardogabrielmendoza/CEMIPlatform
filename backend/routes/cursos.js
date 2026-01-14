import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { id_profesor } = req.query; // viene del frontend

    const query = `
      SELECT 
        c.id_curso,
        c.nombre_curso,
        i.nombre_idioma AS nombre_idioma,
        n.descripcion AS nivel,
        CONCAT(per.nombre, ' ', per.apellido) AS profesor,
        c.id_profesor,
        c.horario,
        a.nombre_aula AS nombre_aula,
        c.cupo_maximo,
        (SELECT COUNT(*) FROM inscripciones WHERE id_curso = c.id_curso AND estado = 'activo') AS alumnos_inscritos
      FROM cursos c
      INNER JOIN idiomas i ON c.id_idioma = i.id_idioma
      LEFT JOIN niveles n ON c.id_nivel = n.id_nivel
      LEFT JOIN profesores p ON c.id_profesor = p.id_profesor
      LEFT JOIN personas per ON p.id_profesor = per.id_persona
      LEFT JOIN aulas a ON c.id_aula = a.id_aula
      ${id_profesor ? "WHERE c.id_profesor = ?" : ""}
      ORDER BY c.id_curso DESC
    `;

    const [rows] = await pool.query(query, id_profesor ? [id_profesor] : []);
    res.json(rows);
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    res.status(500).json({ message: "Error al obtener los cursos" });
  }
});

router.get("/profesor/:idProfesor", async (req, res) => {
  try {
    const { idProfesor } = req.params;
    console.log(` [GET /cursos/profesor/:id] Obteniendo cursos del profesor ${idProfesor}`);

    const query = `
      SELECT 
        c.id_curso,
        c.nombre_curso,
        i.nombre_idioma,
        n.descripcion AS nombre_nivel,
        c.horario,
        a.nombre_aula,
        c.cupo_maximo,
        (SELECT COUNT(*) FROM inscripciones WHERE id_curso = c.id_curso AND estado = 'activo') AS total_inscritos
      FROM cursos c
      INNER JOIN idiomas i ON c.id_idioma = i.id_idioma
      LEFT JOIN niveles n ON c.id_nivel = n.id_nivel
      LEFT JOIN aulas a ON c.id_aula = a.id_aula
      WHERE c.id_profesor = ?
      ORDER BY c.nombre_curso
    `;

    const [cursos] = await pool.query(query, [idProfesor]);
    
    console.log(`   Encontrados ${cursos.length} cursos`);

    res.json({
      success: true,
      cursos: cursos
    });
  } catch (error) {
    console.error(" Error al obtener cursos del profesor:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener cursos del profesor" 
    });
  }
});


router.get('/catalogo', async (req, res) => {
    try {
        const { id_alumno, idioma, nivel, profesor } = req.query;

        if (!id_alumno) {
            return res.status(400).json({ 
                success: false,
                error: 'El parámetro id_alumno es requerido' 
            });
        }

        console.log('[CATALOGO] Iniciando consulta para alumno:', id_alumno);

        let query = `
            SELECT 
                c.id_curso,
                c.nombre_curso,
                c.horario,
                c.cupo_maximo,
                c.id_idioma,
                c.id_nivel,
                c.id_profesor,
                i.nombre_idioma,
                n.descripcion as nivel_descripcion,
                CONCAT(COALESCE(pp.nombre, ''), ' ', COALESCE(pp.apellido, '')) as nombre_profesor,
                COALESCE(prof.especialidad, '') as especialidad_profesor,
                COALESCE(pp.avatar, '') as avatar_profesor,
                COALESCE(a.nombre_aula, '') as nombre_aula,
                COALESCE(a.capacidad, 0) as capacidad_aula,
                (SELECT COUNT(*) FROM inscripciones WHERE id_curso = c.id_curso AND estado = 'activo') as inscriptos_actuales,
                (SELECT COUNT(*) FROM inscripciones WHERE id_curso = c.id_curso AND id_alumno = ? AND estado = 'activo') as ya_inscrito
            FROM cursos c
            INNER JOIN idiomas i ON c.id_idioma = i.id_idioma
            INNER JOIN niveles n ON c.id_nivel = n.id_nivel
            LEFT JOIN profesores prof ON c.id_profesor = prof.id_profesor
            LEFT JOIN personas pp ON prof.id_persona = pp.id_persona
            LEFT JOIN aulas a ON c.id_aula = a.id_aula
            WHERE 1=1
        `;

        const params = [id_alumno];

        if (idioma) {
            query += ' AND c.id_idioma = ?';
            params.push(idioma);
        }

        if (nivel) {
            query += ' AND c.id_nivel = ?';
            params.push(nivel);
        }

        if (profesor) {
            query += ' AND c.id_profesor = ?';
            params.push(profesor);
        }

        query += ' ORDER BY i.nombre_idioma, n.descripcion, c.nombre_curso';

        console.log('[CATALOGO] Ejecutando query con params:', params);
        const [cursos] = await pool.query(query, params);
        console.log('[CATALOGO] Cursos encontrados:', cursos.length);

        const cursosDisponibles = cursos.filter(curso => curso.ya_inscrito === 0);
        console.log('[CATALOGO] Cursos disponibles (sin inscripción):', cursosDisponibles.length);

        const cursosConEstado = cursosDisponibles.map(curso => {
            const porcentajeOcupacion = curso.cupo_maximo > 0 
                ? (curso.inscriptos_actuales / curso.cupo_maximo) * 100 
                : 0;
            const porcentajeDisponible = 100 - porcentajeOcupacion;
            
            let estado = 'disponible';
            
            if (curso.inscriptos_actuales >= curso.cupo_maximo) {
                estado = 'completo';
            } else if (porcentajeOcupacion >= 80) {
                estado = 'cupos_limitados';
            }

            return {
                id_curso: curso.id_curso,
                nombre_curso: curso.nombre_curso,
                horario: curso.horario,
                cupo_maximo: curso.cupo_maximo,
                inscriptos_actuales: curso.inscriptos_actuales,
                cupos_disponibles: curso.cupo_maximo - curso.inscriptos_actuales,
                porcentaje_ocupacion: Math.round(porcentajeOcupacion),
                porcentaje_disponible: Math.round(porcentajeDisponible),
                estado: estado,
                
                idioma: {
                    id_idioma: curso.id_idioma,
                    nombre: curso.nombre_idioma
                },
                
                nivel: {
                    id_nivel: curso.id_nivel,
                    descripcion: curso.nivel_descripcion
                },
                
                profesor: {
                    id_profesor: curso.id_profesor,
                    nombre: curso.nombre_profesor,
                    especialidad: curso.especialidad_profesor,
                    avatar: curso.avatar_profesor
                },
                
                aula: curso.nombre_aula ? {
                    nombre: curso.nombre_aula,
                    capacidad: curso.capacidad_aula
                } : null
            };
        });

        console.log('[CATALOGO] Enviando respuesta con', cursosConEstado.length, 'cursos');
        res.json({
            success: true,
            total: cursosConEstado.length,
            cursos: cursosConEstado
        });

    } catch (error) {
        console.error('[CATALOGO ERROR]:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al cargar el catálogo de cursos',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

router.get('/filtros/opciones', async (req, res) => {
    try {
        const [idiomas] = await pool.query(`
            SELECT DISTINCT i.id_idioma, i.nombre_idioma
            FROM idiomas i
            INNER JOIN cursos c ON i.id_idioma = c.id_idioma
            ORDER BY i.nombre_idioma
        `);

        const [niveles] = await pool.query(`
            SELECT DISTINCT n.id_nivel, n.descripcion, i.nombre_idioma
            FROM niveles n
            INNER JOIN idiomas i ON n.id_idioma = i.id_idioma
            INNER JOIN cursos c ON n.id_nivel = c.id_nivel
            ORDER BY i.nombre_idioma, n.descripcion
        `);

        const [profesores] = await pool.query(`
            SELECT DISTINCT 
                prof.id_profesor,
                CONCAT(p.nombre, ' ', p.apellido) as nombre_completo,
                prof.especialidad
            FROM profesores prof
            INNER JOIN personas p ON prof.id_persona = p.id_persona
            INNER JOIN cursos c ON prof.id_profesor = c.id_profesor
            ORDER BY nombre_completo
        `);

        res.json({
            success: true,
            filtros: {
                idiomas,
                niveles,
                profesores
            }
        });

    } catch (error) {
        console.error('Error al obtener opciones de filtros:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al cargar opciones de filtros',
            details: error.message 
        });
    }
});

router.get('/mis-cursos/:id_alumno', async (req, res) => {
    try {
        const { id_alumno } = req.params;

        const query = `
            SELECT 
                c.id_curso,
                c.nombre_curso,
                c.horario,
                i.nombre_idioma,
                n.descripcion as nivel_descripcion,
                CONCAT(pp.nombre, ' ', pp.apellido) as nombre_profesor,
                pp.avatar as avatar_profesor,
                a.nombre_aula,
                ins.fecha_inscripcion
            FROM inscripciones ins
            INNER JOIN cursos c ON ins.id_curso = c.id_curso
            INNER JOIN idiomas i ON c.id_idioma = i.id_idioma
            INNER JOIN niveles n ON c.id_nivel = n.id_nivel
            INNER JOIN profesores prof ON c.id_profesor = prof.id_profesor
            INNER JOIN personas pp ON prof.id_persona = pp.id_persona
            LEFT JOIN aulas a ON c.id_aula = a.id_aula
            WHERE ins.id_alumno = ? 
            AND ins.estado = 'activo'
            ORDER BY ins.fecha_inscripcion DESC
        `;

        const [cursos] = await pool.query(query, [id_alumno]);

        res.json({
            success: true,
            total: cursos.length,
            cursos: cursos.map(curso => ({
                id_curso: curso.id_curso,
                nombre_curso: curso.nombre_curso,
                horario: curso.horario,
                idioma: curso.nombre_idioma,
                nivel: curso.nivel_descripcion,
                profesor: {
                    nombre: curso.nombre_profesor,
                    avatar: curso.avatar_profesor
                },
                aula: curso.nombre_aula,
                fecha_inscripcion: curso.fecha_inscripcion
            }))
        });

    } catch (error) {
        console.error('Error al obtener mis cursos:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error al cargar tus cursos',
            details: error.message 
        });
    }
});


router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        c.id_curso,
        c.nombre_curso,
        c.id_idioma,
        c.id_nivel,
        c.id_profesor,
        c.id_aula,
        i.nombre_idioma AS nombre_idioma,
        n.descripcion AS nivel,
        CONCAT(per.nombre, ' ', per.apellido) AS profesor,
        c.horario,
        a.nombre_aula AS nombre_aula,
        c.cupo_maximo,
        (SELECT COUNT(*) FROM inscripciones WHERE id_curso = c.id_curso AND estado = 'activo') AS alumnos_inscritos
      FROM cursos c
      INNER JOIN idiomas i ON c.id_idioma = i.id_idioma
      LEFT JOIN niveles n ON c.id_nivel = n.id_nivel
      INNER JOIN profesores p ON c.id_profesor = p.id_profesor
      INNER JOIN personas per ON p.id_persona = per.id_persona
      LEFT JOIN aulas a ON c.id_aula = a.id_aula
      WHERE c.id_curso = ?
    `;

    const [rows] = await pool.query(query, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    res.status(500).json({ message: "Error al obtener el curso" });
  }
});

router.get("/:id/detalles", async (req, res) => {
  try {
    const { id } = req.params;

    const [cursoRows] = await pool.query(`
      SELECT 
        c.id_curso,
        c.nombre_curso,
        i.nombre_idioma,
        n.descripcion AS nivel,
        c.id_nivel,
        c.horario,
        a.nombre_aula,
        a.capacidad,
        CONCAT(per.nombre, ' ', per.apellido) AS profesor,
        c.cupo_maximo,
        (SELECT COUNT(*) FROM inscripciones WHERE id_curso = c.id_curso AND estado = 'activo') AS alumnos_inscritos
      FROM cursos c
      INNER JOIN idiomas i ON c.id_idioma = i.id_idioma
      LEFT JOIN niveles n ON c.id_nivel = n.id_nivel
      LEFT JOIN aulas a ON c.id_aula = a.id_aula
      INNER JOIN profesores p ON c.id_profesor = p.id_profesor
      INNER JOIN personas per ON p.id_persona = per.id_persona
      WHERE c.id_curso = ?
    `, [id]);

    if (cursoRows.length === 0) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    const [alumnosRows] = await pool.query(`
      SELECT 
        a.id_alumno,
        CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo,
        p.mail,
        p.avatar,
        i.fecha_inscripcion,
        cal.parcial1,
        cal.parcial2,
        cal.final,
        CASE 
          WHEN cal.parcial1 IS NULL AND cal.parcial2 IS NULL AND cal.final IS NULL THEN NULL
          ELSE ROUND(
            (COALESCE(cal.parcial1, 0) + COALESCE(cal.parcial2, 0) + COALESCE(cal.final, 0)) / 
            (
              (CASE WHEN cal.parcial1 IS NOT NULL THEN 1 ELSE 0 END) + 
              (CASE WHEN cal.parcial2 IS NOT NULL THEN 1 ELSE 0 END) + 
              (CASE WHEN cal.final IS NOT NULL THEN 1 ELSE 0 END)
            ), 
            2
          )
        END AS promedio
      FROM inscripciones i
      INNER JOIN alumnos a ON i.id_alumno = a.id_alumno
      INNER JOIN personas p ON a.id_persona = p.id_persona
      LEFT JOIN calificaciones cal ON (cal.id_alumno = a.id_alumno AND cal.id_curso = i.id_curso)
      WHERE i.id_curso = ? AND i.estado = 'activo'
      ORDER BY p.apellido, p.nombre
    `, [id]);

    const alumnosConPromedio = alumnosRows.filter(al => al.promedio !== null);
    const promedioGeneral = alumnosConPromedio.length > 0
      ? (alumnosConPromedio.reduce((sum, al) => sum + parseFloat(al.promedio), 0) / alumnosConPromedio.length).toFixed(2)
      : 0;

    const aprobados = alumnosRows.filter(al => al.promedio !== null && parseFloat(al.promedio) >= 7).length;
    const reprobados = alumnosRows.filter(al => al.promedio !== null && parseFloat(al.promedio) < 7).length;

    res.json({
      curso: cursoRows[0],
      alumnos: alumnosRows,
      estadisticas: {
        total_alumnos: alumnosRows.length,
        promedio_general: promedioGeneral,
        aprobados,
        reprobados,
        sin_calificaciones: alumnosRows.filter(al => al.promedio === null).length
      }
    });
  } catch (error) {
    console.error("Error al obtener detalles del curso:", error);
    res.status(500).json({ message: "Error al obtener detalles del curso" });
  }
});

router.get("/:id/alumnos", async (req, res) => {
  try {
    const { id } = req.params;

    const [alumnos] = await pool.query(`
      SELECT 
        a.id_alumno,
        CONCAT(p.nombre, ' ', p.apellido) AS nombre,
        p.mail AS email,
        p.avatar,
        i.fecha_inscripcion,
        i.estado
      FROM inscripciones i
      INNER JOIN alumnos a ON i.id_alumno = a.id_alumno
      INNER JOIN personas p ON a.id_persona = p.id_persona
      WHERE i.id_curso = ? AND i.estado = 'activo'
      ORDER BY p.apellido, p.nombre
    `, [id]);

    res.json(alumnos);
  } catch (error) {
    console.error("Error al obtener alumnos del curso:", error);
    res.status(500).json({ message: "Error al obtener alumnos del curso" });
  }
});

router.put("/:id/profesor", async (req, res) => {
  try {
    const { id } = req.params;
    const { id_profesor } = req.body;

    if (!id_profesor) {
      return res.status(400).json({ 
        success: false, 
        message: "El ID del profesor es obligatorio" 
      });
    }

    const [profesorRows] = await pool.query(
      'SELECT id_profesor FROM profesores WHERE id_profesor = ? AND estado = "activo"',
      [id_profesor]
    );

    if (profesorRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Profesor no encontrado o inactivo" 
      });
    }

    const [result] = await pool.query(
      'UPDATE cursos SET id_profesor = ? WHERE id_curso = ?',
      [id_profesor, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Curso no encontrado" 
      });
    }

    res.json({ 
      message: "Profesor asignado correctamente al curso", 
      success: true 
    });
  } catch (error) {
    console.error("Error al asignar profesor:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Error al asignar profesor" 
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_curso, horario, cupo_maximo, id_aula, id_idioma, id_nivel, id_profesor } = req.body;

    const query = `
      UPDATE cursos 
      SET nombre_curso = ?, 
          horario = ?, 
          cupo_maximo = ?, 
          id_aula = ?,
          id_idioma = ?,
          id_nivel = ?,
          id_profesor = ?
      WHERE id_curso = ?
    `;

    const [result] = await pool.query(query, [
      nombre_curso, 
      horario, 
      cupo_maximo, 
      id_aula,
      id_idioma,
      id_nivel,
      id_profesor,
      id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    res.json({ message: "Curso actualizado correctamente", success: true });
  } catch (error) {
    console.error("Error al actualizar el curso:", error);
    res.status(500).json({ message: "Error al actualizar el curso" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { nombre_curso, id_idioma, id_nivel, id_profesor, horario, cupo_maximo, id_aula } = req.body;

    if (!nombre_curso || !id_idioma || !id_profesor) {
      return res.status(400).json({ 
        success: false, 
        message: "Nombre del curso, idioma y profesor son obligatorios" 
      });
    }

    const [result] = await pool.query(
      `INSERT INTO cursos (nombre_curso, id_idioma, id_nivel, id_profesor, horario, cupo_maximo, id_aula) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre_curso, 
        id_idioma, 
        id_nivel || null, 
        id_profesor, 
        horario || 'Horario por definir', 
        cupo_maximo || 30, 
        id_aula || null
      ]
    );

    res.json({ 
      message: "Curso creado correctamente", 
      success: true,
      id_curso: result.insertId
    });
  } catch (error) {
    console.error("Error al crear curso:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Error al crear curso" 
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const id_curso = req.params.id;

    const [inscripciones] = await pool.query(
      'SELECT COUNT(*) as total FROM inscripciones WHERE id_curso = ? AND estado = "activo"',
      [id_curso]
    );

    if (inscripciones[0].total > 0) {
      return res.status(400).json({ 
        success: false,
        message: `No se puede eliminar: el curso tiene ${inscripciones[0].total} inscripción/es activa(s)` 
      });
    }

    await pool.query('DELETE FROM calificaciones WHERE id_curso = ?', [id_curso]);
    await pool.query('DELETE FROM asistencias WHERE id_curso = ?', [id_curso]);
    await pool.query('DELETE FROM inscripciones WHERE id_curso = ?', [id_curso]);
    
    const [result] = await pool.query('DELETE FROM cursos WHERE id_curso = ?', [id_curso]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Curso no encontrado" 
      });
    }

    res.json({ 
      message: "Curso eliminado correctamente", 
      success: true 
    });
  } catch (error) {
    console.error("Error al eliminar curso:", error);
    res.status(500).json({ 
      success: false,
      message: error.message || "Error al eliminar curso" 
    });
  }
});


router.put("/:id/cuotas", async (req, res) => {
  try {
    const { id } = req.params;
    const { cuotas } = req.body; // Array: ['Matricula', 'Marzo', 'Abril', ...]
    
    console.log('\n=== PUT /cursos/:id/cuotas ===');
    console.log('ID curso:', id);
    console.log('Body recibido:', req.body);
    console.log('Cuotas recibidas:', cuotas);
    console.log('Tipo de cuotas:', typeof cuotas, Array.isArray(cuotas));
    
    if (!Array.isArray(cuotas)) {
      console.log('ERROR: cuotas no es un array');
      return res.status(400).json({ 
        success: false, 
        message: "El campo 'cuotas' debe ser un array" 
      });
    }

    const [curso] = await pool.query(
      'SELECT id_curso, nombre_curso FROM cursos WHERE id_curso = ?',
      [id]
    );

    if (curso.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Curso no encontrado" 
      });
    }

    const cuotasValidas = ['Matricula', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'];
    
    const cuotasInvalidas = cuotas.filter(c => !cuotasValidas.includes(c));
    if (cuotasInvalidas.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cuotas inválidas: ${cuotasInvalidas.join(', ')}` 
      });
    }

    
    console.log('Cuotas a guardar:', cuotas);
    console.log('Ejecutando UPDATE...');
    
    const placeholders = cuotas.map(() => '?').join(', ');
    const jsonArraySQL = cuotas.length > 0 
      ? `CAST(JSON_ARRAY(${placeholders}) AS JSON)`
      : `CAST('[]' AS JSON)`; // Array vacío en lugar de NULL
    
    await pool.query(
      `UPDATE cursos SET cuotas_habilitadas = ${jsonArraySQL} WHERE id_curso = ?`,
      [...cuotas, id]
    );
    
    console.log('UPDATE exitoso!');
    
    res.json({ 
      success: true, 
      message: `Cuotas actualizadas para el curso "${curso[0].nombre_curso}"`,
      cuotas_habilitadas: cuotas
    });
    
  } catch (error) {
    console.error("Error al actualizar cuotas del curso:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al actualizar cuotas del curso" 
    });
  }
});

router.put("/cuotas/todos", async (req, res) => {
  try {
    const { cuotas } = req.body; // Array: ['Matricula', 'Marzo', 'Abril', ...]
    
    if (!Array.isArray(cuotas)) {
      return res.status(400).json({ 
        success: false, 
        message: "El campo 'cuotas' debe ser un array" 
      });
    }

    const cuotasValidas = ['Matricula', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                           'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'];
    
    const cuotasInvalidas = cuotas.filter(c => !cuotasValidas.includes(c));
    if (cuotasInvalidas.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cuotas inválidas: ${cuotasInvalidas.join(', ')}` 
      });
    }

    const valor = cuotas.length > 0 ? JSON.stringify(cuotas) : null;
    
    const [result] = await pool.query(
      'UPDATE cursos SET cuotas_habilitadas = ?',
      [valor]
    );
    
    res.json({ 
      success: true, 
      message: `Cuotas actualizadas para ${result.affectedRows} cursos`,
      cuotas_habilitadas: cuotas.length > 0 ? cuotas : 'Todas las cuotas',
      cursos_actualizados: result.affectedRows
    });
    
  } catch (error) {
    console.error("Error al actualizar cuotas de todos los cursos:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al actualizar cuotas de todos los cursos" 
    });
  }
});

router.get("/:id/cuotas", async (req, res) => {
  try {
    const { id } = req.params;
    
    const [curso] = await pool.query(
      'SELECT id_curso, nombre_curso, cuotas_habilitadas FROM cursos WHERE id_curso = ?',
      [id]
    );

    if (curso.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Curso no encontrado" 
      });
    }

    const rawCuotas = curso[0].cuotas_habilitadas;
    let cuotasHabilitadas;
    
    if (rawCuotas === null || rawCuotas === undefined) {
      cuotasHabilitadas = null;
    } else if (typeof rawCuotas === 'object' && Array.isArray(rawCuotas)) {
      cuotasHabilitadas = rawCuotas;
    } else {
      try {
        cuotasHabilitadas = JSON.parse(rawCuotas);
      } catch (error) {
        try {
          const jsonString = rawCuotas.replace(/'/g, '"');
          cuotasHabilitadas = JSON.parse(jsonString);
        } catch (error2) {
          console.error('Error parseando cuotas_habilitadas:', rawCuotas);
          cuotasHabilitadas = null;
        }
      }
    }

    const todasLasCuotas = ['Matricula', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                            'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'];

    res.json({ 
      success: true,
      curso: curso[0].nombre_curso,
      cuotasHabilitadas: cuotasHabilitadas !== null ? cuotasHabilitadas : todasLasCuotas
    });
    
  } catch (error) {
    console.error("Error al obtener cuotas del curso:", error);
    console.error("Error completo:", error.message);
    console.error("Stack:", error.stack);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener cuotas del curso",
      error: error.message
    });
  }
});

export default router;


