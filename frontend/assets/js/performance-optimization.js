
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => imageObserver.observe(img));
}

function virtualizeTable(tableId, rowHeight = 50, visibleRows = 20) {
  const table = document.getElementById(tableId);
  if (!table) return;

  const tbody = table.querySelector('tbody');
  if (!tbody) return;

  const allRows = Array.from(tbody.querySelectorAll('tr'));
  const totalRows = allRows.length;

  if (totalRows <= visibleRows) return; // No need to virtualize

  const container = document.createElement('div');
  container.style.height = `${totalRows * rowHeight}px`;
  container.style.position = 'relative';

  const viewport = document.createElement('div');
  viewport.style.overflow = 'auto';
  viewport.style.height = `${visibleRows * rowHeight}px`;

  table.parentNode.insertBefore(viewport, table);
  viewport.appendChild(container);
  container.appendChild(table);

  table.style.position = 'absolute';
  table.style.top = '0';

  const updateVisibleRows = throttle(() => {
    const scrollTop = viewport.scrollTop;
    const startIndex = Math.floor(scrollTop / rowHeight);
    const endIndex = Math.min(startIndex + visibleRows + 5, totalRows);

    tbody.innerHTML = '';
    for (let i = startIndex; i < endIndex; i++) {
      tbody.appendChild(allRows[i].cloneNode(true));
    }

    table.style.transform = `translateY(${startIndex * rowHeight}px)`;
  }, 100);

  viewport.addEventListener('scroll', updateVisibleRows);
  updateVisibleRows();
}

const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function cachedFetch(url, options = {}) {
  const cacheKey = url + JSON.stringify(options);
  const cached = apiCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return Promise.resolve(cached.data);
  }

  return fetch(url, options)
    .then(response => response.json())
    .then(data => {
      apiCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      return data;
    });
}

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of apiCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      apiCache.delete(key);
    }
  }
}, CACHE_DURATION);

function optimizeAnimations() {
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    document.documentElement.style.setProperty('--animation-duration', '0.15s');
    document.documentElement.style.setProperty('--transition-duration', '0.15s');
  } else {
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
    document.documentElement.style.setProperty('--transition-duration', '0.3s');
  }
}

function detectSlowConnection() {
  if ('connection' in navigator) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const slowConnection = connection.effectiveType === 'slow-2g' || 
                            connection.effectiveType === '2g' ||
                            connection.saveData;
      
      if (slowConnection) {
        console.warn('️ Conexión lenta detectada. Activando modo de bajo consumo.');
        document.body.classList.add('low-bandwidth');
        
        document.querySelectorAll('[style*="background-image"]').forEach(el => {
          el.style.backgroundImage = 'none';
        });
      }
    }
  }
}

function initMobileMenu() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const sidebar = document.querySelector('.sidebar');
  
  if (!menuToggle || !sidebar) return;

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('active');
    
    if (sidebar.classList.contains('active')) {
      const overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999;
        opacity: 0;
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(overlay);
      
      setTimeout(() => overlay.style.opacity = '1', 10);
      
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      });
    } else {
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      }
    }
  });

  sidebar.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      sidebar.classList.remove('active');
      const overlay = document.querySelector('.sidebar-overlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
      }
    });
  });
}

function optimizeLargeForms() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, select, textarea');
    
    if (inputs.length > 10) {
      inputs.forEach(input => {
        const originalValidation = input.oninput;
        if (originalValidation) {
          input.oninput = debounce(originalValidation, 300);
        }
      });
    }
  });
}

function batchDOMUpdates(updates) {
  requestAnimationFrame(() => {
    updates.forEach(update => update());
  });
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log(' Service Worker registrado:', registration);
      })
      .catch(error => {
        console.log(' Error al registrar Service Worker:', error);
      });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  console.log(' Inicializando optimizaciones de performance...');
  
  optimizeAnimations();
  detectSlowConnection();
  initMobileMenu();
  lazyLoadImages();
  optimizeLargeForms();
  
  window.addEventListener('resize', debounce(() => {
    optimizeAnimations();
  }, 250));
  
  console.log(' Optimizaciones cargadas');
});

window.performanceUtils = {
  debounce,
  throttle,
  cachedFetch,
  batchDOMUpdates,
  virtualizeTable,
  lazyLoadImages
};

