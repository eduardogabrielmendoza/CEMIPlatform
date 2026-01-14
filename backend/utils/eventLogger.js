/**
 * Sistema Centralizado de Event Logging para CEMI
 * Captura eventos de toda la plataforma para el Centro de Monitoreo
 */

// Almacenamiento en memoria de eventos (últimos 500)
const MAX_EVENTS = 500;
const events = [];

// Categorías de eventos
const EventCategory = {
    AUTH: 'auth',
    CLASSROOM: 'classroom',
    CHAT: 'chat',
    COMMUNITY: 'community',
    PAYMENTS: 'payments',
    USERS: 'users',
    SYSTEM: 'system'
};

// Tipos de eventos por categoría (iconos Lucide)
const EventTypes = {
    // Auth
    LOGIN_SUCCESS: { category: EventCategory.AUTH, icon: 'log-in', severity: 'info' },
    LOGIN_FAILED: { category: EventCategory.AUTH, icon: 'lock', severity: 'warning' },
    LOGOUT: { category: EventCategory.AUTH, icon: 'log-out', severity: 'info' },
    REGISTER: { category: EventCategory.AUTH, icon: 'user-plus', severity: 'success' },
    PASSWORD_RECOVERY: { category: EventCategory.AUTH, icon: 'key', severity: 'info' },
    PASSWORD_CHANGED: { category: EventCategory.AUTH, icon: 'shield-check', severity: 'success' },
    
    // Classroom
    CLASSROOM_ACCESS: { category: EventCategory.CLASSROOM, icon: 'book-open', severity: 'info' },
    TASK_CREATED: { category: EventCategory.CLASSROOM, icon: 'file-plus', severity: 'success' },
    TASK_SUBMITTED: { category: EventCategory.CLASSROOM, icon: 'check-circle', severity: 'success' },
    TASK_GRADED: { category: EventCategory.CLASSROOM, icon: 'award', severity: 'success' },
    TASK_DELETED: { category: EventCategory.CLASSROOM, icon: 'file-minus', severity: 'warning' },
    ANNOUNCEMENT_CREATED: { category: EventCategory.CLASSROOM, icon: 'megaphone', severity: 'success' },
    ANNOUNCEMENT_DELETED: { category: EventCategory.CLASSROOM, icon: 'trash-2', severity: 'warning' },
    POLL_VOTED: { category: EventCategory.CLASSROOM, icon: 'vote', severity: 'info' },
    COMMENT_POSTED: { category: EventCategory.CLASSROOM, icon: 'message-square', severity: 'info' },
    RESOURCE_UPLOADED: { category: EventCategory.CLASSROOM, icon: 'upload', severity: 'info' },
    RESOURCE_DOWNLOADED: { category: EventCategory.CLASSROOM, icon: 'download', severity: 'info' },
    RESOURCE_DELETED: { category: EventCategory.CLASSROOM, icon: 'trash', severity: 'warning' },
    COURSE_CREATED: { category: EventCategory.CLASSROOM, icon: 'graduation-cap', severity: 'success' },
    ENROLLMENT: { category: EventCategory.CLASSROOM, icon: 'clipboard-list', severity: 'info' },
    
    // Chat
    MESSAGE_SENT: { category: EventCategory.CHAT, icon: 'message-circle', severity: 'info' },
    CHAT_CONNECTED: { category: EventCategory.CHAT, icon: 'wifi', severity: 'info' },
    CHAT_DISCONNECTED: { category: EventCategory.CHAT, icon: 'wifi-off', severity: 'info' },
    FILE_SHARED: { category: EventCategory.CHAT, icon: 'paperclip', severity: 'info' },
    
    // Community
    POST_CREATED: { category: EventCategory.COMMUNITY, icon: 'file-plus', severity: 'success' },
    POST_EDITED: { category: EventCategory.COMMUNITY, icon: 'edit', severity: 'info' },
    POST_DELETED: { category: EventCategory.COMMUNITY, icon: 'trash-2', severity: 'warning' },
    COMMENT_ADDED: { category: EventCategory.COMMUNITY, icon: 'message-square', severity: 'info' },
    QUESTION_ASKED: { category: EventCategory.COMMUNITY, icon: 'help-circle', severity: 'info' },
    QUESTION_ANSWERED: { category: EventCategory.COMMUNITY, icon: 'check-square', severity: 'success' },
    
    // Payments
    PAYMENT_CREATED: { category: EventCategory.PAYMENTS, icon: 'credit-card', severity: 'success' },
    PAYMENT_UPDATED: { category: EventCategory.PAYMENTS, icon: 'dollar-sign', severity: 'info' },
    PAYMENT_DELETED: { category: EventCategory.PAYMENTS, icon: 'x-circle', severity: 'warning' },
    PAYMENT_CONFIRMED: { category: EventCategory.PAYMENTS, icon: 'check-circle', severity: 'success' },
    
    // Users
    USER_CREATED: { category: EventCategory.USERS, icon: 'user-plus', severity: 'success' },
    USER_UPDATED: { category: EventCategory.USERS, icon: 'user-cog', severity: 'info' },
    USER_DELETED: { category: EventCategory.USERS, icon: 'user-minus', severity: 'warning' },
    PROFILE_UPDATED: { category: EventCategory.USERS, icon: 'user', severity: 'info' },
    AVATAR_CHANGED: { category: EventCategory.USERS, icon: 'image', severity: 'info' },
    
    // System
    SERVER_START: { category: EventCategory.SYSTEM, icon: 'power', severity: 'success' },
    SERVER_ERROR: { category: EventCategory.SYSTEM, icon: 'alert-circle', severity: 'error' },
    DB_ERROR: { category: EventCategory.SYSTEM, icon: 'database', severity: 'error' },
    API_ERROR: { category: EventCategory.SYSTEM, icon: 'alert-triangle', severity: 'error' },
    HEALTH_CHECK: { category: EventCategory.SYSTEM, icon: 'activity', severity: 'info' }
};

