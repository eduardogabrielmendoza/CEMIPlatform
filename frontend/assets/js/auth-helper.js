const AuthHelper = {
  getToken() {
    return localStorage.getItem('token');
  },

  setToken(token) {
    localStorage.setItem('token', token);
  },

  removeToken() {
    localStorage.removeItem('token');
  },

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch (e) {
      return false;
    }
  },

  getTokenPayload() {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  },

  getHeaders() {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  },

  async fetch(url, options = {}) {
    const defaultOptions = {
      headers: this.getHeaders()
    };

    if (options.headers) {
      options.headers = { ...defaultOptions.headers, ...options.headers };
    }

    const mergedOptions = { ...defaultOptions, ...options };
    
    if (mergedOptions.body && typeof mergedOptions.body === 'object' && !(mergedOptions.body instanceof FormData)) {
      mergedOptions.body = JSON.stringify(mergedOptions.body);
    }

    if (mergedOptions.body instanceof FormData) {
      delete mergedOptions.headers['Content-Type'];
    }

    try {
      const response = await fetch(url, mergedOptions);
      
      if (response.status === 401) {
        const data = await response.json().catch(() => ({}));
        if (data.expired) {
          this.handleTokenExpired();
          return response;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error en peticion:', error);
      throw error;
    }
  },

  handleTokenExpired() {
    this.clearSession();
    
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        icon: 'warning',
        title: 'Sesion Expirada',
        text: 'Tu sesion ha expirado. Por favor inicia sesion nuevamente.',
        confirmButtonText: 'Ir al Login',
        allowOutsideClick: false
      }).then(() => {
        this.redirectToLogin();
      });
    } else {
      alert('Tu sesion ha expirado. Por favor inicia sesion nuevamente.');
      this.redirectToLogin();
    }
  },

  redirectToLogin() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('classroom')) {
      window.location.href = 'classroom-login.html';
    } else if (currentPath.includes('dashboard')) {
      window.location.href = 'login.html';
    } else {
      window.location.href = 'login.html';
    }
  },

  clearSession() {
    localStorage.removeItem('token');
    localStorage.removeItem('id_usuario');
    localStorage.removeItem('id_persona');
    localStorage.removeItem('rol');
    localStorage.removeItem('nombre');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    localStorage.removeItem('id_alumno');
    localStorage.removeItem('id_profesor');
    localStorage.removeItem('id_administrador');
  },

  saveLoginData(data) {
    if (data.token) {
      this.setToken(data.token);
    }
    if (data.id_usuario) localStorage.setItem('id_usuario', data.id_usuario);
    if (data.id_persona) localStorage.setItem('id_persona', data.id_persona);
    if (data.rol) localStorage.setItem('rol', data.rol);
    if (data.nombre) localStorage.setItem('nombre', data.nombre);
    if (data.username) localStorage.setItem('username', data.username);
    if (data.avatar) localStorage.setItem('avatar', data.avatar);
    if (data.id_alumno) localStorage.setItem('id_alumno', data.id_alumno);
    if (data.id_profesor) localStorage.setItem('id_profesor', data.id_profesor);
    if (data.id_administrador) localStorage.setItem('id_administrador', data.id_administrador);
  },

  checkAuth() {
    if (!this.isAuthenticated()) {
      this.clearSession();
      this.redirectToLogin();
      return false;
    }
    return true;
  }
};

window.AuthHelper = AuthHelper;
