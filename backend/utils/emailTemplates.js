
const LOGO_URL = 'https://cemi.up.railway.app/images/logolong.png';
const SITE_URL = 'https://cemi.up.railway.app';

const COLORS = {
  charcoal: '#1e1e1e',
  wroughtIron: '#4a4a4a',
  graphite: '#656f77',
  silver: '#a0a0a0',
  lightGray: '#f5f5f5',
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  danger: '#ef4444',
  dangerLight: '#fee2e2',
  text: '#1e1e1e',
  textLight: '#4a4a4a',
  textMuted: '#656f77',
  background: '#f5f5f5',
  white: '#ffffff',
  border: '#e5e5e5'
};

const baseStyles = `
  <style>
    body { font-family: 'Georgia', 'Times New Roman', serif; margin: 0; padding: 0; background: ${COLORS.background}; }
    .container { max-width: 600px; margin: 0 auto; background: ${COLORS.white}; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
    .header { background: ${COLORS.charcoal}; padding: 30px 30px; text-align: center; }
    .header img { height: 50px; width: auto; }
    .header h1 { color: ${COLORS.white}; margin: 20px 0 0 0; font-size: 22px; font-weight: 600; font-family: 'Times New Roman', Georgia, serif; letter-spacing: 0.5px; }
    .header-accent { height: 4px; background: ${COLORS.wroughtIron}; }
    .content { padding: 40px 30px; }
    .content h2 { color: ${COLORS.charcoal}; margin-bottom: 20px; font-size: 20px; font-family: 'Times New Roman', Georgia, serif; }
    .content h3 { color: ${COLORS.charcoal}; margin-top: 25px; margin-bottom: 15px; font-family: 'Times New Roman', Georgia, serif; }
    .content p { color: ${COLORS.textLight}; line-height: 1.7; margin-bottom: 15px; font-size: 15px; }
    .info-box { background: ${COLORS.lightGray}; border-left: 4px solid ${COLORS.charcoal}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0; }
    .info-box p { margin: 8px 0; color: ${COLORS.text}; }
    .info-box strong { color: ${COLORS.charcoal}; }
    .credential-box { background: ${COLORS.lightGray}; border: 2px solid ${COLORS.charcoal}; padding: 25px; margin: 25px 0; border-radius: 8px; text-align: center; }
    .credential-box h3 { color: ${COLORS.charcoal}; margin-bottom: 20px; margin-top: 0; }
    .credential-item { background: ${COLORS.white}; padding: 15px 25px; margin: 10px 0; border-radius: 6px; display: inline-block; min-width: 220px; border: 1px solid ${COLORS.border}; }
    .credential-item label { display: block; font-size: 11px; color: ${COLORS.graphite}; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
    .credential-item span { font-size: 18px; font-weight: 600; color: ${COLORS.charcoal}; font-family: 'Consolas', monospace; }
    .warning { background: ${COLORS.warningLight}; border-left: 4px solid ${COLORS.warning}; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .warning p { color: #92400e; margin: 0; font-size: 14px; }
    .success-box { background: ${COLORS.successLight}; border-left: 4px solid ${COLORS.success}; padding: 15px 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
    .success-box p { color: #065f46; margin: 0; font-size: 14px; }
    .btn { display: inline-block; background: ${COLORS.charcoal}; color: ${COLORS.white} !important; padding: 14px 35px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
    .btn:hover { background: ${COLORS.wroughtIron}; }
    .btn-secondary { display: inline-block; background: transparent; color: ${COLORS.charcoal} !important; padding: 12px 25px; border-radius: 6px; text-decoration: none; font-weight: 500; border: 2px solid ${COLORS.charcoal}; margin: 10px 5px; }
    .success-icon { font-size: 48px; margin-bottom: 15px; }
    .divider { height: 1px; background: ${COLORS.border}; margin: 30px 0; }
    .footer { background: ${COLORS.lightGray}; padding: 30px; text-align: center; border-top: 1px solid ${COLORS.border}; }
    .footer p { color: ${COLORS.graphite}; font-size: 13px; margin: 5px 0; }
    .footer-links { margin: 20px 0; padding: 0; }
    .footer-links a { color: ${COLORS.charcoal}; text-decoration: none; margin: 0 12px; font-size: 13px; font-weight: 500; }
    .footer-links a:hover { text-decoration: underline; }
    .footer-brand { color: ${COLORS.charcoal}; font-weight: 600; font-size: 14px; margin-bottom: 10px; font-family: 'Times New Roman', Georgia, serif; }
    .footer-legal { font-size: 11px; color: ${COLORS.silver}; margin-top: 15px; line-height: 1.6; }
    ul { padding-left: 20px; }
    ul li { color: ${COLORS.textLight}; line-height: 2; margin-bottom: 5px; }
  </style>
`;

