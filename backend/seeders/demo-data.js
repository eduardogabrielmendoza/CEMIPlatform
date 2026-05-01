import bcrypt from "bcryptjs";
import pool from "../utils/db.js";
import { fileURLToPath } from "url";

const password = "Cemi2026!";
const today = new Date();

const alumnos = [
  ["Valentina", "Rojas"], ["Mateo", "Fernandez"], ["Sofia", "Acosta"], ["Benjamin", "Pereyra"],
  ["Martina", "Silva"], ["Joaquin", "Herrera"], ["Catalina", "Molina"], ["Thiago", "Castro"],
  ["Lucia", "Navarro"], ["Santino", "Vega"], ["Emma", "Romero"], ["Bautista", "Medina"],
  ["Isabella", "Arias"], ["Lorenzo", "Suarez"], ["Olivia", "Cabrera"], ["Tomas", "Flores"],
  ["Renata", "Ortega"], ["Francisco", "Ramos"], ["Ambar", "Gimenez"], ["Agustin", "Morales"]
];

const profesores = [
  ["Mariana", "Ledesma", "Ingles conversacional"], ["Andres", "Quiroga", "Frances academico"],
  ["Carolina", "Ibarra", "Portugues empresarial"], ["Nicolas", "Peralta", "Ingles inicial"],
  ["Paula", "Benitez", "Frances cultura"], ["Diego", "Soria", "Portugues turistico"],
  ["Florencia", "Campos", "Ingles avanzado"], ["Martin", "Aguilar", "Frances DELF"],
  ["Julieta", "Farias", "Portugues CELPE"], ["Gaston", "Miranda", "Ingles jovenes"],
  ["Camila", "Vidal", "Frances conversacion"], ["Lucas", "Mendez", "Portugues inicial"],
  ["Rocio", "Fuentes", "Ingles negocios"], ["Leandro", "Aguirre", "Frances inicial"],
  ["Malena", "Correa", "Portugues avanzado"], ["Emiliano", "Godoy", "Ingles examenes"],
  ["Ailén", "Paz", "Frances literatura"], ["Bruno", "Serrano", "Portugues conversacion"],
  ["Victoria", "Luna", "Ingles kids"], ["Federico", "Bravo", "Frances avanzado"]
];

const idiomas = [
  { nombre: "Ingles", bandera: "gb", niveles: ["A1", "A2", "B1", "B2"] },
  { nombre: "Frances", bandera: "fr", niveles: ["A1", "A2", "B1"] },
  { nombre: "Portugues", bandera: "br", niveles: ["A1", "A2", "B1"] }
];

const aulas = [
  ["Aula Norte 101", 28], ["Aula Sur 202", 24], ["Laboratorio Idiomas", 32],
  ["Aula Taller 303", 20], ["Auditorio CEMI", 45]
];

const levelCandidates = {
  A1: ["A1", "Base"],
  A2: ["A2", "Pre-Intermedio"],
  B1: ["B1", "Intermedio"],
  B2: ["B2", "Intermedio-Alto", "Avanzado"]
};

const tableColumnsCache = new Map();

async function getTableColumns(table) {
  if (tableColumnsCache.has(table)) return tableColumnsCache.get(table);
  const [rows] = await pool.query(`SHOW COLUMNS FROM ${table}`);
  const columns = new Set(rows.map((row) => row.Field));
  tableColumnsCache.set(table, columns);
  return columns;
}

async function tableExists(table) {
  const [rows] = await pool.query("SHOW TABLES LIKE ?", [table]);
  return rows.length > 0;
}

