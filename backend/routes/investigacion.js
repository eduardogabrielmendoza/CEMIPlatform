import express from "express";
import PDFDocument from "pdfkit";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import { sendEmail } from "../config/mailer.js";
import { encuestaAgradecimientoTemplate } from "../utils/emailTemplates.js";
import rateLimit from "express-rate-limit";
import { verificarToken, verificarRol } from "../utils/authMiddleware.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const registroPath = path.join(__dirname, "../../uploads/investigacion/registro.json");

const ensureDir = () => {
  const dir = path.dirname(registroPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(registroPath)) {
    fs.writeFileSync(registroPath, JSON.stringify([], null, 2));
  }
};

const leerRegistro = () => {
  ensureDir();
  try {
    return JSON.parse(fs.readFileSync(registroPath, "utf8"));
  } catch {
    return [];
  }
};

const guardarRegistro = (data) => {
  ensureDir();
  fs.writeFileSync(registroPath, JSON.stringify(data, null, 2));
};

const descargarImagen = (url) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.on("end", () => resolve(Buffer.concat(chunks)));
      response.on("error", reject);
    }).on("error", reject);
  });
};

const colores = {
  charcoal: "#1e1e1e",
  wroughtIron: "#4a4a4a",
  graphite: "#656f77",
  silver: "#a0a0a0",
  lightGray: "#f5f5f5",
  texto: "#1e1e1e",
  textoSecundario: "#656f77",
  blanco: "#ffffff",
  grisClaro: "#f5f5f5",
  borde: "#e5e7eb",
  success: "#10b981"
};

const traducciones = {
  gender: {
    "male": "Hombre",
    "female": "Mujer",
    "non-binary": "No binario",
    "prefer-not": "Prefiero no decir",
    "other": "Otro"
  },
  frequency: {
    "daily": "Diariamente",
    "weekly": "Semanalmente",
    "monthly": "Mensualmente",
    "quarterly": "Trimestralmente",
    "rarely": "Raramente"
  },
  education: {
    "primary": "Nivel Primario",
    "secondary": "Nivel Secundario",
    "k12": "Nivel Secundario",
    "university": "Nivel Superior/Universidad",
    "higher": "Nivel Superior/Universidad",
    "postgraduate": "Posgrado",
    "other": "Otro"
  },
  products: {
    "classroom": "Aula Virtual",
    "chat": "Chat",
    "dashboard": "Panel de Control",
    "calendar": "Calendario",
    "payments": "Pagos",
    "resources": "Recursos",
    "grades": "Calificaciones",
    "notifications": "Notificaciones"
  },
  improvements: {
    "interfaz": "Interfaz de usuario",
    "velocidad": "Velocidad del sistema",
    "navegacion": "Navegacion",
    "movil": "Version movil",
    "contenido": "Contenido educativo",
    "comunicacion": "Comunicacion",
    "soporte": "Soporte tecnico",
    "pagos": "Sistema de pagos",
    "calendario": "Calendario",
    "recursos": "Recursos",
    "calificaciones": "Calificaciones",
    "ninguna": "Ninguna mejora necesaria"
  },
  features: {
    "videollamadas": "Videollamadas integradas",
    "app-movil": "Aplicacion movil nativa",
    "gamificacion": "Gamificacion",
    "certificados": "Certificados digitales",
    "foro": "Foro de discusion",
    "biblioteca": "Biblioteca digital",
    "grabaciones": "Grabacion de clases",
    "ia": "Asistente con IA",
    "offline": "Modo offline",
    "ninguna": "Ninguna funcion adicional"
  },
  countries: {
    "AR": "Argentina",
    "BO": "Bolivia",
    "BR": "Brasil",
    "CL": "Chile",
    "CO": "Colombia",
    "CR": "Costa Rica",
    "CU": "Cuba",
    "EC": "Ecuador",
    "SV": "El Salvador",
    "GT": "Guatemala",
    "HN": "Honduras",
    "MX": "Mexico",
    "NI": "Nicaragua",
    "PA": "Panama",
    "PY": "Paraguay",
    "PE": "Peru",
    "PR": "Puerto Rico",
    "DO": "Republica Dominicana",
    "UY": "Uruguay",
    "VE": "Venezuela",
    "ES": "Espana",
    "US": "Estados Unidos",
    "OTHER": "Otro"
  }
};

