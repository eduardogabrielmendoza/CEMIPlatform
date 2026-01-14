class AdminChat {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.conversations = [];
    this.activeConversation = null;
    this.messages = [];
    this.adminInfo = this.loadAdminInfo();
    
    this.initializeUI();
    this.connectSocketIO();
  }
  
  loadAdminInfo() {
    return {
      id_usuario: localStorage.getItem('id_usuario'),
      nombre: localStorage.getItem('nombre') || 'Admin',
      tipo: 'admin'
    };
  }
  
  connectSocketIO() {
    const BASE_URL = window.BASE_URL || 'http://localhost:3000';
    console.log('[AdminChat] Conectando a Socket.IO:', BASE_URL);
    
    this.socket = io(BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });
    
    this.socket.on('connect', () => {
      console.log('[AdminChat]  Conectado a Socket.IO');
      this.isConnected = true;
      this.authenticate();
      this.loadConversations();
    });
    
    this.socket.on('authenticated', (data) => {
      console.log('[AdminChat]  Autenticado:', data);
    });
    
    this.socket.on('new_message', (data) => {
      console.log('[AdminChat] Nuevo mensaje:', data);
      this.handleNewMessage(data);
    });
    
    this.socket.on('conversation_update', () => {
      this.loadConversations();
    });
    
    this.socket.on('disconnect', () => {
      console.log('[AdminChat] Desconectado');
      this.isConnected = false;
    });
  }
  
  authenticate() {
    if (!this.socket || !this.isConnected) return;
    
    this.socket.emit('auth', {
      tipo: 'admin',
      id_usuario: this.adminInfo.id_usuario,
      nombre: this.adminInfo.nombre
    });
  }
  
  async loadConversations() {
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/conversaciones`);
      const result = await response.json();
      
      if (result.success) {
        this.conversations = result.data || [];
        this.renderConversationsList();
      }
    } catch (error) {
      console.error('[AdminChat] Error cargando conversaciones:', error);
    }
  }
  
  initializeUI() {
    const chatContainer = document.getElementById('chatContainer');
    if (!chatContainer) return;
    
    chatContainer.innerHTML = `
      <div class="admin-chat-wrapper">
        <div class="admin-chat-sidebar">
          <div class="admin-chat-sidebar-header">
            <h3>Conversaciones</h3>
            <span class="badge" id="adminChatBadge" style="display:none;">0</span>
          </div>
          <div class="admin-chat-conversations" id="adminConversationsList">
            <div class="admin-chat-empty">
              <i data-lucide="inbox"></i>
              <p>No hay conversaciones</p>
            </div>
          </div>
        </div>
        
        <div class="admin-chat-main">
          <div class="admin-chat-header" id="adminChatHeader" style="display:none;">
            <div>
              <h3 id="adminChatHeaderName">Usuario</h3>
              <span id="adminChatHeaderStatus">En línea</span>
            </div>
            <button onclick="window.adminChat.closeConversation()" title="Cerrar conversación">
              <i data-lucide="x-circle"></i>
            </button>
          </div>
          
          <div class="admin-chat-messages" id="adminChatMessages">
            <div class="admin-chat-empty">
              <i data-lucide="message-square"></i>
              <p>Selecciona una conversación</p>
            </div>
          </div>
          
          <div class="admin-chat-input" id="adminChatInput" style="display:none;">
            <input type="text" id="adminChatInputField" placeholder="Escribe tu respuesta..." maxlength="1000">
            <button onclick="window.adminChat.sendMessage()">
              <i data-lucide="send"></i>
            </button>
          </div>
        </div>
      </div>
    `;
    
    const input = document.getElementById('adminChatInputField');
    if (input) {
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') this.sendMessage();
      });
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  
  renderConversationsList() {
    const container = document.getElementById('adminConversationsList');
    if (!container) return;
    
    if (this.conversations.length === 0) {
      container.innerHTML = `
        <div class="admin-chat-empty">
          <i data-lucide="inbox"></i>
          <p>No hay conversaciones</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }
    
    const unreadCount = this.conversations.filter(c => c.mensajes_no_leidos_admin > 0).reduce((sum, c) => sum + c.mensajes_no_leidos_admin, 0);
    this.updateBadge(unreadCount);
    
    container.innerHTML = this.conversations.map(conv => {
      const isActive = this.activeConversation && this.activeConversation.id_conversacion === conv.id_conversacion;
      const nombre = conv.nombre_invitado || conv.nombre_usuario || 'Usuario';
      const time = this.formatTime(conv.fecha_ultimo_mensaje || conv.fecha_inicio);
      const preview = conv.ultimo_mensaje || 'Sin mensajes';
      const unread = conv.mensajes_no_leidos_admin > 0 ? `<span class="unread-badge">${conv.mensajes_no_leidos_admin}</span>` : '';
      
      return `
        <div class="admin-conversation-item ${isActive ? 'active' : ''}" onclick="window.adminChat.selectConversation(${conv.id_conversacion})">
          <div class="conv-avatar">${nombre.charAt(0).toUpperCase()}</div>
          <div class="conv-info">
            <div class="conv-header">
              <span class="conv-name">${this.escapeHtml(nombre)}</span>
              <span class="conv-time">${time}</span>
            </div>
            <div class="conv-preview">${this.escapeHtml(preview)}</div>
            <div class="conv-footer">
              <span class="conv-status ${conv.estado}">${conv.estado}</span>
              ${unread}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }
  
  async selectConversation(id) {
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/conversacion/${id}`);
      const result = await response.json();
      
      if (result.success) {
        this.activeConversation = result.data.conversacion;
        this.messages = result.data.mensajes || [];
        
        this.socket.emit('join_conversation', {
          id_conversacion: id
        });
        
        if (this.activeConversation.estado === 'pendiente') {
          await this.takeConversation(id);
        }
        
        await this.markAsRead(id);
        
        this.renderMessages();
        this.renderConversationsList();
        
        document.getElementById('adminChatHeader').style.display = 'flex';
        document.getElementById('adminChatInput').style.display = 'flex';
        document.getElementById('adminChatHeaderName').textContent = this.activeConversation.nombre_invitado || 'Usuario';
      }
    } catch (error) {
      console.error('[AdminChat] Error seleccionando conversación:', error);
    }
  }
  
  renderMessages() {
    const container = document.getElementById('adminChatMessages');
    if (!container) return;
    
    if (this.messages.length === 0) {
      container.innerHTML = `
        <div class="admin-chat-empty">
          <i data-lucide="message-square"></i>
          <p>No hay mensajes</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }
    
    container.innerHTML = this.messages.map(msg => {
      const isMine = msg.tipo_remitente === 'admin';
      const time = new Date(msg.fecha_envio).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
      
      return `
        <div class="admin-chat-message ${isMine ? 'mine' : 'theirs'}">
          <div class="message-bubble">
            <div class="message-sender">${this.escapeHtml(msg.nombre_remitente)}</div>
            <div class="message-text">${this.escapeHtml(msg.mensaje)}</div>
            <div class="message-time">${time}</div>
          </div>
        </div>
      `;
    }).join('');
    
    this.scrollToBottom();
  }
  
  handleNewMessage(data) {
    const isActiveConversation = this.activeConversation && this.activeConversation.id_conversacion === data.id_conversacion;
    
    if (isActiveConversation) {
      this.messages.push(data);
      this.renderMessages();
      this.playSound();
    }
    
    this.loadConversations();
  }
  
  async sendMessage() {
    const input = document.getElementById('adminChatInputField');
    const mensaje = input?.value.trim();
    
    if (!mensaje || !this.activeConversation) return;
    
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_URL}/chat/mensaje`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_conversacion: this.activeConversation.id_conversacion,
          tipo_remitente: 'admin',
          id_remitente: this.adminInfo.id_usuario,
          nombre_remitente: this.adminInfo.nombre,
          mensaje
        })
      });
      
      const result = await response.json();
      if (result.success) {
        const messageData = {
          id_mensaje: result.data.id_mensaje,
          id_conversacion: this.activeConversation.id_conversacion,
          tipo_remitente: 'admin',
          id_remitente: this.adminInfo.id_usuario,
          nombre_remitente: this.adminInfo.nombre,
          mensaje,
          fecha_envio: new Date().toISOString()
        };
        
        this.messages.push(messageData);
        this.renderMessages();
        
        this.socket.emit('message', messageData);
        
        input.value = '';
      }
    } catch (error) {
      console.error('[AdminChat] Error enviando mensaje:', error);
    }
  }
  
  async takeConversation(id) {
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      await fetch(`${API_URL}/chat/conversacion/${id}/tomar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_admin: this.adminInfo.id_usuario })
      });
      
      this.socket.emit('take_conversation', {
        id_conversacion: id,
        admin_nombre: this.adminInfo.nombre
      });
    } catch (error) {
      console.error('[AdminChat] Error tomando conversación:', error);
    }
  }
  
  async closeConversation() {
    if (!this.activeConversation) return;
    
    const confirmed = confirm('¿Cerrar y eliminar esta conversación?');
    if (!confirmed) return;
    
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      await fetch(`${API_URL}/chat/conversacion/${this.activeConversation.id_conversacion}`, {
        method: 'DELETE'
      });
      
      this.socket.emit('close_conversation', {
        id_conversacion: this.activeConversation.id_conversacion
      });
      
      this.activeConversation = null;
      this.messages = [];
      
      document.getElementById('adminChatHeader').style.display = 'none';
      document.getElementById('adminChatInput').style.display = 'none';
      
      const messagesContainer = document.getElementById('adminChatMessages');
      messagesContainer.innerHTML = `
        <div class="admin-chat-empty">
          <i data-lucide="message-square"></i>
          <p>Selecciona una conversación</p>
        </div>
      `;
      
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      this.loadConversations();
    } catch (error) {
      console.error('[AdminChat] Error cerrando conversación:', error);
    }
  }
  
  async markAsRead(id) {
    try {
      const API_URL = window.API_URL || 'http://localhost:3000/api';
      await fetch(`${API_URL}/chat/conversacion/${id}/leer`, {
        method: 'PATCH'
      });
      
      this.socket.emit('read', { id_conversacion: id });
    } catch (error) {
      console.error('[AdminChat] Error marcando como leído:', error);
    }
  }
  
  updateBadge(count) {
    const badge = document.getElementById('adminChatBadge');
    if (!badge) return;
    
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : count;
      badge.style.display = 'block';
    } else {
      badge.style.display = 'none';
    }
  }
  
  playSound() {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ0fPTfC0GGmm98OKZSw0PUqzn7rZgHQU2jdXzzn0vBSF+zPLaizsKFGS57OubUBELTKXh8bllHgU7k9n01oIwBh1vwvDnnk4OD1Ov6O+2Yh0FN5HY8tGAMQYfcsXw8adPEgw=');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('[AdminChat] No se pudo reproducir sonido:', e));
    } catch (error) {
      console.log('[AdminChat] Error reproduciendo sonido:', error);
    }
  }
  
  scrollToBottom() {
    const container = document.getElementById('adminChatMessages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
  
  formatTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

window.AdminChat = AdminChat;



