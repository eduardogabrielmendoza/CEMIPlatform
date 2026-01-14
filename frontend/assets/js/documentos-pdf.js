
const API_URL_DOCS = typeof API_URL !== 'undefined' ? API_URL : '/api';

let CEMI_LOGO_BASE64 = null;

async function cargarLogoCEMI() {
  if (CEMI_LOGO_BASE64) return CEMI_LOGO_BASE64;
  
  try {
    const response = await fetch('/images/logo.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        CEMI_LOGO_BASE64 = reader.result;
        resolve(CEMI_LOGO_BASE64);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('No se pudo cargar el logo CEMI:', error);
    return null;
  }
}

function openDocumentosModal(idAlumno, nombreAlumno) {
  const modalHTML = `
    <div id="documentosModal" class="modal-overlay" style="
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      animation: fadeInDoc 0.3s ease;
    ">
      <div class="modal-content" style="
        background: white;
        border-radius: 20px;
        width: 95%;
        max-width: 550px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
        animation: slideUpDoc 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      ">
        <!-- Header del Modal -->
        <div style="
          background: #5d646b;
          padding: 25px 30px;
          border-radius: 20px 20px 0 0;
          position: relative;
          overflow: hidden;
        ">
          <button onclick="closeDocumentosModal()" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(0,0,0,0.1);
            border: none;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
          " onmouseover="this.style.background='rgba(0,0,0,0.2)'" onmouseout="this.style.background='rgba(0,0,0,0.1)'">
            <i data-lucide="x" style="width: 20px; height: 20px; color: #1e293b;"></i>
          </button>
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="
              width: 55px;
              height: 55px;
              background: rgba(0,0,0,0.1);
              border-radius: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <i data-lucide="file-text" style="width: 28px; height: 28px; color: #ffffffff;"></i>
            </div>
            <div>
              <h2 style="font-family: 'Inter';margin: 0;color: #ffffff;font-size: 22px;font-weight: 400;">Generar Documentos</h2>
              <p style="margin: 5px 0 0 0; color: #c9cdd1; font-size: 14px;">${nombreAlumno}</p>
            </div>
          </div>
        </div>
        
        <!-- Cuerpo del Modal -->
        <div style="padding: 25px 30px;">
          <p style="color: #64748b; font-size: 14px; margin-bottom: 20px; text-align: center;">
            Selecciona el documento que deseas generar en formato PDF
          </p>
          
          <div style="display: grid; gap: 12px;">
            <!-- Constancia de Alumno Regular -->
            <button onclick="generarConstanciaAlumnoRegular(${idAlumno})" class="doc-option-btn" style="
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 18px 20px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 2px solid #e2e8f0;
              border-radius: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
              text-align: left;
            " onmouseover="this.style.borderColor='rgba(147, 161, 173, 0.65)'; this.style.background='linear-gradient(135deg, rgba(147, 161, 173, 0.12) 0%, rgba(147, 161, 173, 0.18) 100%)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'">
              <div style="
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #93a1ad 0%, #1a1f4e 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              ">
                <i data-lucide="badge-check" style="width: 24px; height: 24px; color: white;"></i>
              </div>
              <div style="flex: 1;">
                <h4 style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 600;">Constancia de Alumno Regular</h4>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">Certifica inscripción activa en el instituto</p>
              </div>
              <i data-lucide="download" style="width: 20px; height: 20px; color: #94a3b8;"></i>
            </button>
            
            <!-- Certificado de Calificaciones -->
            <button onclick="generarCertificadoCalificaciones(${idAlumno})" class="doc-option-btn" style="
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 18px 20px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 2px solid #e2e8f0;
              border-radius: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
              text-align: left;
            " onmouseover="this.style.borderColor='rgba(147, 161, 173, 0.65)'; this.style.background='linear-gradient(135deg, rgba(147, 161, 173, 0.12) 0%, rgba(147, 161, 173, 0.18) 100%)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'">
              <div style="
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #93a1ad 0%, #1a1f4e 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              ">
                <i data-lucide="clipboard-list" style="width: 24px; height: 24px; color: white;"></i>
              </div>
              <div style="flex: 1;">
                <h4 style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 600;">Certificado de Calificaciones</h4>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">Historial académico con notas y promedios</p>
              </div>
              <i data-lucide="download" style="width: 20px; height: 20px; color: #94a3b8;"></i>
            </button>
            
            <!-- Estado de Cuenta -->
            <button onclick="generarEstadoCuenta(${idAlumno})" class="doc-option-btn" style="
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 18px 20px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 2px solid #e2e8f0;
              border-radius: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
              text-align: left;
            " onmouseover="this.style.borderColor='rgba(147, 161, 173, 0.65)'; this.style.background='linear-gradient(135deg, rgba(147, 161, 173, 0.12) 0%, rgba(147, 161, 173, 0.18) 100%)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'">
              <div style="
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #93a1ad 0%, #1a1f4e 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              ">
                <i data-lucide="receipt" style="width: 24px; height: 24px; color: white;"></i>
              </div>
              <div style="flex: 1;">
                <h4 style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 600;">Estado de Cuenta</h4>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">Resumen de pagos y cuotas pendientes</p>
              </div>
              <i data-lucide="download" style="width: 20px; height: 20px; color: #94a3b8;"></i>
            </button>
            
            <!-- Ficha de Inscripción -->
            <button onclick="generarFichaInscripcion(${idAlumno})" class="doc-option-btn" style="
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 18px 20px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 2px solid #e2e8f0;
              border-radius: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
              text-align: left;
            " onmouseover="this.style.borderColor='rgba(147, 161, 173, 0.65)'; this.style.background='linear-gradient(135deg, rgba(147, 161, 173, 0.12) 0%, rgba(147, 161, 173, 0.18) 100%)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'">
              <div style="
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #93a1ad 0%, #1a1f4e 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              ">
                <i data-lucide="user-check" style="width: 24px; height: 24px; color: white;"></i>
              </div>
              <div style="flex: 1;">
                <h4 style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 600;">Ficha de Inscripción</h4>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">Datos personales y cursos inscriptos</p>
              </div>
              <i data-lucide="download" style="width: 20px; height: 20px; color: #94a3b8;"></i>
            </button>
            
            <!-- Códigos de Recuperación 2FA -->
            <button onclick="generarCodigosRecuperacion('${nombreAlumno}')" class="doc-option-btn" style="
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 18px 20px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 2px solid #e2e8f0;
              border-radius: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
              text-align: left;
            " onmouseover="this.style.borderColor='rgba(147, 161, 173, 0.65)'; this.style.background='linear-gradient(135deg, rgba(147, 161, 173, 0.12) 0%, rgba(147, 161, 173, 0.18) 100%)'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'">
              <div style="
                width: 50px;
                height: 50px;
                background: linear-gradient(135deg, #93a1ad 0%, #1a1f4e 100%);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              ">
                <i data-lucide="key" style="width: 24px; height: 24px; color: white;"></i>
              </div>
              <div style="flex: 1;">
                <h4 style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 600;">Códigos de Recuperación 2FA</h4>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">Generar 5 códigos aleatorios de respaldo</p>
              </div>
              <i data-lucide="sparkles" style="width: 20px; height: 20px; color: #94a3b8;"></i>
            </button>
            
            <!-- Separador -->
            <div style="
              margin: 10px 0;
              border-top: 2px dashed #e2e8f0;
            "></div>
            
            <!-- Descargar Todo (ZIP) -->
            <button onclick="generarTodosLosPDFs(${idAlumno})" class="doc-option-btn" style="
              display: flex;
              align-items: center;
              gap: 15px;
              padding: 18px 20px;
              background: #cbd5e0;
              border: 2px solid #94a3b8;
              border-radius: 14px;
              cursor: pointer;
              transition: all 0.3s ease;
              text-align: left;
            " onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 4px 15px rgba(0, 0, 0, 0.15)'" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none'">
              <div style="
                width: 50px;
                height: 50px;
                background: rgba(0,0,0,0.1);
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                flex-shrink: 0;
              ">
                <i data-lucide="archive" style="width: 24px; height: 24px; color: #1e293b;"></i>
              </div>
              <div style="flex: 1;">
                <h4 style="margin: 0; color: #1e293b; font-size: 15px; font-weight: 600;">Descargar Todo (ZIP)</h4>
                <p style="margin: 4px 0 0 0; color: #64748b; font-size: 12px;">Paquete completo con los 4 documentos</p>
              </div>
              <i data-lucide="file-archive" style="width: 20px; height: 20px; color: #64748b;"></i>
            </button>
          </div>
          
          <div style="
            margin-top: 20px;
            padding: 15px;
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <i data-lucide="info" style="width: 20px; height: 20px; color: #92400e; flex-shrink: 0;"></i>
            <p style="margin: 0; color: #92400e; font-size: 12px;">
              Los documentos se generan con datos actualizados y tienen validez institucional.
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes fadeInDoc {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUpDoc {
        from { opacity: 0; transform: translateY(30px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    </style>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  lucide.createIcons();
  
  const closeOnEscape = (e) => {
    if (e.key === 'Escape') {
      closeDocumentosModal();
      document.removeEventListener('keydown', closeOnEscape);
    }
  };
  document.addEventListener('keydown', closeOnEscape);
}

function closeDocumentosModal() {
  const modal = document.getElementById('documentosModal');
  if (modal) {
    modal.style.animation = 'fadeInDoc 0.2s ease reverse';
    setTimeout(() => modal.remove(), 200);
  }
}

const HARVARD_COLORS = {
  charcoal: [30, 30, 30],        // #1e1e1e - Headers, fondos oscuros
  wroughtIron: [74, 74, 74],     // #4a4a4a - Secundario
  graphite: [101, 111, 119],     // #656f77 - Texto secundario
  silver: [160, 160, 160],       // #a0a0a0 - Terciario
  lightGray: [245, 245, 245],    // #f5f5f5 - Fondos claros
  white: [255, 255, 255],        // #ffffff - Blanco
  text: [45, 45, 45],            // #2d2d2d - Texto principal
  accent: [147, 161, 173],       // #93a1ad - Azul institucional
  success: [16, 185, 129],       // #10b981 - Verde éxito
  warning: [245, 158, 11],       // #f59e0b - Amarillo advertencia
  error: [239, 68, 68],          // #ef4444 - Rojo error
};

async function agregarHeaderPDF(doc, titulo, subtitulo = null) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(...HARVARD_COLORS.charcoal);
  doc.rect(0, 0, pageWidth, 38, 'F');
  
  doc.setFillColor(...HARVARD_COLORS.wroughtIron);
  doc.rect(0, 38, pageWidth, 3, 'F');
  
  doc.setFillColor(...HARVARD_COLORS.graphite);
  doc.rect(0, 41, pageWidth, 0.5, 'F');
  
  try {
    const logoBase64 = await cargarLogoCEMI();
    if (logoBase64) {
      doc.setFillColor(...HARVARD_COLORS.white);
      doc.circle(22, 19, 11, 'F');
      
      doc.addImage(logoBase64, 'PNG', 11, 8, 22, 22);
      
      doc.setFontSize(20);
      doc.setFont('times', 'bold'); // Times = serif similar a Georgia
      doc.setTextColor(...HARVARD_COLORS.white);
      doc.text('CEMI', 40, 17);
      
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...HARVARD_COLORS.silver);
      doc.text('Centro de Enseñanza Multilingüe Integral', 40, 24);
      
      doc.setDrawColor(...HARVARD_COLORS.graphite);
      doc.setLineWidth(0.3);
      doc.line(40, 28, 80, 28);
    } else {
      doc.setFontSize(22);
      doc.setFont('times', 'bold');
      doc.setTextColor(...HARVARD_COLORS.white);
      doc.text('CEMI', 20, 18);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...HARVARD_COLORS.silver);
      doc.text('Centro de Enseñanza Multilingüe Integral', 20, 25);
    }
  } catch (e) {
    doc.setFontSize(22);
    doc.setFont('times', 'bold');
    doc.setTextColor(...HARVARD_COLORS.white);
    doc.text('CEMI', 20, 18);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.silver);
    doc.text('Centro de Enseñanza Multilingüe Integral', 20, 25);
  }
  
  doc.setFontSize(13);
  doc.setFont('times', 'bold');
  doc.setTextColor(...HARVARD_COLORS.white);
  doc.text(titulo.toUpperCase(), pageWidth - 20, 16, { align: 'right' });
  
  if (subtitulo) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.silver);
    doc.text(subtitulo, pageWidth - 20, 24, { align: 'right' });
  }
  
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...HARVARD_COLORS.graphite);
  const fechaHeader = new Date().toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  });
  doc.text(fechaHeader, pageWidth - 20, 32, { align: 'right' });
  
  return 52; // Retorna la posición Y después del header
}

function agregarFooterPDF(doc) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  doc.setFillColor(...HARVARD_COLORS.charcoal);
  doc.rect(0, pageHeight - 22, pageWidth, 22, 'F');
  
  doc.setFillColor(...HARVARD_COLORS.wroughtIron);
  doc.rect(0, pageHeight - 22, pageWidth, 0.5, 'F');
  
  doc.setFontSize(9);
  doc.setFont('times', 'bold');
  doc.setTextColor(...HARVARD_COLORS.white);
  doc.text('CEMI', 20, pageHeight - 12);
  
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...HARVARD_COLORS.silver);
  doc.text('Centro de Enseñanza Multilingüe Integral', 20, pageHeight - 7);
  
  doc.setFontSize(6);
  doc.setTextColor(...HARVARD_COLORS.graphite);
  const fechaGen = new Date().toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  const horaGen = new Date().toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  doc.text(`Generado: ${fechaGen} - ${horaGen}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
  
  doc.setFontSize(5.5);
  doc.setTextColor(...HARVARD_COLORS.silver);
  doc.text('Documento con validez institucional', pageWidth / 2, pageHeight - 7, { align: 'center' });
  
  const pageNumber = doc.internal.getNumberOfPages ? doc.internal.getCurrentPageInfo().pageNumber : 1;
  const totalPages = doc.internal.getNumberOfPages ? doc.internal.getNumberOfPages() : 1;
  doc.setFontSize(7);
  doc.setTextColor(...HARVARD_COLORS.white);
  doc.text(`${pageNumber} / ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
}

function agregarHeaderSecundario(doc, titulo) {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  doc.setFillColor(...HARVARD_COLORS.charcoal);
  doc.rect(0, 0, pageWidth, 18, 'F');
  
  doc.setFontSize(10);
  doc.setFont('times', 'bold');
  doc.setTextColor(...HARVARD_COLORS.white);
  doc.text('CEMI', 15, 12);
  
  doc.setFontSize(8);
  doc.setTextColor(...HARVARD_COLORS.silver);
  doc.text(titulo, pageWidth - 15, 12, { align: 'right' });
  
  return 28; // Posición Y después del header secundario
}

function generarCodigosRecuperacion(nombreAlumno) {
  function generarCodigo() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sin I, O, 0, 1 para evitar confusión
    let codigo = '';
    for (let i = 0; i < 8; i++) {
      if (i === 4) codigo += '-'; // Separador en el medio
      codigo += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return codigo;
  }
  
  const codigos = [];
  for (let i = 0; i < 5; i++) {
    codigos.push(generarCodigo());
  }
  
  const modalHTML = `
    <div id="codigosRecuperacionModal" style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
      animation: fadeInCodigos 0.3s ease;
    ">
      <div style="
        background: white;
        border-radius: 20px;
        width: 90%;
        max-width: 450px;
        overflow: hidden;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
        animation: slideUpCodigos 0.4s ease;
      ">
        <!-- Header -->
        <div style="
          background: linear-gradient(135deg, #93a1ad 0%, #1a1f4e 100%);
          padding: 25px 30px;
          position: relative;
        ">
          <button onclick="document.getElementById('codigosRecuperacionModal').remove()" style="
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(255,255,255,0.2);
            border: none;
            width: 35px;
            height: 35px;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <i data-lucide="x" style="width: 20px; height: 20px; color: white;"></i>
          </button>
          <div style="display: flex; align-items: center; gap: 15px;">
            <div style="
              width: 55px;
              height: 55px;
              background: rgba(255,255,255,0.2);
              border-radius: 15px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <i data-lucide="key" style="width: 28px; height: 28px; color: white;"></i>
            </div>
            <div>
              <h2 style="margin: 0; color: white; font-size: 20px; font-weight: 600;">Códigos de Recuperación</h2>
              <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">${nombreAlumno}</p>
            </div>
          </div>
        </div>
        
        <!-- Cuerpo -->
        <div style="padding: 25px 30px;">
          <div style="
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border: 2px dashed #93c5fd;
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
          ">
            <p style="margin: 0 0 15px 0; color: #1e40af; font-size: 13px; text-align: center; font-weight: 500;">
               Códigos generados aleatoriamente
            </p>
            <div style="display: grid; gap: 10px;">
              ${codigos.map((codigo, i) => `
                <div style="
                  display: flex;
                  align-items: center;
                  gap: 12px;
                  background: white;
                  padding: 12px 16px;
                  border-radius: 10px;
                  box-shadow: 0 2px 8px rgba(30, 60, 114, 0.1);
                ">
                  <span style="
                    background: linear-gradient(135deg, #93a1ad 0%, #1a1f4e 100%);
                    color: white;
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 600;
                  ">${i + 1}</span>
                  <code style="
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1e293b;
                    letter-spacing: 2px;
                    flex: 1;
                  ">${codigo}</code>
                  <button onclick="navigator.clipboard.writeText('${codigo}'); this.innerHTML='<i data-lucide=\\'check\\' style=\\'width:16px;height:16px;color:#10b981;\\'></i>'; lucide.createIcons(); setTimeout(() => { this.innerHTML='<i data-lucide=\\'copy\\' style=\\'width:16px;height:16px;color:#94a3b8;\\'></i>'; lucide.createIcons(); }, 1500);" style="
                    background: #f1f5f9;
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <i data-lucide="copy" style="width: 16px; height: 16px; color: #94a3b8;"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
          
          <div style="
            background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
            border-radius: 12px;
            padding: 15px;
            display: flex;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 20px;
          ">
            <i data-lucide="alert-triangle" style="width: 20px; height: 20px; color: #92400e; flex-shrink: 0; margin-top: 2px;"></i>
            <div>
              <p style="margin: 0; color: #92400e; font-size: 12px; line-height: 1.5;">
                <strong>️ Importante:</strong> Cada código solo puede usarse UNA vez. Guárdalos en un lugar seguro fuera de tu dispositivo.
              </p>
            </div>
          </div>
          
          <div style="display: flex; gap: 12px;">
            <button onclick="
              const texto = ' Códigos de Recuperación 2FA - CEMI\\n' +
                           '${nombreAlumno}\\n' +
                           '━━━━━━━━━━━━━━━━━━━━━━━━\\n' +
                           '${codigos.map((c, i) => (i+1) + '. ' + c).join('\\n')}\\n' +
                           '━━━━━━━━━━━━━━━━━━━━━━━━\\n' +
                           '️ Cada código es de un solo uso.\\n' +
                           'Generado: ' + new Date().toLocaleString('es-AR');
              navigator.clipboard.writeText(texto);
              showToast('Códigos copiados al portapapeles', 'success');
            " style="
              flex: 1;
              padding: 14px;
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 2px solid #e2e8f0;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 600;
              color: #475569;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            ">
              <i data-lucide="clipboard-copy" style="width: 18px; height: 18px;"></i>
              Copiar Todos
            </button>
            <button onclick="generarNuevosCodigos('${nombreAlumno}')" style="
              flex: 1;
              padding: 14px;
              background: linear-gradient(135deg, #93a1ad 0%, #1a1f4e 100%);
              border: none;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 600;
              color: white;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 8px;
            ">
              <i data-lucide="refresh-cw" style="width: 18px; height: 18px;"></i>
              Regenerar
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <style>
      @keyframes fadeInCodigos {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUpCodigos {
        from { opacity: 0; transform: translateY(30px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    </style>
  `;
  
  const existingModal = document.getElementById('codigosRecuperacionModal');
  if (existingModal) existingModal.remove();
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  lucide.createIcons();
}

function generarNuevosCodigos(nombreAlumno) {
  document.getElementById('codigosRecuperacionModal').remove();
  generarCodigosRecuperacion(nombreAlumno);
  showToast('Nuevos códigos generados', 'success');
}

async function generarConstanciaAlumnoRegular(idAlumno) {
  try {
    closeDocumentosModal();
    showToast('Generando constancia...', 'info');
    
    const response = await fetch(`${API_URL_DOCS}/alumnos/${idAlumno}`);
    if (!response.ok) throw new Error('Error al obtener datos del alumno');
    const alumno = await response.json();
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = await agregarHeaderPDF(doc, 'CONSTANCIA', 'Alumno Regular');
    
    const numeroConstancia = `CONST-${new Date().getFullYear()}-${String(idAlumno).padStart(5, '0')}`;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text(`N° ${numeroConstancia}`, pageWidth - 20, yPos, { align: 'right' });
    
    yPos += 15;
    
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.setTextColor(...HARVARD_COLORS.charcoal);
    doc.text('CONSTANCIA DE ALUMNO REGULAR', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    doc.setDrawColor(...HARVARD_COLORS.graphite);
    doc.setLineWidth(0.4);
    doc.line(pageWidth / 2 - 50, yPos, pageWidth / 2 + 50, yPos);
    
    yPos += 18;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.text);
    doc.text('Por medio de la presente, el Centro de Enseñanza Multilingüe Integral', 20, yPos);
    yPos += 6;
    doc.text('(CEMI) certifica que:', 20, yPos);
    
    yPos += 15;
    
    doc.setFillColor(...HARVARD_COLORS.lightGray);
    doc.setDrawColor(...HARVARD_COLORS.charcoal);
    doc.setLineWidth(0.8);
    doc.roundedRect(25, yPos, pageWidth - 50, 48, 2, 2, 'FD');
    
    doc.setFillColor(...HARVARD_COLORS.charcoal);
    doc.rect(25, yPos, pageWidth - 50, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.white);
    doc.text('DATOS DEL ALUMNO', pageWidth / 2, yPos + 5.5, { align: 'center' });
    
    yPos += 18;
    
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.setTextColor(...HARVARD_COLORS.charcoal);
    doc.text(`${alumno.nombre} ${alumno.apellido}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.wroughtIron);
    
    const dniText = `DNI: ${alumno.dni || 'No registrado'}`;
    const legajoText = `Legajo: ${alumno.legajo}`;
    doc.text(dniText, pageWidth / 2 - 35, yPos, { align: 'center' });
    doc.text('|', pageWidth / 2, yPos, { align: 'center' });
    doc.text(legajoText, pageWidth / 2 + 35, yPos, { align: 'center' });
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text(`Fecha de Registro: ${alumno.fecha_registro ? new Date(alumno.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'No registrada'}`, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 25;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.text);
    const textoConfirmacion = `Se encuentra regularmente inscripto/a como alumno/a de esta institución, cursando actualmente ${alumno.cursos_activos || 0} curso(s) de idiomas.`;
    const lineasConf = doc.splitTextToSize(textoConfirmacion, pageWidth - 40);
    doc.text(lineasConf, 20, yPos);
    
    yPos += lineasConf.length * 6 + 12;
    
    if (alumno.cursos && alumno.cursos.length > 0) {
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.setTextColor(...HARVARD_COLORS.charcoal);
      doc.text('Cursos inscriptos:', 20, yPos);
      
      yPos += 8;
      
      alumno.cursos.forEach((curso, index) => {
        doc.setFillColor(...HARVARD_COLORS.wroughtIron);
        doc.circle(24, yPos - 1.5, 1.2, 'F');
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...HARVARD_COLORS.text);
        doc.text(`${curso.nombre_curso} — ${curso.nombre_idioma} (Nivel ${curso.id_nivel})`, 28, yPos);
        yPos += 7;
      });
    }
    
    yPos += 12;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.text);
    doc.text('Se extiende la presente constancia a pedido del interesado para ser presentada', 20, yPos);
    yPos += 5;
    doc.text('ante quien corresponda.', 20, yPos);
    
    yPos += 20;
    
    doc.setFontSize(10);
    doc.setFont('times', 'italic');
    doc.setTextColor(...HARVARD_COLORS.wroughtIron);
    doc.text(`San Miguel de Tucumán, ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 25, yPos, { align: 'right' });
    
    yPos += 28;
    
    doc.setDrawColor(...HARVARD_COLORS.charcoal);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 35, yPos, pageWidth / 2 + 35, yPos);
    
    yPos += 5;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.charcoal);
    doc.text('Firma y Sello', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('Dirección CEMI', pageWidth / 2, yPos, { align: 'center' });
    
    agregarFooterPDF(doc);
    
    const nombreArchivo = `Constancia_Alumno_Regular_${alumno.legajo}_${alumno.apellido}.pdf`;
    doc.save(nombreArchivo);
    
    showToast('Constancia generada exitosamente', 'success');
  } catch (error) {
    console.error('Error al generar constancia:', error);
    showToast('Error al generar la constancia', 'error');
  }
}

async function generarCertificadoCalificaciones(idAlumno) {
  try {
    closeDocumentosModal();
    showToast('Generando certificado...', 'info');
    
    const response = await fetch(`${API_URL_DOCS}/alumnos/${idAlumno}`);
    if (!response.ok) throw new Error('Error al obtener datos del alumno');
    const alumno = await response.json();
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = await agregarHeaderPDF(doc, 'CERTIFICADO', 'Calificaciones Académicas');
    
    const numeroCertificado = `CERT-${new Date().getFullYear()}-${String(idAlumno).padStart(5, '0')}`;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text(`N° ${numeroCertificado}`, pageWidth - 20, yPos, { align: 'right' });
    
    yPos += 12;
    
    doc.setFontSize(15);
    doc.setFont('times', 'bold');
    doc.setTextColor(...HARVARD_COLORS.charcoal);
    doc.text('CERTIFICADO DE CALIFICACIONES', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 4;
    doc.setDrawColor(...HARVARD_COLORS.graphite);
    doc.setLineWidth(0.4);
    doc.line(pageWidth / 2 - 45, yPos, pageWidth / 2 + 45, yPos);
    
    yPos += 12;
    
    doc.setFillColor(...HARVARD_COLORS.lightGray);
    doc.setDrawColor(...HARVARD_COLORS.charcoal);
    doc.setLineWidth(0.6);
    doc.roundedRect(20, yPos, pageWidth - 40, 32, 2, 2, 'FD');
    
    yPos += 10;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('ALUMNO:', 25, yPos);
    doc.setFont('times', 'bold');
    doc.setTextColor(...HARVARD_COLORS.charcoal);
    doc.setFontSize(11);
    doc.text(`${alumno.nombre} ${alumno.apellido}`, 48, yPos);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('DNI:', 130, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.text);
    doc.text(`${alumno.dni || 'N/R'}`, 142, yPos);
    
    yPos += 10;
    
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('LEGAJO:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.text);
    doc.text(`${alumno.legajo}`, 48, yPos);
    
    if (alumno.promedio_general) {
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...HARVARD_COLORS.graphite);
      doc.text('PROMEDIO GENERAL:', 130, yPos);
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...HARVARD_COLORS.success);
      doc.text(`${alumno.promedio_general}`, 175, yPos);
    }
    
    yPos += 22;
    
    if (alumno.cursos && alumno.cursos.length > 0) {
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.setTextColor(...HARVARD_COLORS.charcoal);
      doc.text('DETALLE DE CALIFICACIONES POR CURSO', 20, yPos);
      
      yPos += 8;
      
      const colWidths = [65, 25, 25, 25, 25];
      const headers = ['Curso', 'Parcial 1', 'Parcial 2', 'Final', 'Promedio'];
      
      doc.setFillColor(...HARVARD_COLORS.charcoal);
      doc.rect(20, yPos, pageWidth - 40, 9, 'F');
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...HARVARD_COLORS.white);
      
      let xPos = 24;
      headers.forEach((header, i) => {
        if (i === 0) {
          doc.text(header, xPos, yPos + 6);
        } else {
          doc.text(header, xPos + colWidths[i]/2, yPos + 6, { align: 'center' });
        }
        xPos += colWidths[i];
      });
      
      yPos += 11;
      
      alumno.cursos.forEach((curso, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(...HARVARD_COLORS.lightGray);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(20, yPos - 3, pageWidth - 40, 9, 'F');
        
        doc.setDrawColor(...HARVARD_COLORS.silver);
        doc.setLineWidth(0.1);
        doc.line(20, yPos + 6, pageWidth - 20, yPos + 6);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...HARVARD_COLORS.text);
        xPos = 24;
        
        const nombreCurso = curso.nombre_curso.length > 28 ? curso.nombre_curso.substring(0, 25) + '...' : curso.nombre_curso;
        doc.text(nombreCurso, xPos, yPos + 3);
        xPos += colWidths[0];
        
        doc.text(curso.parcial1 ? curso.parcial1.toString() : '—', xPos + colWidths[1]/2, yPos + 3, { align: 'center' });
        xPos += colWidths[1];
        
        doc.text(curso.parcial2 ? curso.parcial2.toString() : '—', xPos + colWidths[2]/2, yPos + 3, { align: 'center' });
        xPos += colWidths[2];
        
        doc.text(curso.final ? curso.final.toString() : '—', xPos + colWidths[3]/2, yPos + 3, { align: 'center' });
        xPos += colWidths[3];
        
        const promedio = curso.promedio ? parseFloat(curso.promedio).toFixed(1) : '—';
        doc.setFont('helvetica', 'bold');
        if (promedio !== '—') {
          if (parseFloat(promedio) >= 7) {
            doc.setTextColor(...HARVARD_COLORS.success);
          } else if (parseFloat(promedio) >= 4) {
            doc.setTextColor(...HARVARD_COLORS.warning);
          } else {
            doc.setTextColor(...HARVARD_COLORS.error);
          }
        }
        doc.text(promedio, xPos + colWidths[4]/2, yPos + 3, { align: 'center' });
        
        yPos += 9;
      });
      
      doc.setDrawColor(...HARVARD_COLORS.wroughtIron);
      doc.setLineWidth(0.5);
      doc.rect(20, yPos - (alumno.cursos.length * 9) - 11, pageWidth - 40, (alumno.cursos.length * 9) + 11);
      
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...HARVARD_COLORS.graphite);
      doc.text('No hay calificaciones registradas.', pageWidth / 2, yPos + 10, { align: 'center' });
      yPos += 20;
    }
    
    yPos += 15;
    
    doc.setFillColor(...HARVARD_COLORS.lightGray);
    doc.roundedRect(20, yPos, pageWidth - 40, 12, 1, 1, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('Escala de calificación: 1 a 10  |  Nota mínima de aprobación: 7 (siete)  |  Aprobado', pageWidth / 2 - 15, yPos + 5, { align: 'center' });
    doc.setFillColor(...HARVARD_COLORS.success);
    doc.circle(pageWidth / 2 + 47, yPos + 4.5, 2.5, 'F');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('Recuperación', pageWidth / 2 + 53, yPos + 5);
    doc.setFillColor(...HARVARD_COLORS.warning);
    doc.circle(pageWidth / 2 + 78, yPos + 4.5, 2.5, 'F');
    
    yPos += 22;
    
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.setTextColor(...HARVARD_COLORS.wroughtIron);
    doc.text(`Emitido en San Miguel de Tucumán, ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 25, yPos, { align: 'right' });
    
    yPos += 22;
    
    doc.setDrawColor(...HARVARD_COLORS.charcoal);
    doc.setLineWidth(0.5);
    doc.line(pageWidth / 2 - 35, yPos, pageWidth / 2 + 35, yPos);
    yPos += 4;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.charcoal);
    doc.text('Firma y Sello', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('Dirección Académica CEMI', pageWidth / 2, yPos, { align: 'center' });
    
    agregarFooterPDF(doc);
    
    const nombreArchivo = `Certificado_Calificaciones_${alumno.legajo}_${alumno.apellido}.pdf`;
    doc.save(nombreArchivo);
    
    showToast('Certificado generado exitosamente', 'success');
  } catch (error) {
    console.error('Error al generar certificado:', error);
    showToast('Error al generar el certificado', 'error');
  }
}

async function generarEstadoCuenta(idAlumno) {
  try {
    closeDocumentosModal();
    showToast('Generando estado de cuenta...', 'info');
    
    const alumnoResponse = await fetch(`${API_URL_DOCS}/alumnos/${idAlumno}`);
    if (!alumnoResponse.ok) throw new Error('Error al obtener datos del alumno');
    const alumno = await alumnoResponse.json();
    
    const pagosResponse = await fetch(`${API_URL_DOCS}/pagos/alumno/${idAlumno}`);
    let pagosData = { cursos: [] };
    if (pagosResponse.ok) {
      pagosData = await pagosResponse.json();
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = await agregarHeaderPDF(doc, 'ESTADO DE CUENTA', 'Resumen Financiero');
    
    const numeroDoc = `EC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(idAlumno).padStart(5, '0')}`;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text(`N° ${numeroDoc}`, pageWidth - 20, yPos, { align: 'right' });
    
    yPos += 8;
    
    doc.setFillColor(...HARVARD_COLORS.lightGray);
    doc.setDrawColor(...HARVARD_COLORS.charcoal);
    doc.setLineWidth(0.6);
    doc.roundedRect(20, yPos, pageWidth - 40, 20, 2, 2, 'FD');
    
    yPos += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('ALUMNO:', 25, yPos);
    doc.setFont('times', 'bold');
    doc.setTextColor(...HARVARD_COLORS.charcoal);
    doc.setFontSize(10);
    doc.text(`${alumno.nombre} ${alumno.apellido}`, 48, yPos);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('LEGAJO:', 130, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.text);
    doc.text(`${alumno.legajo}`, 152, yPos);
    
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('EMAIL:', 25, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.text);
    doc.text(`${alumno.mail || 'No registrado'}`, 43, yPos);
    
    yPos += 18;
    
    let totalPagado = 0;
    let totalPendiente = 0;
    let cuotasPagadas = 0;
    let cuotasTotales = 0;
    
    if (pagosData.estadisticas_globales) {
      totalPagado = pagosData.estadisticas_globales.total_pagado || 0;
      totalPendiente = pagosData.estadisticas_globales.total_pendiente || 0;
    }
    
    if (pagosData.cursos && pagosData.cursos.length > 0) {
      pagosData.cursos.forEach(curso => {
        if (curso.estadisticas) {
          cuotasPagadas += curso.estadisticas.cuotas_pagadas || 0;
          cuotasTotales += (curso.estadisticas.cuotas_pagadas || 0) + 
                          (curso.estadisticas.cuotas_impagas || 0) + 
                          (curso.estadisticas.cuotas_pendientes || 0);
        }
      });
    }
    
    doc.setFontSize(10);
    doc.setFont('times', 'bold');
    doc.setTextColor(...HARVARD_COLORS.charcoal);
    doc.text('RESUMEN FINANCIERO', 20, yPos);
    
    yPos += 8;
    
    const boxWidth = 52;
    const boxHeight = 26;
    const spacing = 7;
    
    // Cuadro 1: TOTAL PAGADO - Fondo azul institucional
    doc.setFillColor(...HARVARD_COLORS.accent);
    doc.setDrawColor(...HARVARD_COLORS.accent);
    doc.setLineWidth(1.5);
    doc.roundedRect(20, yPos, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.white);
    doc.text('TOTAL PAGADO', 20 + boxWidth/2, yPos + 8, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.text(`$${totalPagado.toLocaleString('es-AR')}`, 20 + boxWidth/2, yPos + 18, { align: 'center' });
    
    // Cuadro 2: PENDIENTE - Fondo verde
    doc.setFillColor(...HARVARD_COLORS.success);
    doc.setDrawColor(...HARVARD_COLORS.success);
    doc.roundedRect(20 + boxWidth + spacing, yPos, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.white);
    doc.text('PENDIENTE', 20 + boxWidth + spacing + boxWidth/2, yPos + 8, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.text(`$${totalPendiente.toLocaleString('es-AR')}`, 20 + boxWidth + spacing + boxWidth/2, yPos + 18, { align: 'center' });
    
    // Cuadro 3: CUOTAS ABONADAS - Fondo naranja/warning
    doc.setFillColor(...HARVARD_COLORS.warning);
    doc.setDrawColor(...HARVARD_COLORS.warning);
    doc.roundedRect(20 + (boxWidth + spacing) * 2, yPos, boxWidth, boxHeight, 2, 2, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.white);
    doc.text('CUOTAS ABONADAS', 20 + (boxWidth + spacing) * 2 + boxWidth/2, yPos + 8, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('times', 'bold');
    doc.text(`${cuotasPagadas} / ${cuotasTotales}`, 20 + (boxWidth + spacing) * 2 + boxWidth/2, yPos + 18, { align: 'center' });
    
    yPos += 36;
    
    const pageHeight = doc.internal.pageSize.getHeight();
    const margenInferior = 30;
    
    const verificarNuevaPagina = (espacioNecesario = 15) => {
      if (yPos + espacioNecesario > pageHeight - margenInferior) {
        agregarFooterPDF(doc);
        doc.addPage();
        yPos = agregarHeaderSecundario(doc, 'ESTADO DE CUENTA');
        return true;
      }
      return false;
    };
    
    if (pagosData.cursos && pagosData.cursos.length > 0) {
      doc.setFontSize(10);
      doc.setFont('times', 'bold');
      doc.setTextColor(...HARVARD_COLORS.charcoal);
      doc.text('DETALLE POR CURSO', 20, yPos);
      
      yPos += 8;
      
      pagosData.cursos.forEach((curso, index) => {
        verificarNuevaPagina(40);
        
        doc.setFillColor(...HARVARD_COLORS.charcoal);
        doc.rect(20, yPos, pageWidth - 40, 7, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...HARVARD_COLORS.white);
        const nombreCurso = curso.nombre_curso || 'Curso';
        doc.text(nombreCurso.toUpperCase(), 25, yPos + 5);
        
        yPos += 10;
        
        if (curso.meses && curso.meses.length > 0) {
          doc.setFillColor(...HARVARD_COLORS.lightGray);
          doc.rect(20, yPos, pageWidth - 40, 6, 'F');
          
          doc.setFontSize(7);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...HARVARD_COLORS.graphite);
          doc.text('CUOTA', 28, yPos + 4);
          doc.text('MONTO', 75, yPos + 4);
          doc.text('ESTADO', 110, yPos + 4);
          doc.text('FECHA PAGO', 155, yPos + 4);
          
          yPos += 8;
          
          curso.meses.forEach((mes, mesIndex) => {
            if (verificarNuevaPagina(6)) {
              doc.setFontSize(8);
              doc.setFont('helvetica', 'bold');
              doc.setTextColor(...HARVARD_COLORS.charcoal);
              doc.text(`${nombreCurso} (continuación)`, 25, yPos);
              yPos += 7;
              
              doc.setFillColor(...HARVARD_COLORS.lightGray);
              doc.rect(20, yPos, pageWidth - 40, 6, 'F');
              doc.setFontSize(7);
              doc.setTextColor(...HARVARD_COLORS.graphite);
              doc.text('CUOTA', 28, yPos + 4);
              doc.text('MONTO', 75, yPos + 4);
              doc.text('ESTADO', 110, yPos + 4);
              doc.text('FECHA PAGO', 155, yPos + 4);
              yPos += 8;
            }
            
            if (mesIndex % 2 === 0) {
              doc.setFillColor(252, 252, 252);
              doc.rect(20, yPos - 3, pageWidth - 40, 6, 'F');
            }
            
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...HARVARD_COLORS.text);
            doc.text(mes.mes || '', 28, yPos);
            doc.text(`$${(mes.monto || 15000).toLocaleString('es-AR')}`, 75, yPos);
            
            if (mes.estado === 'pagado') {
              doc.setTextColor(...HARVARD_COLORS.success);
              doc.setFont('helvetica', 'bold');
              doc.text('Pagado', 110, yPos);
              doc.setFont('helvetica', 'normal');
              doc.setTextColor(...HARVARD_COLORS.text);
              doc.text(mes.fecha_pago ? new Date(mes.fecha_pago).toLocaleDateString('es-ES') : '-', 155, yPos);
            } else if (mes.estado === 'impago') {
              doc.setTextColor(...HARVARD_COLORS.error);
              doc.setFont('helvetica', 'bold');
              doc.text('Impago', 110, yPos);
              doc.setTextColor(...HARVARD_COLORS.graphite);
              doc.text('-', 155, yPos);
            } else if (mes.estado === 'pendiente') {
              doc.setTextColor(...HARVARD_COLORS.warning);
              doc.setFont('helvetica', 'bold');
              doc.text('Pendiente', 110, yPos);
              doc.setTextColor(...HARVARD_COLORS.graphite);
              doc.text('-', 155, yPos);
            } else {
              doc.setTextColor(...HARVARD_COLORS.silver);
              doc.text('Proximo', 110, yPos);
              doc.text('-', 155, yPos);
            }
            
            yPos += 6;
          });
          
          doc.setDrawColor(...HARVARD_COLORS.silver);
          doc.setLineWidth(0.2);
          doc.line(20, yPos + 2, pageWidth - 20, yPos + 2);
        }
        
        yPos += 8;
      });
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...HARVARD_COLORS.graphite);
      doc.text('No hay registros de pagos para este alumno.', pageWidth / 2, yPos + 10, { align: 'center' });
      yPos += 25; // Agregar espacio después del mensaje para que sea visible antes del cuadro de notas
    }
    
    verificarNuevaPagina(20);
    yPos += 12;
    
    doc.setFillColor(...HARVARD_COLORS.lightGray);
    doc.roundedRect(20, yPos, pageWidth - 40, 18, 1, 1, 'F');
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('* Los montos están expresados en pesos argentinos (ARS)', 25, yPos + 6);
    doc.text('* Para consultas sobre pagos, comunicarse con el área de administración', 25, yPos + 12);
    
    agregarFooterPDF(doc);
    
    const nombreArchivo = `Estado_Cuenta_${alumno.legajo}_${alumno.apellido}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(nombreArchivo);
    
    showToast('Estado de cuenta generado exitosamente', 'success');
  } catch (error) {
    console.error('Error al generar estado de cuenta:', error);
    showToast('Error al generar el estado de cuenta', 'error');
  }
}

async function generarFichaInscripcion(idAlumno) {
  try {
    closeDocumentosModal();
    showToast('Generando ficha de inscripción...', 'info');
    
    const response = await fetch(`${API_URL_DOCS}/alumnos/${idAlumno}`);
    if (!response.ok) throw new Error('Error al obtener datos del alumno');
    const alumno = await response.json();
    
    const pagosResponse = await fetch(`${API_URL_DOCS}/pagos/alumno/${idAlumno}`);
    let cursosConProfesor = [];
    if (pagosResponse.ok) {
      const pagosData = await pagosResponse.json();
      cursosConProfesor = pagosData.cursos || [];
    }
    
    const cursosCombinados = (alumno.cursos || []).map(curso => {
      const cursoPago = cursosConProfesor.find(cp => cp.id_curso === curso.id_curso);
      return {
        ...curso,
        profesor: cursoPago?.profesor || 'No asignado'
      };
    });
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = await agregarHeaderPDF(doc, 'FICHA DE INSCRIPCIÓN', 'Registro Académico');
    
    const numeroFicha = `FI-${alumno.legajo}`;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text(`N° ${numeroFicha}`, pageWidth - 20, yPos, { align: 'right' });
    
    yPos += 8;
    
    doc.setFillColor(...HARVARD_COLORS.charcoal);
    doc.rect(20, yPos, pageWidth - 40, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.white);
    doc.text('DATOS PERSONALES', 25, yPos + 5);
    
    yPos += 12;
    
    doc.setFillColor(...HARVARD_COLORS.lightGray);
    doc.roundedRect(20, yPos, pageWidth - 40, 38, 2, 2, 'F');
    
    const datosPersonales = [
      { label: 'Nombre Completo', value: `${alumno.nombre || ''} ${alumno.apellido || ''}`.trim() || 'No registrado' },
      { label: 'DNI', value: alumno.dni || 'No registrado' },
      { label: 'Legajo', value: alumno.legajo || 'No asignado' },
      { label: 'Email', value: alumno.mail || 'No registrado' },
      { label: 'Teléfono', value: alumno.telefono || 'No registrado' },
      { label: 'Fecha de Registro', value: alumno.fecha_registro ? new Date(alumno.fecha_registro).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'No registrada' },
      { label: 'Estado', value: alumno.estado ? alumno.estado.charAt(0).toUpperCase() + alumno.estado.slice(1) : 'Activo' },
      { label: 'Usuario', value: alumno.usuario || 'No asignado' }
    ];
    
    yPos += 6;
    doc.setFontSize(8);
    let col = 0;
    datosPersonales.forEach((dato, index) => {
      const xBase = col === 0 ? 25 : 115;
      
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...HARVARD_COLORS.graphite);
      doc.text(`${dato.label}:`, xBase, yPos);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...HARVARD_COLORS.charcoal);
      const valorTruncado = dato.value.length > 32 ? dato.value.substring(0, 29) + '...' : dato.value;
      doc.text(valorTruncado, xBase + 32, yPos);
      
      col++;
      if (col === 2) {
        col = 0;
        yPos += 7;
      }
    });
    
    if (col !== 0) yPos += 7;
    yPos += 10;
    
    doc.setFillColor(...HARVARD_COLORS.charcoal);
    doc.rect(20, yPos, pageWidth - 40, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.white);
    doc.text('CURSOS INSCRIPTOS', 25, yPos + 5);
    
    yPos += 12;
    
    if (cursosCombinados.length > 0) {
      doc.setFillColor(...HARVARD_COLORS.wroughtIron);
      doc.rect(20, yPos, pageWidth - 40, 7, 'F');
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...HARVARD_COLORS.white);
      doc.text('CURSO', 25, yPos + 5);
      doc.text('IDIOMA', 80, yPos + 5);
      doc.text('NIVEL', 115, yPos + 5);
      doc.text('PROFESOR', 140, yPos + 5);
      
      yPos += 9;
      
      cursosCombinados.forEach((curso, index) => {
        if (index % 2 === 0) {
          doc.setFillColor(...HARVARD_COLORS.lightGray);
        } else {
          doc.setFillColor(255, 255, 255);
        }
        doc.rect(20, yPos - 3, pageWidth - 40, 7, 'F');
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...HARVARD_COLORS.text);
        
        const nombreCurso = (curso.nombre_curso || '').length > 28 ? (curso.nombre_curso || '').substring(0, 25) + '...' : (curso.nombre_curso || 'N/A');
        doc.text(nombreCurso, 25, yPos + 1);
        doc.text(curso.nombre_idioma || 'N/A', 80, yPos + 1);
        doc.text(curso.nivel || curso.id_nivel?.toString() || 'N/A', 115, yPos + 1);
        
        const profesor = (curso.profesor || '').length > 22 ? (curso.profesor || '').substring(0, 19) + '...' : (curso.profesor || 'No asignado');
        doc.text(profesor, 140, yPos + 1);
        
        yPos += 7;
      });
      
      doc.setDrawColor(...HARVARD_COLORS.wroughtIron);
      doc.setLineWidth(0.5);
      doc.rect(20, yPos - (cursosCombinados.length * 7) - 9, pageWidth - 40, (cursosCombinados.length * 7) + 9);
      
    } else {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(...HARVARD_COLORS.graphite);
      doc.text('No hay cursos inscriptos actualmente.', pageWidth / 2, yPos, { align: 'center' });
      yPos += 10;
    }
    
    yPos += 12;
    
    doc.setFillColor(...HARVARD_COLORS.charcoal);
    doc.rect(20, yPos, pageWidth - 40, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.white);
    doc.text('INFORMACIÓN ACADÉMICA', 25, yPos + 5);
    
    yPos += 12;
    
    const boxW = 80;
    
    doc.setFillColor(...HARVARD_COLORS.lightGray);
    doc.setDrawColor(...HARVARD_COLORS.wroughtIron);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPos, boxW, 18, 2, 2, 'FD');
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('CURSOS ACTIVOS', 20 + boxW/2, yPos + 6, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.setTextColor(...HARVARD_COLORS.charcoal);
    doc.text(`${alumno.cursos_activos || 0}`, 20 + boxW/2, yPos + 14, { align: 'center' });
    
    doc.setFillColor(...HARVARD_COLORS.lightGray);
    doc.roundedRect(20 + boxW + 10, yPos, boxW, 18, 2, 2, 'FD');
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.graphite);
    doc.text('PROMEDIO GENERAL', 20 + boxW + 10 + boxW/2, yPos + 6, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    if (alumno.promedio_general && parseFloat(alumno.promedio_general) >= 7) {
      doc.setTextColor(...HARVARD_COLORS.success);
    } else if (alumno.promedio_general && parseFloat(alumno.promedio_general) >= 4) {
      doc.setTextColor(...HARVARD_COLORS.warning);
    } else {
      doc.setTextColor(...HARVARD_COLORS.charcoal);
    }
    doc.text(`${alumno.promedio_general || '—'}`, 20 + boxW + 10 + boxW/2, yPos + 14, { align: 'center' });
    
    yPos += 30;
    
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.setTextColor(...HARVARD_COLORS.wroughtIron);
    doc.text(`Ficha generada el ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, pageWidth - 25, yPos, { align: 'right' });
    
    yPos += 22;
    
    doc.setDrawColor(...HARVARD_COLORS.charcoal);
    doc.setLineWidth(0.5);
    
    doc.line(30, yPos, 90, yPos);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...HARVARD_COLORS.charcoal);
    doc.text('Firma del Alumno', 60, yPos + 5, { align: 'center' });
    
    doc.line(120, yPos, 180, yPos);
    doc.text('Sello Institucional', 150, yPos + 5, { align: 'center' });
    
    agregarFooterPDF(doc);
    
    const nombreArchivo = `Ficha_Inscripcion_${alumno.legajo}_${alumno.apellido}.pdf`;
    doc.save(nombreArchivo);
    
    showToast('Ficha de inscripción generada exitosamente', 'success');
  } catch (error) {
    console.error('Error al generar ficha:', error);
    showToast('Error al generar la ficha de inscripción', 'error');
  }
}

async function generarTodosLosPDFs(idAlumno) {
  try {
    closeDocumentosModal();
    showToast('Generando paquete de documentos...', 'info');
    
    const response = await fetch(`${API_URL_DOCS}/alumnos/${idAlumno}`);
    if (!response.ok) throw new Error('Error al obtener datos del alumno');
    const alumno = await response.json();
    
    const pagosResponse = await fetch(`${API_URL_DOCS}/pagos/alumno/${idAlumno}`);
    let pagosData = { cursos: [] };
    if (pagosResponse.ok) {
      pagosData = await pagosResponse.json();
    }
    
    const zip = new JSZip();
    const { jsPDF } = window.jspdf;
    
    showToast('Generando Constancia de Alumno Regular...', 'info');
    const pdfConstancia = await generarPDFConstancia(alumno);
    zip.file(`01_Constancia_Alumno_Regular_${alumno.legajo}.pdf`, pdfConstancia);
    
    showToast('Generando Certificado de Calificaciones...', 'info');
    const pdfCalificaciones = await generarPDFCalificaciones(alumno);
    zip.file(`02_Certificado_Calificaciones_${alumno.legajo}.pdf`, pdfCalificaciones);
    
    showToast('Generando Estado de Cuenta...', 'info');
    const pdfEstadoCuenta = await generarPDFEstadoCuenta(alumno, pagosData);
    zip.file(`03_Estado_Cuenta_${alumno.legajo}.pdf`, pdfEstadoCuenta);
    
    showToast('Generando Ficha de Inscripción...', 'info');
    const pdfFicha = await generarPDFFicha(alumno, pagosData);
    zip.file(`04_Ficha_Inscripcion_${alumno.legajo}.pdf`, pdfFicha);
    
    showToast('Comprimiendo archivos...', 'info');
    const contenidoZip = await zip.generateAsync({ type: 'blob' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(contenidoZip);
    link.download = `Documentos_${alumno.legajo}_${alumno.apellido}_${new Date().toISOString().split('T')[0]}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    showToast('Paquete de documentos generado exitosamente', 'success');
  } catch (error) {
    console.error('Error al generar paquete:', error);
    showToast('Error al generar el paquete de documentos', 'error');
  }
}

