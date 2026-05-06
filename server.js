import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import pool from "./backend/utils/db.js";

import authRoutes from "./backend/routes/auth.js";
import alumnosRoutes from "./backend/routes/alumnos.js";
import profesoresRoutes from "./backend/routes/profesores.js";
import administradoresRoutes from "./backend/routes/administradores.js";
import cursosRoutes from "./backend/routes/cursos.js";
import pagosRoutes from "./backend/routes/pagos.js";
import idiomasRoutes from "./backend/routes/idiomas.js";
import aulasRoutes from "./backend/routes/aulas.js";
import nivelesRoutes from "./backend/routes/niveles.js";
import inscripcionesRoutes from "./backend/routes/inscripciones.js";
import calificacionesRoutes from "./backend/routes/calificaciones.js";
import asistenciasRoutes from "./backend/routes/asistencias.js";
import statsRoutes from "./backend/routes/stats.js";
import classroomRoutes from "./backend/routes/classroom.js";
import perfilClassroomRoutes from "./backend/routes/perfil-classroom.js";
import notificacionesRoutes from "./backend/routes/notificaciones.js";
import chatRoutes, { setChatServer } from "./backend/routes/chat.js";
import classroomChatRoutes from "./backend/routes/classroom-chat.js";
import configRoutes from "./backend/routes/config.js";
import investigacionRoutes from "./backend/routes/investigacion-db.js";
import comunidadRoutes from "./backend/routes/comunidad-db.js";
import statusRoutes from "./backend/routes/status.js";
import gdprRoutes from "./backend/routes/gdpr.js";
import codigosRecuperacionRoutes from "./backend/routes/codigosRecuperacion.js";
import codigosCemiRoutes from "./backend/routes/codigos-cemi.js";
import recuperacionRoutes from "./backend/routes/recuperacion.js";
import depuracionRoutes from "./backend/routes/depuracion.js";
import ChatServer from "./backend/utils/chat-server.js";
import http from "http";
import { verificarToken } from "./backend/utils/authMiddleware.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://unpkg.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://cdn.socket.io"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net", "https://cdnjs.cloudflare.com", "https://unpkg.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "ws:", "wss:", "https://unpkg.com", "https://cdn.socket.io", "https://cdnjs.cloudflare.com", "http://localhost:3000", "ws://localhost:3000"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // Formato corto para desarrollo
} else {
  app.use(morgan('combined')); // Formato completo para producción
}

app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Aumentado a 1000 requests por IP
  message: 'Demasiadas peticiones desde esta IP, por favor intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path.startsWith('/api/chat');
  },
  validate: { xForwardedForHeader: false }
});
app.use('/api/', limiter);

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
  process.env.RAILWAY_STATIC_URL,
  process.env.RAILWAY_PUBLIC_DOMAIN
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
  }
  next();
});

app.use('/uploads', express.static('uploads'));
app.use('/uploads/recursos', express.static('uploads/recursos'));
app.use('/uploads/tareas', express.static('uploads/tareas'));

app.use('/assets', express.static('frontend/assets'));

app.use('/downloads', express.static('frontend/downloads', {
  setHeaders: (res, path) => {
    if (path.endsWith('.apk')) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="cemi-app-v1.2.apk"');
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

app.use(express.static('frontend'));

const verificarConexion = async () => {
  try {
    const [rows] = await pool.query("SELECT 1");
    console.log(" Conexión con MySQL establecida correctamente.");
  } catch (error) {
    console.error(" Error al conectar con MySQL:", error.message);
  }
};
verificarConexion();


app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "CEMI API is running",
    timestamp: new Date().toISOString()
  });
});

async function tableHasColumn(table, column) {
  const [rows] = await pool.query(
    "SELECT COUNT(*) AS total FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
    [table, column]
  );
  return Number(rows[0]?.total || 0) > 0;
}

