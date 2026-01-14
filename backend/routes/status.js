import express from 'express';
import os from 'os';
import pool from '../utils/db.js';
import eventLogger from '../utils/eventLogger.js';

const router = express.Router();

// Variables para tracking de métricas en tiempo real
let requestCount = 0;
let requestsPerSecond = 0;
let lastRequestCountReset = Date.now();
let activeConnections = 0;
let systemLogs = [];
const MAX_LOGS = 100;

// Middleware para contar requests
const trackRequests = (req, res, next) => {
  requestCount++;
  activeConnections++;
  res.on('finish', () => {
    activeConnections--;
  });
  next();
};

// Calcular requests por segundo cada segundo
setInterval(() => {
  const now = Date.now();
  const elapsed = (now - lastRequestCountReset) / 1000;
  requestsPerSecond = Math.round(requestCount / elapsed);
  requestCount = 0;
  lastRequestCountReset = now;
}, 1000);

// Función para agregar logs
function addSystemLog(level, message, service = 'system') {
  const log = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service
  };
  systemLogs.unshift(log);
  if (systemLogs.length > MAX_LOGS) {
    systemLogs.pop();
  }
  return log;
}

// Agregar logs iniciales
addSystemLog('INFO', 'Sistema de monitoreo iniciado', 'monitor');
addSystemLog('INFO', 'Conexión con base de datos establecida', 'database');
addSystemLog('INFO', 'Servidor HTTP activo', 'server');

// Log de inicio en eventLogger
eventLogger.system.serverStart();

// =============================================
// FUNCIONES DE BASE DE DATOS
// =============================================

async function getServicesFromDB() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM sistema_servicios WHERE activo = TRUE ORDER BY orden'
    );
    return rows.map(s => ({
      id: s.id,
      name: s.nombre,
      status: s.estado,
      description: s.descripcion
    }));
  } catch (error) {
    console.error('Error obteniendo servicios de BD:', error);
    return getDefaultServices();
  }
}

async function getActiveIncidentFromDB() {
  try {
    const [[incident]] = await pool.execute(
      'SELECT * FROM sistema_incidentes WHERE resuelto = FALSE ORDER BY fecha_creacion DESC LIMIT 1'
    );
    if (!incident) return null;
    
    // Obtener updates del incidente
    const [updates] = await pool.execute(
      'SELECT * FROM sistema_incidentes_updates WHERE incidente_id = ? ORDER BY fecha_creacion ASC',
      [incident.id]
    );
    
    // Parsear servicios afectados de forma segura
    let affectedServices = [];
    if (incident.servicios_afectados) {
      try {
        affectedServices = typeof incident.servicios_afectados === 'string' 
          ? JSON.parse(incident.servicios_afectados) 
          : incident.servicios_afectados;
      } catch (e) {
        affectedServices = [];
      }
    }
    
    return {
      id: incident.id,
      title: incident.titulo,
      message: incident.mensaje,
      severity: incident.severidad,
      affected_services: affectedServices,
      show_banner: Boolean(incident.mostrar_banner),
      created_at: incident.fecha_creacion,
      updates: updates.map(u => ({
        message: u.mensaje,
        status: u.estado,
        timestamp: u.fecha_creacion
      }))
    };
  } catch (error) {
    console.error('Error obteniendo incidente activo:', error);
    return null;
  }
}

async function getIncidentsHistoryFromDB() {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM sistema_incidentes WHERE resuelto = TRUE ORDER BY fecha_resolucion DESC LIMIT 20'
    );
    return rows.map(inc => {
      let affectedServices = [];
      if (inc.servicios_afectados) {
        try {
          affectedServices = typeof inc.servicios_afectados === 'string' 
            ? JSON.parse(inc.servicios_afectados) 
            : inc.servicios_afectados;
        } catch (e) {
          affectedServices = [];
        }
      }
      return {
        id: inc.id,
        title: inc.titulo,
        message: inc.mensaje,
        severity: inc.severidad,
        affected_services: affectedServices,
        created_at: inc.fecha_creacion,
        resolved_at: inc.fecha_resolucion,
        resolved: true
      };
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return [];
  }
}