const footerTemplate = `
  <div class="footer">
    <p class="footer-brand">Centro Educativo Multilingue Integral</p>
    <p>Tu plataforma educativa de confianza</p>
    
    <div class="footer-links">
      <a href="${SITE_URL}/ayuda.html">Centro de Ayuda</a>
      <a href="${SITE_URL}/terminos.html">Terminos de Uso</a>
      <a href="${SITE_URL}/privacidad.html">Privacidad</a>
      <a href="mailto:soporte@cemi.edu">Contacto</a>
    </div>
    
    <div class="divider" style="margin: 15px auto; max-width: 200px;"></div>
    
    <p class="footer-legal">
      Este es un correo automatico enviado por el sistema CEMI.<br>
      Por favor no responda directamente a este mensaje.<br>
      &copy; ${new Date().getFullYear()} CEMI - Todos los derechos reservados.
    </p>
  </div>
`;

export function solicitudRecibidaTemplate(nombreUsuario, email) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="CEMI">
          <h1>Solicitud Recibida</h1>
        </div>
        <div class="header-accent"></div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-icon"></div>
          </div>
          <h2>Hola ${nombreUsuario || 'Usuario'},</h2>
          <p>Hemos recibido tu solicitud de recuperacion de contrasena para tu cuenta en el <strong>Centro Educativo Multilingue Integral (CEMI)</strong>.</p>
          
          <div class="info-box">
            <p><strong> Email registrado:</strong> ${email}</p>
            <p><strong> Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'short' })}</p>
            <p><strong> Numero de referencia:</strong> #${Date.now().toString().slice(-8)}</p>
          </div>
          
          <p>Un administrador revisara tu solicitud y te enviara tus nuevas credenciales de acceso a este mismo correo electronico.</p>
          
          <div class="warning">
            <p>️ <strong>Importante:</strong> Si no solicitaste este cambio, por favor ignora este mensaje o contacta inmediatamente con soporte.</p>
          </div>
          
          <p>Te notificaremos cuando tus credenciales hayan sido actualizadas. Este proceso suele tomar entre 24-48 horas habiles.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${SITE_URL}/ayuda.html" class="btn-secondary">Visitar Centro de Ayuda</a>
          </div>
        </div>
        ${footerTemplate}
      </div>
    </body>
    </html>
  `;
}

export function notificacionAdminTemplate(usuario) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background: ${COLORS.charcoal};">
          <img src="${LOGO_URL}" alt="CEMI">
          <h1>Nueva Solicitud de Recuperacion</h1>
        </div>
        <div class="header-accent"></div>
        <div class="content">
          <h2>Accion Requerida: Solicitud de Restablecimiento</h2>
          <p>Se ha recibido una nueva solicitud de recuperacion de contrasena que requiere tu atencion.</p>
          
          <div class="info-box" style="border-left-color: ${COLORS.warning}; background: ${COLORS.warningLight};">
            <p><strong>Usuario:</strong> ${usuario.nombre || 'No disponible'}</p>
            <p><strong>Email:</strong> ${usuario.email}</p>
            <p><strong>Rol:</strong> ${usuario.rol || 'No especificado'}</p>
            <p><strong>ID de Usuario:</strong> ${usuario.id || 'No disponible'}</p>
            <p><strong>Fecha/Hora:</strong> ${new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' })}</p>
          </div>
          
          <div class="divider"></div>
          
          <h3>Pasos a seguir:</h3>
          <ul>
            <li>Accede al panel de administracion</li>
            <li>Verifica la identidad del usuario solicitante</li>
            <li>Genera nuevas credenciales de acceso</li>
            <li>El sistema enviara automaticamente las credenciales al usuario</li>
          </ul>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${SITE_URL}/login-admin.html" class="btn">Ir al Panel de Admin</a>
          </div>
        </div>
        ${footerTemplate}
      </div>
    </body>
    </html>
  `;
}