app.get("/api/oferta-academica", async (req, res) => {
  try {
    const idiomasHasEstado = await tableHasColumn("idiomas", "estado");
    const idiomasHasBandera = await tableHasColumn("idiomas", "bandera");
    const nivelesHasIdioma = await tableHasColumn("niveles", "id_idioma");
    const idiomaColumns = [
      "id_idioma",
      "nombre_idioma",
      idiomasHasBandera ? "bandera" : "NULL AS bandera",
      idiomasHasEstado ? "COALESCE(estado, 'activo') AS estado" : "'activo' AS estado"
    ].join(", ");
    const [idiomas] = await pool.query(`SELECT ${idiomaColumns} FROM idiomas ORDER BY nombre_idioma`);
    const [niveles] = await pool.query(
      nivelesHasIdioma
        ? "SELECT id_nivel, id_idioma, descripcion FROM niveles ORDER BY id_nivel"
        : "SELECT id_nivel, descripcion FROM niveles ORDER BY id_nivel"
    );
    const [cursos] = await pool.query(`
      SELECT
        c.id_curso,
        c.nombre_curso,
        c.id_idioma,
        c.horario,
        c.cupo_maximo,
        c.ciclo_lectivo,
        COALESCE(c.estado, 'activo') AS estado,
        n.descripcion AS nivel
      FROM cursos c
      LEFT JOIN niveles n ON c.id_nivel = n.id_nivel
      WHERE COALESCE(c.estado, 'activo') = 'activo'
      ORDER BY c.id_idioma, n.id_nivel, c.nombre_curso
    `);
    const nivelesUniversales = nivelesHasIdioma ? [] : niveles;
    const idiomasConNiveles = idiomas.map(idioma => ({
      ...idioma,
      niveles: nivelesHasIdioma ? niveles.filter(nivel => String(nivel.id_idioma) === String(idioma.id_idioma)) : nivelesUniversales,
      cursos: cursos.filter(curso => String(curso.id_idioma) === String(idioma.id_idioma))
    }));
    res.json({
      success: true,
      idiomas: idiomasConNiveles,
      niveles_universales: nivelesUniversales
    });
  } catch (error) {
    console.error("Error al obtener oferta académica:", error);
    res.status(500).json({ success: false, message: "Error al obtener oferta académica" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/config", configRoutes);
app.use("/api/recuperacion", recuperacionRoutes);

app.use("/api/alumnos", verificarToken, alumnosRoutes);
app.use("/api/profesores", verificarToken, profesoresRoutes);
app.use("/api/administradores", verificarToken, administradoresRoutes);
app.use("/api/cursos", verificarToken, cursosRoutes);
app.use("/api/pagos", verificarToken, pagosRoutes);
app.use("/api/idiomas", verificarToken, idiomasRoutes);
app.use("/api/aulas", verificarToken, aulasRoutes);
app.use("/api/niveles", verificarToken, nivelesRoutes);
app.use("/api/inscripciones", verificarToken, inscripcionesRoutes);
app.use("/api/calificaciones", verificarToken, calificacionesRoutes);
app.use("/api/asistencias", verificarToken, asistenciasRoutes);
app.use("/api/stats", verificarToken, statsRoutes);
app.use("/api/classroom", verificarToken, classroomRoutes);
app.use("/api/classroom", verificarToken, perfilClassroomRoutes);
app.use("/api/notificaciones", verificarToken, notificacionesRoutes);
app.use("/api/chat", verificarToken, chatRoutes);
app.use("/api/classroom-chat", verificarToken, classroomChatRoutes);
app.use("/api/investigacion", verificarToken, investigacionRoutes);
app.use("/api/comunidad", comunidadRoutes);
app.use("/api/gdpr", verificarToken, gdprRoutes);
app.use("/api/codigos-recuperacion", verificarToken, codigosRecuperacionRoutes);
app.use("/api/codigos-cemi", verificarToken, codigosCemiRoutes);
app.use("/api/depuracion", verificarToken, depuracionRoutes);

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "frontend" });
});

const server = http.createServer(app);

const chatServer = new ChatServer(server);

setChatServer(chatServer);

// Auto-migrate: ensure new tables/columns exist
(async () => {
  try {
    // Add bandera column to idiomas if not exists
    const [idiomasCols] = await pool.query("SHOW COLUMNS FROM idiomas LIKE 'bandera'");
    if (idiomasCols.length === 0) {
      await pool.query("ALTER TABLE idiomas ADD COLUMN bandera VARCHAR(10) DEFAULT NULL AFTER nombre_idioma");
      console.log('[migration] Added bandera column to idiomas');
    }

    // Add estado column to idiomas if not exists
    const [idiomasEstadoCols] = await pool.query("SHOW COLUMNS FROM idiomas LIKE 'estado'");
    if (idiomasEstadoCols.length === 0) {
      await pool.query("ALTER TABLE idiomas ADD COLUMN estado ENUM('activo','inactivo') DEFAULT 'activo' AFTER bandera");
      console.log('[migration] Added estado column to idiomas');
    }

    // Populate bandera with 2-letter ISO codes for known idiomas (only when NULL)
    const banderaMap = [
      ['gb', '%ingl%'], ['fr', '%franc%'], ['de', '%alem%'],
      ['it', '%italian%'], ['br', '%portugu%'], ['jp', '%japon%'],
      ['cn', '%chin%'], ['cn', '%mandarin%'], ['kr', '%crean%'],
      ['kr', '%coreano%'], ['ru', '%ruso%'], ['sa', '%arab%'],
      ['in', '%hindi%'], ['tr', '%turco%'], ['es', '%espa%'],
    ];
    for (const [code, pattern] of banderaMap) {
      await pool.query(
        'UPDATE idiomas SET bandera = ? WHERE LOWER(nombre_idioma) LIKE ? AND bandera IS NULL',
        [code, pattern]
      ).catch(() => {});
    }
    console.log('[migration] bandera values populated for known idiomas');

    // Add 'resuelta' to chat_conversaciones.estado ENUM if not present
    const [chatEstadoCols] = await pool.query("SHOW COLUMNS FROM chat_conversaciones LIKE 'estado'");
    if (chatEstadoCols.length > 0 && !chatEstadoCols[0].Type.includes('resuelta')) {
      await pool.query("ALTER TABLE chat_conversaciones MODIFY COLUMN estado ENUM('pendiente','activa','cerrada','resuelta') DEFAULT 'pendiente'");
      console.log('[migration] chat_conversaciones.estado ENUM updated with resuelta');
    }

    // Add 'sistema' to chat_mensajes.tipo_remitente ENUM if not present
    const [chatMensajesCols] = await pool.query("SHOW COLUMNS FROM chat_mensajes LIKE 'tipo_remitente'");
    if (chatMensajesCols.length > 0 && !chatMensajesCols[0].Type.includes('sistema')) {
      await pool.query("ALTER TABLE chat_mensajes MODIFY COLUMN tipo_remitente ENUM('invitado','alumno','profesor','admin','sistema') COLLATE utf8mb4_general_ci NOT NULL");
      console.log('[migration] chat_mensajes.tipo_remitente ENUM updated with sistema');
    }

    // Create registros_pagos table if not exists
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
    console.log('[migration] registros_pagos table ensured');

    const [aulasEstadoCols] = await pool.query("SHOW COLUMNS FROM aulas LIKE 'estado'");
    if (aulasEstadoCols.length === 0) {
      await pool.query("ALTER TABLE aulas ADD COLUMN estado ENUM('activo','inactivo') DEFAULT 'activo' AFTER capacidad");
      console.log('[migration] Added estado column to aulas');
    }

    const [cursosCicloCols] = await pool.query("SHOW COLUMNS FROM cursos LIKE 'ciclo_lectivo'");
    if (cursosCicloCols.length === 0) {
      await pool.query("ALTER TABLE cursos ADD COLUMN ciclo_lectivo INT DEFAULT NULL AFTER cupo_maximo");
      await pool.query("UPDATE cursos SET ciclo_lectivo = YEAR(CURDATE()) WHERE ciclo_lectivo IS NULL");
      console.log('[migration] Added ciclo_lectivo column to cursos');
    }

    const [cursosEstadoCols] = await pool.query("SHOW COLUMNS FROM cursos LIKE 'estado'");
    if (cursosEstadoCols.length === 0) {
      await pool.query("ALTER TABLE cursos ADD COLUMN estado ENUM('activo','inactivo') DEFAULT 'activo' AFTER ciclo_lectivo");
      console.log('[migration] Added estado column to cursos');
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS depuraciones_backup (
        id_depuracion INT NOT NULL AUTO_INCREMENT,
        secciones JSON NOT NULL,
        backup_json JSON NOT NULL,
        total_registros INT NOT NULL DEFAULT 0,
        creado_por INT DEFAULT NULL,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expira_en TIMESTAMP NOT NULL,
        restaurado_en TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (id_depuracion),
        KEY idx_depuraciones_expira (expira_en),
        KEY idx_depuraciones_restaurado (restaurado_en)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('[migration] depuraciones_backup table ensured');
  } catch (err) {
    console.error('[migration] Error running auto-migrations:', err.message);
  }
})();

server.listen(PORT, () => {
  console.log(` Servidor HTTP activo en http://localhost:${PORT}`);
  console.log(` Servidor Socket.IO de Chat activo en http://localhost:${PORT}/socket.io/`);
  console.log(` Estado del chat:`, chatServer.getStats());
});



