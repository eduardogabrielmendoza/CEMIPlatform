(function() {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  
  if (!token || !rol) {
    window.location.replace('classroom-login.html');
    return;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp <= now) {
      localStorage.clear();
      window.location.replace('classroom-login.html');
      return;
    }
  } catch (e) {
    localStorage.clear();
    window.location.replace('classroom-login.html');
    return;
  }
  
  const rolLower = rol.toLowerCase();
  const rolesPermitidos = ['alumno', 'profesor', 'admin', 'administrador'];
  
  if (!rolesPermitidos.includes(rolLower)) {
    localStorage.clear();
    window.location.replace('classroom-login.html');
    return;
  }
})();