export function credencialesActualizadasTemplate(usuario, nuevasCredenciales) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header" style="background: ${COLORS.charcoal};">
          <img src="${LOGO_URL}" alt="CEMI">
          <h1>Contrasena Restablecida</h1>
        </div>
        <div class="header-accent" style="background: ${COLORS.success};"></div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-icon">&#10003;</div>
          </div>
          <h2>Hola ${usuario.nombre || 'Usuario'}!</h2>
          <p>Tu contrasena ha sido <strong>restablecida exitosamente</strong> por el administrador del sistema.</p>
          <p>A continuacion encontraras tus nuevas credenciales de acceso:</p>
          
          <div class="credential-box">
            <h3>Tus Nuevas Credenciales</h3>
            <div class="credential-item">
              <label>Usuario</label>
              <span>${nuevasCredenciales.usuario}</span>
            </div>
            <div class="credential-item">
              <label>Contrasena</label>
              <span>${nuevasCredenciales.password}</span>
            </div>
          </div>
          
          <div class="success-box">
            <p><strong>Recomendacion de seguridad:</strong> Te sugerimos cambiar tu contrasena despues de iniciar sesion por primera vez desde tu perfil.</p>
          </div>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="${SITE_URL}/login.html" class="btn">Iniciar Sesion Ahora</a>
          </div>
          
          <div class="divider"></div>
          
          <p style="font-size: 14px;">Si tienes alguna duda o problema para acceder, visita nuestro <a href="${SITE_URL}/ayuda.html" style="color: ${COLORS.charcoal};">Centro de Ayuda</a> o contacta con el administrador del sistema.</p>
        </div>
        ${footerTemplate}
      </div>
    </body>
    </html>
  `;
}

export function encuestaAgradecimientoTemplate(nombre) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="CEMI">
          <h1>Gracias por Participar</h1>
        </div>
        <div class="header-accent" style="background: ${COLORS.success};"></div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-icon">&#10003;</div>
          </div>
          <h2>Hola ${nombre || 'Participante'},</h2>
          <p>Queremos agradecerte sinceramente por tomarte el tiempo de completar nuestra <strong>encuesta de investigacion</strong>.</p>
          
          <div class="info-box">
            <p style="margin: 0; font-size: 15px;">Tu opinion es fundamental para nosotros. Cada respuesta nos ayuda a entender mejor las necesidades de nuestra comunidad educativa y a mejorar continuamente <strong>CEMI Classroom</strong>.</p>
          </div>
          
          <h3>Que sigue ahora?</h3>
          <p>Tu perfil ya esta activo en nuestro sistema de investigacion. Esto significa que:</p>
          
          <ul>
            <li>Seras considerado/a para futuros estudios y encuestas</li>
            <li>Recibiras invitaciones exclusivas para probar nuevas funcionalidades</li>
            <li>Podras influir directamente en el desarrollo de CEMI</li>
            <li>Tendras acceso prioritario a novedades y actualizaciones</li>
          </ul>
          
          <div style="background: ${COLORS.lightGray}; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border: 1px solid ${COLORS.border};">
            <p style="margin: 0; color: ${COLORS.charcoal}; font-weight: 600; font-size: 16px;">Manten un ojo en tu bandeja de entrada</p>
            <p style="margin: 10px 0 0 0; color: ${COLORS.graphite}; font-size: 14px;">Pronto recibiras mas novedades y oportunidades para seguir colaborando con nosotros.</p>
          </div>
          
          <p>Si tienes alguna pregunta, sugerencia o comentario adicional, no dudes en contactarnos. Estamos emocionados de contar contigo en nuestra comunidad!</p>
          
          <div style="text-align: center; margin-top: 25px;">
            <a href="${SITE_URL}/classroom.html" class="btn">Explorar CEMI Classroom</a>
          </div>
          
          <div class="divider"></div>
          
          <p style="margin-top: 20px;">Con gratitud,<br><strong style="color: ${COLORS.charcoal};">El equipo de CEMI</strong></p>
        </div>
        ${footerTemplate}
      </div>
    </body>
    </html>
  `;
}