const traducir = (categoria, valor) => {
  if (!valor) return "No especificado";
  if (Array.isArray(valor)) {
    return valor.map(v => traducciones[categoria]?.[v] || v).join(", ");
  }
  return traducciones[categoria]?.[valor] || valor;
};

// Rate limiter para prevenir spam de encuestas
const encuestaLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 horas
  max: 1, // 1 solicitud por IP
  message: { success: false, error: "Ya has enviado una encuesta hoy. Intenta mañana." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/encuesta", encuestaLimiter, async (req, res) => {
  try {
    const datos = req.body;
    console.log("Datos de encuesta recibidos:", datos);

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
      info: {
        Title: "Encuesta CEMI",
        Author: "CEMI",
        Subject: "Respuestas de Encuesta de Usuario"
      }
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfPromise = new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    const pageWidth = doc.page.width - 100;

    let logoBuffer = null;
    try {
      const logoPath = path.join(__dirname, '../../frontend/images/logo.png');
      logoBuffer = fs.readFileSync(logoPath);
    } catch (err) {
      console.log("No se pudo cargar el logo:", err.message);
    }

    doc.rect(0, 0, doc.page.width, 110).fill(colores.charcoal);
    
    doc.rect(0, 110, doc.page.width, 4).fill(colores.wroughtIron);
    doc.rect(0, 114, doc.page.width, 1.5).fill(colores.graphite);
    
    doc.rect(45, 25, 30, 36).fillAndStroke(colores.wroughtIron, colores.wroughtIron);
    doc.rect(48, 30, 24, 26).fill(colores.charcoal);
    doc.moveTo(60, 32).lineTo(60, 54).strokeColor(colores.silver).lineWidth(0.8).stroke();
    doc.moveTo(50, 43).lineTo(70, 43).strokeColor(colores.silver).lineWidth(0.8).stroke();
    
    if (logoBuffer) {
      doc.circle(doc.page.width - 75, 55, 35).fill(colores.blanco);
      try {
        doc.image(logoBuffer, doc.page.width - 105, 25, { width: 60, height: 60 });
      } catch (err) {
        console.log("Error al insertar logo:", err.message);
      }
    }

    doc.fillColor(colores.blanco)
       .fontSize(28)
       .font("Times-Bold")
       .text("ENCUESTA DE USUARIO", 85, 35);

    doc.fillColor(colores.silver)
       .fontSize(12)
       .font("Helvetica")
       .text("Centro de Enseñanza de Múltiples Idiomas", 85, 68);

    const fechaActual = new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    
    doc.fillColor(colores.silver)
       .fontSize(10)
       .text(`Generado el ${fechaActual}`, 85, 88);

    let yPos = 135;

    const agregarSeccion = (titulo) => {
      if (yPos > 700) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 28).fill(colores.charcoal);
        doc.rect(0, 28, doc.page.width, 2).fill(colores.wroughtIron);
        doc.fillColor(colores.blanco).fontSize(10).font("Times-Bold")
           .text("CEMI - Encuesta de Usuario", 50, 10);
        yPos = 50;
      }
      
      doc.rect(50, yPos, 4, 20).fill(colores.charcoal);
      
      doc.fillColor(colores.charcoal)
         .fontSize(14)
         .font("Times-Bold")
         .text(titulo, 62, yPos + 3);
      
      yPos += 32;
    };

    const agregarCampo = (etiqueta, valor) => {
      if (yPos > 720) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 28).fill(colores.charcoal);
        doc.rect(0, 28, doc.page.width, 2).fill(colores.wroughtIron);
        doc.fillColor(colores.blanco).fontSize(10).font("Times-Bold")
           .text("CEMI - Encuesta de Usuario", 50, 10);
        yPos = 50;
      }

      doc.fillColor(colores.textoSecundario)
         .fontSize(9)
         .font("Helvetica")
         .text(etiqueta, 62, yPos);
      
      doc.fillColor(colores.texto)
         .fontSize(11)
         .font("Helvetica-Bold")
         .text(valor || "No especificado", 62, yPos + 12, { width: pageWidth - 20 });
      
      yPos += 32;
    };

    const agregarCamposLinea = (campos) => {
      if (yPos > 720) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 28).fill(colores.charcoal);
        doc.rect(0, 28, doc.page.width, 2).fill(colores.wroughtIron);
        doc.fillColor(colores.blanco).fontSize(10).font("Times-Bold")
           .text("CEMI - Encuesta de Usuario", 50, 10);
        yPos = 50;
      }

      const anchoColumna = (pageWidth - 12) / campos.length;
      
      campos.forEach((campo, i) => {
        const xPos = 62 + (i * anchoColumna);
        
        doc.fillColor(colores.textoSecundario)
           .fontSize(9)
           .font("Helvetica")
           .text(campo.etiqueta, xPos, yPos);
        
        doc.fillColor(colores.texto)
           .fontSize(11)
           .font("Helvetica-Bold")
           .text(campo.valor || "N/A", xPos, yPos + 12, { width: anchoColumna - 10 });
      });
      
      yPos += 32;
    };

    const agregarCajaTexto = (texto) => {
      if (yPos > 650) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 28).fill(colores.charcoal);
        doc.rect(0, 28, doc.page.width, 2).fill(colores.wroughtIron);
        doc.fillColor(colores.blanco).fontSize(10).font("Times-Bold")
           .text("CEMI - Encuesta de Usuario", 50, 10);
        yPos = 50;
      }
      
      doc.rect(62, yPos, pageWidth - 24, 60)
         .lineWidth(1)
         .fillAndStroke(colores.grisClaro, colores.borde);
      
      doc.rect(62, yPos, pageWidth - 24, 3).fill(colores.charcoal);
      
      doc.fillColor(colores.texto)
         .fontSize(10)
         .font("Helvetica")
         .text(texto || "Sin comentarios", 72, yPos + 14, { 
           width: pageWidth - 44,
           height: 45,
           ellipsis: true
         });
      
      yPos += 72;
    };


    agregarSeccion("INFORMACION PERSONAL");
    
    agregarCamposLinea([
      { etiqueta: "Nombre", valor: datos.firstName },
      { etiqueta: "Apellido", valor: datos.lastName }
    ]);
    
    agregarCampo("Correo Electronico", datos.email);
    
    agregarCamposLinea([
      { etiqueta: "Telefono", valor: datos.phone || "No proporcionado" },
      { etiqueta: "Fecha de Nacimiento", valor: datos.birthdate }
    ]);

    agregarSeccion("UBICACION");
    
    agregarCamposLinea([
      { etiqueta: "Pais", valor: traducir("countries", datos.country) },
      { etiqueta: "Ciudad", valor: datos.city }
    ]);
    
    agregarCamposLinea([
      { etiqueta: "Codigo Postal", valor: datos.postalCode },
      { etiqueta: "Genero", valor: traducir("gender", datos.gender) }
    ]);

    agregarSeccion("PERFIL DE USUARIO");
    
    agregarCamposLinea([
      { etiqueta: "Nivel Educativo", valor: traducir("education", datos.education) },
      { etiqueta: "Frecuencia de Uso", valor: traducir("frequency", datos.frequency) }
    ]);

    agregarSeccion("PRODUCTOS Y SERVICIOS");
    
    if (datos.products && datos.products.length > 0) {
      agregarCampo("Productos utilizados", traducir("products", datos.products));
    } else {
      agregarCampo("Productos utilizados", "Ninguno seleccionado");
    }

    agregarSeccion("SATISFACCION");
    
    const satisfaccionTexto = {
      "1": "1/10 - Muy insatisfecho",
      "2": "2/10 - Insatisfecho",
      "3": "3/10 - Insatisfecho",
      "4": "4/10 - Poco satisfecho",
      "5": "5/10 - Neutral",
      "6": "6/10 - Algo satisfecho",
      "7": "7/10 - Satisfecho",
      "8": "8/10 - Muy satisfecho",
      "9": "9/10 - Excelente",
      "10": "10/10 - Completamente satisfecho"
    };
    
    const valorSatisfaccion = datos.satisfaction ? satisfaccionTexto[datos.satisfaction] || `${datos.satisfaction}/10` : "No especificado";
    agregarCampo("Nivel de satisfaccion general", valorSatisfaccion);

    if (datos.nps) {
      agregarCampo("Probabilidad de recomendar CEMI", `${datos.nps}/10`);
    }

    const mejorasTexto = traducir("improvements", datos.improvements);
    if (mejorasTexto && mejorasTexto !== "No especificado") {
      agregarSeccion("AREAS DE MEJORA SUGERIDAS");
      agregarCajaTexto(mejorasTexto);
    }

    const funcionesTexto = traducir("features", datos.features);
    if (funcionesTexto && funcionesTexto !== "No especificado") {
      agregarSeccion("FUNCIONES SOLICITADAS");
      agregarCajaTexto(funcionesTexto);
    }

    if (datos.comments && datos.comments.trim()) {
      agregarSeccion("COMENTARIOS ADICIONALES");
      agregarCajaTexto(datos.comments);
    }

    const agregarPie = () => {
      const pieY = doc.page.height - 35;
      
      doc.rect(0, pieY - 8, doc.page.width, 2).fill(colores.wroughtIron);
      doc.rect(0, pieY - 5, doc.page.width, 40).fill(colores.charcoal);
      
      doc.fillColor(colores.silver)
         .fontSize(8)
         .font("Helvetica")
         .text(
           "CEMI | Documento confidencial | " + fechaActual,
           50,
           pieY + 5,
           { align: "center", width: pageWidth }
         );
    };

    agregarPie();

    doc.end();

    const pdfBuffer = await pdfPromise;

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "cemi-investigacion",
          resource_type: "raw",
          public_id: `encuesta_${Date.now()}`,
          format: "pdf"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(pdfBuffer);
    });

    console.log("PDF subido a Cloudinary:", uploadResult.secure_url);

    const registro = leerRegistro();
    const nuevoRegistro = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      nombre: `${datos.firstName} ${datos.lastName}`,
      email: datos.email,
      satisfaction: datos.satisfaction || "N/A",
      nps: datos.nps || "N/A",
      pdfUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id
    };
    
    registro.push(nuevoRegistro);
    guardarRegistro(registro);

    try {
      const emailHtml = encuestaAgradecimientoTemplate(datos.firstName);
      await sendEmail(
        datos.email,
        "¡Gracias por completar nuestra encuesta! - CEMI",
        emailHtml
      );
      console.log(`Email de agradecimiento enviado a: ${datos.email}`);
    } catch (emailError) {
      console.error("Error al enviar email de agradecimiento:", emailError.message);
    }

    res.json({
      success: true,
      message: "Encuesta guardada exitosamente",
      pdfUrl: uploadResult.secure_url,
      id: nuevoRegistro.id
    });

  } catch (error) {
    console.error("Error al procesar encuesta:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la encuesta",
      error: error.message
    });
  }
});

