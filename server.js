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
      connectSrc: ["'self'", "ws:", "wss:", "https://unpkg.com", "http://localhost:3000", "ws://localhost:3000"],
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

app.use("/api/auth", authRoutes);
app.use("/api/status", statusRoutes);
app.use("/api/config", configRoutes);

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

app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "frontend" });
});

const server = http.createServer(app);

const chatServer = new ChatServer(server);

setChatServer(chatServer);

server.listen(PORT, () => {
  console.log(` Servidor HTTP activo en http://localhost:${PORT}`);
  console.log(` Servidor Socket.IO de Chat activo en http://localhost:${PORT}/socket.io/`);
  console.log(` Estado del chat:`, chatServer.getStats());
});