async function generarPDFConstancia(alumno) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = await agregarHeaderPDF(doc, 'CONSTANCIA', 'Alumno Regular');
  
  const numConstancia = `CAR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(alumno.id_alumno).padStart(4, '0')}`;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${numConstancia}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 20;
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 30, 30);
  const fecha = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  const texto = `Por medio de la presente, se deja constancia que ${alumno.nombre || ''} ${alumno.apellido || ''}, ` +
    `DNI N° ${alumno.dni || 'No registrado'}, identificado/a con el legajo ${alumno.legajo || 'N/A'}, ` +
    `se encuentra inscripto/a como ALUMNO REGULAR en el Centro de Enseñanza Multilingüe Integral (CEMI).`;
  
  const lineas = doc.splitTextToSize(texto, pageWidth - 50);
  doc.text(lineas, 25, yPos);
  yPos += lineas.length * 7 + 15;
  
  const cursosActivos = alumno.cursos ? alumno.cursos.length : 0;
  if (cursosActivos > 0) {
    doc.text(`Actualmente cursa ${cursosActivos} ${cursosActivos === 1 ? 'programa' : 'programas'} académico${cursosActivos === 1 ? '' : 's'}:`, 25, yPos);
    yPos += 10;
    
    alumno.cursos.forEach(curso => {
      doc.setFillColor(240, 240, 240);
      doc.rect(30, yPos - 4, pageWidth - 60, 8, 'F');
      doc.text(`• ${curso.nombre_curso || 'Curso'} - Nivel ${curso.nivel || curso.id_nivel || 'N/A'}`, 35, yPos);
      yPos += 10;
    });
  }
  
  yPos += 20;
  doc.text(`Se extiende la presente constancia a pedido del interesado para los fines que estime corresponder.`, 25, yPos);
  yPos += 20;
  doc.text(`${alumno.localidad || 'San Miguel de Tucumán'}, ${fecha}`, 25, yPos);
  
  agregarFooterPDF(doc);
  return doc.output('blob');
}

