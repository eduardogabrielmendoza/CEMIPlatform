import express from "express";
import pool from "../utils/db.js";
import { runDemoSeed } from "../seeders/demo-data.js";

const router = express.Router();

const SECTIONS = {
  pagos: {
    label: "Pagos",
    tables: ["pagos"],
    select: async (conn) => ({ pagos: await selectRows(conn, "pagos", "1=1", []) }),
    clear: async (conn) => deleteWhere(conn, "pagos", "1=1", [])
  },
  auditoria_pagos: {
    label: "Auditoria de pagos",
    tables: ["registros_pagos"],
    select: async (conn) => ({ registros_pagos: await selectRows(conn, "registros_pagos", "1=1", []) }),
    clear: async (conn) => deleteWhere(conn, "registros_pagos", "1=1", [])
  },
  pagos_archivados: {
    label: "Pagos anulados archivados",
    tables: ["pagos", "registros_pagos"],
    select: async (conn) => {
      const pagoIds = await selectIds(conn, "SELECT id_pago FROM pagos WHERE estado_pago = 'anulado' AND archivado = 1", [], "id_pago");
      return {
        pagos: await selectRowsByIds(conn, "pagos", "id_pago", pagoIds),
        registros_pagos: await selectRowsByIds(conn, "registros_pagos", "id_pago", pagoIds)
      };
    },
    clear: async (conn) => {
      const pagoIds = await selectIds(conn, "SELECT id_pago FROM pagos WHERE estado_pago = 'anulado' AND archivado = 1", [], "id_pago");
      let total = await deleteRowsByIds(conn, "registros_pagos", "id_pago", pagoIds);
      total += await deleteRowsByIds(conn, "pagos", "id_pago", pagoIds);
      return total;
    }
  },
  calificaciones: {
    label: "Calificaciones",
    tables: ["calificaciones"],
    select: async (conn) => ({ calificaciones: await selectRows(conn, "calificaciones", "1=1", []) }),
    clear: async (conn) => deleteWhere(conn, "calificaciones", "1=1", [])
  },
  asistencias: {
    label: "Asistencias",
    tables: ["asistencias"],
    select: async (conn) => ({ asistencias: await selectRows(conn, "asistencias", "1=1", []) }),
    clear: async (conn) => deleteWhere(conn, "asistencias", "1=1", [])
  },
  aulas_inactivas: {
    label: "Aulas inactivas sin cursos",
    tables: ["aulas"],
    select: async (conn) => ({
      aulas: await selectRows(conn, "aulas", "estado = 'inactivo' AND NOT EXISTS (SELECT 1 FROM cursos c WHERE c.id_aula = aulas.id_aula)", [])
    }),
    clear: async (conn) => deleteWhere(
      conn,
      "aulas",
      "estado = 'inactivo' AND NOT EXISTS (SELECT 1 FROM cursos c WHERE c.id_aula = aulas.id_aula)",
      []
    )
  },
  idiomas_inactivos: {
    label: "Idiomas inactivos sin cursos",
    tables: ["idiomas", "profesores_idiomas"],
    select: async (conn) => {
      const idiomaIds = await inactiveIdiomaIds(conn);
      return {
        profesores_idiomas: await selectRowsByIds(conn, "profesores_idiomas", "id_idioma", idiomaIds),
        idiomas: await selectRowsByIds(conn, "idiomas", "id_idioma", idiomaIds)
      };
    },
    clear: async (conn) => {
      const idiomaIds = await inactiveIdiomaIds(conn);
      let total = await deleteRowsByIds(conn, "profesores_idiomas", "id_idioma", idiomaIds);
      total += await deleteRowsByIds(conn, "idiomas", "id_idioma", idiomaIds);
      return total;
    }
  },
  inscripciones_inactivas: {
    label: "Inscripciones inactivas",
    tables: ["inscripciones"],
    select: async (conn) => ({ inscripciones: await selectRows(conn, "inscripciones", "estado <> 'activo'", []) }),
    clear: async (conn) => deleteWhere(conn, "inscripciones", "estado <> 'activo'", [])
  },
  alumnos_inactivos: {
    label: "Alumnos inactivos y datos asociados",
    tables: ["personas", "usuarios", "alumnos", "inscripciones", "calificaciones", "asistencias", "pagos", "registros_pagos"],
    select: async (conn) => {
      const alumnoIds = await selectIds(conn, "SELECT id_alumno FROM alumnos WHERE estado = 'inactivo'", [], "id_alumno");
      const pagoIds = await selectIds(conn, queryByIds("SELECT id_pago FROM pagos WHERE id_alumno", alumnoIds), alumnoIds, "id_pago");
      return {
        personas: await selectRowsByIds(conn, "personas", "id_persona", alumnoIds),
        usuarios: await selectRowsByIds(conn, "usuarios", "id_persona", alumnoIds),
        alumnos: await selectRowsByIds(conn, "alumnos", "id_alumno", alumnoIds),
        inscripciones: await selectRowsByIds(conn, "inscripciones", "id_alumno", alumnoIds),
        calificaciones: await selectRowsByIds(conn, "calificaciones", "id_alumno", alumnoIds),
        asistencias: await selectRowsByIds(conn, "asistencias", "id_alumno", alumnoIds),
        pagos: await selectRowsByIds(conn, "pagos", "id_alumno", alumnoIds),
        registros_pagos: await selectRowsByIds(conn, "registros_pagos", "id_pago", pagoIds)
      };
    },
    clear: async (conn) => {
      const alumnoIds = await selectIds(conn, "SELECT id_alumno FROM alumnos WHERE estado = 'inactivo'", [], "id_alumno");
      const pagoIds = await selectIds(conn, queryByIds("SELECT id_pago FROM pagos WHERE id_alumno", alumnoIds), alumnoIds, "id_pago");
      let total = await deleteRowsByIds(conn, "registros_pagos", "id_pago", pagoIds);
      total += await deleteRowsByIds(conn, "pagos", "id_alumno", alumnoIds);
      total += await deleteRowsByIds(conn, "calificaciones", "id_alumno", alumnoIds);
      total += await deleteRowsByIds(conn, "asistencias", "id_alumno", alumnoIds);
      total += await deleteRowsByIds(conn, "inscripciones", "id_alumno", alumnoIds);
      total += await deleteRowsByIds(conn, "usuarios", "id_persona", alumnoIds);
      total += await deleteRowsByIds(conn, "alumnos", "id_alumno", alumnoIds);
      total += await deleteRowsByIds(conn, "personas", "id_persona", alumnoIds);
      return total;
    }
  },
  profesores_no_activos: {
    label: "Profesores inactivos/licencia sin cursos",
    tables: ["personas", "usuarios", "profesores", "profesores_idiomas"],
    select: async (conn) => {
      const profesorIds = await inactiveProfesorIds(conn);
      return {
        personas: await selectRowsByIds(conn, "personas", "id_persona", profesorIds),
        usuarios: await selectRowsByIds(conn, "usuarios", "id_persona", profesorIds),
        profesores: await selectRowsByIds(conn, "profesores", "id_profesor", profesorIds),
        profesores_idiomas: await selectRowsByIds(conn, "profesores_idiomas", "id_profesor", profesorIds)
      };
    },
    clear: async (conn) => {
      const profesorIds = await inactiveProfesorIds(conn);
      let total = await deleteRowsByIds(conn, "profesores_idiomas", "id_profesor", profesorIds);
      total += await deleteRowsByIds(conn, "usuarios", "id_persona", profesorIds);
      total += await deleteRowsByIds(conn, "profesores", "id_profesor", profesorIds);
      total += await deleteRowsByIds(conn, "personas", "id_persona", profesorIds);
      return total;
    }
  },
  administradores_inactivos: {
    label: "Administradores inactivos",
    tables: ["personas", "usuarios", "administradores"],
    select: async (conn) => {
      const adminIds = await selectIds(conn, "SELECT id_persona FROM administradores WHERE estado = 'inactivo' AND nivel_acceso <> 'superadmin'", [], "id_persona");
      return {
        personas: await selectRowsByIds(conn, "personas", "id_persona", adminIds),
        usuarios: await selectRowsByIds(conn, "usuarios", "id_persona", adminIds),
        administradores: await selectRowsByIds(conn, "administradores", "id_persona", adminIds)
      };
    },
    clear: async (conn) => {
      const adminIds = await selectIds(conn, "SELECT id_persona FROM administradores WHERE estado = 'inactivo' AND nivel_acceso <> 'superadmin'", [], "id_persona");
      let total = await deleteRowsByIds(conn, "usuarios", "id_persona", adminIds);
      total += await deleteRowsByIds(conn, "administradores", "id_persona", adminIds);
      total += await deleteRowsByIds(conn, "personas", "id_persona", adminIds);
      return total;
    }
  },
  cursos_inactivos: {
    label: "Cursos inactivos y datos asociados",
    tables: ["cursos", "inscripciones", "calificaciones", "asistencias", "pagos", "registros_pagos"],
    select: async (conn) => {
      const cursoIds = await selectIds(conn, "SELECT id_curso FROM cursos WHERE estado = 'inactivo'");
      const pagoIds = await selectIds(conn, queryByIds("SELECT id_pago FROM pagos WHERE id_curso", cursoIds), cursoIds, "id_pago");
      return {
        cursos: await selectRowsByIds(conn, "cursos", "id_curso", cursoIds),
        inscripciones: await selectRowsByIds(conn, "inscripciones", "id_curso", cursoIds),
        calificaciones: await selectRowsByIds(conn, "calificaciones", "id_curso", cursoIds),
        asistencias: await selectRowsByIds(conn, "asistencias", "id_curso", cursoIds),
        pagos: await selectRowsByIds(conn, "pagos", "id_curso", cursoIds),
        registros_pagos: await selectRowsByIds(conn, "registros_pagos", "id_pago", pagoIds)
      };
    },
    clear: async (conn) => {
      const cursoIds = await selectIds(conn, "SELECT id_curso FROM cursos WHERE estado = 'inactivo'");
      const pagoIds = await selectIds(conn, queryByIds("SELECT id_pago FROM pagos WHERE id_curso", cursoIds), cursoIds, "id_pago");
      let total = await deleteRowsByIds(conn, "registros_pagos", "id_pago", pagoIds);
      total += await deleteRowsByIds(conn, "pagos", "id_curso", cursoIds);
      total += await deleteRowsByIds(conn, "calificaciones", "id_curso", cursoIds);
      total += await deleteRowsByIds(conn, "asistencias", "id_curso", cursoIds);
      total += await deleteRowsByIds(conn, "inscripciones", "id_curso", cursoIds);
      total += await deleteRowsByIds(conn, "cursos", "id_curso", cursoIds);
      return total;
    }
  }
};

