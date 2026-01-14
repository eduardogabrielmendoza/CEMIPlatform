import express from "express";
import PDFDocument from "pdfkit";
import { v2 as cloudinary } from "cloudinary";
import https from "https";
import pool from "../utils/db.js";
import { sendEmail } from "../config/mailer.js";
import { encuestaAgradecimientoTemplate } from "../utils/emailTemplates.js";

const router = express.Router();

// Función para parsear JSON de forma segura
const parseJsonSafe = (jsonString) => {
  if (!jsonString) return [];
  if (Array.isArray(jsonString)) return jsonString;
  if (typeof jsonString === 'string' && jsonString.length > 0) {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error('Error parseando JSON:', e);
      return [];
    }
  }
  return [];
};

// =============================================
// TRADUCCIONES Y HELPERS
// =============================================

const traducciones = {
  gender: {
    "male": "Hombre", "female": "Mujer", "non-binary": "No binario",
    "prefer-not": "Prefiero no decir", "other": "Otro"
  },
  frequency: {
    "daily": "Diariamente", "weekly": "Semanalmente", "monthly": "Mensualmente",
    "quarterly": "Trimestralmente", "rarely": "Raramente"
  },
  education: {
    "primary": "Nivel Primario", "secondary": "Nivel Secundario", "k12": "Nivel Secundario",
    "university": "Nivel Superior/Universidad", "higher": "Nivel Superior/Universidad",
    "postgraduate": "Posgrado", "other": "Otro"
  },
  countries: {
    "AR": "Argentina", "BO": "Bolivia", "BR": "Brasil", "CL": "Chile",
    "CO": "Colombia", "MX": "Mexico", "PE": "Peru", "UY": "Uruguay",
    "VE": "Venezuela", "ES": "Espana", "US": "Estados Unidos", "OTHER": "Otro"
  }
};

