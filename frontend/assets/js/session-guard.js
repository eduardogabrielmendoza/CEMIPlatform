(function() {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  
  if (!token || !rol) {
    window.location.replace('index.html');
    return;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp <= now) {
      localStorage.clear();
      window.location.replace('index.html');
      return;
    }
  } catch (e) {
    localStorage.clear();
    window.location.replace('index.html');
    return;
  }
  
  const path = window.location.pathname.toLowerCase();
  const rolLower = rol.toLowerCase();
  
  if (path.includes('dashboard_admin') && rolLower !== 'admin' && rolLower !== 'administrador') {
    window.location.replace('index.html');
    return;
  }
  
  if (path.includes('dashboard_profesor') && rolLower !== 'profesor') {
    window.location.replace('index.html');
    return;
  }
  
  if (path.includes('dashboard_alumno') && rolLower !== 'alumno') {
    window.location.replace('index.html');
    return;
  }
})();
