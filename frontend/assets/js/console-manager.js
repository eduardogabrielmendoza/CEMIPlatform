/**
 * Sistema de gestión de consola
 * Oculta todos los mensajes de consola en producción
 * Solo muestra logs cuando se accede desde localhost (desarrollo)
 */

(function() {
  'use strict';
  
  // Detectar si estamos en modo desarrollo
  const isDevelopment = 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '' ||
    window.location.search.includes('debug=true'); // Activar con ?debug=true
  
  // Si NO estamos en desarrollo, deshabilitar todos los console
  if (!isDevelopment) {
    // Guardar las funciones originales por si las necesitamos
    const originalConsole = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      error: console.error,
      debug: console.debug,
      trace: console.trace
    };
    
    // Deshabilitar console.log, info, warn, debug, trace
    console.log = function() {};
    console.info = function() {};
    console.warn = function() {};
    console.debug = function() {};
    console.trace = function() {};
    
    // Mantener console.error pero silencioso (opcional: enviarlo al servidor)
    console.error = function(...args) {
      // En producción, los errores no se muestran al usuario
      // Pero podrías enviarlos a un servicio de logging si quisieras
      // originalConsole.error('[Error capturado]', ...args);
    };
    
    // Mensaje único para confirmar que la consola está limpia
    originalConsole.log(
      '%c🔒 Consola en modo producción',
      'color: #4a5259; font-weight: bold; font-size: 12px; padding: 4px 8px; background: #f0f4ff; border-radius: 4px;'
    );
    
    // Mensaje de cómo activar modo debug
    originalConsole.log(
      '%cPara desarrolladores: Agrega ?debug=true a la URL para ver logs',
      'color: #999; font-size: 10px;'
    );
  } else {
    // En desarrollo, mostrar que estamos en modo debug
    console.log(
      '%c🔧 Modo Desarrollador Activo',
      'color: #10b981; font-weight: bold; font-size: 14px; padding: 6px 12px; background: #f0fdf4; border-radius: 6px; border: 2px solid #10b981;'
    );
    console.log(
      '%cTodos los logs están habilitados',
      'color: #059669; font-size: 12px;'
    );
  }
})();
