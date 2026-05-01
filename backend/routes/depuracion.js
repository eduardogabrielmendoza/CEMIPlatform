import express from "express";
import pool from "../utils/db.js";

const router = express.Router();

const SECTIONS = {
  pagos: {
    label: "Pagos",
    tables: ["pagos"],
    select: async (conn) => ({ pagos: await selectRows(conn, "pagos", "1=1", []) }),
    clear: async (conn) => {
      const [result] = await conn.query("DELETE FROM pagos");
      return result.affectedRows;
    },
    restoreOrder: ["pagos"]
  },
  auditoria_pagos: {
    label: "Auditoría de pagos",
    tables: ["registros_pagos"],
    select: async (conn) => ({ registros_pagos: await selectRows(conn, "registros_pagos", "1=1", []) }),
    clear: async (conn) => {
      const [result] = await conn.query("DELETE FROM registros_pagos");
      return result.affectedRows;
    },
    restoreOrder: ["registros_pagos"]
  },
  aulas_inactivas: {
    label: "Aulas inactivas sin cursos",
    tables: ["aulas"],
    select: async (conn) => ({
      aulas: await selectRows(
        conn,
        "aulas",
        "estado = 'inactivo' AND NOT EXISTS (SELECT 1 FROM cursos c WHERE c.id_aula = aulas.id_aula)",
        []
      )
    }),
    clear: async (conn) => {
      const [result] = await conn.query(`
        DELETE FROM aulas
        WHERE estado = 'inactivo'
          AND NOT EXISTS (SELECT 1 FROM cursos c WHERE c.id_aula = aulas.id_aula)
      `);
      return result.affectedRows;
    },
    restoreOrder: ["aulas"]
  },
  inscripciones_inactivas: {
    label: "Inscripciones inactivas",
    tables: ["inscripciones"],
    select: async (conn) => ({ inscripciones: await selectRows(conn, "inscripciones", "estado <> 'activo'", []) }),
    clear: async (conn) => {
      const [result] = await conn.query("DELETE FROM inscripciones WHERE estado <> 'activo'");
      return result.affectedRows;
    },
    restoreOrder: ["inscripciones"]
  },
  cursos_inactivos: {
    label: "Cursos inactivos y datos asociados",
    tables: ["cursos", "inscripciones", "calificaciones", "asistencias", "pagos"],
    select: async (conn) => {
      const cursoIds = await selectIds(conn, "SELECT id_curso FROM cursos WHERE estado = 'inactivo'");
      if (cursoIds.length === 0) {
        return { cursos: [], inscripciones: [], calificaciones: [], asistencias: [], pagos: [] };
      }
      const where = `id_curso IN (${cursoIds.map(() => "?").join(",")})`;
      return {
        cursos: await selectRows(conn, "cursos", where, cursoIds),
        inscripciones: await selectRows(conn, "inscripciones", where, cursoIds),
        calificaciones: await selectRows(conn, "calificaciones", where, cursoIds),
        asistencias: await selectRows(conn, "asistencias", where, cursoIds),
        pagos: await selectRows(conn, "pagos", where, cursoIds)
      };
    },
    clear: async (conn) => {
      const cursoIds = await selectIds(conn, "SELECT id_curso FROM cursos WHERE estado = 'inactivo'");
      if (cursoIds.length === 0) return 0;
      const inClause = cursoIds.map(() => "?").join(",");
      let total = 0;
      for (const table of ["pagos", "calificaciones", "asistencias", "inscripciones"]) {
        const [result] = await conn.query(`DELETE FROM ${table} WHERE id_curso IN (${inClause})`, cursoIds);
        total += result.affectedRows;
      }
      const [result] = await conn.query(`DELETE FROM cursos WHERE id_curso IN (${inClause})`, cursoIds);
      return total + result.affectedRows;
    },
    restoreOrder: ["cursos", "inscripciones", "calificaciones", "asistencias", "pagos"]
  }
};

async function selectRows(conn, table, where, params) {
  const [rows] = await conn.query(`SELECT * FROM ${table} WHERE ${where}`, params);
  return rows;
}

async function selectIds(conn, query, params = []) {
  const [rows] = await conn.query(query, params);
  return rows.map((row) => row.id_curso);
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
    console.error("Error al listar backups de depuración:", error);
    res.status(500).json({ success: false, message: "Error al listar backups" });
  }
});

router.post("/exportar-limpiar", async (req, res) => {
  const selectedSections = normalizeSections(req.body?.secciones);
  if (selectedSections.length === 0) {
    return res.status(400).json({ success: false, message: "Selecciona al menos una sección válida" });
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
    res.status(500).json({ success: false, message: "Error al exportar y limpiar datos" });
  } finally {
    conn.release();
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
        message: "Backup no disponible o vencido. La reversión solo funciona durante 24 horas."
      });
    }

    const backup = typeof rows[0].backup_json === "string"
      ? JSON.parse(rows[0].backup_json)
      : rows[0].backup_json;
    const sections = typeof rows[0].secciones === "string"
      ? JSON.parse(rows[0].secciones)
      : rows[0].secciones;

    let restored = 0;
    const restoredTables = new Set();

    const globalRestoreOrder = ["aulas", "cursos", "inscripciones", "calificaciones", "asistencias", "pagos", "registros_pagos"];
    for (const table of globalRestoreOrder) {
      for (const section of sections) {
        if (!backup[section]?.[table]) continue;
        const key = `${section}:${table}`;
        if (restoredTables.has(key)) continue;
        restored += await restoreRows(conn, table, backup[section][table]);
        restoredTables.add(key);
      }
    }

    await conn.query(
      "UPDATE depuraciones_backup SET restaurado_en = NOW() WHERE id_depuracion = ?",
      [req.params.id]
    );

    await conn.commit();
    res.json({ success: true, message: "Depuración revertida", registros_restaurados: restored });
  } catch (error) {
    await conn.rollback();
    console.error("Error al revertir depuración:", error);
    res.status(500).json({ success: false, message: "Error al revertir depuración" });
  } finally {
    conn.release();
  }
});

export default router;