const RESTORE_ORDER = [
  "personas",
  "idiomas",
  "aulas",
  "alumnos",
  "profesores",
  "administradores",
  "usuarios",
  "profesores_idiomas",
  "cursos",
  "inscripciones",
  "calificaciones",
  "asistencias",
  "pagos",
  "registros_pagos"
];

function queryByIds(prefix, ids) {
  if (!ids || ids.length === 0) return `${prefix} IN (NULL)`;
  return `${prefix} IN (${ids.map(() => "?").join(",")})`;
}

async function selectRows(conn, table, where, params) {
  const [rows] = await conn.query(`SELECT * FROM ${table} WHERE ${where}`, params);
  return rows;
}

async function selectRowsByIds(conn, table, column, ids) {
  if (!ids || ids.length === 0) return [];
  return selectRows(conn, table, `${column} IN (${ids.map(() => "?").join(",")})`, ids);
}

async function deleteWhere(conn, table, where, params) {
  const [result] = await conn.query(`DELETE FROM ${table} WHERE ${where}`, params);
  return result.affectedRows;
}

async function deleteRowsByIds(conn, table, column, ids) {
  if (!ids || ids.length === 0) return 0;
  return deleteWhere(conn, table, `${column} IN (${ids.map(() => "?").join(",")})`, ids);
}

