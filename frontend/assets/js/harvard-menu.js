
document.addEventListener('DOMContentLoaded', function() {
  const header = document.querySelector('.harvard-header');
  const menuBtn = document.getElementById('harvardMenuBtn');
  const megaMenu = document.getElementById('harvardMegaMenu');
  const closeBtn = document.getElementById('megaMenuClose');
  const bgImage = document.getElementById('megaMenuBgImage');
  
  let lastScrollY = window.scrollY;
  let ticking = false;
  const scrollThreshold = 80; // Píxeles mínimos antes de ocultar
  const showThreshold = 200; // Mostrar header cuando estemos a menos de esto del inicio
  
  function handleScroll() {
    const currentScrollY = window.scrollY;
    
    if (megaMenu?.classList.contains('active')) {
      ticking = false;
      return;
    }
    
    if (currentScrollY < showThreshold) {
      header?.classList.remove('header-hidden');
      lastScrollY = currentScrollY;
      ticking = false;
      return;
    }
    
    if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
      header?.classList.add('header-hidden');
    }
    
    lastScrollY = currentScrollY;
    ticking = false;
  }
  
  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  }, { passive: true });
  
  const navItems = document.querySelectorAll('.mega-nav-item');
  const secondaryPanels = document.querySelectorAll('.mega-nav-secondary');
  const tertiaryPanels = document.querySelectorAll('.mega-nav-tertiary');
  
  let isMenuOpen = false;
  let activeNavItem = null;
  let activeSubLink = null;
  
  function preloadMenuImages() {
    const images = document.querySelectorAll('[data-image]');
    images.forEach(el => {
      const src = el.dataset.image;
      if (src && !bgImage.querySelector(`img[data-src="${src}"]`)) {
        const img = document.createElement('img');
        img.dataset.src = src;
        img.src = src;
        bgImage.appendChild(img);
      }
    });
  }

  // ========================================
  // BOTÓN VOLVER PARA SUBMENÚS MÓVILES
  // Definido antes de openMenu para disponibilidad
  // ========================================
  
  function createMobileBackButtons() {
    // Solo en móviles
    if (window.innerWidth > 767) return;
    
    const navPrimary = document.querySelector('.mega-nav-primary');
    
    // Eliminar botones existentes para evitar duplicación
    document.querySelectorAll('.mobile-back-btn').forEach(btn => btn.remove());
    
    // Agregar botón volver a paneles secundarios
    secondaryPanels.forEach(panel => {
      const backBtn = document.createElement('button');
      backBtn.className = 'mobile-back-btn';
      backBtn.type = 'button';
      backBtn.innerHTML = '<span class="back-arrow">←</span> Volver';
      backBtn.setAttribute('aria-label', 'Volver al menú principal');
      
      backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        panel.classList.remove('visible');
        
        const panelId = panel.id;
        const correspondingNavItem = document.querySelector(`.mega-nav-item[data-panel="${panelId}"]`);
        if (correspondingNavItem) {
          correspondingNavItem.classList.remove('active');
        }
        navPrimary?.classList.remove('has-active');
        activeNavItem = null;
      });
      
      panel.insertBefore(backBtn, panel.firstChild);
    });
    
    // Agregar botón volver a paneles terciarios
    tertiaryPanels.forEach(panel => {
      const backBtn = document.createElement('button');
      backBtn.className = 'mobile-back-btn';
      backBtn.type = 'button';
      backBtn.innerHTML = '<span class="back-arrow">←</span> Volver';
      backBtn.setAttribute('aria-label', 'Volver al submenu anterior');
      
      backBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        panel.classList.remove('visible');
        
        const panelId = panel.id;
        const correspondingSubLink = document.querySelector(`.mega-sub-link[data-tertiary="${panelId}"]`);
        if (correspondingSubLink) {
          correspondingSubLink.classList.remove('active');
        }
        activeSubLink = null;
      });
      
      panel.insertBefore(backBtn, panel.firstChild);
    });
    
    console.log('Mobile back buttons created');
  }

  function openMenu() {
    megaMenu.classList.add('active');
    header?.classList.add('menu-open');
    document.body.style.overflow = 'hidden';
    isMenuOpen = true;
    
    preloadMenuImages();
    
    // Crear botones de volver en móvil al abrir el menú
    setTimeout(() => {
      if (window.innerWidth <= 767) {
        createMobileBackButtons();
      }
    }, 50);
    
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 100);
  }

  function closeMenu() {
    megaMenu.classList.add('closing');
    
    setTimeout(() => {
      megaMenu.classList.remove('active');
      megaMenu.classList.remove('closing');
      header?.classList.remove('menu-open');
      document.body.style.overflow = '';
      isMenuOpen = false;
      
      resetMenuState();
    }, 350); // Duración de la animación de cierre
  }

  function resetMenuState() {
    secondaryPanels.forEach(panel => panel.classList.remove('visible'));
    tertiaryPanels.forEach(panel => panel.classList.remove('visible'));
    
    navItems.forEach(item => item.classList.remove('active'));
    document.querySelectorAll('.mega-sub-link').forEach(link => link.classList.remove('active'));
    document.querySelector('.mega-nav-primary')?.classList.remove('has-active');
    
    if (bgImage) {
      bgImage.classList.remove('visible');
    }
    
    activeNavItem = null;
    activeSubLink = null;
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', openMenu);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu();
    }
  });

  megaMenu?.addEventListener('click', function(e) {
    if (e.target === megaMenu || e.target.classList.contains('mega-menu-backdrop')) {
      closeMenu();
    }
  });

  const navPrimary = document.querySelector('.mega-nav-primary');
  
  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetPanel = this.dataset.panel;
      
      if (this.classList.contains('active')) {
        this.classList.remove('active');
        navPrimary?.classList.remove('has-active');
        hideSecondaryPanel(targetPanel);
        activeNavItem = null;
        return;
      }
      
      navItems.forEach(nav => nav.classList.remove('active'));
      
      this.classList.add('active');
      navPrimary?.classList.add('has-active');
      activeNavItem = this;
      
      showSecondaryPanel(targetPanel);
    });
  });

  function showSecondaryPanel(panelId) {
    secondaryPanels.forEach(panel => panel.classList.remove('visible'));
    tertiaryPanels.forEach(panel => panel.classList.remove('visible'));
    
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      targetPanel.classList.add('visible');
      
      const panelImage = targetPanel.dataset.image;
      if (panelImage) {
        showBackgroundImage(panelImage);
      } else {
        if (bgImage) {
          bgImage.classList.remove('visible');
        }
      }
    } else {
      if (bgImage) {
        bgImage.classList.remove('visible');
      }
    }
    
    document.querySelectorAll('.mega-sub-link').forEach(link => link.classList.remove('active'));
    activeSubLink = null;
  }

  function hideSecondaryPanel(panelId) {
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      targetPanel.classList.remove('visible');
    }
    
    tertiaryPanels.forEach(panel => panel.classList.remove('visible'));
    if (bgImage) {
      bgImage.classList.remove('visible');
    }
  }

  document.querySelectorAll('.mega-sub-link.has-children').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetTertiary = this.dataset.tertiary;
      const targetImage = this.dataset.image;
      
      if (this.classList.contains('active')) {
        this.classList.remove('active');
        hideTertiaryPanel(targetTertiary);
        hideBackgroundImage();
        activeSubLink = null;
        activeSubLinkImage = null;
        return;
      }
      
      document.querySelectorAll('.mega-sub-link').forEach(l => l.classList.remove('active'));
      
      document.querySelectorAll('.mega-tertiary-item.active').forEach(item => {
        item.classList.remove('active');
      });
      
      this.classList.add('active');
      activeSubLink = this;
      
      activeSubLinkImage = targetImage || null;
      
      showTertiaryPanel(targetTertiary);
      
      if (targetImage) {
        showBackgroundImage(targetImage);
      }
    });
  });

  function showTertiaryPanel(panelId) {
    tertiaryPanels.forEach(panel => panel.classList.remove('visible'));
    
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      targetPanel.classList.add('visible');
    }
  }

  function hideTertiaryPanel(panelId) {
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      targetPanel.classList.remove('visible');
    }
  }

  function showBackgroundImage(imageSrc) {
    if (bgImage) {
      let img = bgImage.querySelector(`img[data-src="${imageSrc}"]`);
      
      if (!img) {
        img = document.createElement('img');
        img.dataset.src = imageSrc;
        img.src = imageSrc;
        bgImage.appendChild(img);
      }
      
      bgImage.querySelectorAll('img').forEach(i => i.classList.remove('active'));
      
      img.classList.add('active');
      bgImage.classList.add('visible');
    }
  }

  function hideBackgroundImage() {
    if (bgImage) {
      bgImage.querySelectorAll('img').forEach(i => i.classList.remove('active'));
      bgImage.classList.remove('visible');
    }
  }
  
  let activeSubLinkImage = null;

  document.querySelectorAll('.mega-sub-link:not(.has-children)').forEach(link => {
    link.addEventListener('click', function() {
      setTimeout(closeMenu, 100);
    });
  });

  document.querySelectorAll('.mega-tertiary-item').forEach(item => {
    const button = item.querySelector('.mega-tertiary-link');
    
    button?.addEventListener('click', function(e) {
      e.preventDefault();
      
      if (item.classList.contains('active')) {
        item.classList.remove('active');
        if (activeSubLinkImage) {
          showBackgroundImage(activeSubLinkImage);
        } else {
          hideBackgroundImage();
        }
        return;
      }
      
      document.querySelectorAll('.mega-tertiary-item.active').forEach(activeItem => {
        activeItem.classList.remove('active');
      });
      
      item.classList.add('active');
      
      const imageSrc = item.dataset.image;
      if (imageSrc) {
        showBackgroundImage(imageSrc);
      }
    });
  });
  
  document.querySelectorAll('.mega-tertiary-action').forEach(link => {
    link.addEventListener('click', function() {
      setTimeout(closeMenu, 100);
    });
  });

  document.querySelectorAll('.mega-footer-link').forEach(link => {
    link.addEventListener('click', function() {
      setTimeout(closeMenu, 100);
    });
  });

  megaMenu?.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      const focusableElements = megaMenu.querySelectorAll(
        'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });

  const searchWrapper = document.getElementById('harvardSearchWrapper');
  const searchField = document.getElementById('harvardSearchField');
  const searchSubmit = document.getElementById('harvardSearchSubmit');
  const searchCloseBtn = document.getElementById('harvardSearchClose');
  const azBtn = document.getElementById('harvardAzBtn');
  
  let searchJustOpened = false;

  function openSearch() {
    if (searchWrapper?.classList.contains('active')) return;
    
    searchJustOpened = true;
    searchWrapper?.classList.add('active');
    azBtn?.classList.add('hidden');
    
    setTimeout(() => {
      searchField?.focus();
      searchJustOpened = false;
    }, 350);
  }

  function closeSearch() {
    if (!searchWrapper?.classList.contains('active')) return;
    
    searchWrapper?.classList.remove('active');
    azBtn?.classList.remove('hidden');
    if (searchField) searchField.value = '';
  }

  function goToSearch() {
    const query = searchField?.value.trim();
    if (query) {
      window.location.href = `a-to-z.html?search=${encodeURIComponent(query)}`;
    } else {
      window.location.href = 'a-to-z.html';
    }
  }

  azBtn?.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    openSearch();
  });

  searchSubmit?.addEventListener('click', function(e) {
    e.stopPropagation();
    goToSearch();
  });

  searchCloseBtn?.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    closeSearch();
  });
  
  searchWrapper?.addEventListener('click', function(e) {
    e.stopPropagation();
  });

  searchField?.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      goToSearch();
    } else if (e.key === 'Escape') {
      closeSearch();
    }
  });

  document.addEventListener('click', function(e) {
    if (searchJustOpened) return;
    
    if (searchWrapper?.classList.contains('active')) {
      const isInsideWrapper = searchWrapper.contains(e.target);
      const isAzBtn = azBtn?.contains(e.target) || e.target === azBtn;
      
      if (!isInsideWrapper && !isAzBtn) {
        closeSearch();
      }
    }
  });

  // Crear botones al cargar la página
  if (window.innerWidth <= 767) {
    createMobileBackButtons();
  }
  
  // Recrear en resize
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 767) {
      createMobileBackButtons();
    }
  });

  console.log('Harvard Mega Menu initialized');
});