const colores = {
  charcoal: "#1e1e1e", graphite: "#656f77", silver: "#a0a0a0",
  lightGray: "#f5f5f5", blanco: "#ffffff", borde: "#e5e7eb"
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

// =============================================
// RUTAS DE ENCUESTAS
// =============================================

// Guardar nueva encuesta
router.post("/encuesta", async (req, res) => {
  try {
    const datos = req.body;
    console.log("Datos de encuesta recibidos:", datos);

    // Generar PDF
    const pdfBuffer = await generarPDF(datos);

    // Subir PDF a Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "encuestas",
          public_id: `encuesta_${Date.now()}`,
          format: "pdf"
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(pdfBuffer);
    });

    // Guardar en base de datos
    const [result] = await pool.execute(
      `INSERT INTO encuestas_investigacion 
       (first_name, last_name, email, phone, age, gender, country, city,
        education, institution, role, frequency, products, main_purpose,
        satisfaction, recommendation, improvements, improvement_priority,
        desired_features, feature_priority, positive_feedback, negative_feedback,
        additional_comments, contact_permission, newsletter_subscription,
        pdf_url, pdf_public_id, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        datos.firstName, datos.lastName, datos.email, datos.phone || null,
        datos.age || null, datos.gender || null, datos.country || null, datos.city || null,
        datos.education || null, datos.institution || null, datos.role || null,
        datos.frequency || null, datos.products ? JSON.stringify(datos.products) : null,
        datos.mainPurpose || null, datos.satisfaction || null, datos.recommendation || null,
        datos.improvements ? JSON.stringify(datos.improvements) : null,
        datos.improvementPriority || null,
        datos.desiredFeatures ? JSON.stringify(datos.desiredFeatures) : null,
        datos.featurePriority || null, datos.positiveFeedback || null,
        datos.negativeFeedback || null, datos.additionalComments || null,
        datos.contactPermission ? 1 : 0, datos.newsletterSubscription ? 1 : 0,
        uploadResult.secure_url, uploadResult.public_id,
        req.ip || null, req.headers['user-agent'] || null
      ]
    );

    // Enviar email de agradecimiento
    try {
      const emailHtml = encuestaAgradecimientoTemplate(datos.firstName);
      await sendEmail(
        datos.email,
        "¡Gracias por completar nuestra encuesta! - CEMI",
        emailHtml
      );
    } catch (emailError) {
      console.error("Error al enviar email:", emailError.message);
    }

    res.json({
      success: true,
      message: "Encuesta guardada exitosamente",
      pdfUrl: uploadResult.secure_url,
      id: result.insertId
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

// Obtener todas las encuestas
router.get("/encuestas", async (req, res) => {
  try {
    const [encuestas] = await pool.execute(
      `SELECT * FROM encuestas_investigacion ORDER BY fecha_creacion DESC`
    );

    // Formatear para el frontend
    const encuestasFormateadas = encuestas.map(e => ({
      id: e.id,
      firstName: e.first_name,
      lastName: e.last_name,
      email: e.email,
      phone: e.phone,
      age: e.age,
      gender: e.gender,
      country: e.country,
      city: e.city,
      education: e.education,
      institution: e.institution,
      role: e.role,
      frequency: e.frequency,
      products: parseJsonSafe(e.products),
      mainPurpose: e.main_purpose,
      satisfaction: e.satisfaction,
      recommendation: e.recommendation,
      improvements: parseJsonSafe(e.improvements),
      improvementPriority: e.improvement_priority,
      desiredFeatures: parseJsonSafe(e.desired_features),
      featurePriority: e.feature_priority,
      positiveFeedback: e.positive_feedback,
      negativeFeedback: e.negative_feedback,
      additionalComments: e.additional_comments,
      contactPermission: e.contact_permission === 1,
      newsletterSubscription: e.newsletter_subscription === 1,
      pdfUrl: e.pdf_url,
      fecha: e.fecha_creacion
    }));

    res.json({
      success: true,
      encuestas: encuestasFormateadas
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

// Obtener estadísticas
router.get("/estadisticas", async (req, res) => {
  try {
    const [[stats]] = await pool.execute(`
      SELECT 
        COUNT(*) as total,
        AVG(satisfaction) as promedioSatisfaccion,
        AVG(recommendation) as promedioNPS,
        MAX(fecha_creacion) as ultimaEncuesta,
        COUNT(CASE WHEN contact_permission = 1 THEN 1 END) as conPermisoContacto,
        COUNT(CASE WHEN newsletter_subscription = 1 THEN 1 END) as suscriptores
      FROM encuestas_investigacion
    `);

    // Distribución de satisfacción
    const [distribucion] = await pool.execute(`
      SELECT satisfaction, COUNT(*) as cantidad
      FROM encuestas_investigacion
      WHERE satisfaction IS NOT NULL
      GROUP BY satisfaction
    `);

    const distribucionSatisfaccion = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribucion.forEach(d => {
      if (d.satisfaction >= 1 && d.satisfaction <= 5) {
        distribucionSatisfaccion[d.satisfaction] = d.cantidad;
      }
    });

    res.json({
      success: true,
      estadisticas: {
        total: stats.total || 0,
        promedioSatisfaccion: stats.promedioSatisfaccion ? parseFloat(stats.promedioSatisfaccion).toFixed(1) : 0,
        promedioNPS: stats.promedioNPS ? parseFloat(stats.promedioNPS).toFixed(1) : 0,
        ultimaEncuesta: stats.ultimaEncuesta,
        conPermisoContacto: stats.conPermisoContacto || 0,
        suscriptores: stats.suscriptores || 0,
        distribucionSatisfaccion
      }
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener estadísticas",
      error: error.message
    });
  }
});

// Eliminar encuesta
router.delete("/encuestas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener info del PDF para eliminar de Cloudinary
    const [[encuesta]] = await pool.execute(
      'SELECT pdf_public_id FROM encuestas_investigacion WHERE id = ?',
      [id]
    );

    if (encuesta && encuesta.pdf_public_id) {
      try {
        await cloudinary.uploader.destroy(encuesta.pdf_public_id, { resource_type: 'raw' });
      } catch (e) {
        console.error("Error eliminando PDF de Cloudinary:", e);
      }
    }

    await pool.execute('DELETE FROM encuestas_investigacion WHERE id = ?', [id]);

    res.json({ success: true, message: "Encuesta eliminada" });
  } catch (error) {
    console.error("Error al eliminar encuesta:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar encuesta",
      error: error.message
    });
  }
});

// =============================================
// FUNCIÓN PARA GENERAR PDF
// =============================================

async function generarPDF(datos) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40, bufferPages: true });
      const chunks = [];

      doc.on("data", chunk => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      doc.rect(0, 0, doc.page.width, 80).fill(colores.charcoal);
      doc.fillColor(colores.blanco).font("Helvetica-Bold").fontSize(22)
         .text("ENCUESTA DE USUARIO", 40, 30);
      doc.fontSize(10).font("Helvetica")
         .text(`Fecha: ${new Date().toLocaleDateString("es-AR")}`, 40, 55);

      let y = 100;

      // Sección de datos personales
      doc.fillColor(colores.charcoal).font("Helvetica-Bold").fontSize(14)
         .text("DATOS PERSONALES", 40, y);
      y += 25;

      const camposPersonales = [
        ["Nombre", `${datos.firstName} ${datos.lastName}`],
        ["Email", datos.email],
        ["Teléfono", datos.phone || "No proporcionado"],
        ["Edad", datos.age || "No proporcionada"],
        ["Género", traducciones.gender[datos.gender] || datos.gender || "No especificado"],
        ["País", traducciones.countries[datos.country] || datos.country || "No especificado"],
        ["Ciudad", datos.city || "No especificada"]
      ];

      doc.font("Helvetica").fontSize(10);
      camposPersonales.forEach(([label, value]) => {
        doc.fillColor(colores.graphite).text(`${label}:`, 40, y);
        doc.fillColor(colores.charcoal).text(value, 150, y);
        y += 18;
      });

      // Sección educativa
      y += 15;
      doc.fillColor(colores.charcoal).font("Helvetica-Bold").fontSize(14)
         .text("INFORMACIÓN EDUCATIVA", 40, y);
      y += 25;

      const camposEducativos = [
        ["Nivel educativo", traducciones.education[datos.education] || datos.education || "No especificado"],
        ["Institución", datos.institution || "No especificada"],
        ["Rol", datos.role || "No especificado"],
        ["Frecuencia de uso", traducciones.frequency[datos.frequency] || datos.frequency || "No especificada"]
      ];

      doc.font("Helvetica").fontSize(10);
      camposEducativos.forEach(([label, value]) => {
        doc.fillColor(colores.graphite).text(`${label}:`, 40, y);
        doc.fillColor(colores.charcoal).text(value, 150, y);
        y += 18;
      });

      // Satisfacción
      y += 15;
      doc.fillColor(colores.charcoal).font("Helvetica-Bold").fontSize(14)
         .text("SATISFACCIÓN", 40, y);
      y += 25;

      doc.font("Helvetica").fontSize(10);
      doc.fillColor(colores.graphite).text("Satisfacción general:", 40, y);
      doc.fillColor(colores.charcoal).text(`${datos.satisfaction || 'N/A'} / 5`, 150, y);
      y += 18;
      doc.fillColor(colores.graphite).text("Recomendación (NPS):", 40, y);
      doc.fillColor(colores.charcoal).text(`${datos.recommendation || 'N/A'} / 10`, 150, y);
      y += 25;

      // Comentarios
      if (datos.positiveFeedback || datos.negativeFeedback || datos.additionalComments) {
        doc.fillColor(colores.charcoal).font("Helvetica-Bold").fontSize(14)
           .text("COMENTARIOS", 40, y);
        y += 25;

        doc.font("Helvetica").fontSize(10);
        if (datos.positiveFeedback) {
          doc.fillColor(colores.graphite).text("Aspectos positivos:", 40, y);
          y += 15;
          doc.fillColor(colores.charcoal).text(datos.positiveFeedback, 40, y, { width: 500 });
          y += doc.heightOfString(datos.positiveFeedback, { width: 500 }) + 15;
        }

        if (datos.negativeFeedback) {
          doc.fillColor(colores.graphite).text("Áreas de mejora:", 40, y);
          y += 15;
          doc.fillColor(colores.charcoal).text(datos.negativeFeedback, 40, y, { width: 500 });
          y += doc.heightOfString(datos.negativeFeedback, { width: 500 }) + 15;
        }

        if (datos.additionalComments) {
          doc.fillColor(colores.graphite).text("Comentarios adicionales:", 40, y);
          y += 15;
          doc.fillColor(colores.charcoal).text(datos.additionalComments, 40, y, { width: 500 });
        }
      }

      // Footer
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc.fillColor(colores.graphite).fontSize(8)
           .text(`CEMI - Encuesta de Usuario | Página ${i + 1} de ${pageCount}`,
                 40, doc.page.height - 30, { align: "center", width: doc.page.width - 80 });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export default router;