async function selectIds(conn, query, params = [], column = "id_curso") {
  const [rows] = await conn.query(query, params);
  return rows.map((row) => row[column]);
}

async function inactiveIdiomaIds(conn) {
  return selectIds(conn, `
    SELECT id_idioma FROM idiomas i
    WHERE COALESCE(i.estado, 'activo') = 'inactivo'
      AND NOT EXISTS (SELECT 1 FROM cursos c WHERE c.id_idioma = i.id_idioma)
  `, [], "id_idioma");
}

async function inactiveProfesorIds(conn) {
  return selectIds(conn, `
    SELECT p.id_profesor FROM profesores p
    WHERE p.estado <> 'activo'
      AND NOT EXISTS (SELECT 1 FROM cursos c WHERE c.id_profesor = p.id_profesor)
  `, [], "id_profesor");
}

function normalizeSections(sections) {
  if (!Array.isArray(sections)) return [];
  return [...new Set(sections)].filter((section) => SECTIONS[section]);
}

async function restoreRows(conn, table, rows) {
  if (!rows || rows.length === 0) return 0;
  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => "?").join(",");
  const columnSql = columns.map((column) => `\`${column}\``).join(",");
  let restored = 0;

  for (const row of rows) {
    const values = columns.map((column) => row[column]);
    const [result] = await conn.query(
      `INSERT IGNORE INTO ${table} (${columnSql}) VALUES (${placeholders})`,
      values
    );
    restored += result.affectedRows;
  }

  return restored;
}

