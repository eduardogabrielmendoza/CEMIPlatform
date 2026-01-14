(function() {
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  const BASE_URL = isProduction 
    ? window.location.origin
    : 'http://localhost:3000';

  const WS_URL = isProduction
    ? `wss://${window.location.host}`
    : 'ws://localhost:3000';

  window.API_URL = `${BASE_URL}/api`;
  window.BASE_URL = BASE_URL;
  window.WS_URL = WS_URL;

  window.getAuthToken = function() {
    return localStorage.getItem('token');
  };

  window.setAuthToken = function(token) {
    localStorage.setItem('token', token);
  };

  window.removeAuthToken = function() {
    localStorage.removeItem('token');
  };

  const originalFetch = window.fetch;
  window.fetch = async function(url, options = {}) {
    const urlStr = typeof url === 'string' ? url : url.toString();
    const isApiCall = urlStr.includes('/api/');
    const isPublicRoute = urlStr.includes('/api/auth/login') || 
                          urlStr.includes('/api/auth/register') || 
                          urlStr.includes('/api/auth/forgot-password') ||
                          urlStr.includes('/api/gdpr/') ||
                          urlStr.includes('/api/investigacion/') ||
                          urlStr.includes('/api/comunidad/preguntas') ||
                          (urlStr.includes('/api/status') && (!options.method || options.method === 'GET'));
    
    if (isApiCall && !isPublicRoute) {
      const token = localStorage.getItem('token');
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        };
      }
    }
    
    const response = await originalFetch(url, options);
    
    if (response.status === 401 && isApiCall && !isPublicRoute) {
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        if (data.expired) {
          localStorage.clear();
          window.location.href = '/login.html?session=expired';
          return response;
        }
      } catch (e) {}
    }
    
    return response;
  };

  console.log('Configuracion:', {
    isProduction,
    BASE_URL,
    API_URL: window.API_URL,
    WS_URL,
    hostname: window.location.hostname
  });
})();



