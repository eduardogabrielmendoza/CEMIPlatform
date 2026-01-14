(function() {
  const COOKIE_ACCEPTED_KEY = 'cemi_cookies_accepted';
  
  function checkCookieConsent() {
    return localStorage.getItem(COOKIE_ACCEPTED_KEY) === 'true';
  }
  
  function showCookieBanner() {
    if (checkCookieConsent()) {
      const banner = document.getElementById('cookieBanner');
      if (banner) banner.remove();
      return;
    }
    
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.classList.add('active');
    }
  }
  
  function acceptCookies() {
    localStorage.setItem(COOKIE_ACCEPTED_KEY, 'true');
    hideCookieBanner();
  }
  
  function rejectCookies() {
    hideCookieBanner();
  }
  
  function hideCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    if (banner) {
      banner.classList.add('hiding');
      banner.classList.remove('active');
      setTimeout(() => {
        banner.remove();
      }, 400);
    }
  }
  
  function goToCookieConfig() {
    window.location.href = 'cookies-config.html';
  }
  
  window.acceptCookies = acceptCookies;
  window.rejectCookies = rejectCookies;
  window.goToCookieConfig = goToCookieConfig;
  
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(showCookieBanner, 2000);
  });
})();