router.get("/encuestas", (req, res) => {
  try {
    const registro = leerRegistro();
    res.json({
      success: true,
      encuestas: registro.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    });
  } catch (error) {
    console.error("Error al obtener encuestas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener encuestas",
      error: error.message
    });
  }
});

router.get("/estadisticas", (req, res) => {
  try {
    const registro = leerRegistro();
    
    const satisfacciones = registro
      .map(e => parseInt(e.satisfaction))
      .filter(s => !isNaN(s));
    
    const promedioSatisfaccion = satisfacciones.length > 0
      ? (satisfacciones.reduce((a, b) => a + b, 0) / satisfacciones.length).toFixed(1)
      : 0;

    const npsScores = registro
      .map(e => parseInt(e.nps))
      .filter(n => !isNaN(n));
    
    const promedioNPS = npsScores.length > 0
      ? (npsScores.reduce((a, b) => a + b, 0) / npsScores.length).toFixed(1)
      : 0;

    const distribucionSatisfaccion = {
      1: satisfacciones.filter(s => s === 1).length,
      2: satisfacciones.filter(s => s === 2).length,
      3: satisfacciones.filter(s => s === 3).length,
      4: satisfacciones.filter(s => s === 4).length,
      5: satisfacciones.filter(s => s === 5).length
    };

    res.json({
      success: true,
      estadisticas: {
        total: registro.length,
        promedioSatisfaccion,
        promedioNPS,
        distribucionSatisfaccion,
        ultimaEncuesta: registro.length > 0 ? registro[registro.length - 1].fecha : null
      }
    });
  } catch (error) {
    console.error("Error al obtener estadisticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadisticas",
      error: error.message
    });
  }
});

