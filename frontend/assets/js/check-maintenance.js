
(async function checkSystemMaintenance() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  console.log('[check-maintenance] Página actual:', currentPage);
  
  const fullyExcludedPages = [
    'login-admin.html',
    'mantenimiento.html'
  ];

  const blockablePages = [
    'login.html',
    'register.html',
    'classroom-login.html'
  ];

  if (fullyExcludedPages.includes(currentPage)) {
    console.log('[check-maintenance] Página excluida, no se verifica');
    return;
  }

  try {
    const baseUrl = typeof BASE_URL !== 'undefined' ? BASE_URL : '';
    
    console.log('[check-maintenance] Verificando estado en:', `${baseUrl}/api/status`);
    
    const response = await fetch(`${baseUrl}/api/status`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      console.warn('[check-maintenance] Error en respuesta:', response.status);
      return;
    }

    const data = await response.json();
    const status = data.global_status;
    
    console.log('[check-maintenance] Estado del sistema:', status);
    console.log('[check-maintenance] Es página bloqueable:', blockablePages.includes(currentPage));

    if (status === 'operational') {
      console.log('[check-maintenance] Sistema operacional, acceso permitido');
      return;
    }

    const blockedStatuses = ['maintenance', 'outage'];

    if (blockablePages.includes(currentPage) && blockedStatuses.includes(status)) {
      console.log('[check-maintenance] BLOQUEANDO ACCESO - Redirigiendo a mantenimiento.html');
      window.location.href = 'mantenimiento.html';
      document.documentElement.innerHTML = '<h1 style="text-align:center;margin-top:50px;">Redirigiendo...</h1>';
      return;
    }

    if (status === 'degraded' || blockedStatuses.includes(status)) {
      console.log('[check-maintenance] Mostrando banner de advertencia');
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => showStatusBanner(status, data.active_incident));
      } else {
        showStatusBanner(status, data.active_incident);
      }
    }

  } catch (error) {
    console.warn('[check-maintenance] Error:', error.message);
  }
})();

function showStatusBanner(status, incident) {
  if (document.getElementById('system-status-banner')) {
    return;
  }

  if (!document.body) {
    console.warn('[check-maintenance] Body no existe aún, esperando...');
    setTimeout(() => showStatusBanner(status, incident), 100);
    return;
  }

  const statusConfig = {
    degraded: {
      bgColor: '#fef3c7',
      borderColor: '#f59e0b',
      textColor: '#92400e',
      icon: '️',
      title: 'Rendimiento Reducido',
      defaultMessage: 'Algunos servicios pueden estar experimentando lentitud.'
    },
    maintenance: {
      bgColor: '#dbeafe',
      borderColor: '#4a5259',
      textColor: '#1e40af',
      icon: '',
      title: 'Mantenimiento en Curso',
      defaultMessage: 'Estamos realizando mejoras en el sistema.'
    },
    outage: {
      bgColor: '#fee2e2',
      borderColor: '#ef4444',
      textColor: '#991b1b',
      icon: '',
      title: 'Interrupción del Servicio',
      defaultMessage: 'Estamos trabajando para restaurar el servicio.'
    }
  };

  const config = statusConfig[status] || statusConfig.degraded;
  const message = incident?.description || config.defaultMessage;

  const banner = document.createElement('div');
  banner.id = 'system-status-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 99999;
    background: ${config.bgColor};
    border-bottom: 3px solid ${config.borderColor};
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    font-family: 'Poppins', sans-serif;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    animation: slideDown 0.3s ease-out;
  `;

  banner.innerHTML = `
    <style>
      @keyframes slideDown {
        from { transform: translateY(-100%); }
        to { transform: translateY(0); }
      }
      #system-status-banner .banner-content {
        display: flex;
        align-items: center;
        gap: 10px;
        max-width: 1200px;
        width: 100%;
        justify-content: center;
      }
      #system-status-banner .banner-icon {
        font-size: 1.2rem;
      }
      #system-status-banner .banner-text {
        color: ${config.textColor};
        font-size: 0.9rem;
        font-family: Inter, sans-serif;
      }
      #system-status-banner .banner-title {
        font-weight: 600;
        margin-right: 5px;
      }
      #system-status-banner .banner-close {
        position: absolute;
        right: 15px;
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        color: ${config.textColor};
        opacity: 0.7;
        transition: opacity 0.2s;
      }
      #system-status-banner .banner-close:hover {
        opacity: 1;
      }
    </style>
    <div class="banner-content">
      <span class="banner-icon">${config.icon}</span>
      <span class="banner-text">
        <span class="banner-title">${config.title}:</span>
        ${message}
      </span>
    </div>
    <button class="banner-close" onclick="this.parentElement.remove(); document.body.style.paddingTop = '0';" title="Cerrar">×</button>
  `;

  document.body.insertBefore(banner, document.body.firstChild);
  
  document.body.style.paddingTop = (banner.offsetHeight) + 'px';
}