router.get("/opciones", (_req, res) => {
  res.json({
    success: true,
    opciones: Object.entries(SECTIONS).map(([id, config]) => ({
      id,
      label: config.label,
      tables: config.tables
    }))
  });
});

router.get("/backups", async (_req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id_depuracion, secciones, total_registros, creado_en, expira_en, restaurado_en
      FROM depuraciones_backup
      ORDER BY creado_en DESC
      LIMIT 20
    `);
    res.json({ success: true, backups: rows });
  } catch (error) {
    console.error("Error al listar backups de depuracion:", error);
    res.status(500).json({ success: false, message: "Error al listar backups" });
  }
});

router.post("/exportar-limpiar", async (req, res) => {
  const selectedSections = normalizeSections(req.body?.secciones);
  if (selectedSections.length === 0) {
    return res.status(400).json({ success: false, message: "Selecciona al menos una seccion valida" });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const backup = {};
    let totalRegistros = 0;
    const resumen = [];

    for (const section of selectedSections) {
      const config = SECTIONS[section];
      const sectionBackup = await config.select(conn);
      backup[section] = sectionBackup;
      const count = Object.values(sectionBackup).reduce((sum, rows) => sum + rows.length, 0);
      totalRegistros += count;
      const deleted = await config.clear(conn);
      resumen.push({ section, label: config.label, respaldados: count, eliminados: deleted });
    }

    const [result] = await conn.query(
      `INSERT INTO depuraciones_backup (secciones, backup_json, total_registros, creado_por, expira_en)
       VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [
        JSON.stringify(selectedSections),
        JSON.stringify(backup),
        totalRegistros,
        req.user?.id_persona || null
      ]
    );

    await conn.commit();

    res.json({
      success: true,
      id_depuracion: result.insertId,
      generado_en: new Date().toISOString(),
      expira_en_horas: 24,
      secciones: selectedSections,
      resumen,
      backup
    });
  } catch (error) {
    await conn.rollback();
    console.error("Error al exportar y limpiar:", error);
    res.status(500).json({ success: false, message: error.sqlMessage || "Error al exportar y limpiar datos" });
  } finally {
    conn.release();
  }
});

router.post("/seed-demo", async (_req, res) => {
  try {
    const summary = await runDemoSeed();
    res.json({
      success: true,
      message: "Script de datos ejecutado correctamente",
      summary
    });
  } catch (error) {
    console.error("Error ejecutando seeder demo:", error);
    const detail = error.sqlMessage || error.message || "Error desconocido";
    res.status(500).json({
      success: false,
      message: `Error al ejecutar el script de datos: ${detail}`,
      error: detail,
      code: error.code || null
    });
  }
});

router.post("/:id/revertir", async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      `SELECT * FROM depuraciones_backup
       WHERE id_depuracion = ?
         AND restaurado_en IS NULL
         AND expira_en >= NOW()
       FOR UPDATE`,
      [req.params.id]
    );

    if (rows.length === 0) {
      await conn.rollback();
      return res.status(400).json({
        success: false,
        message: "Backup no disponible o vencido. La reversion solo funciona durante 24 horas."
      });
    }

    const backup = typeof rows[0].backup_json === "string"
      ? JSON.parse(rows[0].backup_json)
      : rows[0].backup_json;
    const sections = typeof rows[0].secciones === "string"
      ? JSON.parse(rows[0].secciones)
      : rows[0].secciones;

    let restored = 0;
    for (const table of RESTORE_ORDER) {
      for (const section of sections) {
        if (!backup[section]?.[table]) continue;
        restored += await restoreRows(conn, table, backup[section][table]);
      }
    }

    await conn.query(
      "UPDATE depuraciones_backup SET restaurado_en = NOW() WHERE id_depuracion = ?",
      [req.params.id]
    );

    await conn.commit();
    res.json({ success: true, message: "Depuracion revertida", registros_restaurados: restored });
  } catch (error) {
    await conn.rollback();
    console.error("Error al revertir depuracion:", error);
    res.status(500).json({ success: false, message: "Error al revertir depuracion" });
  } finally {
    conn.release();
  }
});

export default router;