async function ensureColumn(table, column, definition) {
  const [rows] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE ?`, [column]);
  if (rows.length === 0) {
    try {
      await pool.query(`ALTER TABLE ${table} ADD COLUMN ${definition}`);
      tableColumnsCache.delete(table);
    } catch (error) {
      if (error.code !== "ER_DUP_FIELDNAME") throw error;
    }
  }
}

async function ensureSchema() {
  await ensureColumn("aulas", "estado", "estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER capacidad");
  await ensureColumn("cursos", "ciclo_lectivo", "ciclo_lectivo INT DEFAULT NULL AFTER cupo_maximo");
  await ensureColumn("cursos", "estado", "estado ENUM('activo','inactivo') NOT NULL DEFAULT 'activo' AFTER ciclo_lectivo");
  await ensureColumn("idiomas", "bandera", "bandera VARCHAR(10) DEFAULT NULL AFTER nombre_idioma");
  await ensureColumn("idiomas", "estado", "estado ENUM('activo','inactivo') DEFAULT 'activo' AFTER bandera");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS registros_pagos (
      id_registro INT NOT NULL AUTO_INCREMENT,
      accion VARCHAR(50) NOT NULL,
      id_pago INT DEFAULT NULL,
      id_admin INT DEFAULT NULL,
      nombre_admin VARCHAR(100) DEFAULT NULL,
      nombre_alumno VARCHAR(100) DEFAULT NULL,
      concepto VARCHAR(255) DEFAULT NULL,
      monto DECIMAL(10,2) DEFAULT NULL,
      descripcion TEXT DEFAULT NULL,
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id_registro)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
  `);
  await ensureColumn("registros_pagos", "id_pago", "id_pago INT DEFAULT NULL AFTER accion");
  await ensureColumn("registros_pagos", "id_admin", "id_admin INT DEFAULT NULL AFTER id_pago");
  await ensureColumn("registros_pagos", "nombre_admin", "nombre_admin VARCHAR(100) DEFAULT NULL AFTER id_admin");
  await ensureColumn("registros_pagos", "nombre_alumno", "nombre_alumno VARCHAR(100) DEFAULT NULL AFTER nombre_admin");
  await ensureColumn("registros_pagos", "concepto", "concepto VARCHAR(255) DEFAULT NULL AFTER nombre_alumno");
  await ensureColumn("registros_pagos", "monto", "monto DECIMAL(10,2) DEFAULT NULL AFTER concepto");
  await ensureColumn("registros_pagos", "descripcion", "descripcion TEXT DEFAULT NULL AFTER monto");
  await ensureColumn("registros_pagos", "fecha", "fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER descripcion");
  await ensureColumn("pagos", "archivado", "archivado TINYINT(1) DEFAULT 0 AFTER estado_pago");
}

async function ensureNivel(idIdioma, code) {
  const columns = await getTableColumns("niveles");
  const hasIdiomaColumn = columns.has("id_idioma");
  const candidates = levelCandidates[code] || [code];
  const placeholders = candidates.map(() => "?").join(",");

  if (hasIdiomaColumn) {
    const [rows] = await pool.query(
      `SELECT id_nivel FROM niveles WHERE id_idioma = ? AND descripcion IN (${placeholders}) ORDER BY id_nivel LIMIT 1`,
      [idIdioma, ...candidates]
    );
    if (rows.length > 0) return rows[0].id_nivel;

    const [result] = await pool.query(
      "INSERT INTO niveles (id_idioma, descripcion) VALUES (?, ?)",
      [idIdioma, candidates[0]]
    );
    return result.insertId;
  }

  const [rows] = await pool.query(
    `SELECT id_nivel FROM niveles WHERE descripcion IN (${placeholders}) ORDER BY id_nivel LIMIT 1`,
    candidates
  );
  if (rows.length > 0) return rows[0].id_nivel;

  const descripcion = candidates[1] || candidates[0];
  const [result] = await pool.query("INSERT INTO niveles (descripcion) VALUES (?)", [descripcion]);
  return result.insertId;
}

async function getPerfilId(nombre, fallback) {
  const [rows] = await pool.query("SELECT id_perfil FROM perfiles WHERE LOWER(nombre_perfil) LIKE ? LIMIT 1", [`%${nombre}%`]);
  return rows[0]?.id_perfil || fallback;
}

async function upsertPersona({ nombre, apellido, mail, dni, telefono }) {
  const [existing] = await pool.query("SELECT id_persona FROM personas WHERE mail = ?", [mail]);
  if (existing.length) return existing[0].id_persona;

  const [result] = await pool.query(
    "INSERT INTO personas (nombre, apellido, mail, dni, telefono) VALUES (?, ?, ?, ?, ?)",
    [nombre, apellido, mail, dni, telefono]
  );
  return result.insertId;
}