export function bienvenidaAlumnoTemplate(datos) {
  const { nombre, apellido, username, legajo, cemiKey } = datos;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="CEMI">
          <h1>Confirma tu Cuenta</h1>
        </div>
        <div class="header-accent"></div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-icon" style="color: ${COLORS.charcoal};">&#9993;</div>
          </div>
          <h2>Hola ${nombre} ${apellido}!</h2>
          <p>Gracias por registrarte en el <strong>Centro Educativo Multilingue Integral</strong>. Estas a un solo paso de activar tu cuenta.</p>
          
          <div style="background: ${COLORS.lightGray}; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center; border: 2px solid ${COLORS.charcoal};">
            <p style="margin: 0 0 20px 0; color: ${COLORS.charcoal}; font-weight: 600; font-size: 18px;">Solo falta un paso</p>
            <p style="margin: 0 0 25px 0; color: ${COLORS.textLight}; font-size: 15px;">Hace clic en el boton de abajo para confirmar tu cuenta y comenzar tu experiencia educativa.</p>
            <a href="${SITE_URL}/cuenta-confirmada.html" class="btn" style="font-size: 16px; padding: 16px 45px;">Confirmar mi Cuenta</a>
          </div>
          
          <div class="credential-box">
            <h3>Tus Datos de Acceso</h3>
            <div class="credential-item">
              <label>Usuario</label>
              <span>${username}</span>
            </div>
            <div class="credential-item">
              <label>Legajo</label>
              <span>${legajo}</span>
            </div>
          </div>
          
          ${cemiKey ? `
          <div style="background: linear-gradient(135deg, ${COLORS.charcoal} 0%, ${COLORS.wroughtIron} 100%); padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; color: ${COLORS.white}; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Tu CemiKey Personal</p>
            <p style="margin: 0 0 15px 0; font-size: 24px; font-weight: 700; color: ${COLORS.white}; font-family: 'Consolas', 'Monaco', monospace; letter-spacing: 3px;">${cemiKey}</p>
            <p style="margin: 0; color: ${COLORS.silver}; font-size: 13px;">Usala para iniciar sesion de forma rapida y segura</p>
          </div>
          ` : ''}
          
          <div class="info-box">
            <p style="margin: 0; font-size: 15px;"><strong>Recordatorio:</strong> Tu contrasena es la que elegiste durante el registro. Guardala en un lugar seguro.</p>
          </div>
          
          <h3>Una vez confirmada tu cuenta, podras:</h3>
          <ul>
            <li>Explorar los cursos disponibles e inscribirte</li>
            <li>Consultar tus horarios y calendario academico</li>
            <li>Ver tu progreso y calificaciones</li>
            <li>Gestionar tus pagos de cuotas online</li>
            <li>Personalizar tu perfil con foto</li>
          </ul>
          
          <div class="divider"></div>
          
          <div class="warning" style="background: ${COLORS.warningLight}; border-left-color: ${COLORS.warning};">
            <p style="color: #92400e;"><strong>Importante:</strong> Si no creaste esta cuenta, podes ignorar este mensaje de forma segura.</p>
          </div>
          
          <p style="margin-top: 25px;">Te esperamos dentro!</p>
          <p>Saludos cordiales,<br><strong style="color: ${COLORS.charcoal};">El equipo de CEMI</strong></p>
        </div>
        ${footerTemplate}
      </div>
    </body>
    </html>
  `;
}

export default {
  solicitudRecibidaTemplate,
  notificacionAdminTemplate,
  credencialesActualizadasTemplate,
  encuestaAgradecimientoTemplate,
  bienvenidaAlumnoTemplate
};

export function gdprSolicitudUsuarioTemplate(datos) {
  const { nombre, apellido, email, tipoSolicitud, referencia } = datos;
  
  const tipoTexto = {
    'exportar': 'exportacion de datos personales',
    'eliminar': 'eliminacion de cuenta y datos',
    'rectificar': 'rectificacion de datos'
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="CEMI">
          <h1>Solicitud GDPR Recibida</h1>
        </div>
        <div class="header-accent"></div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-icon" style="color: ${COLORS.charcoal};">&#128203;</div>
          </div>
          <h2>Hola ${nombre} ${apellido},</h2>
          <p>Hemos recibido tu solicitud de <strong>${tipoTexto[tipoSolicitud] || tipoSolicitud}</strong> conforme al Reglamento General de Proteccion de Datos (GDPR).</p>
          
          <div class="info-box">
            <p><strong>Email asociado:</strong> ${email}</p>
            <p><strong>Tipo de solicitud:</strong> ${tipoTexto[tipoSolicitud] || tipoSolicitud}</p>
            <p><strong>Numero de referencia:</strong> #${referencia}</p>
            <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })}</p>
          </div>
          
          <div class="success-box">
            <p><strong>Que sigue ahora?</strong> Un administrador procesara tu solicitud en los proximos dias habiles. Recibiras un correo con los resultados.</p>
          </div>
          
          <h3>Tiempos estimados:</h3>
          <ul>
            <li><strong>Exportacion de datos:</strong> 48-72 horas habiles</li>
            <li><strong>Eliminacion de cuenta:</strong> 5-7 dias habiles</li>
            <li><strong>Rectificacion de datos:</strong> 24-48 horas habiles</li>
          </ul>
          
          <div class="warning">
            <p><strong>Importante:</strong> Si no realizaste esta solicitud, por favor contacta inmediatamente con soporte respondiendo a este correo.</p>
          </div>
          
          <p style="margin-top: 25px;">Gracias por confiar en nosotros.</p>
          <p>Atentamente,<br><strong style="color: ${COLORS.charcoal};">El equipo de CEMI</strong></p>
        </div>
        ${footerTemplate}
      </div>
    </body>
    </html>
  `;
}