async function generarPDFCalificaciones(alumno) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = await agregarHeaderPDF(doc, 'CERTIFICADO', 'Calificaciones Académicas');
  
  const numCertificado = `CC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(alumno.id_alumno).padStart(4, '0')}`;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${numCertificado}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 15;
  
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 60, 114);
  doc.text('ALUMNO:', 25, yPos + 8);
  doc.text('LEGAJO:', 25, yPos + 18);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`${alumno.nombre || ''} ${alumno.apellido || ''}`, 50, yPos + 8);
  doc.text(alumno.legajo || 'N/A', 50, yPos + 18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 60, 114);
  doc.text('DNI:', 110, yPos + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(alumno.dni || 'No registrado', 125, yPos + 8);
  yPos += 35;
  
  if (alumno.calificaciones && alumno.calificaciones.length > 0) {
    doc.setFillColor(30, 60, 114);
    doc.rect(20, yPos, pageWidth - 40, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Curso', 25, yPos + 6);
    doc.text('Nota 1', 85, yPos + 6);
    doc.text('Nota 2', 105, yPos + 6);
    doc.text('Nota 3', 125, yPos + 6);
    doc.text('Promedio', 150, yPos + 6);
    doc.text('Estado', 175, yPos + 6);
    yPos += 10;
    
    alumno.calificaciones.forEach((cal, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, yPos - 2, pageWidth - 40, 8, 'F');
      }
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const nombreCurso = (cal.nombre_curso || 'Curso').length > 28 ? (cal.nombre_curso || 'Curso').substring(0, 25) + '...' : (cal.nombre_curso || 'Curso');
      doc.text(nombreCurso, 25, yPos + 3);
      doc.text(cal.nota1 !== null && cal.nota1 !== undefined ? String(cal.nota1) : '-', 90, yPos + 3, { align: 'center' });
      doc.text(cal.nota2 !== null && cal.nota2 !== undefined ? String(cal.nota2) : '-', 110, yPos + 3, { align: 'center' });
      doc.text(cal.nota3 !== null && cal.nota3 !== undefined ? String(cal.nota3) : '-', 130, yPos + 3, { align: 'center' });
      
      const promedio = cal.promedio || ((cal.nota1 || 0) + (cal.nota2 || 0) + (cal.nota3 || 0)) / 3;
      doc.setFont('helvetica', 'bold');
      doc.text(promedio ? promedio.toFixed(2) : '-', 155, yPos + 3, { align: 'center' });
      
      if (promedio >= 6) {
        doc.setTextColor(16, 185, 129);
        doc.text('Aprobado', 180, yPos + 3, { align: 'center' });
      } else if (promedio > 0) {
        doc.setTextColor(239, 68, 68);
        doc.text('Regular', 180, yPos + 3, { align: 'center' });
      } else {
        doc.setTextColor(150, 150, 150);
        doc.text('Cursando', 180, yPos + 3, { align: 'center' });
      }
      yPos += 8;
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('No hay calificaciones registradas para este alumno.', pageWidth / 2, yPos + 10, { align: 'center' });
  }
  
  agregarFooterPDF(doc);
  return doc.output('blob');
}

async function generarPDFEstadoCuenta(alumno, pagosData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = await agregarHeaderPDF(doc, 'ESTADO DE CUENTA', 'Resumen Financiero');
  
  const numEstado = `EC-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(alumno.id_alumno).padStart(5, '0')}`;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${numEstado}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 15;
  
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(200, 200, 200);
  doc.roundedRect(20, yPos, pageWidth - 40, 20, 3, 3, 'FD');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 60, 114);
  doc.text('ALUMNO:', 25, yPos + 8);
  doc.text('EMAIL:', 25, yPos + 15);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(`${alumno.nombre || ''} ${alumno.apellido || ''}`, 50, yPos + 8);
  doc.text(alumno.mail || 'No registrado', 50, yPos + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 60, 114);
  doc.text('LEGAJO:', 130, yPos + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);
  doc.text(alumno.legajo || 'N/A', 155, yPos + 8);
  yPos += 30;
  
  let totalPagado = 0, totalPendiente = 0, cuotasPagadas = 0, cuotasTotales = 0;
  
  if (pagosData.estadisticas_globales) {
    totalPagado = pagosData.estadisticas_globales.total_pagado || 0;
    totalPendiente = pagosData.estadisticas_globales.total_pendiente || 0;
  }
  
  if (pagosData.cursos) {
    pagosData.cursos.forEach(curso => {
      if (curso.estadisticas) {
        cuotasPagadas += curso.estadisticas.cuotas_pagadas || 0;
        cuotasTotales += (curso.estadisticas.cuotas_pagadas || 0) + 
                        (curso.estadisticas.cuotas_impagas || 0) + 
                        (curso.estadisticas.cuotas_pendientes || 0);
      }
    });
  }
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 60, 114);
  doc.text('RESUMEN GENERAL', 20, yPos);
  yPos += 8;
  
  doc.setFillColor(209, 250, 229);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(20, yPos, 55, 28, 3, 3, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(5, 150, 105);
  doc.text('TOTAL PAGADO', 47.5, yPos + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalPagado.toLocaleString('es-AR')}`, 47.5, yPos + 20, { align: 'center' });
  
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.roundedRect(80, yPos, 55, 28, 3, 3, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(217, 119, 6);
  doc.text('PENDIENTE', 107.5, yPos + 8, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`$${totalPendiente.toLocaleString('es-AR')}`, 107.5, yPos + 20, { align: 'center' });
  
  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(140, yPos, 50, 28, 3, 3, 'FD');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(37, 99, 235);
  doc.text('CUOTAS', 165, yPos + 8, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`${cuotasPagadas}/${cuotasTotales}`, 165, yPos + 20, { align: 'center' });
  
  yPos += 40;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('* Los montos están expresados en pesos argentinos (ARS)', 20, yPos);
  
  agregarFooterPDF(doc);
  return doc.output('blob');
}

async function generarPDFFicha(alumno, pagosData) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPos = await agregarHeaderPDF(doc, 'FICHA DE INSCRIPCIÓN', 'Datos del Alumno');
  
  const numFicha = `FI-A${String(alumno.id_alumno).padStart(3, '0')}`;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`N° ${numFicha}`, pageWidth - 20, yPos, { align: 'right' });
  yPos += 15;
  
  doc.setFillColor(30, 60, 114);
  doc.rect(20, yPos, pageWidth - 40, 8, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('DATOS PERSONALES', 25, yPos + 6);
  yPos += 14;
  
  const datosPersonales = [
    { label: 'Nombre Completo', value: `${alumno.nombre || ''} ${alumno.apellido || ''}`.trim() || 'No registrado' },
    { label: 'DNI', value: alumno.dni || 'No registrado' },
    { label: 'Legajo', value: alumno.legajo || 'No asignado' },
    { label: 'Email', value: alumno.mail || 'No registrado' },
    { label: 'Teléfono', value: alumno.telefono || 'No registrado' },
    { label: 'Fecha de Registro', value: alumno.fecha_registro ? new Date(alumno.fecha_registro).toLocaleDateString('es-ES') : 'No registrada' },
    { label: 'Estado', value: alumno.estado ? alumno.estado.charAt(0).toUpperCase() + alumno.estado.slice(1) : 'Activo' },
    { label: 'Usuario', value: alumno.usuario || 'No asignado' }
  ];
  
  doc.setFontSize(9);
  let col = 0;
  datosPersonales.forEach((dato) => {
    const xBase = col === 0 ? 25 : 115;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 60, 114);
    doc.text(`${dato.label}:`, xBase, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    const valorTruncado = dato.value.length > 35 ? dato.value.substring(0, 32) + '...' : dato.value;
    doc.text(valorTruncado, xBase + 35, yPos);
    col++;
    if (col === 2) { col = 0; yPos += 8; }
  });
  if (col !== 0) yPos += 8;
  yPos += 12;
  
  doc.setFillColor(30, 60, 114);
  doc.rect(20, yPos, pageWidth - 40, 8, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('CURSOS INSCRIPTOS', 25, yPos + 6);
  yPos += 14;
  
  const cursosConProfesor = pagosData.cursos || [];
  const cursosCombinados = (alumno.cursos || []).map(curso => {
    const cursoPago = cursosConProfesor.find(cp => cp.id_curso === curso.id_curso);
    return {
      ...curso,
      profesor: cursoPago?.profesor || 'No asignado'
    };
  });
  
  if (cursosCombinados.length > 0) {
    const cursos = cursosCombinados;
    doc.setFillColor(241, 245, 249);
    doc.rect(20, yPos, pageWidth - 40, 8, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 60, 114);
    doc.text('Curso', 25, yPos + 6);
    doc.text('Idioma', 75, yPos + 6);
    doc.text('Nivel', 110, yPos + 6);
    doc.text('Profesor', 135, yPos + 6);
    yPos += 12;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    
    cursos.forEach((curso, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, yPos - 3, pageWidth - 40, 8, 'F');
      }
      const nombreCurso = (curso.nombre_curso || 'Curso').length > 25 ? (curso.nombre_curso || 'Curso').substring(0, 22) + '...' : (curso.nombre_curso || 'Curso');
      doc.text(nombreCurso, 25, yPos + 2);
      doc.text(curso.nombre_idioma || 'N/A', 75, yPos + 2);
      doc.text(curso.nivel || 'N/A', 110, yPos + 2);
      const profesor = (curso.profesor || 'No asignado').length > 20 ? (curso.profesor || 'No asignado').substring(0, 17) + '...' : (curso.profesor || 'No asignado');
      doc.text(profesor, 135, yPos + 2);
      yPos += 8;
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('No hay cursos inscriptos actualmente.', pageWidth / 2, yPos, { align: 'center' });
  }
  
  agregarFooterPDF(doc);
  return doc.output('blob');
}

console.log(' Sistema de Documentos PDF cargado correctamente');