async function upsertUsuario(idPersona, username, perfilId, hash) {
  const [existing] = await pool.query("SELECT id_usuario FROM usuarios WHERE username = ?", [username]);
  if (existing.length) return;
  const columns = await getTableColumns("usuarios");
  const insertColumns = ["username", "password_hash", "id_persona", "id_perfil"];
  const values = [username, hash, idPersona, perfilId];
  if (columns.has("password_plain")) {
    insertColumns.push("password_plain");
    values.push(password);
  }
  const placeholders = insertColumns.map(() => "?").join(",");
  await pool.query(
    `INSERT INTO usuarios (${insertColumns.join(", ")}) VALUES (${placeholders})`,
    values
  );
}

async function seedIdiomas() {
  const ids = {};
  for (const idioma of idiomas) {
    await pool.query(
      `INSERT INTO idiomas (nombre_idioma, bandera, estado)
       VALUES (?, ?, 'activo')
       ON DUPLICATE KEY UPDATE bandera = VALUES(bandera), estado = 'activo'`,
      [idioma.nombre, idioma.bandera]
    );
    const [rows] = await pool.query("SELECT id_idioma FROM idiomas WHERE nombre_idioma = ?", [idioma.nombre]);
    ids[idioma.nombre] = rows[0].id_idioma;
    for (const nivel of idioma.niveles) {
      await ensureNivel(ids[idioma.nombre], nivel);
    }
  }
  return ids;
}

async function seedAulas() {
  const ids = [];
  for (const [nombre, capacidad] of aulas) {
    const [existing] = await pool.query("SELECT id_aula FROM aulas WHERE nombre_aula = ?", [nombre]);
    if (existing.length) {
      ids.push(existing[0].id_aula);
      await pool.query("UPDATE aulas SET capacidad = ?, estado = 'activo' WHERE id_aula = ?", [capacidad, existing[0].id_aula]);
      continue;
    }
    const [result] = await pool.query(
      "INSERT INTO aulas (nombre_aula, capacidad, estado) VALUES (?, ?, 'activo')",
      [nombre, capacidad]
    );
    ids.push(result.insertId);
  }
  return ids;
}

async function seedPersonas() {
  const hash = await bcrypt.hash(password, 10);
  const perfilAlumno = await getPerfilId("alumno", 3);
  const perfilProfesor = await getPerfilId("profesor", 2);
  const alumnoIds = [];
  const profesorIds = [];

  for (let i = 0; i < alumnos.length; i++) {
    const [nombre, apellido] = alumnos[i];
    const id = await upsertPersona({
      nombre,
      apellido,
      mail: `alumno.demo${String(i + 1).padStart(2, "0")}@cemi.edu.ar`,
      dni: `5100${String(i + 1).padStart(4, "0")}`,
      telefono: `381555${String(1000 + i)}`
    });
    await pool.query(
      `INSERT INTO alumnos (id_alumno, id_persona, legajo, estado, fecha_registro)
       VALUES (?, ?, ?, 'activo', ?)
       ON DUPLICATE KEY UPDATE estado = 'activo', legajo = VALUES(legajo)`,
      [id, id, `SD${String(i + 1).padStart(3, "0")}`, "2026-03-01"]
    );
    await upsertUsuario(id, `alumno.demo${i + 1}`, perfilAlumno, hash);
    alumnoIds.push(id);
  }

  for (let i = 0; i < profesores.length; i++) {
    const [nombre, apellido, especialidad] = profesores[i];
    const id = await upsertPersona({
      nombre,
      apellido,
      mail: `profesor.demo${String(i + 1).padStart(2, "0")}@cemi.edu.ar`,
      dni: `5200${String(i + 1).padStart(4, "0")}`,
      telefono: `381556${String(1000 + i)}`
    });
    await pool.query(
      `INSERT INTO profesores (id_profesor, especialidad, id_persona, fecha_ingreso, estado)
       VALUES (?, ?, ?, ?, 'activo')
       ON DUPLICATE KEY UPDATE especialidad = VALUES(especialidad), estado = 'activo'`,
      [id, especialidad, id, "2024-02-15"]
    );
    await upsertUsuario(id, `profesor.demo${i + 1}`, perfilProfesor, hash);
    profesorIds.push(id);
  }

  return { alumnoIds, profesorIds };
}