router.delete("/encuesta/:id", verificarToken, verificarRol('admin', 'administrador'), async (req, res) => {
  try {
    const { id } = req.params;
    const registro = leerRegistro();
    
    const index = registro.findIndex(e => e.id === id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        message: "Encuesta no encontrada"
      });
    }

    const encuesta = registro[index];

    if (encuesta.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(encuesta.cloudinaryId, { resource_type: "raw" });
      } catch (err) {
        console.log("Error al eliminar de Cloudinary:", err.message);
      }
    }

    registro.splice(index, 1);
    guardarRegistro(registro);

    res.json({
      success: true,
      message: "Encuesta eliminada exitosamente"
    });

  } catch (error) {
    console.error("Error al eliminar encuesta:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar encuesta",
      error: error.message
    });
  }
});

router.get("/test-pdf", async (req, res) => {
  try {
    const datos = {
      firstName: "Juan",
      lastName: "Perez",
      email: "juan.perez@ejemplo.com",
      phone: "3814567890",
      birthdate: "1995-03-15",
      gender: "male",
      country: "AR",
      city: "San Miguel de Tucuman",
      postalCode: "T4000",
      education: "university",
      frequency: "daily",
      products: ["classroom", "chat", "dashboard", "calendar"],
      satisfaction: "8",
      nps: "9",
      improvements: ["interfaz", "velocidad", "movil"],
      features: ["videollamadas", "app-movil", "certificados"],
      comments: "El sistema es muy util para gestionar las clases. Me gustaria ver mejoras en la aplicacion movil y que se agreguen videollamadas integradas."
    };

    const PDFDocument = (await import("pdfkit")).default;
    
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 50, right: 50 }
    });

    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfPromise = new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);
    });

    const pageWidth = doc.page.width - 100;

    let logoBuffer = null;
    try {
      const logoPath = path.join(__dirname, '../../frontend/images/logo.png');
      logoBuffer = fs.readFileSync(logoPath);
    } catch (err) {
      console.log("No se pudo cargar el logo:", err.message);
    }

    doc.rect(0, 0, doc.page.width, 110).fill(colores.charcoal);
    doc.rect(0, 110, doc.page.width, 4).fill(colores.wroughtIron);
    doc.rect(0, 114, doc.page.width, 1.5).fill(colores.graphite);
    
    doc.rect(45, 25, 30, 36).fillAndStroke(colores.wroughtIron, colores.wroughtIron);
    doc.rect(48, 30, 24, 26).fill(colores.charcoal);
    
    if (logoBuffer) {
      doc.circle(doc.page.width - 75, 55, 35).fill(colores.blanco);
      try {
        doc.image(logoBuffer, doc.page.width - 105, 25, { width: 60, height: 60 });
      } catch (err) {
        console.log("Error al insertar logo:", err.message);
      }
    }

    doc.fillColor(colores.blanco)
       .fontSize(28)
       .font("Times-Bold")
       .text("ENCUESTA DE USUARIO", 85, 35);

    doc.fillColor(colores.silver)
       .fontSize(12)
       .font("Helvetica")
       .text("Centro de Enseñanza de Múltiples Idiomas", 85, 68);

    const fechaActual = new Date().toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
    
    doc.fillColor(colores.silver)
       .fontSize(10)
       .text(`Generado el ${fechaActual}`, 85, 88);

    let yPos = 135;

    const agregarSeccion = (titulo) => {
      if (yPos > 700) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 28).fill(colores.charcoal);
        doc.rect(0, 28, doc.page.width, 2).fill(colores.wroughtIron);
        doc.fillColor(colores.blanco).fontSize(10).font("Times-Bold")
           .text("CEMI - Encuesta de Usuario", 50, 10);
        yPos = 50;
      }
      
      doc.rect(50, yPos, 4, 20).fill(colores.charcoal);
      doc.fillColor(colores.charcoal)
         .fontSize(14)
         .font("Times-Bold")
         .text(titulo, 62, yPos + 3);
      yPos += 32;
    };

    const agregarCampo = (etiqueta, valor) => {
      if (yPos > 720) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 28).fill(colores.charcoal);
        doc.rect(0, 28, doc.page.width, 2).fill(colores.wroughtIron);
        doc.fillColor(colores.blanco).fontSize(10).font("Times-Bold")
           .text("CEMI - Encuesta de Usuario", 50, 10);
        yPos = 50;
      }

      doc.fillColor(colores.textoSecundario)
         .fontSize(9)
         .font("Helvetica")
         .text(etiqueta, 62, yPos);
      
      doc.fillColor(colores.texto)
         .fontSize(11)
         .font("Helvetica-Bold")
         .text(valor || "No especificado", 62, yPos + 12, { width: pageWidth - 20 });
      
      yPos += 32;
    };

    const agregarCamposLinea = (campos) => {
      if (yPos > 720) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 28).fill(colores.charcoal);
        doc.rect(0, 28, doc.page.width, 2).fill(colores.wroughtIron);
        doc.fillColor(colores.blanco).fontSize(10).font("Times-Bold")
           .text("CEMI - Encuesta de Usuario", 50, 10);
        yPos = 50;
      }

      const anchoColumna = (pageWidth - 12) / campos.length;
      
      campos.forEach((campo, i) => {
        const xPos = 62 + (i * anchoColumna);
        
        doc.fillColor(colores.textoSecundario)
           .fontSize(9)
           .font("Helvetica")
           .text(campo.etiqueta, xPos, yPos);
        
        doc.fillColor(colores.texto)
           .fontSize(11)
           .font("Helvetica-Bold")
           .text(campo.valor || "N/A", xPos, yPos + 12, { width: anchoColumna - 10 });
      });
      
      yPos += 32;
    };

    const agregarCajaTexto = (texto) => {
      if (yPos > 650) {
        doc.addPage();
        doc.rect(0, 0, doc.page.width, 28).fill(colores.charcoal);
        doc.rect(0, 28, doc.page.width, 2).fill(colores.wroughtIron);
        doc.fillColor(colores.blanco).fontSize(10).font("Times-Bold")
           .text("CEMI - Encuesta de Usuario", 50, 10);
        yPos = 50;
      }
      
      doc.rect(62, yPos, pageWidth - 24, 60)
         .lineWidth(1)
         .fillAndStroke(colores.grisClaro, colores.borde);
      
      doc.rect(62, yPos, pageWidth - 24, 3).fill(colores.charcoal);
      
      doc.fillColor(colores.texto)
         .fontSize(10)
         .font("Helvetica")
         .text(texto || "Sin comentarios", 72, yPos + 14, { 
           width: pageWidth - 44,
           height: 45,
           ellipsis: true
         });
      
      yPos += 72;
    };

    agregarSeccion("INFORMACION PERSONAL");
    agregarCamposLinea([
      { etiqueta: "Nombre", valor: datos.firstName },
      { etiqueta: "Apellido", valor: datos.lastName }
    ]);
    agregarCampo("Correo Electronico", datos.email);
    agregarCamposLinea([
      { etiqueta: "Telefono", valor: datos.phone },
      { etiqueta: "Fecha de Nacimiento", valor: datos.birthdate }
    ]);

    agregarSeccion("UBICACION");
    agregarCamposLinea([
      { etiqueta: "Pais", valor: traducir("countries", datos.country) },
      { etiqueta: "Ciudad", valor: datos.city }
    ]);
    agregarCamposLinea([
      { etiqueta: "Codigo Postal", valor: datos.postalCode },
      { etiqueta: "Genero", valor: traducir("gender", datos.gender) }
    ]);

    agregarSeccion("PERFIL DE USUARIO");
    agregarCamposLinea([
      { etiqueta: "Nivel Educativo", valor: traducir("education", datos.education) },
      { etiqueta: "Frecuencia de Uso", valor: traducir("frequency", datos.frequency) }
    ]);

    agregarSeccion("PRODUCTOS Y SERVICIOS");
    agregarCampo("Productos utilizados", traducir("products", datos.products));

    agregarSeccion("SATISFACCION");
    const satisfaccionTexto = {
      "1": "1/10 - Muy insatisfecho",
      "2": "2/10 - Insatisfecho",
      "3": "3/10 - Insatisfecho",
      "4": "4/10 - Poco satisfecho",
      "5": "5/10 - Neutral",
      "6": "6/10 - Algo satisfecho",
      "7": "7/10 - Satisfecho",
      "8": "8/10 - Muy satisfecho",
      "9": "9/10 - Excelente",
      "10": "10/10 - Completamente satisfecho"
    };
    agregarCampo("Nivel de satisfaccion general", satisfaccionTexto[datos.satisfaction]);
    agregarCampo("Probabilidad de recomendar CEMI", `${datos.nps}/10`);

    agregarSeccion("AREAS DE MEJORA SUGERIDAS");
    agregarCajaTexto(traducir("improvements", datos.improvements));

    agregarSeccion("FUNCIONES SOLICITADAS");
    agregarCajaTexto(traducir("features", datos.features));

    agregarSeccion("COMENTARIOS ADICIONALES");
    agregarCajaTexto(datos.comments);

    const pieY = doc.page.height - 35;
    doc.rect(0, pieY - 8, doc.page.width, 2).fill(colores.wroughtIron);
    doc.rect(0, pieY - 5, doc.page.width, 40).fill(colores.charcoal);
    doc.fillColor(colores.silver)
       .fontSize(8)
       .font("Helvetica")
       .text(
         "CEMI | Documento confidencial | " + fechaActual,
         50,
         pieY + 5,
         { align: "center", width: pageWidth }
       );

    doc.end();

    const pdfBuffer = await pdfPromise;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=encuesta-test-cemi.pdf");
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Error al generar PDF de prueba:", error);
    res.status(500).json({
      success: false,
      message: "Error al generar PDF de prueba",
      error: error.message
    });
  }
});

export default router;



