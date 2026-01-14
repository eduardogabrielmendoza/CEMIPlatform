import { Server } from 'socket.io';
import pool from './db.js';
import eventLogger from './eventLogger.js';

class ChatServer {
  constructor(server) {
    this.io = new Server(server, {
      path: '/socket.io/',
      cors: {
        origin: [
          'http://localhost:8080',
          'http://localhost:3000',
          'https://cemi-sistema-educativo-production.up.railway.app',
          'https://cemi-sistema-educativo-production-2239.up.railway.app',
          'https://cemi.up.railway.app',
          process.env.FRONTEND_URL,
          process.env.RAILWAY_STATIC_URL,
          process.env.RAILWAY_PUBLIC_DOMAIN
        ].filter(Boolean),
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling'],
      pingTimeout: 60000,
      pingInterval: 25000
    });
    
    this.clients = new Map();
    this.adminClients = new Set();
    this.conversationClients = new Map();
    
    this.init();
  }
  
  init() {
    console.log(' Servidor Socket.IO de Chat iniciado');
    
    this.io.on('connection', (socket) => {
      console.log(` Nueva conexión Socket.IO: ${socket.id}`);
      
      socket.on('auth', async (data) => {
        await this.handleAuth(socket, data);
      });
      
      socket.on('message', async (data) => {
        await this.handleChatMessage(socket, data);
      });
      
      socket.on('typing', async (data) => {
        await this.handleTyping(socket, data);
      });
      
      socket.on('read', async (data) => {
        await this.handleMarkAsRead(socket, data);
      });
      
      socket.on('join_conversation', async (data) => {
        await this.handleJoinConversation(socket, data);
      });
      
      socket.on('get_conversations', async (data) => {
        await this.handleGetConversations(socket, data);
      });
      
      socket.on('take_conversation', async (data) => {
        await this.handleTakeConversation(socket, data);
      });
      
      socket.on('close_conversation', async (data) => {
        await this.handleCloseConversation(socket, data);
      });
      
      // ========================================
      // EVENTOS DE CLASSROOM CHAT
      // ========================================
      socket.on('classroom_auth', (data) => {
        this.handleClassroomAuth(socket, data);
      });
      
      socket.on('join_classroom_conversation', (data) => {
        this.handleJoinClassroomConversation(socket, data);
      });
      
      socket.on('classroom_message', (data) => {
        this.handleClassroomMessage(socket, data);
      });
      
      socket.on('classroom_typing', (data) => {
        this.handleClassroomTyping(socket, data);
      });
      
      socket.on('classroom_read', (data) => {
        this.handleClassroomRead(socket, data);
      });
      
      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
      
      socket.on('error', (error) => {
        console.error(' Error en Socket.IO:', error);
      });
      
      socket.emit('connected', {
        message: 'Conexión establecida con el servidor de chat'
      });
    });
  }
  
  
  async handleAuth(socket, data) {
    let { tipo, id_usuario, id_especifico, nombre, id_conversacion } = data;
    
    if ((!id_usuario || id_usuario === 'null' || id_usuario === 'undefined') && nombre && tipo !== 'invitado') {
      try {
        let query, params;
        
        if (tipo === 'admin') {
          query = `
            SELECT u.id_usuario
            FROM usuarios u
            JOIN personas p ON u.id_persona = p.id_persona
            JOIN administradores adm ON adm.id_persona = p.id_persona
            WHERE CONCAT(p.nombre, ' ', p.apellido) = ?
            LIMIT 1
          `;
          params = [nombre];
        } else if (tipo === 'profesor') {
          query = `
            SELECT u.id_usuario
            FROM usuarios u
            JOIN personas p ON u.id_persona = p.id_persona
            JOIN profesores prof ON prof.id_persona = p.id_persona
            WHERE CONCAT(p.nombre, ' ', p.apellido) = ?
            LIMIT 1
          `;
          params = [nombre];
        } else if (tipo === 'alumno') {
          query = `
            SELECT u.id_usuario
            FROM usuarios u
            JOIN personas p ON u.id_persona = p.id_persona
            JOIN alumnos al ON al.id_persona = p.id_persona
            WHERE CONCAT(p.nombre, ' ', p.apellido) = ?
            LIMIT 1
          `;
          params = [nombre];
        } else {
          query = `
            SELECT u.id_usuario
            FROM usuarios u
            JOIN personas p ON u.id_persona = p.id_persona
            WHERE CONCAT(p.nombre, ' ', p.apellido) = ?
            LIMIT 1
          `;
          params = [nombre];
        }
        
        const [usuarioBuscado] = await pool.query(query, params);
        
        if (usuarioBuscado.length > 0) {
          id_usuario = usuarioBuscado[0].id_usuario;
          console.log(` id_usuario encontrado automáticamente en auth: ${id_usuario} para ${nombre} (${tipo})`);
        } else {
          console.warn(`️ No se encontró id_usuario para ${nombre} (${tipo})`);
        }
      } catch (err) {
        console.warn('️ Error al buscar id_usuario en auth:', err.message);
      }
    }
    
    if (id_usuario === 'null' || id_usuario === 'undefined' || id_usuario === '') {
      id_usuario = null;
    } else if (id_usuario !== null && id_usuario !== undefined) {
      const numericId = parseInt(id_usuario, 10);
      id_usuario = isNaN(numericId) ? null : numericId;
    }
    
    socket.userInfo = {
      tipo, 
      id_usuario,
      id_especifico: id_especifico || null,
      nombre,
      id_conversacion
    };
    
    const userId = `${tipo}_${id_usuario || id_conversacion}`;
    this.clients.set(userId, socket);
    
    if (tipo === 'admin') {
      this.adminClients.add(socket);
    }
    
    if (id_conversacion) {
      socket.join(`conversation_${id_conversacion}`);
      if (!this.conversationClients.has(id_conversacion)) {
        this.conversationClients.set(id_conversacion, new Set());
      }
      this.conversationClients.get(id_conversacion).add(socket);
    }
    
    console.log(` Usuario autenticado: ${tipo} - ${nombre} (${userId})`);
    
    // Log del evento
    eventLogger.chat.connected(nombre);
    
    socket.emit('authenticated', {
      message: 'Autenticación exitosa',
      userInfo: socket.userInfo
    });
    
    if (tipo === 'admin') {
      await this.sendPendingConversationsCount(socket);
    }
  }

  async handleJoinConversation(socket, data) {
    const { id_conversacion } = data;
    
    if (!socket.userInfo) {
      console.error(' Usuario no autenticado intentando unirse a conversación');
      return;
    }
    
    socket.join(`conversation_${id_conversacion}`);
    
    if (!this.conversationClients.has(id_conversacion)) {
      this.conversationClients.set(id_conversacion, new Set());
    }
    this.conversationClients.get(id_conversacion).add(socket);
    
    socket.userInfo.id_conversacion = id_conversacion;
    
    const roomSize = this.io.sockets.adapter.rooms.get(`conversation_${id_conversacion}`)?.size || 0;
    console.log(` Usuario ${socket.userInfo.nombre} (${socket.userInfo.tipo}) se unió a conversación ${id_conversacion} - Clientes en room: ${roomSize}`);
    
    socket.emit('joined_conversation', {
      id_conversacion
    });
  }
  
  
  async handleChatMessage(socket, data) {
    const { id_conversacion, mensaje } = data;
    const userInfo = socket.userInfo;
    
    if (!userInfo) {
      socket.emit('error', {
        message: 'Usuario no autenticado'
      });
      return;
    }
    
    try {
      let id_remitente = userInfo.id_usuario;
      
      if (id_remitente === null || 
          id_remitente === undefined || 
          id_remitente === 'null' || 
          id_remitente === 'undefined' || 
          id_remitente === '') {
        id_remitente = null;
      } else {
        id_remitente = parseInt(id_remitente, 10);
        if (isNaN(id_remitente)) {
          id_remitente = null;
        }
      }
      
      console.log(` Insertando mensaje: conversacion=${id_conversacion}, tipo=${userInfo.tipo}, id_remitente=${id_remitente}, nombre=${userInfo.nombre}`);
      
      const [result] = await pool.query(`
        INSERT INTO chat_mensajes (
          id_conversacion, 
          tipo_remitente, 
          id_remitente, 
          nombre_remitente, 
          mensaje
        ) VALUES (?, ?, ?, ?, ?)
      `, [
        id_conversacion,
        userInfo.tipo,
        id_remitente,
        userInfo.nombre,
        mensaje
      ]);      
      const id_mensaje = result.insertId;
      
      let avatar_remitente = null;
      
      if (userInfo.tipo === 'admin' && id_remitente) {
        const [avatarResult] = await pool.query(`
          SELECT p.avatar
          FROM personas p
          JOIN usuarios u ON p.id_persona = u.id_persona
          WHERE u.id_usuario = ?
        `, [id_remitente]);
        
        if (avatarResult.length > 0) {
          avatar_remitente = avatarResult[0].avatar;
        }
      } else if (userInfo.tipo === 'profesor' && userInfo.id_especifico) {
        const [avatarResult] = await pool.query(`
          SELECT p.avatar
          FROM personas p
          JOIN profesores pr ON p.id_persona = pr.id_persona
          WHERE pr.id_profesor = ?
        `, [userInfo.id_especifico]);
        
        if (avatarResult.length > 0) {
          avatar_remitente = avatarResult[0].avatar;
        }
      } else if (userInfo.tipo === 'alumno' && userInfo.id_especifico) {
        const [avatarResult] = await pool.query(`
          SELECT p.avatar
          FROM personas p
          JOIN alumnos a ON p.id_persona = a.id_persona
          WHERE a.id_alumno = ?
        `, [userInfo.id_especifico]);
        
        if (avatarResult.length > 0) {
          avatar_remitente = avatarResult[0].avatar;
        }
      }
      
      console.log(` Avatar obtenido para ${userInfo.tipo}:`, avatar_remitente);
      
      if (userInfo.tipo === 'admin') {
        await pool.query(`
          UPDATE chat_conversaciones 
          SET ultima_actividad = CURRENT_TIMESTAMP,
              estado = 'activa',
              mensajes_no_leidos_usuario = mensajes_no_leidos_usuario + 1
          WHERE id_conversacion = ?
        `, [id_conversacion]);
      } else {
        await pool.query(`
          UPDATE chat_conversaciones 
          SET ultima_actividad = CURRENT_TIMESTAMP,
              estado = 'activa',
              mensajes_no_leidos_admin = mensajes_no_leidos_admin + 1
          WHERE id_conversacion = ?
        `, [id_conversacion]);
      }
      
      const messageObj = {
        id_mensaje,
        id_conversacion,
        tipo_remitente: userInfo.tipo,
        id_remitente: id_remitente,
        id_especifico: userInfo.id_especifico,
        nombre_remitente: userInfo.nombre,
        avatar_remitente: avatar_remitente,
        mensaje,
        fecha_envio: new Date(),
        leido: false,
        es_admin: userInfo.tipo === 'admin' ? 1 : 0
      };
      
      this.io.to(`conversation_${id_conversacion}`).emit('new_message', messageObj);
      
      if (userInfo.tipo !== 'admin') {
        this.notifyAdmins('new_message_notification', {
          id_conversacion,
          nombre_usuario: userInfo.nombre,
          tipo_usuario: userInfo.tipo,
          mensaje: mensaje.substring(0, 50) + (mensaje.length > 50 ? '...' : '')
        });
      }
      
      console.log(` Mensaje enviado en conversación ${id_conversacion}`);
      
      // Log del evento
      eventLogger.chat.messageSent(userInfo.nombre, `Conversación #${id_conversacion}`);
      
    } catch (error) {
      console.error(' Error al enviar mensaje:', error);
      socket.emit('error', {
        message: 'Error al enviar el mensaje'
      });
    }
  }
  
  
  async handleTyping(socket, data) {
    const { id_conversacion, isTyping } = data;
    const userInfo = socket.userInfo;
    
    if (!userInfo || !id_conversacion) return;
    
    socket.to(`conversation_${id_conversacion}`).emit('typing', {
      id_conversacion,
      nombre: userInfo.nombre,
      tipo: userInfo.tipo,
      isTyping
    });
  }
  
  
  async handleMarkAsRead(socket, data) {
    const { id_conversacion } = data;
    const userInfo = socket.userInfo;
    
    if (!userInfo) return;
    
    try {
      const tipoLector = userInfo.tipo === 'admin' ? 'admin' : 'usuario';
      
      if (tipoLector === 'admin') {
        await pool.query(`
          UPDATE chat_mensajes 
          SET leido_por_admin = 1, leido = 1
          WHERE id_conversacion = ? 
            AND tipo_remitente != 'admin'
            AND leido_por_admin = 0
        `, [id_conversacion]);
        
        await pool.query(`
          UPDATE chat_conversaciones
          SET mensajes_no_leidos_admin = 0
          WHERE id_conversacion = ?
        `, [id_conversacion]);
      } else {
        await pool.query(`
          UPDATE chat_mensajes 
          SET leido_por_usuario = 1, leido = 1
          WHERE id_conversacion = ? 
            AND tipo_remitente = 'admin'
            AND leido_por_usuario = 0
        `, [id_conversacion]);
        
        await pool.query(`
          UPDATE chat_conversaciones
          SET mensajes_no_leidos_usuario = 0
          WHERE id_conversacion = ?
        `, [id_conversacion]);
      }
      
      socket.to(`conversation_${id_conversacion}`).emit('messages_read', {
        id_conversacion,
        lector_tipo: tipoLector
      });
      
    } catch (error) {
      console.error(' Error al marcar como leído:', error);
    }
  }
  
  
  async handleGetConversations(socket, data) {
    const userInfo = socket.userInfo;
    
    if (!userInfo || userInfo.tipo !== 'admin') {
      socket.emit('error', {
        message: 'No autorizado'
      });
      return;
    }
    
    try {
      const [conversaciones] = await pool.query(`
        SELECT 
          c.*,
          COUNT(m.id_mensaje) as total_mensajes,
          (SELECT mensaje FROM chat_mensajes 
           WHERE id_conversacion = c.id_conversacion 
           ORDER BY fecha_envio DESC LIMIT 1) as ultimo_mensaje,
          (SELECT fecha_envio FROM chat_mensajes 
           WHERE id_conversacion = c.id_conversacion 
           ORDER BY fecha_envio DESC LIMIT 1) as fecha_ultimo_mensaje
        FROM chat_conversaciones c
        LEFT JOIN chat_mensajes m ON c.id_conversacion = m.id_conversacion
        WHERE c.estado != 'cerrada'
        GROUP BY c.id_conversacion
        ORDER BY c.ultima_actividad DESC
      `);
      
      socket.emit('conversations_list', conversaciones);
      
    } catch (error) {
      console.error(' Error al obtener conversaciones:', error);
      socket.emit('error', {
        message: 'Error al cargar conversaciones'
      });
    }
  }
  
  
  async handleTakeConversation(socket, data) {
    const { id_conversacion } = data;
    const userInfo = socket.userInfo;
    
    if (!userInfo || userInfo.tipo !== 'admin') return;
    
    try {
      await pool.query(`
        UPDATE chat_conversaciones
        SET atendido_por = ?, estado = 'activa'
        WHERE id_conversacion = ?
      `, [userInfo.id_usuario, id_conversacion]);
      
      this.notifyAdmins('conversation_taken', {
        id_conversacion,
        atendido_por: userInfo.nombre
      });
      
    } catch (error) {
      console.error(' Error al tomar conversación:', error);
    }
  }
  
  
  async handleCloseConversation(socket, data) {
    const { id_conversacion, tipo_usuario, id_usuario } = data;
    const userInfo = socket.userInfo;
    
    if (!userInfo || userInfo.tipo !== 'admin') {
      console.error(' Solo administradores pueden cerrar conversaciones');
      return;
    }
    
    try {
      console.log(`️ Admin cerrando conversación ${id_conversacion}`);
      
      this.io.to(`conversation_${id_conversacion}`).emit('conversation_closed', {
        id_conversacion,
        message: 'Esta conversación ha sido cerrada por un administrador'
      });
      
      if (tipo_usuario && id_usuario) {
        const userId = `${tipo_usuario}_${id_usuario}`;
        const userSocket = this.clients.get(userId);
        
        if (userSocket && userSocket.connected) {
          userSocket.emit('conversation_deleted', {
            id_conversacion,
            message: 'El administrador ha cerrado esta conversación'
          });
          console.log(` Notificación enviada a usuario ${userId}`);
        }
      }
      
      const socketsInRoom = await this.io.in(`conversation_${id_conversacion}`).allSockets();
      socketsInRoom.forEach(socketId => {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
          socket.leave(`conversation_${id_conversacion}`);
        }
      });
      
      this.conversationClients.delete(id_conversacion);
      
      console.log(` Conversación ${id_conversacion} cerrada y notificaciones enviadas`);
      
    } catch (error) {
      console.error(' Error al cerrar conversación:', error);
    }
  }
  
  
  broadcastToConversation(id_conversacion, message) {
    const room = `conversation_${id_conversacion}`;
    
    const eventData = message.data || message;
    const eventType = message.type === 'message' ? 'new_message' : message.type;
    
    this.io.to(room).emit(eventType, eventData);
    
    console.log(` Broadcast a room ${room}: ${eventType}`, eventData);
  }
  
