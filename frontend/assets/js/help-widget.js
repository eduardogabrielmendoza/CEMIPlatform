(function() {
  'use strict';

  const widgetStyles = `
    :root {
      --hw-charcoal: #1e1e1e;
      --hw-graphite: #656f77;
      --hw-light-gray: #8c939a;
      --hw-silver: #b8bdc2;
      --hw-off-white: #f8f9fa;
      --hw-cream: #f5f5f7;
      --hw-accent-orange: #f5a623;
    }

    .cemi-help-widget { 
      position: fixed; 
      bottom: 24px; 
      right: 24px; 
      z-index: 9999; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
    }
    
    .cemi-help-btn { 
      width: 56px; 
      height: 56px; 
      background: #dee2e6; 
      border: none; 
      border-radius: 50%; 
      cursor: pointer; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      box-shadow: 0 4px 20px rgba(30, 30, 30, 0.25); 
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      overflow: hidden;
    }
    
    .cemi-help-btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: var(--hw-graphite);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      transition: width 0.5s ease, height 0.5s ease;
    }
    
    .cemi-help-btn:hover::before {
      width: 100%;
      height: 100%;
    }
    
    .cemi-help-btn:hover { 
      transform: scale(1.08) rotate(8deg); 
      box-shadow: 0 12px 35px rgba(30, 30, 30, 0.35); 
    }
    
    .cemi-help-btn:active { 
      transform: scale(0.95); 
    }
    
    .cemi-help-btn svg { 
      width: 24px; 
      height: 24px; 
      color: white; 
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      z-index: 1;
    }
    
    .cemi-help-btn.active svg { 
      transform: rotate(180deg); 
    }

    @keyframes helpPulse {
      0%, 100% { box-shadow: 0 4px 20px rgba(30, 30, 30, 0.25), 0 0 0 0 rgba(147, 161, 173, 0.4); }
      50% { box-shadow: 0 4px 20px rgba(30, 30, 30, 0.25), 0 0 0 12px rgba(147, 161, 173, 0); }
    }
    
    .cemi-help-btn.pulse {
      animation: helpPulse 2s ease-in-out infinite;
    }

    .cemi-help-dropdown { 
      position: absolute; 
      bottom: 70px; 
      right: 0; 
      background: var(--hw-off-white); 
      border-radius: 16px; 
      box-shadow: 0 20px 60px rgba(30, 30, 30, 0.18), 0 0 0 1px rgba(101, 111, 119, 0.08); 
      min-width: 280px; 
      opacity: 0; 
      visibility: hidden; 
      transform: translateY(15px) scale(0.92); 
      transform-origin: bottom right; 
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); 
      overflow: hidden;
    }
    
    .cemi-help-dropdown.active { 
      opacity: 1; 
      visibility: visible; 
      transform: translateY(0) scale(1); 
    }
    
    .cemi-help-dropdown-header { 
      padding: 24px; 
      background: var(--hw-charcoal); 
      color: white;
      position: relative;
      overflow: hidden;
    }
    
    .cemi-help-dropdown-header::before {
      content: '';
      position: absolute;
      top: -30px;
      right: -30px;
      width: 80px;
      height: 80px;
      border: 2px solid rgba(255,255,255,0.08);
      border-radius: 50%;
    }
    
    .cemi-help-dropdown-header::after {
      content: '';
      position: absolute;
      bottom: -20px;
      left: 20px;
      width: 40px;
      height: 40px;
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 50%;
    }
    
    .cemi-help-dropdown-header h4 { 
      font-family: 'Georgia', serif;
      font-size: 18px; 
      font-weight: 400; 
      margin: 0 0 6px 0;
      position: relative;
      z-index: 1;
    }
    
    .cemi-help-dropdown-header p { 
      font-size: 13px; 
      opacity: 0.75; 
      margin: 0;
      position: relative;
      z-index: 1;
    }
    
    .cemi-help-dropdown-items { 
      padding: 12px 0; 
    }
    
    .cemi-help-dropdown-item { 
      display: flex; 
      align-items: center; 
      gap: 14px; 
      padding: 14px 24px; 
      color: var(--hw-charcoal); 
      text-decoration: none; 
      font-size: 14px; 
      font-weight: 500; 
      transition: all 0.3s ease; 
      cursor: pointer; 
      border: none; 
      background: none; 
      width: 100%; 
      text-align: left;
      position: relative;
    }
    
    .cemi-help-dropdown-item::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 0;
      background: #93a1ad;
      transition: height 0.3s ease;
      border-radius: 0 2px 2px 0;
    }
    
    .cemi-help-dropdown-item:hover::before {
      height: 60%;
    }
    
    .cemi-help-dropdown-item:hover { 
      background: var(--hw-cream); 
      color: var(--hw-charcoal);
      padding-left: 28px;
    }
    
    .cemi-help-dropdown-item svg { 
      width: 20px; 
      height: 20px; 
      color: var(--hw-graphite); 
      transition: all 0.3s ease; 
    }
    
    .cemi-help-dropdown-item:hover svg { 
      color: var(--hw-charcoal); 
      transform: scale(1.1);
    }
    
    .cemi-help-dropdown-divider { 
      height: 1px; 
      background: rgba(101, 111, 119, 0.12); 
      margin: 8px 24px; 
    }

    .cemi-help-panel { 
      position: fixed; 
      top: 0; 
      right: -420px; 
      width: 400px; 
      height: 100vh; 
      background: var(--hw-off-white); 
      box-shadow: -8px 0 40px rgba(30, 30, 30, 0.12); 
      z-index: 10000; 
      transition: right 0.5s cubic-bezier(0.16, 1, 0.3, 1); 
      display: flex; 
      flex-direction: column; 
    }
    
    .cemi-help-panel.active { 
      right: 0; 
    }
    
    .cemi-help-panel-header { 
      padding: 24px; 
      background: var(--hw-charcoal); 
      color: white; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      flex-shrink: 0;
      position: relative;
      overflow: hidden;
    }
    
    .cemi-help-panel-header::before {
      content: '';
      position: absolute;
      top: -50px;
      right: -50px;
      width: 120px;
      height: 120px;
      border: 2px solid rgba(255,255,255,0.06);
      border-radius: 50%;
    }
    
    .cemi-help-panel-title { 
      display: flex; 
      align-items: center; 
      gap: 12px;
      position: relative;
      z-index: 1;
    }
    
    .cemi-help-panel-title svg { 
      width: 24px; 
      height: 24px;
      color: var(--hw-silver);
    }
    
    .cemi-help-panel-title h3 { 
      font-family: 'Georgia', serif;
      font-size: 20px; 
      font-weight: 400; 
      margin: 0; 
    }
    
    .cemi-help-panel-close { 
      background: rgba(255, 255, 255, 0.1); 
      border: 1px solid rgba(255,255,255,0.15); 
      border-radius: 10px; 
      padding: 10px; 
      cursor: pointer; 
      transition: all 0.3s ease; 
      display: flex; 
      align-items: center; 
      justify-content: center;
      position: relative;
      z-index: 1;
    }
    
    .cemi-help-panel-close:hover { 
      background: rgba(255, 255, 255, 0.2);
      transform: rotate(90deg);
    }
    
    .cemi-help-panel-close svg { 
      width: 18px; 
      height: 18px; 
      color: white; 
    }
    
    .cemi-help-panel-search { 
      padding: 20px 24px; 
      border-bottom: 1px solid rgba(101, 111, 119, 0.1); 
      flex-shrink: 0; 
      background: white;
    }
    
    .cemi-help-panel-search-input { 
      width: 100%; 
      padding: 14px 18px 14px 48px; 
      border: 1px solid rgba(101, 111, 119, 0.15); 
      border-radius: 12px; 
      font-size: 14px; 
      font-family: 'Inter', sans-serif; 
      transition: all 0.3s ease; 
      background: var(--hw-cream) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23656f77' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='m21 21-4.3-4.3'%3E%3C/path%3E%3C/svg%3E") 16px center no-repeat; 
    }
    
    .cemi-help-panel-search-input:focus { 
      outline: none; 
      border-color: var(--hw-charcoal); 
      box-shadow: 0 0 0 4px rgba(30, 30, 30, 0.08); 
      background-color: white; 
    }
    
    .cemi-help-panel-content { 
      flex: 1; 
      overflow-y: auto; 
      padding: 24px; 
    }
    
    .cemi-help-section { 
      margin-bottom: 28px; 
    }
    
    .cemi-help-section-title { 
      font-family: 'Georgia', serif;
      font-size: 14px; 
      font-weight: 400; 
      color: var(--hw-graphite); 
      text-transform: uppercase; 
      letter-spacing: 1px; 
      margin-bottom: 16px; 
    }
    
    .cemi-help-article { 
      display: flex; 
      align-items: flex-start; 
      gap: 14px; 
      padding: 16px; 
      border-radius: 14px; 
      cursor: pointer; 
      transition: all 0.3s ease; 
      text-decoration: none; 
      color: inherit;
      background: white;
      margin-bottom: 10px;
      border: 1px solid transparent;
    }
    
    .cemi-help-article:hover { 
      border-color: rgba(101, 111, 119, 0.15);
      transform: translateX(6px);
      box-shadow: 0 4px 15px rgba(30, 30, 30, 0.06);
    }
    
    .cemi-help-article-icon { 
      width: 42px; 
      height: 42px; 
      background: var(--hw-cream); 
      border-radius: 10px; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      flex-shrink: 0;
      transition: all 0.3s ease;
    }
    
    .cemi-help-article:hover .cemi-help-article-icon {
      background: var(--hw-charcoal);
    }
    
    .cemi-help-article-icon svg { 
      width: 20px; 
      height: 20px; 
      color: var(--hw-graphite);
      transition: color 0.3s ease;
    }
    
    .cemi-help-article:hover .cemi-help-article-icon svg {
      color: white;
    }
    
    .cemi-help-article-content h5 { 
      font-family: 'Georgia', serif;
      font-size: 15px; 
      font-weight: 400; 
      color: var(--hw-charcoal); 
      margin: 0 0 4px 0; 
    }
    
    .cemi-help-article-content p { 
      font-size: 13px; 
      color: var(--hw-graphite); 
      margin: 0; 
      line-height: 1.5; 
    }
    
    .cemi-help-link-btn { 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      gap: 10px; 
      width: 100%; 
      padding: 14px; 
      background: var(--hw-charcoal); 
      border: none; 
      border-radius: 12px; 
      color: white; 
      font-size: 14px; 
      font-weight: 500; 
      cursor: pointer; 
      transition: all 0.3s ease; 
      text-decoration: none; 
    }
    
    .cemi-help-link-btn:hover { 
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(30, 30, 30, 0.2);
    }
    
    .cemi-help-link-btn svg { 
      width: 16px; 
      height: 16px; 
    }
    
    .cemi-help-panel-footer { 
      padding: 20px 24px; 
      border-top: 1px solid rgba(101, 111, 119, 0.1); 
      background: white; 
      flex-shrink: 0; 
    }
    
    .cemi-help-panel-footer a { 
      display: flex; 
      align-items: center; 
      gap: 10px; 
      color: var(--hw-graphite); 
      text-decoration: none; 
      font-size: 14px; 
      transition: all 0.3s ease; 
      padding: 10px;
      border-radius: 10px;
    }
    
    .cemi-help-panel-footer a:hover { 
      color: var(--hw-charcoal);
      background: var(--hw-cream);
    }
    
    .cemi-help-panel-footer a svg { 
      width: 18px; 
      height: 18px;
      color: var(--hw-silver);
    }

    .cemi-help-overlay { 
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0; 
      background: rgba(30, 30, 30, 0.4); 
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 9998; 
      opacity: 0; 
      visibility: hidden; 
      transition: all 0.4s ease; 
    }
    
    .cemi-help-overlay.active { 
      opacity: 1; 
      visibility: visible; 
    }

    .cemi-feedback-modal { 
      position: fixed; 
      top: 0; 
      left: 0; 
      right: 0; 
      bottom: 0; 
      background: rgba(30, 30, 30, 0.5); 
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 10001; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      opacity: 0; 
      visibility: hidden; 
      transition: all 0.4s ease;
      padding: 20px;
    }
    
    .cemi-feedback-modal.active { 
      opacity: 1; 
      visibility: visible; 
    }
    
    .cemi-feedback-content { 
      background: var(--hw-off-white); 
      border-radius: 20px; 
      width: 100%; 
      max-width: 500px; 
      max-height: 90vh; 
      overflow-y: auto; 
      transform: translateY(30px) scale(0.95); 
      transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 25px 80px rgba(30, 30, 30, 0.25);
    }
    
    .cemi-feedback-modal.active .cemi-feedback-content { 
      transform: translateY(0) scale(1); 
    }
    
    .cemi-feedback-header { 
      padding: 28px; 
      border-bottom: 1px solid rgba(101, 111, 119, 0.1); 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      background: white;
      border-radius: 20px 20px 0 0;
    }
    
    .cemi-feedback-header h3 { 
      font-family: 'Georgia', serif;
      font-size: 20px; 
      font-weight: 400; 
      color: var(--hw-charcoal); 
      margin: 0; 
      display: flex; 
      align-items: center; 
      gap: 12px; 
    }
    
    .cemi-feedback-header h3 svg { 
      width: 24px; 
      height: 24px; 
      color: var(--hw-graphite); 
    }
    
    .cemi-feedback-close { 
      background: var(--hw-cream); 
      border: none; 
      padding: 10px; 
      cursor: pointer; 
      border-radius: 10px; 
      transition: all 0.3s ease; 
    }
    
    .cemi-feedback-close:hover { 
      background: var(--hw-charcoal);
      transform: rotate(90deg);
    }
    
    .cemi-feedback-close svg { 
      width: 18px; 
      height: 18px; 
      color: var(--hw-graphite);
      transition: color 0.3s ease;
    }
    
    .cemi-feedback-close:hover svg {
      color: white;
    }
    
    .cemi-feedback-body { 
      padding: 28px; 
      background: white;
    }
    
    .cemi-feedback-group { 
      margin-bottom: 24px; 
    }
    
    .cemi-feedback-group label { 
      display: block; 
      font-family: 'Georgia', serif;
      font-size: 14px; 
      font-weight: 400; 
      color: var(--hw-charcoal); 
      margin-bottom: 10px; 
    }
    
    .cemi-feedback-group select, 
    .cemi-feedback-group textarea { 
      width: 100%; 
      padding: 14px 18px; 
      border: 1px solid rgba(101, 111, 119, 0.2); 
      border-radius: 12px; 
      font-size: 14px; 
      font-family: 'Inter', sans-serif; 
      transition: all 0.3s ease;
      background: var(--hw-off-white);
    }
    
    .cemi-feedback-group select:focus, 
    .cemi-feedback-group textarea:focus { 
      outline: none; 
      border-color: var(--hw-charcoal); 
      box-shadow: 0 0 0 4px rgba(30, 30, 30, 0.06);
      background: white;
    }
    
    .cemi-feedback-group textarea { 
      min-height: 130px; 
      resize: vertical; 
    }
    
    .cemi-feedback-footer { 
      padding: 24px 28px; 
      border-top: 1px solid rgba(101, 111, 119, 0.1); 
      display: flex; 
      justify-content: flex-end; 
      gap: 12px;
      background: var(--hw-cream);
      border-radius: 0 0 20px 20px;
    }
    
    .cemi-feedback-btn { 
      padding: 14px 28px; 
      border-radius: 12px; 
      font-size: 14px; 
      font-weight: 600; 
      cursor: pointer; 
      transition: all 0.3s ease; 
      border: none; 
    }
    
    .cemi-feedback-btn.secondary { 
      background: white; 
      color: var(--hw-graphite);
      border: 1px solid rgba(101, 111, 119, 0.2);
    }
    
    .cemi-feedback-btn.secondary:hover { 
      background: var(--hw-off-white);
      border-color: var(--hw-graphite);
    }
    
    .cemi-feedback-btn.primary { 
      background: var(--hw-charcoal); 
      color: white; 
    }
    
    .cemi-feedback-btn.primary:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 10px 30px rgba(30, 30, 30, 0.25); 
    }

    @media (max-width: 480px) { 
      .cemi-help-panel { width: 100%; right: -100%; } 
      .cemi-help-dropdown { min-width: 260px; right: -10px; } 
      .cemi-help-widget { bottom: 16px; right: 16px; } 
      .cemi-help-btn { width: 52px; height: 52px; } 
    }
  `;

  const icons = {
    help: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><path d="M12 17h.01"></path></svg>',
    x: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>',
    book: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>',
    users: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
    messageSquare: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>',
    sparkles: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>',
    externalLink: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" x2="21" y1="14" y2="3"></line></svg>',
    rocket: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>',
    clipboardList: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><path d="M12 11h4"></path><path d="M12 16h4"></path><path d="M8 11h.01"></path><path d="M8 16h.01"></path></svg>',
    messageCircle: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>'
  };

  function createWidgetHTML() {
    return `
      <div class="cemi-help-overlay" id="cemiHelpOverlay"></div>
      <div class="cemi-help-widget" id="cemiHelpWidget">
        <button class="cemi-help-btn" id="cemiHelpBtn" aria-label="Abrir ayuda">${icons.help}</button>
        <div class="cemi-help-dropdown" id="cemiHelpDropdown">
          <div class="cemi-help-dropdown-header"><h4>¿Necesitas ayuda?</h4><p>Estamos aquí para asistirte</p></div>
          <div class="cemi-help-dropdown-items">
            <a href="ayuda-classroom.html" class="cemi-help-dropdown-item">${icons.book}<span>Centro de Ayuda</span></a>
            <a href="comunidad-ayuda.html" class="cemi-help-dropdown-item">${icons.users}<span>Comunidad</span></a>
            <button class="cemi-help-dropdown-item" id="cemiOpenFeedback">${icons.messageSquare}<span>Enviar comentarios</span></button>
            <div class="cemi-help-dropdown-divider"></div>
            <a href="novedades-cemi.html" class="cemi-help-dropdown-item">${icons.sparkles}<span>Novedades</span></a>
          </div>
        </div>
      </div>
      <div class="cemi-help-panel" id="cemiHelpPanel">
        <div class="cemi-help-panel-header">
          <div class="cemi-help-panel-title">${icons.help}<h3>Ayuda CEMI</h3></div>
          <button class="cemi-help-panel-close" id="cemiPanelClose">${icons.x}</button>
        </div>
        <div class="cemi-help-panel-search"><input type="text" class="cemi-help-panel-search-input" placeholder="Buscar en la ayuda..." id="cemiPanelSearch"></div>
        <div class="cemi-help-panel-content" id="cemiPanelContent">
          <div class="cemi-help-section">
            <div class="cemi-help-section-title">Recursos populares</div>
            <a href="ayuda-classroom.html#primeros-pasos" class="cemi-help-article"><div class="cemi-help-article-icon">${icons.rocket}</div><div class="cemi-help-article-content"><h5>Primeros Pasos</h5><p>Aprende lo básico de CEMI Classroom</p></div></a>
            <a href="ayuda-classroom.html#tareas" class="cemi-help-article"><div class="cemi-help-article-icon">${icons.clipboardList}</div><div class="cemi-help-article-content"><h5>Tareas y Entregas</h5><p>Cómo entregar y gestionar tareas</p></div></a>
            <a href="ayuda-classroom.html#comunicacion" class="cemi-help-article"><div class="cemi-help-article-icon">${icons.messageCircle}</div><div class="cemi-help-article-content"><h5>Comunicación</h5><p>Mensajes y notificaciones</p></div></a>
          </div>
          <div class="cemi-help-section"><a href="ayuda-classroom.html" class="cemi-help-link-btn">Ver todo el Centro de Ayuda ${icons.externalLink}</a></div>
          <div class="cemi-help-section"><div class="cemi-help-section-title">¿No encuentras lo que buscas?</div><a href="comunidad-ayuda.html" class="cemi-help-link-btn">Pregunta a la Comunidad ${icons.users}</a></div>
        </div>
        <div class="cemi-help-panel-footer"><a href="novedades-cemi.html">${icons.sparkles}<span>Ver novedades de CEMI</span></a></div>
      </div>
      <div class="cemi-feedback-modal" id="cemiFeedbackModal">
        <div class="cemi-feedback-content">
          <div class="cemi-feedback-header"><h3>${icons.messageSquare}Enviar comentarios</h3><button class="cemi-feedback-close" id="cemiFeedbackClose">${icons.x}</button></div>
          <div class="cemi-feedback-body">
            <div class="cemi-feedback-group"><label>Tipo de comentario</label><select id="cemiFeedbackType"><option value="">Selecciona una opción...</option><option value="sugerencia">Sugerencia</option><option value="problema">Reportar un problema</option><option value="felicitacion">Felicitación</option><option value="otro">Otro</option></select></div>
            <div class="cemi-feedback-group"><label>Tu comentario</label><textarea id="cemiFeedbackMessage" placeholder="Cuéntanos qué piensas..."></textarea></div>
          </div>
          <div class="cemi-feedback-footer"><button class="cemi-feedback-btn secondary" id="cemiFeedbackCancel">Cancelar</button><button class="cemi-feedback-btn primary" id="cemiFeedbackSubmit">Enviar</button></div>
        </div>
      </div>
    `;
  }

  function initHelpWidget() {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = widgetStyles;
    document.head.appendChild(styleSheet);

    const widgetContainer = document.createElement('div');
    widgetContainer.innerHTML = createWidgetHTML();
    document.body.appendChild(widgetContainer);

    const helpBtn = document.getElementById('cemiHelpBtn');
    const dropdown = document.getElementById('cemiHelpDropdown');
    const overlay = document.getElementById('cemiHelpOverlay');
    const panel = document.getElementById('cemiHelpPanel');
    const panelClose = document.getElementById('cemiPanelClose');
    const feedbackModal = document.getElementById('cemiFeedbackModal');
    const feedbackClose = document.getElementById('cemiFeedbackClose');
    const feedbackCancel = document.getElementById('cemiFeedbackCancel');
    const feedbackSubmit = document.getElementById('cemiFeedbackSubmit');
    const openFeedbackBtn = document.getElementById('cemiOpenFeedback');

    let dropdownOpen = false;
    let panelOpen = false;

    helpBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      dropdownOpen = !dropdownOpen;
      dropdown.classList.toggle('active', dropdownOpen);
      helpBtn.classList.toggle('active', dropdownOpen);
    });

    document.addEventListener('click', function(e) {
      if (dropdownOpen && !dropdown.contains(e.target) && e.target !== helpBtn) {
        dropdownOpen = false;
        dropdown.classList.remove('active');
        helpBtn.classList.remove('active');
      }
    });

    function closePanel() {
      panelOpen = false;
      panel.classList.remove('active');
      overlay.classList.remove('active');
    }

    panelClose.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    openFeedbackBtn.addEventListener('click', function() {
      dropdownOpen = false;
      dropdown.classList.remove('active');
      helpBtn.classList.remove('active');
      feedbackModal.classList.add('active');
    });

    function closeFeedbackModal() {
      feedbackModal.classList.remove('active');
    }

    feedbackClose.addEventListener('click', closeFeedbackModal);
    feedbackCancel.addEventListener('click', closeFeedbackModal);
    feedbackModal.addEventListener('click', function(e) { if (e.target === feedbackModal) closeFeedbackModal(); });

    feedbackSubmit.addEventListener('click', function() {
      const type = document.getElementById('cemiFeedbackType').value;
      const message = document.getElementById('cemiFeedbackMessage').value.trim();
      if (!type || !message) { alert('Por favor completa todos los campos'); return; }
      alert('¡Gracias por tus comentarios! Tu feedback nos ayuda a mejorar CEMI.');
      document.getElementById('cemiFeedbackType').value = '';
      document.getElementById('cemiFeedbackMessage').value = '';
      closeFeedbackModal();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        if (feedbackModal.classList.contains('active')) closeFeedbackModal();
        else if (panelOpen) closePanel();
        else if (dropdownOpen) { dropdownOpen = false; dropdown.classList.remove('active'); helpBtn.classList.remove('active'); }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHelpWidget);
  } else {
    initHelpWidget();
  }
})();
