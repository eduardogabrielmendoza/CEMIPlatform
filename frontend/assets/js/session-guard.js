(function() {
  const token = localStorage.getItem('token');
  const rol = localStorage.getItem('rol');
  
  if (!token || !rol) {
    window.location.replace('login.html?session=expired');
    return;
  }
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    if (payload.exp <= now) {
      const cp = localStorage.getItem('cemi_cookies_accepted');
      localStorage.clear();
      if (cp) localStorage.setItem('cemi_cookies_accepted', cp);
      window.location.replace('login.html?session=expired');
      return;
    }
  } catch (e) {
    const cp = localStorage.getItem('cemi_cookies_accepted');
    localStorage.clear();
    if (cp) localStorage.setItem('cemi_cookies_accepted', cp);
    window.location.replace('login.html?session=expired');
    return;
  }
  
  const path = window.location.pathname.toLowerCase();
  const rolLower = rol.toLowerCase();
  
  if (path.includes('dashboard_admin') && rolLower !== 'admin' && rolLower !== 'administrador') {
    window.location.replace('login.html?session=expired');
    return;
  }
  
  if (path.includes('dashboard_profesor') && rolLower !== 'profesor') {
    window.location.replace('login.html?session=expired');
    return;
  }
  
  if (path.includes('dashboard_alumno') && rolLower !== 'alumno') {
    window.location.replace('login.html?session=expired');
    return;
  }
})();