  async notifyAdmins(event, data) {
    this.adminClients.forEach(adminSocket => {
      if (adminSocket.connected) {
        adminSocket.emit(event, data);
      }
    });
  }
  
  async sendPendingConversationsCount(socket) {
    try {
      const [result] = await pool.query(`
        SELECT COUNT(*) as count
        FROM chat_conversaciones
        WHERE estado = 'pendiente'
      `);
      
      socket.emit('pending_count', {
        count: result[0].count
      });
    } catch (error) {
      console.error(' Error al obtener conteo:', error);
    }
  }
  
  // ========================================
  // MÉTODOS DE CLASSROOM CHAT
  // ========================================
  
  handleClassroomAuth(socket, data) {
    const { tipo, id, nombre } = data;
    
    socket.classroomUser = { tipo, id, nombre };
    
    // Crear identificador único para este usuario
    const classroomUserId = `classroom_${tipo}_${id}`;
    socket.join(classroomUserId);
    
    console.log(`📚 Usuario Classroom autenticado: ${tipo} ${id} - ${nombre}`);
    
    socket.emit('classroom_authenticated', { success: true });
  }
  
  handleJoinClassroomConversation(socket, data) {
    const { id_conversacion } = data;
    
    if (!id_conversacion) return;
    
    // Unirse a la sala de la conversación
    const roomName = `classroom_conv_${id_conversacion}`;
    socket.join(roomName);
    
    console.log(`📚 Usuario unido a conversación classroom: ${id_conversacion}`);
  }
  