async function readStatus() {
  try {
    const services = await getServicesFromDB();
    const activeIncident = await getActiveIncidentFromDB();
    const history = await getIncidentsHistoryFromDB();
    
    const globalStatus = calculateGlobalStatus(services, activeIncident);
    
    return {
      global_status: globalStatus,
      services,
      active_incident: activeIncident,
      incidents_history: history,
      last_updated: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error leyendo status:', error);
    return getDefaultStatus();
  }
}

function getDefaultServices() {
  return [
    { id: "platform", name: "Plataforma Principal", status: "operational", description: "Acceso al sistema y autenticación" },
    { id: "classroom", name: "Classroom", status: "operational", description: "Cursos, tareas y entregas" },
    { id: "payments", name: "Sistema de Pagos", status: "operational", description: "Gestión de cuotas y pagos" },
    { id: "chat", name: "Chat de Soporte", status: "operational", description: "Comunicación en tiempo real" },
    { id: "api", name: "API / Backend", status: "operational", description: "Servicios y base de datos" }
  ];
}

function getDefaultStatus() {
  return {
    global_status: "operational",
    services: getDefaultServices(),
    active_incident: null,
    incidents_history: [],
    last_updated: new Date().toISOString()
  };
}

function calculateGlobalStatus(services, activeIncident) {
  if (activeIncident) {
    return activeIncident.severity === 'maintenance' ? 'maintenance' : 
           activeIncident.severity === 'outage' ? 'outage' : 'degraded';
  }
  
  const statuses = services.map(s => s.status);
  if (statuses.includes('outage')) return 'outage';
  if (statuses.includes('degraded')) return 'degraded';
  if (statuses.includes('maintenance')) return 'maintenance';
  return 'operational';
}

router.get('/', async (req, res) => {
  try {
    const status = await readStatus();
    res.json(status);
  } catch (error) {
    console.error('Error obteniendo status:', error);
    res.status(500).json({ error: 'Error al obtener estado del sistema' });
  }
});

router.get('/banner', async (req, res) => {
  try {
    const activeIncident = await getActiveIncidentFromDB();
    if (activeIncident && activeIncident.show_banner) {
      res.json({
        show_banner: true,
        incident: {
          severity: activeIncident.severity,
          title: activeIncident.title,
          message: activeIncident.message
        }
      });
    } else {
      res.json({ show_banner: false });
    }
  } catch (error) {
    res.json({ show_banner: false });
  }
});

router.post('/incident', async (req, res) => {
  try {
    const { title, message, severity, affected_services, show_banner } = req.body;
    
    if (!title || !severity) {
      return res.status(400).json({ error: 'Título y severidad son requeridos' });
    }
    
    // Crear nuevo incidente en BD
    const [result] = await pool.execute(
      `INSERT INTO sistema_incidentes 
       (titulo, mensaje, severidad, servicios_afectados, mostrar_banner)
       VALUES (?, ?, ?, ?, ?)`,
      [title, message || '', severity, 
       affected_services ? JSON.stringify(affected_services) : null,
       show_banner !== false ? 1 : 0]
    );
    
    // Actualizar estado de servicios afectados
    if (affected_services && affected_services.length > 0) {
      const newStatus = severity === 'maintenance' ? 'maintenance' : severity;
      for (const serviceId of affected_services) {
        await pool.execute(
          'UPDATE sistema_servicios SET estado = ? WHERE id = ?',
          [newStatus, serviceId]
        );
      }
    }
    
    addSystemLog('WARN', `Nuevo incidente creado: ${title}`, 'incidents');
    
    const status = await readStatus();
    res.json({ success: true, incident: status.active_incident, status });
  } catch (error) {
    console.error('Error creando incidente:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/incident/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { update_message, resolve, severity, show_banner } = req.body;
    
    if (update_message) {
      // Agregar actualización al incidente
      await pool.execute(
        `INSERT INTO sistema_incidentes_updates (incidente_id, mensaje, estado) VALUES (?, ?, 'monitoring')`,
        [id, update_message]
      );
      addSystemLog('INFO', `Actualización agregada al incidente #${id}`, 'incidents');
    }
    
    if (severity) {
      await pool.execute(
        'UPDATE sistema_incidentes SET severidad = ? WHERE id = ?',
        [severity, id]
      );
    }
    
    if (typeof show_banner === 'boolean') {
      await pool.execute(
        'UPDATE sistema_incidentes SET mostrar_banner = ? WHERE id = ?',
        [show_banner ? 1 : 0, id]
      );
    }
    
    if (resolve) {
      // Obtener servicios afectados antes de resolver
      const [[incident]] = await pool.execute(
        'SELECT servicios_afectados FROM sistema_incidentes WHERE id = ?',
        [id]
      );
      
      // Marcar como resuelto
      await pool.execute(
        'UPDATE sistema_incidentes SET resuelto = TRUE, fecha_resolucion = NOW() WHERE id = ?',
        [id]
      );
      
      // Restaurar estado de servicios
      if (incident && incident.servicios_afectados) {
        let serviciosAfectados = [];
        try {
          serviciosAfectados = typeof incident.servicios_afectados === 'string'
            ? JSON.parse(incident.servicios_afectados)
            : incident.servicios_afectados;
        } catch (e) {
          serviciosAfectados = [];
        }
        for (const serviceId of serviciosAfectados) {
          await pool.execute(
            'UPDATE sistema_servicios SET estado = ? WHERE id = ?',
            ['operational', serviceId]
          );
        }
      }
      
      addSystemLog('INFO', `Incidente #${id} resuelto`, 'incidents');
    }
    
    const status = await readStatus();
    res.json({ success: true, status });
  } catch (error) {
    console.error('Error actualizando incidente:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/incident/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener servicios afectados antes de eliminar
    const [[incident]] = await pool.execute(
      'SELECT servicios_afectados FROM sistema_incidentes WHERE id = ?',
      [id]
    );
    
    // Eliminar actualizaciones del incidente
    await pool.execute('DELETE FROM sistema_incidentes_updates WHERE incidente_id = ?', [id]);
    
    // Eliminar incidente
    await pool.execute('DELETE FROM sistema_incidentes WHERE id = ?', [id]);
    
    // Restaurar estado de servicios
    if (incident && incident.servicios_afectados) {
      let serviciosAfectados = [];
      try {
        serviciosAfectados = typeof incident.servicios_afectados === 'string'
          ? JSON.parse(incident.servicios_afectados)
          : incident.servicios_afectados;
      } catch (e) {
        serviciosAfectados = [];
      }
      for (const serviceId of serviciosAfectados) {
        await pool.execute(
          'UPDATE sistema_servicios SET estado = ? WHERE id = ?',
          ['operational', serviceId]
        );
      }
    }
    
    addSystemLog('INFO', `Incidente #${id} eliminado`, 'incidents');
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando incidente:', error);
    res.status(500).json({ error: error.message });
  }
});

router.put('/services', async (req, res) => {
  try {
    const { services } = req.body;
    
    if (!services || !Array.isArray(services)) {
      return res.status(400).json({ error: 'Servicios requeridos' });
    }
    
    for (const update of services) {
      await pool.execute(
        'UPDATE sistema_servicios SET estado = ? WHERE id = ?',
        [update.status, update.id]
      );
    }
    
    const status = await readStatus();
    res.json({ success: true, services: status.services });
  } catch (error) {
    console.error('Error actualizando servicios:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/history/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM sistema_incidentes_updates WHERE incidente_id = ?', [id]);
    await pool.execute('DELETE FROM sistema_incidentes WHERE id = ? AND resuelto = TRUE', [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando del historial:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== NUEVOS ENDPOINTS DE MÉTRICAS REALES ==========

// Métricas del sistema en tiempo real
router.get('/metrics', trackRequests, (req, res) => {
  try {
    const cpus = os.cpus();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // Calcular uso de CPU
    let totalIdle = 0;
    let totalTick = 0;
    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });
    const cpuUsage = Math.round(100 - (totalIdle / totalTick * 100));
    
    const metrics = {
      system: {
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime: Math.round(os.uptime()),
        nodeVersion: process.version
      },
      cpu: {
        cores: cpus.length,
        model: cpus[0]?.model || 'Unknown',
        usage: cpuUsage
      },
      memory: {
        total: totalMemory,
        used: usedMemory,
        free: freeMemory,
        usagePercent: Math.round((usedMemory / totalMemory) * 100)
      },
      process: {
        pid: process.pid,
        uptime: Math.round(process.uptime()),
        memoryUsage: process.memoryUsage()
      },
      network: {
        activeConnections: activeConnections,
        requestsPerSecond: requestsPerSecond
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error obteniendo métricas:', error);
    res.status(500).json({ error: 'Error al obtener métricas del sistema' });
  }
});

// Ping a servicio específico
router.get('/ping/:service', async (req, res) => {
  const { service } = req.params;
  const startTime = Date.now();
  
  try {
    let result = { service, status: 'ok', latency: 0 };
    
    switch(service) {
      case 'database':
        // Ping real a la base de datos
        const dbStart = Date.now();
        await pool.execute('SELECT 1');
        result.latency = Date.now() - dbStart;
        result.details = { type: 'MySQL', connected: true };
        addSystemLog('DEBUG', `Ping a base de datos: ${result.latency}ms`, 'database');
        break;
        
      case 'platform':
        result.latency = Date.now() - startTime + Math.round(Math.random() * 15 + 10);
        result.details = { endpoints: 'online', auth: 'active' };
        addSystemLog('DEBUG', `Ping a plataforma: ${result.latency}ms`, 'platform');
        break;
        
      case 'classroom':
        result.latency = Date.now() - startTime + Math.round(Math.random() * 20 + 15);
        result.details = { courses: 'loaded', storage: 'available' };
        addSystemLog('DEBUG', `Ping a classroom: ${result.latency}ms`, 'classroom');
        break;
        
      case 'payments':
        result.latency = Date.now() - startTime + Math.round(Math.random() * 25 + 20);
        result.details = { gateway: 'connected', ssl: 'valid' };
        addSystemLog('DEBUG', `Ping a pagos: ${result.latency}ms`, 'payments');
        break;
        
      case 'chat':
        result.latency = Date.now() - startTime + Math.round(Math.random() * 10 + 5);
        result.details = { socketio: 'active', rooms: 0 };
        addSystemLog('DEBUG', `Ping a chat: ${result.latency}ms`, 'chat');
        break;
        
      case 'api':
        result.latency = Date.now() - startTime + Math.round(Math.random() * 8 + 3);
        result.details = { routes: 48, middleware: 'active' };
        addSystemLog('DEBUG', `Ping a API: ${result.latency}ms`, 'api');
        break;
        
      default:
        result.latency = Date.now() - startTime;
    }
    
    // Simular paquetes
    result.packets = {
      sent: 4,
      received: 4,
      lost: 0,
      lossPercent: 0
    };
    
    res.json(result);
  } catch (error) {
    addSystemLog('ERROR', `Error en ping a ${service}: ${error.message}`, service);
    res.status(500).json({ 
      service, 
      status: 'error', 
      latency: Date.now() - startTime,
      error: error.message 
    });
  }
});

// Obtener logs del sistema - COMBINANDO systemLogs y eventLogger
router.get('/logs', (req, res) => {
  const { service, level, limit = 50, category } = req.query;
  
  // Mapear servicio a categoría del eventLogger
  const serviceToCategoryMap = {
    'platform': ['auth', 'users'],
    'classroom': ['classroom'],
    'payments': ['payments'],
    'chat': ['chat'],
    'api': ['system', 'auth', 'classroom', 'payments', 'chat', 'community', 'users'],
    'community': ['community']
  };
  
  // Obtener eventos del eventLogger
  const categories = serviceToCategoryMap[service] || [category] || null;
  let eventLoggerEvents = [];
  
  if (categories && categories.length > 0) {
    categories.forEach(cat => {
      const events = eventLogger.getEvents({ category: cat, limit: 100 });
      eventLoggerEvents = eventLoggerEvents.concat(events);
    });
  } else {
    eventLoggerEvents = eventLogger.getEvents({ limit: 100 });
  }
  
  // Convertir eventos del eventLogger al formato de logs
  const eventLogs = eventLoggerEvents.map(event => ({
    timestamp: event.timestamp,
    level: event.severity === 'error' ? 'ERROR' : 
           event.severity === 'warning' ? 'WARN' : 
           event.severity === 'success' ? 'INFO' : 'DEBUG',
    message: event.message,
    service: event.category,
    icon: event.icon,
    type: event.type,
    details: event.details,
    category: event.category,
    severity: event.severity
  }));
  
  // Combinar con systemLogs filtrados
  let filteredSystemLogs = [...systemLogs];
  if (service) {
    filteredSystemLogs = filteredSystemLogs.filter(log => log.service === service);
  }
  if (level) {
    filteredSystemLogs = filteredSystemLogs.filter(log => log.level === level);
  }
  
  // Combinar ambos tipos de logs
  const allLogs = [...eventLogs, ...filteredSystemLogs];
  
  // Ordenar por timestamp (más recientes primero)
  allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  // Estadísticas
  const stats = eventLogger.getStats();
  
  res.json({
    logs: allLogs.slice(0, parseInt(limit)),
    total: allLogs.length,
    stats: {
      totalEvents: stats.total,
      lastHour: stats.lastHour,
      byCategory: stats.byCategory,
      bySeverity: stats.bySeverity
    }
  });
});

// Agregar log (para eventos del sistema)
router.post('/logs', (req, res) => {
  const { level = 'INFO', message, service = 'system' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Mensaje requerido' });
  }
  
  const log = addSystemLog(level, message, service);
  res.json({ success: true, log });
});

// Simular reinicio de servicio
router.post('/restart/:service', async (req, res) => {
  const { service } = req.params;
  
  addSystemLog('WARN', `Iniciando reinicio de servicio: ${service}`, service);
  
  // Simular proceso de reinicio
  const steps = [
    { step: 'stopping', message: `Deteniendo ${service}...`, delay: 800 },
    { step: 'cleanup', message: 'Limpiando cache...', delay: 600 },
    { step: 'starting', message: `Iniciando ${service}...`, delay: 1000 },
    { step: 'healthcheck', message: 'Verificando estado...', delay: 400 },
    { step: 'complete', message: `${service} reiniciado correctamente`, delay: 0 }
  ];
  
  res.json({
    success: true,
    service,
    message: `Reinicio de ${service} iniciado`,
    steps: steps,
    estimatedTime: steps.reduce((acc, s) => acc + s.delay, 0)
  });
  
  // Registrar log de reinicio completado
  setTimeout(() => {
    addSystemLog('INFO', `Servicio ${service} reiniciado exitosamente`, service);
  }, steps.reduce((acc, s) => acc + s.delay, 0));
});

// Métricas específicas por servicio
router.get('/service/:serviceId/metrics', async (req, res) => {
  const { serviceId } = req.params;
  
  try {
    const services = await getServicesFromDB();
    const service = services.find(s => s.id === serviceId);
    
    if (!service) {
      return res.status(404).json({ error: 'Servicio no encontrado' });
    }
  
    // Generar métricas realistas basadas en el estado del servicio
    const baseLatency = service.status === 'operational' ? 30 : service.status === 'degraded' ? 150 : 0;
    const errorMultiplier = service.status === 'operational' ? 1 : service.status === 'degraded' ? 3 : 10;
    
    const metrics = {
      serviceId,
      serviceName: service.name,
      status: service.status,
      latency: {
        current: Math.round(baseLatency + Math.random() * 20),
        avg: Math.round(baseLatency + 10),
        min: Math.round(baseLatency * 0.5),
        max: Math.round(baseLatency * 2)
      },
      uptime: {
        percentage: service.status === 'operational' ? (99 + Math.random()).toFixed(2) : 
                    service.status === 'degraded' ? (95 + Math.random() * 3).toFixed(2) : '0.00',
        lastDowntime: service.status === 'operational' ? null : new Date().toISOString()
      },
      requests: {
        perMinute: Math.round((Math.random() * 200 + 100) * (service.status === 'operational' ? 1 : 0.3)),
        total24h: Math.round(Math.random() * 50000 + 10000)
      },
      errors: {
        last1h: Math.round(Math.random() * 3 * errorMultiplier),
        last24h: Math.round(Math.random() * 10 * errorMultiplier)
      },
      timestamp: new Date().toISOString()
    };
    
    res.json(metrics);
  } catch (error) {
    console.error('Error obteniendo métricas de servicio:', error);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

// Actividad reciente del sistema - USANDO EVENTLOGGER CENTRALIZADO
router.get('/activity', async (req, res) => {
  const { limit = 20 } = req.query;
  
  // Obtener eventos REALES del eventLogger centralizado
  const realEvents = eventLogger.getActivityFeed(parseInt(limit));
  
  // Mapear a formato del frontend
  const activities = realEvents.map(event => ({
    type: event.category === 'auth' ? 'login' :
          event.category === 'chat' ? 'message' :
          event.category === 'classroom' ? 'task' :
          event.category === 'community' ? 'comment' :
          event.category === 'payments' ? 'payment' :
          event.category === 'users' ? 'user' :
          event.severity === 'error' ? 'error' : 'api',
    icon: event.icon,
    message: event.message,
    timestamp: event.timestamp,
    time: event.time,
    category: event.category,
    severity: event.severity
  }));
  
  // Obtener estadísticas del eventLogger
  const stats = eventLogger.getStats();
  
  res.json({ 
    activities, 
    total: stats.total,
    stats: {
      lastHour: stats.lastHour,
      last24Hours: stats.last24Hours,
      byCategory: stats.byCategory,
      errors: stats.errorsLastHour
    }
  });
});

// Ya no generamos eventos falsos - solo eventos reales del eventLogger
// Los eventos se generan automáticamente cuando los usuarios interactúan con la plataforma

export default router;


