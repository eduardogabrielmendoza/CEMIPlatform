if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log(' Service Worker registrado:', registration.scope);
        
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log(' Nueva versión disponible');
              
              if (window.Swal) {
                Swal.fire({
                  title: 'Actualización Disponible',
                  text: '¿Deseas actualizar a la nueva versión?',
                  icon: 'info',
                  showCancelButton: true,
                  confirmButtonText: 'Actualizar',
                  cancelButtonText: 'Más tarde'
                }).then((result) => {
                  if (result.isConfirmed) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                });
              }
            }
          });
        });
      })
      .catch(error => {
        console.error(' Error al registrar Service Worker:', error);
      });
  });
}

let deferredPrompt;
const installButton = document.getElementById('installButton');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  
  if (installButton) {
    installButton.style.display = 'block';
  }
});

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}


async function installPWA() {
  if (!deferredPrompt) {
    console.log('No hay prompt de instalación disponible');
    return;
  }
  
  deferredPrompt.prompt();
  
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`);
  
  if (outcome === 'accepted') {
    const banner = document.getElementById('pwa-install-banner');
    if (banner) banner.remove();
    
    if (window.Swal) {
      Swal.fire({
        title: '¡Instalado!',
        text: 'La app se ha instalado correctamente',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }
  
  deferredPrompt = null;
  
  if (installButton) {
    installButton.style.display = 'none';
  }
}

window.addEventListener('appinstalled', () => {
  console.log(' PWA instalada exitosamente');
  deferredPrompt = null;
  
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.remove();
});

window.addEventListener('load', () => {
  if (!window.matchMedia('(display-mode: standalone)').matches) {
    console.log('App ejecutándose en navegador');
  }
});

if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log(' App ejecutándose como PWA instalada');
  document.body.classList.add('pwa-mode');
}



