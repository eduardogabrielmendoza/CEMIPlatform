class UserChatManager {
  constructor(userType) {
    this.userType = userType; // 'profesor' o 'alumno'
    this.socket = null;
    this.isConnected = false;
    this.conversations = [];
    this.activeConversation = null;
    this.userInfo = null;
    this.messageSound = null;
    this.BASE_URL = window.BASE_URL || 'http://localhost:3000';
    
    this.initMessageSound();
  }
  
  async init() {
    await this.loadUserInfo();
    this.connectSocket();
    
    document.addEventListener('click', () => {
      this.initAudioContext();
    }, { once: true });
  }
  
  initMessageSound() {
    this.audioContext = null;
    this.audioInitialized = false;
  }
  
  initAudioContext() {
    if (!this.audioInitialized) {
      try {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioInitialized = true;
        console.log(' AudioContext inicializado');
      } catch (error) {
        console.error('Error al inicializar AudioContext:', error);
      }
    }
  }
  
  playMessageSound() {
    if (!this.audioInitialized) {
      this.initAudioContext();
    }
    
    try {
      if (!this.audioContext) {
        console.log('️ AudioContext no disponible');
        return;
      }
      
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().then(() => {
          this.playSoundEffect();
        }).catch(err => {
          console.log('️ No se pudo reanudar AudioContext:', err);
        });
      } else {
        this.playSoundEffect();
      }
    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
  }
  
  playSoundEffect() {
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      const currentTime = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0.3, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
      
      oscillator.start(currentTime);
      oscillator.stop(currentTime + 0.5);
    } catch (error) {
      console.error('Error al reproducir efecto de sonido:', error);
    }
  }
  
  showNotification(title, message) {
    if (!('Notification' in window)) {
      console.log('Este navegador no soporta notificaciones de escritorio');
      return;
    }
    
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: message.substring(0, 100),
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        tag: 'chat-message',
        requireInteraction: false
      });
    }
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, {
            body: message.substring(0, 100),
            icon: '/images/logo.png',
            badge: '/images/logo.png',
            tag: 'chat-message',
            requireInteraction: false
          });
        }
      });
    }
  }
  
  updateNotificationBadge(count) {
    const badge = document.getElementById('chatNotificationBadge');
    if (!badge) {
      console.error(' No se encontró el elemento chatNotificationBadge');
      return;
    }
    
    console.log(' updateNotificationBadge llamado con count:', count);
    
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'flex';
      console.log(' Badge mostrado con:', badge.textContent);
    } else {
      badge.style.display = 'none';
      console.log(' Badge ocultado');
    }
  }
  
  clearNotificationBadge() {
    this.updateNotificationBadge(0);
  }
  
  async loadUserInfo() {
    const idKey = this.userType === 'profesor' ? 'id_profesor' : 'id_alumno';
    
    let id_usuario = localStorage.getItem('id_usuario');
    
    if (!id_usuario || id_usuario === 'null' || id_usuario === 'undefined') {
      console.warn('️ id_usuario no encontrado o inválido en localStorage');
      id_usuario = null;
      this.actualizarIdUsuario();
    } else {
      const numericId = parseInt(id_usuario, 10);
      if (isNaN(numericId)) {
        console.warn('️ id_usuario no es un número válido:', id_usuario);
        id_usuario = null;
        this.actualizarIdUsuario();
      } else {
        id_usuario = numericId;
      }
    }
    
    this.userInfo = {
      id_usuario: id_usuario, // ID de la tabla Usuarios (puede ser null temporalmente)
      id_especifico: localStorage.getItem(idKey), // id_profesor o id_alumno
      nombre: localStorage.getItem('nombre') || 'Usuario',
      avatar: localStorage.getItem('avatar') || null, // Avatar del usuario
      tipo: this.userType
    };
    
    if (!this.userInfo.id_especifico) {
      console.error(`No se encontró ${idKey} en localStorage`);
    }
    
    console.log(' Usuario cargado:', this.userInfo);
    
    if (!this.userInfo.avatar && this.userInfo.id_usuario) {
      await this.cargarAvatarDesdeServidor();
    }
  }
  
  async actualizarIdUsuario() {
    try {
      const username = localStorage.getItem('username');
      const nombre = localStorage.getItem('nombre');
      
      if (!username && !nombre) {
        console.error(' No hay username ni nombre en localStorage');
        return;
      }
      
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      
      try {
        const response = await fetch(`${API_URL}/auth/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username })
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.id_usuario) {
            localStorage.setItem('id_usuario', data.id_usuario);
            this.userInfo.id_usuario = parseInt(data.id_usuario, 10);
            console.log(' id_usuario actualizado desde /auth/verify:', data.id_usuario);
            
            if (this.socket && this.socket.connected) {
              this.authenticate();
            }
            return;
          }
        }
      } catch (verifyError) {
        console.warn('️ Endpoint /auth/verify no disponible, intentando método alternativo');
      }
      
      try {
        const idKey = this.userType === 'profesor' ? 'id_profesor' : 'id_alumno';
        const idValue = localStorage.getItem(idKey);
        
        if (idValue) {
          const response = await fetch(`${API_URL}/chat/mi-conversacion?tipo_usuario=${this.userType}&id_usuario=${idValue}`);
          if (response.ok) {
            const result = await response.json();
            console.log(' Conversación cargada, id_usuario debería estar disponible en el contexto');
          }
        }
      } catch (altError) {
        console.error(' Error en método alternativo:', altError);
      }
      
    } catch (err) {
      console.error(' Error actualizando id_usuario:', err);
    }
  }
  
  async cargarAvatarDesdeServidor() {
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/auth/usuario/${this.userInfo.id_usuario}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.avatar) {
          console.log(' Avatar cargado desde servidor:', data.avatar);
          this.userInfo.avatar = data.avatar;
          localStorage.setItem('avatar', data.avatar);
        }
      }
    } catch (error) {
      console.warn(' No se pudo cargar avatar desde servidor:', error);
    }
  }
  
  connectSocket() {
    if (this.socket && this.socket.connected) {
      console.log('️ Socket.IO ya está conectado');
      return;
    }
    
    console.log(' Conectando Socket.IO del chat...');
    this.socket = io(this.BASE_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000
    });
    
    this.socket.on('connect', () => {
      console.log(' User Chat Socket.IO conectado');
      this.isConnected = true;
      this.authenticate();
    });
    
    this.socket.on('authenticated', (data) => {
      console.log(' Usuario autenticado');
      this.loadConversations();
    });
    
    this.socket.on('new_message', (data) => {
      this.handleNewMessage(data);
    });
    
    this.socket.on('typing', (data) => {
      this.handleTyping(data);
    });
    
    this.socket.on('conversation_closed', () => {
      this.handleConversationClosed();
    });
    
    this.socket.on('conversation_deleted', () => {
      this.handleConversationClosed();
    });
    
    this.socket.on('joined_conversation', (data) => {
      console.log(' Confirmación de unión a conversación:', data);
    });
    
    this.socket.on('disconnect', () => {
      console.log(' User Chat Socket.IO desconectado');
      this.isConnected = false;
    });
    
    this.socket.on('error', (error) => {
      console.error(' Error en Socket.IO:', error);
    });
  }
  
  authenticate() {
    if (!this.socket || !this.socket.connected) return;
    
    this.socket.emit('auth', {
      tipo: this.userType,
      id_usuario: this.userInfo.id_usuario,
      nombre: this.userInfo.nombre,
      id_conversacion: this.activeConversation ? this.activeConversation.id_conversacion : null
    });
  }
  
  
  handleNewMessage(data) {
    console.log(' Nuevo mensaje recibido:', data);
    
    const esMensajePropio = data.tipo_remitente === this.userType && 
                            (data.id_especifico == this.userInfo.id_especifico || 
                             data.id_remitente == this.userInfo.id_especifico);
    
    console.log(' Es mensaje propio?', esMensajePropio, {
      data_tipo: data.tipo_remitente,
      my_tipo: this.userType,
      data_id_especifico: data.id_especifico,
      data_id_remitente: data.id_remitente,
      my_id: this.userInfo.id_especifico
    });
    
    if (!esMensajePropio) {
      this.playMessageSound();
      this.showNotification('Nuevo mensaje de Soporte', data.mensaje);
    }
    
    const chatContainer = document.getElementById('userChatContainer');
    const isChatVisible = chatContainer && chatContainer.offsetParent !== null;
    
    console.log('️ Chat visible:', isChatVisible);
    console.log(' Conversación activa:', this.activeConversation?.id_conversacion);
    
    if (isChatVisible && this.activeConversation && this.activeConversation.id_conversacion === data.id_conversacion) {
      console.log(' Agregando mensaje a conversación activa');
      this.addMessageToUI(data);
      this.scrollToBottom();
      
      const conv = this.conversations.find(c => c.id_conversacion === data.id_conversacion);
      if (conv) {
        conv.ultimo_mensaje = data.mensaje;
        conv.fecha_ultimo_mensaje = data.fecha_envio || new Date().toISOString();
        this.renderConversationsList();
      }
      
      if (!esMensajePropio) {
        this.markAsRead(data.id_conversacion);
      }
    } else {
      console.log(' Mensaje recibido (chat no visible), actualizando badge desde BD');
      
      this.loadConversations();
    }
  }
  
  handleTyping(data) {
    if (this.activeConversation && this.activeConversation.id_conversacion === data.id_conversacion) {
      this.showTypingIndicator(data.nombre, data.isTyping);
    }
  }
  
  handleConversationClosed() {
    Swal.fire({
      icon: 'info',
      title: 'Conversación cerrada',
      text: 'El administrador ha cerrado esta conversación.'
    });
    this.activeConversation = null;
    this.loadConversations();
    this.renderMessages();
  }
  
  async loadConversations() {
    try {
      const idValue = this.userInfo.id_usuario; // Usar id_usuario de la tabla Usuarios
      
      console.log(' Cargando conversaciones para:', this.userType, 'id_usuario:', idValue);
      
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/mi-conversacion?tipo_usuario=${this.userType}&id_usuario=${idValue}`);
      
      if (response.ok) {
        const result = await response.json();
        console.log(' Respuesta del servidor:', result);
        
        if (result.success && result.data && result.data.conversacion) {
          const conversacion = result.data.conversacion;
          conversacion.mensajes = result.data.mensajes || [];
          this.conversations = [conversacion];
          
          console.log(' Conversación cargada:', conversacion);
          
          const mensajesNoLeidos = conversacion.mensajes_no_leidos_usuario || 0;
          console.log(' Mensajes no leídos desde BD:', mensajesNoLeidos);
          this.updateNotificationBadge(mensajesNoLeidos);
          
          if (this.socket && this.socket.connected) {
            console.log(' Uniéndose automáticamente a conversación:', conversacion.id_conversacion);
            this.socket.emit('join_conversation', {
              id_conversacion: conversacion.id_conversacion
            });
          } else {
            console.warn('️ Socket.IO no está listo, reintentando en 500ms...');
            setTimeout(() => {
              if (this.socket && this.socket.connected) {
                console.log(' Reintento: Uniéndose a conversación:', conversacion.id_conversacion);
                this.socket.emit('join_conversation', {
                  id_conversacion: conversacion.id_conversacion
                });
              }
            }, 500);
          }
          
        } else {
          console.log('ℹ️ No hay conversaciones activas');
          this.conversations = [];
          this.updateNotificationBadge(0);
          
          const header = document.getElementById('userChatHeader');
          const inputArea = document.getElementById('userChatInputArea');
          if (header) header.style.display = 'flex';
          if (inputArea) inputArea.style.display = 'flex';
        }
        
        this.renderConversationsList();
      }
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
    }
  }
  
  renderConversationsList() {
    const container = document.getElementById('userChatConversationsList');
    if (!container) return;
    
    if (this.conversations.length === 0) {
      container.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #9ca3af;">
          <i data-lucide="inbox" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5;"></i>
          <p>No tienes conversaciones activas</p>
          <p style="font-size: 13px; margin-top: 8px;">Envía tu primer mensaje para iniciar</p>
        </div>
      `;
      lucide.createIcons();
      
      const emptyMessage = document.getElementById('userChatEmptyMessage');
      if (emptyMessage) {
        emptyMessage.querySelector('p').textContent = 'Escribe un mensaje para iniciar una conversación con Soporte';
      }
      return;
    }
    
    container.innerHTML = this.conversations.map(conv => {
      const nombre = 'Soporte CEMI';
      const logoUrl = 'images/logo.png';
      const avatarContent = this.renderAvatar(logoUrl, nombre);
      const tiempo = this.formatTime(conv.fecha_ultimo_mensaje || conv.fecha_inicio);
      const preview = conv.ultimo_mensaje || 'Sin mensajes';
      
      return `
        <div class="user-chat-conversation-item ${this.activeConversation && this.activeConversation.id_conversacion === conv.id_conversacion ? 'active' : ''}" 
             onclick="userChatManager.selectConversation(${conv.id_conversacion})">
          <div class="user-chat-conv-avatar">${avatarContent}</div>
          <div class="user-chat-conv-info">
            <div class="user-chat-conv-header">
              <div class="user-chat-conv-name">${nombre}</div>
              <span class="user-chat-conv-time">${tiempo}</span>
            </div>
            <div class="user-chat-conv-preview">${this.escapeHtml(preview)}</div>
            ${conv.mensajes_no_leidos > 0 ? `<span class="user-chat-conv-unread">${conv.mensajes_no_leidos}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
    
    lucide.createIcons();
  }
  
  async selectConversation(id) {
    console.log(' Seleccionando conversación:', id);
    const conv = this.conversations.find(c => c.id_conversacion === id);
    if (!conv) {
      console.error(' No se encontró conversación con ID:', id);
      return;
    }
    
    this.activeConversation = conv;
    this.renderConversationsList();
    
    const header = document.getElementById('userChatHeader');
    const inputArea = document.getElementById('userChatInputArea');
    if (header) header.style.display = 'flex';
    if (inputArea) inputArea.style.display = 'flex';
    
    const emptyMessage = document.getElementById('userChatEmptyMessage');
    if (emptyMessage) {
      emptyMessage.querySelector('p').textContent = 'Selecciona una conversación para comenzar a chatear';
    }
    
    if (this.socket && this.socket.connected) {
      console.log(' Uniéndose a conversación vía Socket.IO:', id);
      this.socket.emit('join_conversation', {
        id_conversacion: id
      });
    }
    
    if (this.activeConversation.mensajes && this.activeConversation.mensajes.length > 0) {
      console.log(' Usando mensajes ya cargados:', this.activeConversation.mensajes.length);
      this.renderMessages();
    } else {
      console.log(' Cargando mensajes desde servidor...');
      await this.loadMessages();
    }
    
    this.markAsRead(id);
  }
  
  async loadMessages() {
    if (!this.activeConversation) return;
    
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/conversacion/${this.activeConversation.id_conversacion}`);
      const result = await response.json();
      
      if (result.success) {
        this.activeConversation.mensajes = result.mensajes || [];
        this.renderMessages();
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  }
  
  renderMessages() {
    const container = document.getElementById('userChatMessagesContainer');
    if (!container) return;
    
    if (!this.activeConversation) {
      container.innerHTML = `
        <div class="user-chat-empty">
          <i data-lucide="message-square" style="width: 64px; height: 64px;"></i>
          <p>Selecciona una conversación o inicia una nueva</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }
    
    const mensajes = this.activeConversation.mensajes || [];
    
    if (mensajes.length === 0) {
      container.innerHTML = `
        <div class="user-chat-empty">
          <i data-lucide="message-circle" style="width: 64px; height: 64px;"></i>
          <p>No hay mensajes aún</p>
          <p style="font-size: 13px; margin-top: 8px; color: #9ca3af;">Envía un mensaje para comenzar</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }
    
    container.innerHTML = mensajes.map(msg => {
      const isAdmin = msg.es_admin === 1 || msg.tipo_remitente === 'admin';
      const time = new Date(msg.fecha_envio).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      let nombreMostrar = '';
      let tipoLabel = '';
      let avatarParaMostrar = null;
      
      if (isAdmin) {
        nombreMostrar = msg.nombre_remitente || 'Admin';
        tipoLabel = 'Administrador';
        avatarParaMostrar = 'images/logo.png';
      } else {
        nombreMostrar = msg.nombre_remitente || this.userInfo.nombre;
        tipoLabel = msg.tipo_remitente === 'profesor' ? 'Profesor' : 'Alumno';
        
        const esMiMensaje = msg.tipo_remitente === this.userType && 
                            (msg.id_especifico == this.userInfo.id_especifico || 
                             msg.id_remitente == this.userInfo.id_especifico);
        
        if (msg.tipo_remitente === this.userType) {
          avatarParaMostrar = this.userInfo.avatar || msg.avatar_remitente;
          console.log(' Mensaje de mi tipo (alumno/profesor) - usando MI avatar:', avatarParaMostrar);
        } else {
          avatarParaMostrar = msg.avatar_remitente;
          console.log(' Mensaje de admin - usando avatar de BD:', avatarParaMostrar);
        }
      }
      
      console.log(' Antes de renderAvatar - avatarParaMostrar:', avatarParaMostrar);
      const avatarContent = this.renderAvatar(avatarParaMostrar, nombreMostrar);
      console.log(' Después de renderAvatar - avatarContent:', avatarContent);
      
      let mensajeContent = '';
      if (msg.archivo_adjunto) {
        if (msg.tipo_archivo === 'image') {
          mensajeContent = `
            <div class="chat-file-attachment">
              <img src="${msg.archivo_adjunto}" 
                   alt="Imagen adjunta" 
                   class="chat-image-preview" 
                   onclick="window.open('${msg.archivo_adjunto}', '_blank')" 
                   onerror="this.style.display='none'; this.parentElement.innerHTML='<div class=&quot;user-chat-message-bubble&quot; style=&quot;background:#fee2e2; color:#991b1b; border:1px solid #fca5a5;&quot;>️ Imagen no disponible</div>';" />
            </div>
          `;
        } else if (msg.tipo_archivo === 'pdf') {
          const nombreArchivo = msg.archivo_adjunto.split('/').pop();
          mensajeContent = `
            <div class="chat-file-attachment pdf">
              <div class="chat-pdf-icon">
                <i data-lucide="file-text" style="width: 32px; height: 32px; color: #e53935;"></i>
              </div>
              <div class="chat-pdf-info">
                <div class="chat-pdf-name">${nombreArchivo}</div>
                <div class="chat-pdf-type">Documento PDF</div>
              </div>
              <a href="${msg.archivo_adjunto}" download class="chat-pdf-download" title="Descargar PDF">
                <i data-lucide="download" style="width: 20px; height: 20px;"></i>
              </a>
            </div>
          `;
        }
      } else {
        mensajeContent = `<div class="user-chat-message-bubble">${this.escapeHtml(msg.mensaje)}</div>`;
      }
      
      return `
        <div class="user-chat-message ${isAdmin ? 'received' : 'sent'}">
          <div class="user-chat-message-avatar">${avatarContent}</div>
          <div class="user-chat-message-content">
            <div class="user-chat-message-sender">${nombreMostrar} <span class="user-chat-sender-type">(${tipoLabel})</span></div>
            ${mensajeContent}
            <div class="user-chat-message-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');
    
    lucide.createIcons();
    this.scrollToBottom();
  }
  
  addMessageToUI(messageData) {
    if (!this.activeConversation) return;
    
    if (!this.activeConversation.mensajes) {
      this.activeConversation.mensajes = [];
    }
    
    this.activeConversation.mensajes.push(messageData);
    
    this.activeConversation.ultimo_mensaje = messageData.mensaje;
    this.activeConversation.fecha_ultimo_mensaje = messageData.fecha_envio || new Date().toISOString();
    
    const conv = this.conversations.find(c => c.id_conversacion === this.activeConversation.id_conversacion);
    if (conv) {
      conv.ultimo_mensaje = messageData.mensaje;
      conv.fecha_ultimo_mensaje = messageData.fecha_envio || new Date().toISOString();
      this.renderConversationsList();
    }
    
    this.renderMessages();
  }
  
  async sendMessage() {
    const input = document.getElementById('userChatMessageInput');
    const mensaje = input.value.trim();
    
    if (!mensaje) return;
    
    if (!this.activeConversation) {
      console.log('️ No hay conversación activa, cargando conversación del usuario...');
      
      await this.loadConversations();
      
      if (this.conversations && this.conversations.length > 0) {
        console.log(' Conversación encontrada, seleccionando automáticamente...');
        await this.selectConversation(this.conversations[0].id_conversacion);
        
        if (this.socket && this.socket.connected) {
          this.socket.emit('message', {
            id_conversacion: this.activeConversation.id_conversacion,
            mensaje: mensaje
          });
          input.value = '';
          return;
        }
      } else {
        console.log(' No existe conversación, creando una nueva con el mensaje...');
        await this.startNewConversation(mensaje);
        return;
      }
    }
    
    if (this.socket && this.socket.connected) {
      this.socket.emit('message', {
        id_conversacion: this.activeConversation.id_conversacion,
        mensaje: mensaje
      });
      
      input.value = '';
      console.log(' Mensaje enviado a conversación:', this.activeConversation.id_conversacion);
    } else {
      console.error(' Socket.IO no conectado');
      Swal.fire({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo enviar el mensaje. Intenta de nuevo.'
      });
    }
  }
  
  async handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo muy grande',
        text: 'El archivo no debe superar los 5MB'
      });
      event.target.value = '';
      return;
    }
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Tipo de archivo no válido',
        text: 'Solo se permiten imágenes (JPG, PNG, WEBP) y archivos PDF'
      });
      event.target.value = '';
      return;
    }
    
    Swal.fire({
      title: 'Subiendo archivo...',
      text: file.name,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    
    await this.uploadFile(file);
    
    event.target.value = '';
  }
  
  async uploadFile(file) {
    try {
      if (!this.activeConversation) {
        await this.loadConversations();
        
        if (this.conversations && this.conversations.length > 0) {
          await this.selectConversation(this.conversations[0].id_conversacion);
        } else {
          await this.startNewConversation('[Archivo adjunto]');
          await new Promise(resolve => setTimeout(resolve, 500));
          await this.loadConversations();
          if (this.conversations.length > 0) {
            await this.selectConversation(this.conversations[0].id_conversacion);
          }
        }
      }
      
      if (!this.activeConversation) {
        throw new Error('No se pudo establecer una conversación');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('id_conversacion', this.activeConversation.id_conversacion);
      formData.append('tipo_remitente', this.userType);
      formData.append('id_remitente', this.userInfo.id_especifico || '');
      formData.append('nombre_remitente', this.userInfo.nombre);
      
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/upload`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Archivo enviado',
          text: 'El archivo se ha enviado correctamente',
          timer: 1500,
          showConfirmButton: false
        });
        
        console.log(' Archivo subido exitosamente, esperando evento Socket.IO...');
      } else {
        throw new Error(result.message || 'Error al subir archivo');
      }
      
    } catch (error) {
      console.error(' Error al subir archivo:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'No se pudo subir el archivo'
      });
    }
  }
  
  async startNewConversation(mensaje) {
    try {
      const idKey = this.userType === 'profesor' ? 'id_profesor' : 'id_alumno';
      
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: this.userInfo.nombre,
          tipo_usuario: this.userType,
          id_usuario: this.userInfo.id_usuario,
          mensaje_inicial: mensaje
        })
      });
      
      const result = await response.json();
      console.log(' Resultado de iniciar conversación:', result);
      
      if (result.success && result.data) {
        const id_conversacion = result.data.id_conversacion;
        console.log(' Conversación creada con ID:', id_conversacion);
        
        document.getElementById('userChatMessageInput').value = '';
        await this.loadConversations();
        
        if (this.conversations.length > 0) {
          console.log(' Seleccionando conversación:', id_conversacion);
          await this.selectConversation(id_conversacion);
        }
        
        this.authenticate();
      } else {
        throw new Error(result.message || 'Error al iniciar conversación');
      }
    } catch (error) {
      console.error('Error al iniciar conversación:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo iniciar la conversación. Intenta de nuevo.'
      });
    }
  }
  
  handleTypingInput() {
    if (!this.activeConversation || !this.socket || !this.socket.connected) return;
    
    clearTimeout(this.typingTimeout);
    
    this.socket.emit('typing', {
      id_conversacion: this.activeConversation.id_conversacion,
      isTyping: true
    });
    
    this.typingTimeout = setTimeout(() => {
      if (this.socket && this.socket.connected) {
        this.socket.emit('typing', {
          id_conversacion: this.activeConversation.id_conversacion,
          isTyping: false
        });
      }
    }, 1000);
  }
  
  showTypingIndicator(nombre, isTyping) {
    const container = document.getElementById('userChatMessagesContainer');
    if (!container) return;
    
    const existingIndicator = document.getElementById('userTypingIndicator');
    
    if (!isTyping) {
      if (existingIndicator) existingIndicator.remove();
      return;
    }
    
    if (!existingIndicator) {
      const indicator = document.createElement('div');
      indicator.id = 'userTypingIndicator';
      indicator.className = 'user-chat-typing';
      indicator.innerHTML = `
        <span>${nombre} está escribiendo</span>
        <div class="user-chat-typing-dots">
          <div class="user-chat-typing-dot"></div>
          <div class="user-chat-typing-dot"></div>
          <div class="user-chat-typing-dot"></div>
        </div>
      `;
      container.appendChild(indicator);
      this.scrollToBottom();
    }
  }
  
  async markAsRead(id) {
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      await fetch(`${API_URL}/chat/conversacion/${id}/leer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo_lector: 'usuario' })
      });
      
      await this.loadConversations();
      console.log(' Mensajes marcados como leídos, badge actualizado desde BD');
    } catch (error) {
      console.error('Error al marcar como leído:', error);
    }
  }
  
  scrollToBottom() {
    const container = document.getElementById('userChatMessagesContainer');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
  
  formatTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  renderAvatar(avatar, nombre) {
    const iniciales = nombre ? nombre.charAt(0).toUpperCase() : 'U';
    
    if (avatar && avatar.trim()) {
      // Aceptar URLs absolutas (http/https) y rutas relativas (images/)
      const isValidUrl = avatar.startsWith('http') || avatar.startsWith('images/') || avatar.startsWith('/images/');
      
      if (isValidUrl) {
        console.log(`️ Renderizando avatar:`, avatar);
        
        const isLogo = avatar.includes('logo');
        const bgSize = isLogo ? 'contain' : 'cover';
        const padding = isLogo ? 'padding: 4px;' : '';
        const bgColor = isLogo ? 'background-color: white;' : '';
        
        return `<div style="width: 100%; height: 100%; ${bgColor} background-image: url('${avatar}'); background-size: ${bgSize}; background-position: center; background-repeat: no-repeat; border-radius: inherit; ${padding}">
                  <span style="display: none;">${iniciales}</span>
                </div>`;
      }
    }
    
    return `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #4a5259; border-radius: inherit;">${iniciales}</div>`;
  }
  
  renderChatView() {
    const container = document.getElementById('userChatContainer');
    container.innerHTML = `
      <div class="user-chat-full-container">
        <!-- Panel Izquierdo: Lista de Conversaciones -->
        <div class="user-chat-conversations-panel">
          <div class="user-chat-conversations-header">
            <h3>
              <i data-lucide="message-circle"></i>
              Mis Conversaciones
            </h3>
          </div>
          <div class="user-chat-conversations-list" id="userChatConversationsList">
            <div style="padding: 40px 20px; text-align: center; color: #9ca3af;">
              <p>Cargando...</p>
            </div>
          </div>
        </div>
        
        <!-- Panel Derecho: Chat Activo -->
        <div class="user-chat-messages-panel">
          <div class="user-chat-header" style="display: none;" id="userChatHeader">
            <i data-lucide="message-square" style="width: 24px; height: 24px;"></i>
            <div>
              <h3>Soporte CEMI</h3>
              <div class="user-chat-status">
                <div class="user-chat-status-dot"></div>
                <span>En línea</span>
              </div>
            </div>
          </div>
          
          <div class="user-chat-messages" id="userChatMessagesContainer">
            <div class="user-chat-empty" id="userChatEmptyMessage">
              <i data-lucide="message-square" style="width: 64px; height: 64px;"></i>
              <p>Escribe un mensaje para iniciar una conversación con Soporte</p>
            </div>
          </div>
          
          <div class="user-chat-input-area" style="display: none;" id="userChatInputArea">
            <input 
              type="file" 
              id="userChatFileInput" 
              accept="image/*,.pdf"
              style="display: none;"
              onchange="userChatManager.handleFileSelect(event)"
            >
            <button class="user-chat-attach-btn" onclick="document.getElementById('userChatFileInput').click()" title="Adjuntar archivo">
              <i data-lucide="paperclip" style="width: 20px; height: 20px;"></i>
            </button>
            <input 
              type="text" 
              id="userChatMessageInput" 
              class="user-chat-input" 
              placeholder="Escribe tu mensaje..."
              onkeypress="if(event.key === 'Enter') userChatManager.sendMessage()"
              oninput="userChatManager.handleTypingInput()"
              maxlength="1000"
            >
            <button class="user-chat-send-btn" onclick="userChatManager.sendMessage()">
              <i data-lucide="send" style="width: 20px; height: 20px;"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
    
    this.loadConversations();
  }
}



