class UserChat {
  constructor(userType) {
    this.userType = userType; // 'profesor' o 'alumno'
    this.socket = null;
    this.isConnected = false;
    this.activeConversation = null;
    this.messages = [];
    this.userInfo = this.loadUserInfo();
    
    this.initializeUI();
    this.connectSocketIO();
  }
  
  loadUserInfo() {
    return {
      id_usuario: localStorage.getItem('id_usuario'),
      nombre: localStorage.getItem('nombre') || 'Usuario',
      tipo: this.userType
    };
  }
  
  connectSocketIO() {
    const BASE_URL = window.BASE_URL || 'http://localhost:3000';
    console.log('[UserChat] Conectando a Socket.IO:', BASE_URL);
    
    this.socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    this.socket.on('connect', () => {
      console.log('[UserChat]  Conectado a Socket.IO');
      this.isConnected = true;
      this.authenticate();
      this.loadConversation();
    });
    
    this.socket.on('authenticated', (data) => {
      console.log('[UserChat]  Autenticado:', data);
    });
    
    this.socket.on('new_message', (data) => {
      console.log('[UserChat] Nuevo mensaje recibido:', data);
      this.addMessageToUI(data);
      this.playSound();
    });
    
    this.socket.on('user_typing', (data) => {
      this.showTypingIndicator(data.nombre, data.isTyping);
    });
    
    this.socket.on('messages_read', () => {
      console.log('[UserChat] Mensajes marcados como leídos');
    });
    
    this.socket.on('conversation_closed', () => {
      console.log('[UserChat] Conversación cerrada por admin');
      this.activeConversation = null;
      this.messages = [];
      this.renderMessages();
    });
    
    this.socket.on('disconnect', () => {
      console.log('[UserChat] Desconectado de Socket.IO');
      this.isConnected = false;
    });
    
    this.socket.on('error', (error) => {
      console.error('[UserChat] Error Socket.IO:', error);
    });
  }
  
  authenticate() {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('auth', {
      tipo: this.userType,
      id_usuario: this.userInfo.id_usuario,
      nombre: this.userInfo.nombre
    });
  }
  
  async loadConversation() {
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/mi-conversacion?tipo_usuario=${this.userType}&id_usuario=${this.userInfo.id_usuario}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        this.activeConversation = result.data.conversacion;
        this.messages = result.data.mensajes || [];
        
        if (this.activeConversation) {
          this.socket.emit('join_conversation', {
            id_conversacion: this.activeConversation.id_conversacion
          });
        }
        
        this.renderMessages();
      }
    } catch (error) {
      console.error('[UserChat] Error cargando conversación:', error);
    }
  }
  
  initializeUI() {
    const chatContainer = document.getElementById('userChatContainer');
    if (!chatContainer) {
      console.error('[UserChat] No se encontró #userChatContainer');
      return;
    }
    
    chatContainer.innerHTML = `
      <div class="user-chat-wrapper">
        <div class="user-chat-header">
          <i data-lucide="message-square"></i>
          <div>
            <h3>Soporte CEMI</h3>
            <span class="user-chat-status">En línea</span>
          </div>
        </div>
        
        <div class="user-chat-messages" id="userChatMessages">
          <div class="user-chat-empty">
            <i data-lucide="message-circle"></i>
            <p>Escribe un mensaje para iniciar</p>
          </div>
        </div>
        
        <div class="user-chat-input">
          <input type="text" id="userChatInput" placeholder="Escribe tu mensaje..." maxlength="1000">
          <button onclick="window.userChat.sendMessage()">
            <i data-lucide="send"></i>
          </button>
        </div>
      </div>
    `;
    
    const input = document.getElementById('userChatInput');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  
  renderMessages() {
    const container = document.getElementById('userChatMessages');
    if (!container) return;
    
    if (this.messages.length === 0) {
      container.innerHTML = `
        <div class="user-chat-empty">
          <i data-lucide="message-circle"></i>
          <p>Escribe un mensaje para iniciar</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }
    
    container.innerHTML = this.messages.map(msg => {
      const isMine = msg.tipo_remitente === this.userType;
      const time = new Date(msg.fecha_envio).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div class="user-chat-message ${isMine ? 'mine' : 'theirs'}">
          <div class="message-bubble">
            <div class="message-sender">${msg.nombre_remitente}</div>
            <div class="message-text">${this.escapeHtml(msg.mensaje)}</div>
            <div class="message-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');
    
    this.scrollToBottom();
  }
  
  addMessageToUI(data) {
    this.messages.push(data);
    this.renderMessages();
  }
  
  async sendMessage() {
    const input = document.getElementById('userChatInput');
    const mensaje = input?.value.trim();
    
    if (!mensaje) return;
    
    if (!this.activeConversation) {
      await this.startNewConversation(mensaje);
    } else {
      await this.sendExistingMessage(mensaje);
    }
    
    input.value = '';
  }
  
  async startNewConversation(mensaje) {
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/conversacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo_usuario: this.userType,
          id_usuario: this.userInfo.id_usuario,
          nombre_invitado: this.userInfo.nombre
        })
      });
      
      const result = await response.json();
      if (result.success) {
        this.activeConversation = { id_conversacion: result.data.id_conversacion };
        
        this.socket.emit('join_conversation', {
          id_conversacion: this.activeConversation.id_conversacion
        });
        
        await this.sendExistingMessage(mensaje);
      }
    } catch (error) {
      console.error('[UserChat] Error creando conversación:', error);
    }
  }
  
  async sendExistingMessage(mensaje) {
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/mensaje`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_conversacion: this.activeConversation.id_conversacion,
          tipo_remitente: this.userType,
          id_remitente: this.userInfo.id_usuario,
          nombre_remitente: this.userInfo.nombre,
          mensaje
        })
      });
      
      const result = await response.json();
      if (result.success) {
        const messageData = {
          id_mensaje: result.data.id_mensaje,
          id_conversacion: this.activeConversation.id_conversacion,
          tipo_remitente: this.userType,
          id_remitente: this.userInfo.id_usuario,
          nombre_remitente: this.userInfo.nombre,
          mensaje,
          fecha_envio: new Date().toISOString()
        };
        
        this.addMessageToUI(messageData);
        
        this.socket.emit('message', messageData);
      }
    } catch (error) {
      console.error('[UserChat] Error enviando mensaje:', error);
    }
  }
  
  showTypingIndicator(nombre, isTyping) {
    const container = document.getElementById('userChatMessages');
    if (!container) return;
    
    const existing = container.querySelector('.typing-indicator');
    if (existing) existing.remove();
    
    if (isTyping) {
      const indicator = document.createElement('div');
      indicator.className = 'typing-indicator';
      indicator.innerHTML = `<span>${nombre} está escribiendo...</span>`;
      container.appendChild(indicator);
      this.scrollToBottom();
    }
  }
  
  playSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ0fPTfC0GGmm98OKZSw0PUqzn7rZgHQU2jdXzzn0vBSF+zPLaizsKFGS57OubUBELTKXh8bllHgU7k9n01oIwBh1vwvDnnk4OD1Ov6O+2Yh0FN5HY8tGAMQYfcsXw8adPEgw=');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('[UserChat] No se pudo reproducir sonido:', e));
    } catch (error) {
      console.log('[UserChat] Error reproduciendo sonido:', error);
    }
  }
  
  scrollToBottom() {
    const container = document.getElementById('userChatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

window.UserChat = UserChat;