export function gdprNotificacionAdminTemplate(datos) {
  const { nombre, apellido, email, dni, legajo, tipoSolicitud, formato, referencia, idUsuario, idAlumno } = datos;
  
  const tipoTexto = {
    'exportar': 'Exportacion de Datos',
    'eliminar': 'Eliminacion de Cuenta',
    'rectificar': 'Rectificacion de Datos'
  };
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="CEMI">
          <h1>Nueva Solicitud GDPR</h1>
        </div>
        <div class="header-accent" style="background: ${COLORS.warning};"></div>
        <div class="content">
          <h2>Accion Requerida: ${tipoTexto[tipoSolicitud] || tipoSolicitud}</h2>
          <p>Se ha recibido una nueva solicitud de derechos GDPR que requiere tu atencion.</p>
          
          <div class="info-box" style="border-left-color: ${COLORS.warning}; background: ${COLORS.warningLight};">
            <p><strong>Referencia:</strong> #${referencia}</p>
            <p><strong>Tipo:</strong> ${tipoTexto[tipoSolicitud] || tipoSolicitud}</p>
            <p><strong>Fecha/Hora:</strong> ${new Date().toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'medium' })}</p>
          </div>
          
          <div class="credential-box">
            <h3>Datos del Solicitante</h3>
            <table style="width: 100%; text-align: left; margin-top: 15px;">
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>Nombre:</strong></td><td style="padding: 8px;">${nombre} ${apellido}</td></tr>
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>Email:</strong></td><td style="padding: 8px;">${email}</td></tr>
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>DNI:</strong></td><td style="padding: 8px;">${dni || 'No disponible'}</td></tr>
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>Legajo:</strong></td><td style="padding: 8px;">${legajo || 'No disponible'}</td></tr>
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>ID Usuario:</strong></td><td style="padding: 8px;">${idUsuario}</td></tr>
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>ID Alumno:</strong></td><td style="padding: 8px;">${idAlumno || 'N/A'}</td></tr>
              ${formato ? `<tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>Formato preferido:</strong></td><td style="padding: 8px;">${formato.toUpperCase()}</td></tr>` : ''}
            </table>
          </div>
          
          <div class="divider"></div>
          
          <h3>Pasos a seguir:</h3>
          <ul>
            <li>Accede al panel de administracion</li>
            <li>Localiza al usuario en la seccion correspondiente</li>
            ${tipoSolicitud === 'exportar' ? '<li>Genera el archivo de exportacion en el formato solicitado</li><li>Envia el archivo al email del usuario</li>' : ''}
            ${tipoSolicitud === 'eliminar' ? '<li>Verifica que no haya pagos pendientes</li><li>Procede con la eliminacion segura de datos</li><li>Confirma la eliminacion al usuario</li>' : ''}
            ${tipoSolicitud === 'rectificar' ? '<li>Contacta al usuario para conocer los cambios necesarios</li><li>Actualiza los datos correspondientes</li><li>Confirma los cambios al usuario</li>' : ''}
          </ul>
          
          <div class="warning">
            <p><strong>Plazo legal:</strong> Segun GDPR, tienes un maximo de 30 dias para responder a esta solicitud.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${SITE_URL}/login-admin.html" class="btn">Ir al Panel de Admin</a>
          </div>
        </div>
        ${footerTemplate}
      </div>
    </body>
    </html>
  `;
}

export function codigosRecuperacionUsuarioTemplate(datos) {
  const { nombre, apellido, email, referencia } = datos;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="CEMI">
          <h1>Solicitud de Codigos Recibida</h1>
        </div>
        <div class="header-accent"></div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-icon" style="color: ${COLORS.charcoal};">&#128274;</div>
          </div>
          <h2>Hola ${nombre} ${apellido},</h2>
          <p>Hemos recibido tu solicitud para <strong>generar/regenerar codigos de recuperacion</strong> para la verificacion en dos pasos (2FA).</p>
          
          <div class="info-box">
            <p><strong>Email asociado:</strong> ${email}</p>
            <p><strong>Tipo de solicitud:</strong> Codigos de Recuperacion 2FA</p>
            <p><strong>Numero de referencia:</strong> #${referencia}</p>
            <p><strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'short' })}</p>
          </div>
          
          <div class="success-box">
            <p><strong>Que sigue ahora?</strong> Un administrador verificara tu identidad y generara tus nuevos codigos de recuperacion. Los recibiras por este mismo correo.</p>
          </div>
          
          <h3>Tiempo estimado:</h3>
          <p>El proceso suele completarse en <strong>24-48 horas habiles</strong>.</p>
          
          <div class="warning">
            <p><strong>Importante:</strong> Si no realizaste esta solicitud, por favor contacta inmediatamente con soporte. Tu cuenta podria estar comprometida.</p>
          </div>
          
          <div class="divider"></div>
          
          <h3>Para que sirven los codigos de recuperacion?</h3>
          <ul>
            <li>Acceder a tu cuenta si pierdes tu dispositivo 2FA</li>
            <li>Cada codigo solo puede usarse <strong>una vez</strong></li>
            <li>Recibiras 10 codigos unicos de 8 digitos</li>
            <li>Guardalos en un lugar seguro (no en tu telefono)</li>
          </ul>
          
          <p style="margin-top: 25px;">Gracias por mantener tu cuenta segura.</p>
          <p>Atentamente,<br><strong style="color: ${COLORS.charcoal};">El equipo de CEMI</strong></p>
        </div>
        ${footerTemplate}
      </div>
    </body>
    </html>
  `;
}