/**
 * Registra un evento en el sistema
 * @param {string} eventType - Tipo de evento (usar EventTypes)
 * @param {string} message - Mensaje descriptivo
 * @param {object} details - Detalles adicionales (usuario, IP, etc)
 */
function logEvent(eventType, message, details = {}) {
    const eventConfig = EventTypes[eventType] || { 
        category: EventCategory.SYSTEM, 
        icon: '📌', 
        severity: 'info' 
    };
    
    const event = {
        id: Date.now() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        type: eventType,
        category: eventConfig.category,
        icon: eventConfig.icon,
        severity: eventConfig.severity,
        message: message,
        details: {
            ...details,
            // Sanitizar datos sensibles
            password: undefined,
            token: undefined
        }
    };
    
    // Agregar al inicio del array
    events.unshift(event);
    
    // Mantener solo los últimos MAX_EVENTS
    if (events.length > MAX_EVENTS) {
        events.pop();
    }
    
    // Log en consola para debugging
    console.log(`[${event.category.toUpperCase()}] ${event.icon} ${message}`);
    
    return event;
}

/**
 * Obtiene eventos filtrados
 * @param {object} filters - Filtros opcionales
 * @returns {array} Lista de eventos
 */
function getEvents(filters = {}) {
    let filtered = [...events];
    
    if (filters.category) {
        filtered = filtered.filter(e => e.category === filters.category);
    }
    
    if (filters.severity) {
        filtered = filtered.filter(e => e.severity === filters.severity);
    }
    
    if (filters.type) {
        filtered = filtered.filter(e => e.type === filters.type);
    }
    
    if (filters.since) {
        const sinceDate = new Date(filters.since);
        filtered = filtered.filter(e => new Date(e.timestamp) >= sinceDate);
    }
    
    if (filters.limit) {
        filtered = filtered.slice(0, filters.limit);
    }
    
    return filtered;
}

/**
 * Obtiene eventos formateados para el Activity Feed
 * @param {number} limit - Cantidad de eventos a retornar
 * @returns {array} Lista de eventos formateados
 */
function getActivityFeed(limit = 20) {
    return events.slice(0, limit).map(event => ({
        id: event.id,
        time: formatTimeAgo(event.timestamp),
        timestamp: event.timestamp,
        icon: event.icon,
        message: event.message,
        category: event.category,
        severity: event.severity,
        type: event.type
    }));
}

