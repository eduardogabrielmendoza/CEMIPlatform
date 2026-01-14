
class ChatWidget {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.conversationId = null;
    this.userInfo = null;
    this.isTyping = false;
    this.typingTimeout = null;
    this.BASE_URL = window.BASE_URL || 'http://localhost:3000';
    this.messageSound = null;
    
    this.init();
  }
  
  init() {
    this.createWidget();
    this.setupEventListeners();
    this.loadUserInfo();
    this.initMessageSound();
  }
  
  
  createWidget() {
    const widgetHTML = `
      <!-- Botón flotante de Login -->
      <button class="chat-float-button" id="chatFloatButton" onclick="window.location.href='login.html'" title="Iniciar Sesión">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
          <polyline points="10 17 15 12 10 7"></polyline>
          <line x1="15" y1="12" x2="3" y2="12"></line>
        </svg>
      </button>
      
      <!-- Widget del chat (oculto, ya no se usa) -->
      <div class="chat-widget-container" id="chatWidgetContainer" style="display: none !important;">
        <!-- Header -->
        <div class="chat-widget-header">
          <div class="chat-widget-header-info">
            <div class="chat-widget-header-avatar"></div>
            <div class="chat-widget-header-text">
              <h3>Chat de Soporte</h3>
              <p><span class="status-dot"></span> En línea</p>
            </div>
          </div>
          <button class="chat-widget-close" id="chatWidgetClose">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <!-- Estado de conexión -->
        <div class="chat-connection-status" id="chatConnectionStatus"></div>
        
        <!-- Formulario inicial (para invitados) -->
        <div class="chat-initial-form" id="chatInitialForm">
          <h4>¡Hola! </h4>
          <p>Estamos aquí para ayudarte. Cuéntanos en qué podemos asistirte.</p>
          
          <div class="chat-form-group">
            <label for="chatUserName">Tu nombre</label>
            <input type="text" id="chatUserName" placeholder="Ej: Juan Pérez" required>
          </div>
          
          <div class="chat-form-group">
            <label for="chatInitialMessage">¿En qué podemos ayudarte?</label>
            <textarea id="chatInitialMessage" placeholder="Describe tu consulta..." required></textarea>
          </div>
          
          <button class="chat-start-button" id="chatStartButton">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Iniciar Chat
          </button>
        </div>
        
        <!-- Área de mensajes -->
        <div class="chat-messages-container" id="chatMessagesContainer" style="display: none;"></div>
        
        <!-- Indicador de escritura -->
        <div class="chat-typing-indicator" id="chatTypingIndicator" style="display: none;">
          <span>Escribiendo</span>
          <div class="chat-typing-dots">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
        
        <!-- Input de mensaje -->
        <div class="chat-input-container" id="chatInputContainer" style="display: none;">
          <div class="chat-input-wrapper">
            <input type="text" id="chatMessageInput" placeholder="Escribe un mensaje...">
          </div>
          <button class="chat-send-button" id="chatSendButton">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
  }
  
  
  setupEventListeners() {
    document.getElementById('chatFloatButton').addEventListener('click', () => this.toggleWidget());
    document.getElementById('chatWidgetClose').addEventListener('click', () => this.closeWidget());
    
    document.getElementById('chatStartButton').addEventListener('click', () => this.startChat());
    
    document.getElementById('chatSendButton').addEventListener('click', () => this.sendMessage());
    document.getElementById('chatMessageInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });
    
    document.getElementById('chatMessageInput').addEventListener('input', () => this.handleTyping());
  }
  
  
  loadUserInfo() {
    const nombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    const id_alumno = localStorage.getItem('id_alumno');
    const id_profesor = localStorage.getItem('id_profesor');
    
    if (nombre && rol) {
      this.userInfo = {
        nombre,
        tipo: rol.toLowerCase(),
        id_usuario: rol === 'alumno' ? id_alumno : id_profesor
      };
      
      document.getElementById('chatInitialForm').style.display = 'none';
      document.getElementById('chatMessagesContainer').style.display = 'flex';
      document.getElementById('chatInputContainer').style.display = 'flex';
      
      this.checkActiveConversation();
    }
  }
  
  
  initMessageSound() {
    this.messageSound = () => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    };
  }
  
  
  connectSocket() {
    if (this.socket && this.socket.connected) {
      console.log('Socket.IO ya está conectado');
      return;
    }
    
    this.showConnectionStatus('Conectando...', 'warning');
    
    this.socket = io(this.BASE_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      reconnectionAttempts: 5
    });
    
    this.socket.on('connect', () => {
      console.log(' Socket.IO conectado');
      this.isConnected = true;
      this.showConnectionStatus('Conectado', 'success');
      setTimeout(() => this.hideConnectionStatus(), 2000);
      
      this.authenticate();
    });
    
    this.socket.on('connected', (data) => {
      console.log('', data.message);
    });
    
    this.socket.on('authenticated', (data) => {
      console.log(' Autenticado:', data.message);
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
    
    this.socket.on('disconnect', () => {
      console.log(' Socket.IO desconectado');
      this.isConnected = false;
      this.showConnectionStatus('Desconectado', 'warning');
    });
    
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(` Reconectado después de ${attemptNumber} intentos`);
      this.showConnectionStatus('Reconectado', 'success');
      setTimeout(() => this.hideConnectionStatus(), 2000);
    });
    
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      this.showConnectionStatus(`Reconectando... (${attemptNumber}/5)`, 'warning');
    });
    
    this.socket.on('reconnect_failed', () => {
      this.showConnectionStatus('No se pudo reconectar. Recarga la página.', 'error');
    });
    
    this.socket.on('error', (error) => {
      console.error(' Error en Socket.IO:', error);
      this.showConnectionStatus('Error de conexión', 'error');
    });
  }
  
  authenticate() {
    if (!this.socket || !this.socket.connected) return;
    
    const authData = {
      tipo: this.userInfo.tipo,
      id_usuario: this.userInfo.id_usuario,
      nombre: this.userInfo.nombre,
      id_conversacion: this.conversationId
    };
    
    this.socket.emit('auth', authData);
  }
  
  
  handleNewMessage(data) {
    this.addMessageToUI(data);
    this.playMessageSound();
    this.scrollToBottom();
  }
  
  handleTyping(data) {
    if (data.tipo === 'admin') {
      this.showTypingIndicator();
    }
  }
  
  handleConversationClosed() {
    this.showConnectionStatus('La conversación ha sido cerrada por un administrador', 'warning');
    this.disableChat();
  }
  
  
  async startChat() {
    const nombre = document.getElementById('chatUserName').value.trim();
    const mensaje = document.getElementById('chatInitialMessage').value.trim();
    
    if (!nombre || !mensaje) {
      alert('Por favor completa todos los campos');
      return;
    }
    
    const button = document.getElementById('chatStartButton');
    button.disabled = true;
    button.textContent = 'Iniciando...';
    
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/iniciar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_usuario: 'invitado',
          nombre,
          mensaje_inicial: mensaje
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.conversationId = result.data.id_conversacion;
        this.userInfo = {
          tipo: 'invitado',
          nombre,
          id_usuario: null
        };
        
        document.getElementById('chatInitialForm').style.display = 'none';
        document.getElementById('chatMessagesContainer').style.display = 'flex';
        document.getElementById('chatInputContainer').style.display = 'flex';
        
        this.connectSocket();
        
        await this.loadMessages();
      } else {
        alert('Error al iniciar el chat');
        button.disabled = false;
        button.innerHTML = '<svg>...</svg> Iniciar Chat';
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
      button.disabled = false;
      button.innerHTML = '<svg>...</svg> Iniciar Chat';
    }
  }
  
  
  async checkActiveConversation() {
    if (!this.userInfo || this.userInfo.tipo === 'invitado') return;
    
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(
        `${API_URL}/chat/mi-conversacion?tipo_usuario=${this.userInfo.tipo}&id_usuario=${this.userInfo.id_usuario}`
      );
      
      const result = await response.json();
      
      if (result.success && result.data) {
        this.conversationId = result.data.conversacion.id_conversacion;
        this.connectSocket();
        this.loadMessages();
      }
    } catch (error) {
      console.error('Error al verificar conversación:', error);
    }
  }
  
  
  async loadMessages() {
    if (!this.conversationId) return;
    
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/conversacion/${this.conversationId}`);
      const result = await response.json();
      
      if (result.success) {
        const container = document.getElementById('chatMessagesContainer');
        container.innerHTML = '';
        
        result.data.mensajes.forEach(msg => {
          this.addMessageToUI(msg, false);
        });
        
        this.scrollToBottom();
        
        this.markAsRead();
      }
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
    }
  }
  
  
  sendMessage() {
    const input = document.getElementById('chatMessageInput');
    const mensaje = input.value.trim();
    
    if (!mensaje || !this.isConnected) return;
    
    this.socket.emit('message', {
      id_conversacion: this.conversationId,
      mensaje
    });
    
    input.value = '';
    this.stopTyping();
  }
  
  
  addMessageToUI(messageData, playSound = true) {
    const container = document.getElementById('chatMessagesContainer');
    const isSent = messageData.tipo_remitente === this.userInfo.tipo || 
                   (messageData.nombre_remitente === this.userInfo.nombre && messageData.tipo_remitente === 'invitado');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isSent ? 'sent' : 'received'}`;
    
    const avatar = isSent ? this.userInfo.nombre.charAt(0).toUpperCase() : '';
    const time = new Date(messageData.fecha_envio).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
      <div class="chat-message-avatar">${avatar}</div>
      <div class="chat-message-bubble">
        <div class="chat-message-sender">${messageData.nombre_remitente}</div>
        <p class="chat-message-text">${this.escapeHtml(messageData.mensaje)}</p>
        <div class="chat-message-time">${time}</div>
      </div>
    `;
    
    container.appendChild(messageDiv);
    this.scrollToBottom();
    
    if (!isSent && playSound) {
      this.playMessageSound();
      this.updateNotificationBadge();
    }
  }
  
  
  handleTyping() {
    if (!this.isTyping) {
      this.isTyping = true;
      this.socket.emit('typing', {
        id_conversacion: this.conversationId,
        isTyping: true
      });
    }
    
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.stopTyping();
    }, 3000);
  }
  
  stopTyping() {
    if (this.isTyping) {
      this.isTyping = false;
      this.socket.emit('typing', {
        id_conversacion: this.conversationId,
        isTyping: false
      });
    }
  }
  
  showTypingIndicator() {
    const indicator = document.getElementById('chatTypingIndicator');
    indicator.style.display = 'flex';
    
    setTimeout(() => {
      indicator.style.display = 'none';
    }, 3000);
  }
  
  
  async markAsRead() {
    if (!this.conversationId || !this.isConnected) return;
    
    this.socket.emit('read', {
      id_conversacion: this.conversationId
    });
    this.updateNotificationBadge(0);
  }
  
  
  toggleWidget() {
    const container = document.getElementById('chatWidgetContainer');
    const isActive = container.classList.contains('active');
    
    if (isActive) {
      this.closeWidget();
    } else {
      this.openWidget();
    }
  }
  
  openWidget() {
    document.getElementById('chatWidgetContainer').classList.add('active');
    
    if (this.conversationId && !this.isConnected) {
      this.connectSocket();
    }
    
    if (this.conversationId) {
      this.markAsRead();
    }
    
    setTimeout(() => {
      const input = document.getElementById('chatMessageInput');
      if (input.offsetParent !== null) {
        input.focus();
      }
    }, 300);
  }
  
  closeWidget() {
    document.getElementById('chatWidgetContainer').classList.remove('active');
  }
  
  scrollToBottom() {
    const container = document.getElementById('chatMessagesContainer');
    container.scrollTop = container.scrollHeight;
  }
  
  playMessageSound() {
    try {
      this.messageSound();
    } catch (error) {
      console.error('Error al reproducir sonido:', error);
    }
  }
  
  updateNotificationBadge(count = null) {
    const badge = document.getElementById('chatNotificationBadge');
    
    if (count === null) {
      const currentCount = parseInt(badge.textContent) || 0;
      count = currentCount + 1;
    }
    
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }
  
  showConnectionStatus(message, type = 'warning') {
    const status = document.getElementById('chatConnectionStatus');
    status.textContent = message;
    status.className = `chat-connection-status show ${type}`;
  }
  
  hideConnectionStatus() {
    const status = document.getElementById('chatConnectionStatus');
    status.classList.remove('show');
  }
  
  disableChat() {
    document.getElementById('chatMessageInput').disabled = true;
    document.getElementById('chatSendButton').disabled = true;
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}


document.addEventListener('DOMContentLoaded', () => {
  window.chatWidget = new ChatWidget();
  console.log(' Chat Widget inicializado');
});