export function codigosRecuperacionAdminTemplate(datos) {
  const { nombre, apellido, email, dni, usuario, motivo, referencia, idUsuario } = datos;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      ${baseStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="${LOGO_URL}" alt="CEMI">
          <h1>Solicitud de Codigos 2FA</h1>
        </div>
        <div class="header-accent" style="background: ${COLORS.warning};"></div>
        <div class="content">
          <h2>Accion Requerida: Generar Codigos de Recuperacion</h2>
          <p>Se ha recibido una nueva solicitud de codigos de recuperacion para 2FA que requiere tu atencion.</p>
          
          <div class="info-box" style="border-left-color: ${COLORS.warning}; background: ${COLORS.warningLight};">
            <p><strong>Referencia:</strong> #${referencia}</p>
            <p><strong>Tipo:</strong> Codigos de Recuperacion 2FA</p>
            <p><strong>Fecha/Hora:</strong> ${new Date().toLocaleString('es-AR', { dateStyle: 'full', timeStyle: 'medium' })}</p>
          </div>
          
          <div class="credential-box">
            <h3>Datos del Solicitante</h3>
            <table style="width: 100%; text-align: left; margin-top: 15px;">
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>Nombre:</strong></td><td style="padding: 8px;">${nombre} ${apellido}</td></tr>
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>Usuario:</strong></td><td style="padding: 8px;">${usuario || 'No especificado'}</td></tr>
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>Email:</strong></td><td style="padding: 8px;">${email}</td></tr>
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>DNI:</strong></td><td style="padding: 8px;">${dni || 'No especificado'}</td></tr>
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>ID Usuario:</strong></td><td style="padding: 8px;">${idUsuario || 'No disponible'}</td></tr>
              <tr><td style="padding: 8px; color: ${COLORS.graphite};"><strong>Motivo:</strong></td><td style="padding: 8px;">${motivo || 'No especificado'}</td></tr>
            </table>
          </div>
          
          <div class="divider"></div>
          
          <h3>Pasos a seguir:</h3>
          <ul>
            <li>Verificar la identidad del usuario (DNI, usuario, email)</li>
            <li>Acceder al panel de administracion</li>
            <li>Localizar al usuario en la gestion de 2FA</li>
            <li>Generar nuevos codigos de recuperacion (10 codigos)</li>
            <li>Enviar los codigos de forma segura al usuario</li>
            <li>Los codigos anteriores quedaran invalidados</li>
          </ul>
          
          <div class="warning">
            <p><strong>Seguridad:</strong> Antes de generar codigos, verifica que la solicitud sea legitima. Podrias contactar al usuario por otro medio para confirmar.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${SITE_URL}/login-admin.html" class="btn">Ir al Panel de Admin</a>
          </div>
        </div>
        ${footerTemplate}
      </div>
    </body>
    </html>
  `;
}