/**
 * Obtiene estadísticas de eventos
 * @returns {object} Estadísticas
 */
function getStats() {
    const now = new Date();
    const oneHourAgo = new Date(now - 60 * 60 * 1000);
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
    
    const recentEvents = events.filter(e => new Date(e.timestamp) >= oneHourAgo);
    const dailyEvents = events.filter(e => new Date(e.timestamp) >= oneDayAgo);
    
    const categoryCounts = {};
    const severityCounts = { info: 0, success: 0, warning: 0, error: 0 };
    
    dailyEvents.forEach(event => {
        categoryCounts[event.category] = (categoryCounts[event.category] || 0) + 1;
        severityCounts[event.severity] = (severityCounts[event.severity] || 0) + 1;
    });
    
    return {
        total: events.length,
        lastHour: recentEvents.length,
        last24Hours: dailyEvents.length,
        byCategory: categoryCounts,
        bySeverity: severityCounts,
        errorsLastHour: recentEvents.filter(e => e.severity === 'error').length
    };
}

/**
 * Formatea tiempo relativo
 */
function formatTimeAgo(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'Hace unos segundos';
    if (seconds < 120) return 'Hace 1 minuto';
    if (seconds < 3600) return `Hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 7200) return 'Hace 1 hora';
    if (seconds < 86400) return `Hace ${Math.floor(seconds / 3600)} horas`;
    return `Hace ${Math.floor(seconds / 86400)} días`;
}

/**
 * Limpia eventos antiguos (más de 24 horas)
 */
function cleanOldEvents() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const initialLength = events.length;
    
    while (events.length > 0 && new Date(events[events.length - 1].timestamp) < oneDayAgo) {
        events.pop();
    }
    
    const removed = initialLength - events.length;
    if (removed > 0) {
        console.log(`[EVENTLOGGER] Cleaned ${removed} old events`);
    }
}

// Limpiar eventos antiguos cada hora
setInterval(cleanOldEvents, 60 * 60 * 1000);

// Exportar usando ESM
const eventLogger = {
    logEvent,
    getEvents,
    getActivityFeed,
    getStats,
    EventCategory,
    EventTypes,
    // Helpers para logging rápido
    auth: {
        loginSuccess: (user, ip) => logEvent('LOGIN_SUCCESS', `${user} inició sesión`, { user, ip }),
        loginFailed: (email, ip, reason) => logEvent('LOGIN_FAILED', `Intento fallido: ${email}`, { email, ip, reason }),
        logout: (user) => logEvent('LOGOUT', `${user} cerró sesión`, { user }),
        register: (user, email) => logEvent('REGISTER', `Nuevo registro: ${user}`, { user, email }),
        passwordRecovery: (email) => logEvent('PASSWORD_RECOVERY', `Recuperación solicitada: ${email}`, { email }),
        passwordChanged: (user) => logEvent('PASSWORD_CHANGED', `Contraseña cambiada: ${user}`, { user })
    },
    classroom: {
        access: (user, course) => logEvent('CLASSROOM_ACCESS', `${user} accedió a ${course}`, { user, course }),
        taskCreated: (teacher, task, course) => logEvent('TASK_CREATED', `${teacher} creó tarea: ${task}`, { teacher, task, course }),
        taskSubmitted: (user, task) => logEvent('TASK_SUBMITTED', `${user} entregó: ${task}`, { user, task }),
        taskGraded: (teacher, student, task) => logEvent('TASK_GRADED', `${teacher} calificó a ${student}`, { teacher, student, task }),
        taskDeleted: (user, taskId) => logEvent('TASK_DELETED', `Tarea #${taskId} eliminada`, { user, taskId }),
        announcementCreated: (teacher, title, course) => logEvent('ANNOUNCEMENT_CREATED', `${teacher} publicó: ${title}`, { teacher, title, course }),
        announcementDeleted: (user, announcementId) => logEvent('ANNOUNCEMENT_DELETED', `Anuncio #${announcementId} eliminado`, { user, announcementId }),
        pollVoted: (student, pollId) => logEvent('POLL_VOTED', `${student} votó en encuesta #${pollId}`, { student, pollId }),
        commentPosted: (user, announcementTitle) => logEvent('COMMENT_POSTED', `${user} comentó en: ${announcementTitle}`, { user, announcementTitle }),
        resourceUploaded: (user, resource) => logEvent('RESOURCE_UPLOADED', `${user} subió: ${resource}`, { user, resource }),
        resourceDownloaded: (user, resource) => logEvent('RESOURCE_DOWNLOADED', `${user} descargó: ${resource}`, { user, resource }),
        resourceDeleted: (user, resourceId) => logEvent('RESOURCE_DELETED', `Recurso #${resourceId} eliminado`, { user, resourceId }),
        courseCreated: (admin, course) => logEvent('COURSE_CREATED', `Nuevo curso: ${course}`, { admin, course }),
        enrollment: (student, course) => logEvent('ENROLLMENT', `${student} inscrito en ${course}`, { student, course })
    },
    chat: {
        messageSent: (from, to) => logEvent('MESSAGE_SENT', `Mensaje de ${from} a ${to}`, { from, to }),
        connected: (user) => logEvent('CHAT_CONNECTED', `${user} conectado al chat`, { user }),
        disconnected: (user) => logEvent('CHAT_DISCONNECTED', `${user} desconectado del chat`, { user }),
        fileShared: (user, filename) => logEvent('FILE_SHARED', `${user} compartió: ${filename}`, { user, filename })
    },
    community: {
        postCreated: (user, title) => logEvent('POST_CREATED', `${user} publicó: ${title}`, { user, title }),
        postEdited: (user, title) => logEvent('POST_EDITED', `${user} editó: ${title}`, { user, title }),
        postDeleted: (user, title) => logEvent('POST_DELETED', `${user} eliminó publicación`, { user, title }),
        commentAdded: (user, postTitle) => logEvent('COMMENT_ADDED', `${user} comentó en: ${postTitle}`, { user, postTitle }),
        questionAsked: (user, question) => logEvent('QUESTION_ASKED', `${user} preguntó: ${question}`, { user, question }),
        questionAnswered: (user, question) => logEvent('QUESTION_ANSWERED', `${user} respondió: ${question}`, { user, question })
    },
    payments: {
        created: (admin, student, amount) => logEvent('PAYMENT_CREATED', `Pago registrado: $${amount} - ${student}`, { admin, student, amount }),
        updated: (admin, student) => logEvent('PAYMENT_UPDATED', `Pago actualizado: ${student}`, { admin, student }),
        deleted: (admin, student) => logEvent('PAYMENT_DELETED', `Pago eliminado: ${student}`, { admin, student }),
        confirmed: (student, amount) => logEvent('PAYMENT_CONFIRMED', `Pago confirmado: $${amount}`, { student, amount })
    },
    users: {
        created: (admin, user, role) => logEvent('USER_CREATED', `Nuevo ${role}: ${user}`, { admin, user, role }),
        updated: (admin, user) => logEvent('USER_UPDATED', `Usuario actualizado: ${user}`, { admin, user }),
        deleted: (admin, user) => logEvent('USER_DELETED', `Usuario eliminado: ${user}`, { admin, user }),
        profileUpdated: (user) => logEvent('PROFILE_UPDATED', `Perfil actualizado: ${user}`, { user }),
        avatarChanged: (user) => logEvent('AVATAR_CHANGED', `Avatar cambiado: ${user}`, { user })
    },
    system: {
        serverStart: () => logEvent('SERVER_START', 'Servidor iniciado', {}),
        serverError: (error) => logEvent('SERVER_ERROR', `Error: ${error}`, { error }),
        dbError: (error) => logEvent('DB_ERROR', `Error BD: ${error}`, { error }),
        apiError: (endpoint, error) => logEvent('API_ERROR', `Error API ${endpoint}`, { endpoint, error }),
        healthCheck: (service, status) => logEvent('HEALTH_CHECK', `Health check: ${service} - ${status}`, { service, status })
    }
};

export default eventLogger;
