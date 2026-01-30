/**
 * MOBILE HANDLER - CEMI Platform
 * ================================
 * Resilient event handling for mobile interactions
 * Uses optional chaining and null guards throughout
 * 
 * Features:
 * - Safe DOM queries (null-safe)
 * - Scroll lock management
 * - Sidebar toggle with overlay
 * - Modal management
 * - Accordion navigation
 * - Table to cards transformation
 */

(function() {
  'use strict';
  
  // ========================================
  // SAFE QUERY SELECTORS
  // ========================================
  
  /**
   * Safe querySelector - returns null instead of throwing
   * @param {string} selector 
   * @param {Element} context 
   * @returns {Element|null}
   */
  function $(selector, context = document) {
    try {
      return context?.querySelector(selector) || null;
    } catch (e) {
      console.warn('[MobileHandler] Invalid selector:', selector);
      return null;
    }
  }
  
  /**
   * Safe querySelectorAll - returns empty array instead of throwing
   * @param {string} selector 
   * @param {Element} context 
   * @returns {Element[]}
   */
  function $$(selector, context = document) {
    try {
      return Array.from(context?.querySelectorAll(selector) || []);
    } catch (e) {
      console.warn('[MobileHandler] Invalid selector:', selector);
      return [];
    }
  }
  
  /**
   * Safe event listener - only adds if element exists
   * @param {Element|string} elementOrSelector 
   * @param {string} event 
   * @param {Function} handler 
   * @param {Object} options 
   */
  function safeAddListener(elementOrSelector, event, handler, options = {}) {
    const element = typeof elementOrSelector === 'string' 
      ? $(elementOrSelector) 
      : elementOrSelector;
    
    if (element && typeof element.addEventListener === 'function') {
      element.addEventListener(event, handler, options);
      return true;
    }
    return false;
  }
  
  // ========================================
  // SCROLL LOCK MANAGEMENT
  // ========================================
  
  const scrollLock = {
    scrollPosition: 0,
    
    enable() {
      this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.scrollPosition}px`;
      document.body.style.width = '100%';
      document.body.classList.add('modal-open');
    },
    
    disable() {
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('position');
      document.body.style.removeProperty('top');
      document.body.style.removeProperty('width');
      document.body.classList.remove('modal-open');
      window.scrollTo(0, this.scrollPosition);
    }
  };
  
  // ========================================
  // SIDEBAR MANAGEMENT
  // ========================================
  
  function initMobileSidebar() {
    const sidebar = $('.dashboard-sidebar') || $('.classroom-sidebar') || $('.sidebar');
    const menuToggle = $('#menuToggle') || $('.menu-toggle') || $('.hamburger-btn');
    
    if (!sidebar) return;
    
    // Create overlay if it doesn't exist
    let overlay = $('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }
    
    // Create close button if it doesn't exist
    let closeBtn = sidebar.querySelector('.sidebar-close');
    if (!closeBtn) {
      closeBtn = document.createElement('button');
      closeBtn.className = 'sidebar-close';
      closeBtn.setAttribute('aria-label', 'Cerrar menú');
      closeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
      sidebar.insertBefore(closeBtn, sidebar.firstChild);
    }
    
    function openSidebar() {
      sidebar.classList.add('active', 'open');
      overlay.classList.add('active', 'visible');
      document.body.classList.add('sidebar-open');
      scrollLock.enable();
    }
    
    function closeSidebar() {
      sidebar.classList.remove('active', 'open');
      overlay.classList.remove('active', 'visible');
      document.body.classList.remove('sidebar-open');
      scrollLock.disable();
    }
    
    // Toggle button
    safeAddListener(menuToggle, 'click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (sidebar.classList.contains('active')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
    
    // Close button
    safeAddListener(closeBtn, 'click', closeSidebar);
    
    // Overlay click
    safeAddListener(overlay, 'click', closeSidebar);
    
    // Close on navigation
    $$('.sidebar-menu a, .sidebar-menu button, .sidebar a', sidebar).forEach(link => {
      safeAddListener(link, 'click', () => {
        if (window.innerWidth <= 768) {
          setTimeout(closeSidebar, 100);
        }
      });
    });
    
    // ESC key to close
    safeAddListener(document, 'keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeSidebar();
      }
    });
  }
  
  // ========================================
  // MODAL MANAGEMENT
  // ========================================
  
  function initModalHandlers() {
    // Close all modals with close buttons
    $$('.modal .close-modal, .modal-close, .btn-close-modal, [data-dismiss="modal"]').forEach(btn => {
      safeAddListener(btn, 'click', (e) => {
        const modal = btn.closest('.modal') || btn.closest('[class*="modal"]');
        if (modal) {
          modal.classList.remove('active', 'show', 'visible');
          scrollLock.disable();
        }
      });
    });
    
    // Close modal on backdrop click
    $$('.modal, .modal-overlay').forEach(modal => {
      safeAddListener(modal, 'click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active', 'show', 'visible');
          scrollLock.disable();
        }
      });
    });
    
    // Global ESC key handler
    safeAddListener(document, 'keydown', (e) => {
      if (e.key === 'Escape') {
        const activeModals = $$('.modal.active, .modal.show, .modal.visible');
        activeModals.forEach(modal => {
          modal.classList.remove('active', 'show', 'visible');
        });
        if (activeModals.length > 0) {
          scrollLock.disable();
        }
      }
    });
    
    // Observe for dynamically added modals
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && node.classList?.contains('modal')) {
            const closeBtn = node.querySelector('.close-modal, .modal-close');
            if (closeBtn) {
              safeAddListener(closeBtn, 'click', () => {
                node.classList.remove('active', 'show', 'visible');
                scrollLock.disable();
              });
            }
          }
        });
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // ========================================
  // ACCORDION NAVIGATION
  // ========================================
  
  function initAccordionNav() {
    $$('.accordion-header, .nav-accordion-header, [data-accordion-toggle]').forEach(header => {
      safeAddListener(header, 'click', (e) => {
        e.preventDefault();
        
        const content = header.nextElementSibling;
        const isExpanded = header.classList.contains('active');
        
        // Close all other accordions in the same group
        const parent = header.closest('.accordion-nav, .nav-accordion, .sidebar-menu');
        if (parent) {
          $$('.accordion-header.active, .nav-accordion-header.active', parent).forEach(otherHeader => {
            if (otherHeader !== header) {
              otherHeader.classList.remove('active');
              otherHeader.setAttribute('aria-expanded', 'false');
              otherHeader.nextElementSibling?.classList.remove('open');
            }
          });
        }
        
        // Toggle current
        header.classList.toggle('active', !isExpanded);
        header.setAttribute('aria-expanded', !isExpanded);
        content?.classList.toggle('open', !isExpanded);
      });
    });
  }
  
  // ========================================
  // TABLE TO CARDS TRANSFORMATION
  // ========================================
  
  function transformTablesToCards() {
    if (window.innerWidth > 768) return;
    
    $$('table:not(.mobile-processed)').forEach(table => {
      // Get headers for data labels
      const headers = $$('th', table).map(th => th.textContent.trim());
      
      if (headers.length === 0) return;
      
      // Add data-label to each td
      $$('tbody tr', table).forEach(row => {
        $$('td', row).forEach((td, index) => {
          if (headers[index]) {
            td.setAttribute('data-label', headers[index]);
          }
        });
      });
      
      // Mark as processed and add mobile class
      table.classList.add('mobile-processed', 'mobile-cards');
    });
  }
  
  // ========================================
  // CHAT MOBILE OPTIMIZATION
  // ========================================
  
  function initChatMobile() {
    if (window.innerWidth > 768) return;
    
    const chatContainer = $('.admin-chat-container, .chat-container');
    if (!chatContainer) return;
    
    const conversationsPanel = $('.chat-conversations-panel', chatContainer);
    const mainPanel = $('.chat-main-panel', chatContainer);
    
    // Add back button to main panel if not exists
    if (mainPanel && !$('.chat-back-btn', mainPanel)) {
      const backBtn = document.createElement('button');
      backBtn.className = 'chat-back-btn';
      backBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg> Conversaciones';
      backBtn.style.cssText = 'display:flex;align-items:center;gap:8px;padding:12px 16px;background:transparent;border:none;color:#667eea;font-weight:500;cursor:pointer;';
      
      const header = $('.chat-panel-header, .chat-header', mainPanel);
      if (header) {
        header.insertBefore(backBtn, header.firstChild);
      }
      
      safeAddListener(backBtn, 'click', () => {
        mainPanel.classList.remove('active');
        conversationsPanel?.classList.remove('hidden');
      });
    }
    
    // Conversation item click handler
    $$('.conversation-item, .chat-conversation', conversationsPanel).forEach(item => {
      safeAddListener(item, 'click', () => {
        if (window.innerWidth <= 768) {
          conversationsPanel?.classList.add('hidden');
          mainPanel?.classList.add('active');
        }
      });
    });
  }
  
  // ========================================
  // INITIALIZATION
  // ========================================
  
  function init() {
    // Only run on mobile
    if (window.innerWidth > 768) {
      // Still add resize listener for orientation changes
      let resizeTimer;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (window.innerWidth <= 768) {
            init();
          }
        }, 250);
      });
      return;
    }
    
    console.log('[MobileHandler] Initializing mobile optimizations...');
    
    initMobileSidebar();
    initModalHandlers();
    initAccordionNav();
    transformTablesToCards();
    initChatMobile();
    
    console.log('[MobileHandler] Mobile optimizations complete.');
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Expose utilities globally for debugging
  window.MobileHandler = {
    $,
    $$,
    safeAddListener,
    scrollLock,
    reinit: init
  };
  
})();