async function seedCursos(idiomaIds, aulaIds, profesorIds) {
  const cursos = [
    ["Ingles Inicial Manana", "Ingles", "A1"], ["Ingles Inicial Tarde", "Ingles", "A1"],
    ["Ingles Intermedio", "Ingles", "B1"], ["Ingles Conversacion", "Ingles", "B2"],
    ["Frances Inicial", "Frances", "A1"], ["Frances Intermedio", "Frances", "A2"],
    ["Frances Conversacion", "Frances", "B1"], ["Portugues Inicial", "Portugues", "A1"],
    ["Portugues Intermedio", "Portugues", "A2"], ["Portugues Empresarial", "Portugues", "B1"]
  ];

  const ids = [];
  for (let i = 0; i < cursos.length; i++) {
    const [nombre, idioma, nivel] = cursos[i];
    const idNivel = await ensureNivel(idiomaIds[idioma], nivel);
    const [existing] = await pool.query("SELECT id_curso FROM cursos WHERE nombre_curso = ?", [nombre]);
    const values = [
      nombre,
      idiomaIds[idioma],
      idNivel,
      profesorIds[i],
      i % 2 === 0 ? "Lunes y Miercoles 18:00" : "Martes y Jueves 19:30",
      30,
      aulaIds[i % aulaIds.length],
      2026,
      "activo"
    ];
    if (existing.length) {
      await pool.query(
        `UPDATE cursos SET id_idioma=?, id_nivel=?, id_profesor=?, horario=?, cupo_maximo=?, id_aula=?, ciclo_lectivo=?, estado=? WHERE id_curso=?`,
        [...values.slice(1), existing[0].id_curso]
      );
      ids.push(existing[0].id_curso);
    } else {
      const [result] = await pool.query(
        `INSERT INTO cursos (nombre_curso, id_idioma, id_nivel, id_profesor, horario, cupo_maximo, id_aula, ciclo_lectivo, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values
      );
      ids.push(result.insertId);
    }
  }
  return ids;
}

async function seedRelations(cursoIds, alumnoIds, profesorIds, idiomaIds) {
  if (await tableExists("profesores_idiomas")) {
    const profesorIdiomaColumns = await getTableColumns("profesores_idiomas");
    if (profesorIdiomaColumns.has("id_profesor") && profesorIdiomaColumns.has("id_idioma")) {
      for (let i = 0; i < profesorIds.length; i++) {
        const idiomaId = Object.values(idiomaIds)[i % 3];
        await pool.query(
          "INSERT IGNORE INTO profesores_idiomas (id_profesor, id_idioma) VALUES (?, ?)",
          [profesorIds[i], idiomaId]
        );
      }
    }
  }

  const medios = ["Efectivo", "Transferencia", "Tarjeta de Credito"];
  for (const medio of medios) {
    await pool.query("INSERT IGNORE INTO medios_pago (descripcion) VALUES (?)", [medio]);
  }
  await pool.query("INSERT IGNORE INTO conceptos_pago (id_concepto, descripcion, monto_sugerido) VALUES (1, 'Matricula', 5000)");
  await pool.query("INSERT IGNORE INTO conceptos_pago (id_concepto, descripcion, monto_sugerido) VALUES (2, 'Cuota Mensual', 15000)");
  const [mediosRows] = await pool.query("SELECT id_medio_pago, descripcion FROM medios_pago");

  const registrosColumns = await getTableColumns("registros_pagos");
  if (registrosColumns.has("nombre_admin")) {
    await pool.query("DELETE FROM registros_pagos WHERE nombre_admin = 'Seeder CEMI'");
  }
  const pagoCleanupColumns = await getTableColumns("pagos");
  if (pagoCleanupColumns.has("detalle_pago")) {
    await pool.query("DELETE FROM pagos WHERE detalle_pago LIKE '%Curso demo %'");
  }

  const meses = ["Matricula", "Marzo", "Abril", "Mayo", "Junio", "Julio"];
  for (let c = 0; c < cursoIds.length; c++) {
    const alumnosCurso = Array.from({ length: 15 }, (_, idx) => alumnoIds[(c * 3 + idx) % alumnoIds.length]);
    for (let idx = 0; idx < alumnosCurso.length; idx++) {
      const alumnoId = alumnosCurso[idx];
      const fecha = new Date(today);
      fecha.setDate(today.getDate() - (c + idx + 3));
      const fechaSql = fecha.toISOString().slice(0, 10);
      await pool.query(
        `INSERT IGNORE INTO inscripciones (id_alumno, id_curso, fecha_inscripcion, estado)
         VALUES (?, ?, ?, 'activo')`,
        [alumnoId, cursoIds[c], fechaSql]
      );
      await pool.query(
        `INSERT INTO calificaciones (id_alumno, id_curso, parcial1, parcial2, final)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE parcial1 = VALUES(parcial1), parcial2 = VALUES(parcial2), final = VALUES(final)`,
        [alumnoId, cursoIds[c], 6 + ((idx + c) % 5), 5 + ((idx + c + 1) % 5), 6 + ((idx + c + 2) % 4)]
      );

      if (idx < 8) {
        const mes = meses[(idx + c) % meses.length];
        const medio = mediosRows[(idx + c) % mediosRows.length];
        const pagoFecha = new Date(today);
        pagoFecha.setDate(today.getDate() - ((idx + c) % 45));
        const monto = mes === "Matricula" ? 12000 : 18000 + ((idx + c) % 4) * 2500;
        const pagoColumns = await getTableColumns("pagos");
        const pagoData = {
          id_alumno: alumnoId,
          id_curso: cursoIds[c],
          id_concepto: mes === "Matricula" ? 1 : 2,
          id_medio_pago: medio.id_medio_pago,
          monto,
          fecha_pago: pagoFecha.toISOString().slice(0, 10),
          periodo: `2026-${String(Math.min(11, idx + 2)).padStart(2, "0")}`,
          detalle_pago: `${mes} - Curso demo ${c + 1}`,
          mes_cuota: mes,
          estado_pago: "pagado",
          archivado: 0
        };
        const insertPagoColumns = Object.keys(pagoData).filter((column) => pagoColumns.has(column));
        const insertPagoValues = insertPagoColumns.map((column) => pagoData[column]);
        const [pago] = await pool.query(
          `INSERT INTO pagos (${insertPagoColumns.join(", ")}) VALUES (${insertPagoColumns.map(() => "?").join(", ")})`,
          insertPagoValues
        );
        const registroColumns = await getTableColumns("registros_pagos");
        const registroData = {
          accion: "registrado",
          id_pago: pago.insertId,
          nombre_admin: "Seeder CEMI",
          nombre_alumno: `Alumno demo ${idx + 1}`,
          concepto: `${mes} - Curso demo ${c + 1}`,
          monto,
          descripcion: `Seeder CEMI registro un pago demo por $${monto}`,
          fecha: pagoFecha
        };
        const insertRegistroColumns = Object.keys(registroData).filter((column) => registroColumns.has(column));
        const insertRegistroValues = insertRegistroColumns.map((column) => registroData[column]);
        if (insertRegistroColumns.length > 0) {
          await pool.query(
            `INSERT INTO registros_pagos (${insertRegistroColumns.join(", ")}) VALUES (${insertRegistroColumns.map(() => "?").join(", ")})`,
            insertRegistroValues
          );
        }
      }
    }
  }
}

export async function runDemoSeed() {
  await ensureSchema();
  const idiomaIds = await seedIdiomas();
  const aulaIds = await seedAulas();
  const { alumnoIds, profesorIds } = await seedPersonas();
  const cursoIds = await seedCursos(idiomaIds, aulaIds, profesorIds);
  await seedRelations(cursoIds, alumnoIds, profesorIds, idiomaIds);
  return {
    alumnos: alumnoIds.length,
    profesores: profesorIds.length,
    cursos: cursoIds.length,
    aulas: aulaIds.length,
    idiomas: Object.keys(idiomaIds).length
  };
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isDirectRun) {
  runDemoSeed()
    .then((summary) => {
      console.log(
        `Seeder completado: ${summary.alumnos} alumnos, ${summary.profesores} profesores, ${summary.cursos} cursos, ${summary.aulas} aulas, ${summary.idiomas} idiomas, pagos y auditoría.`
      );
    })
    .catch((error) => {
      console.error("Error ejecutando seeder:", error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await pool.end();
    });
}
