
(function() {
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return;
  }

  if (window.location.port !== '8080') {
    console.log('ℹ️ Hot-reload desactivado (no estás en dev server)');
    return;
  }

  console.log('%c HOT-RELOAD ACTIVADO', 'color: #ff6b6b; font-size: 14px; font-weight: bold;');
  console.log('%cLos cambios en archivos se reflejarán automáticamente', 'color: #4ecdc4; font-size: 12px;');

  let ws;
  let reconnectInterval;
  let isReloading = false;

  function connect() {
    ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
      console.log('%c Conectado al dev server', 'color: #95e1d3; font-weight: bold;');
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    };

    ws.onmessage = (event) => {
      if (isReloading) return;

      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'reload') {
          isReloading = true;
          console.log(`%c Archivo modificado: ${data.file}`, 'color: #ffd93d; font-weight: bold;');
          console.log(`%c Recargando página...`, 'color: #6bcf7f; font-weight: bold;');
          
          setTimeout(() => {
            location.reload();
          }, 200);
        }
      } catch (error) {
        console.error('Error al procesar mensaje:', error);
      }
    };

    ws.onerror = (error) => {
      console.warn('️ Error en WebSocket:', error.message);
    };

    ws.onclose = () => {
      console.log('%c Desconectado del dev server', 'color: #ff6b6b;');
      console.log('Intentando reconectar...');
      
      if (!reconnectInterval) {
        reconnectInterval = setInterval(() => {
          console.log(' Intentando reconectar...');
          connect();
        }, 2000);
      }
    };
  }

  connect();

  window.addEventListener('beforeunload', () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
    if (reconnectInterval) {
      clearInterval(reconnectInterval);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'R') {
      e.preventDefault();
      console.log('%c Recarga forzada', 'color: #ff6b6b; font-weight: bold;');
      location.reload(true);
    }
  });


})();