  handleClassroomMessage(socket, data) {
    const { id_conversacion, mensaje } = data;
    
    if (!id_conversacion || !mensaje) return;
    
    // Emitir a todos en la sala de la conversación
    const roomName = `classroom_conv_${id_conversacion}`;
    socket.to(roomName).emit('new_classroom_message', {
      id_conversacion,
      ...mensaje
    });
    
    // También emitir al destinatario si está en línea pero no en la sala
    // Esto es para las notificaciones cuando el chat no está abierto
    if (mensaje.destinatario_tipo && mensaje.destinatario_id) {
      const destinatarioRoom = `classroom_${mensaje.destinatario_tipo}_${mensaje.destinatario_id}`;
      socket.to(destinatarioRoom).emit('new_classroom_message', {
        id_conversacion,
        ...mensaje
      });
    }
    
    console.log(`📚 Mensaje classroom enviado en conversación: ${id_conversacion}`);
  }
  
  handleClassroomTyping(socket, data) {
    const { id_conversacion, isTyping } = data;
    
    if (!id_conversacion) return;
    
    const roomName = `classroom_conv_${id_conversacion}`;
    socket.to(roomName).emit('classroom_typing', {
      id_conversacion,
      isTyping,
      from: socket.classroomUser
    });
  }
  
  handleClassroomRead(socket, data) {
    const { id_conversacion } = data;
    
    if (!id_conversacion) return;
    
    const roomName = `classroom_conv_${id_conversacion}`;
    socket.to(roomName).emit('classroom_read', {
      id_conversacion,
      readBy: socket.classroomUser
    });
    
    console.log(`📚 Mensajes marcados como leídos en conversación: ${id_conversacion}`);
  }
  
  handleDisconnect(socket) {
    const userInfo = socket.userInfo;
    
    if (userInfo) {
      const userId = `${userInfo.tipo}_${userInfo.id_usuario || userInfo.id_conversacion}`;
      this.clients.delete(userId);
      
      if (userInfo.tipo === 'admin') {
        this.adminClients.delete(socket);
      }
      
      if (userInfo.id_conversacion) {
        const clients = this.conversationClients.get(userInfo.id_conversacion);
        if (clients) {
          clients.delete(socket);
          if (clients.size === 0) {
            this.conversationClients.delete(userInfo.id_conversacion);
          }
        }
      }
      
      console.log(` Usuario desconectado: ${userInfo.tipo} - ${userInfo.nombre} (${socket.id})`);
      
      // Log del evento
      eventLogger.chat.disconnected(userInfo.nombre);
    } else {
      console.log(` Conexión cerrada (no autenticada): ${socket.id}`);
    }
  }
  
  getStats() {
    return {
      totalConnections: this.io.sockets.sockets.size,
      adminConnections: this.adminClients.size,
      activeConversations: this.conversationClients.size,
      registeredClients: this.clients.size
    };
  }
}

export default ChatServer;


