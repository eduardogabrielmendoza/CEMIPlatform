
const cardTypes = [
  { pattern: /^4/, type: 'visa', color: 'lightblue', icon: 'fab fa-cc-visa', name: 'VISA' },
  { pattern: /^(5[1-5]|22[2-9]|2[3-7])/, type: 'mastercard', color: 'red', icon: 'fab fa-cc-mastercard', name: 'MASTERCARD' },
  { pattern: /^3[47]/, type: 'amex', color: 'purple', icon: 'fab fa-cc-amex', name: 'AMEX' },
  { pattern: /^(?:6011|65|64[4-9])/, type: 'discover', color: 'cyan', icon: 'fab fa-cc-discover', name: 'DISCOVER' },
  { pattern: /^3(?:0[0-5]|[689])/, type: 'diners', color: 'green', icon: 'fab fa-cc-diners-club', name: 'DINERS' },
  { pattern: /^(?:2131|1800|35)/, type: 'jcb', color: 'lime', icon: 'fab fa-cc-jcb', name: 'JCB' },
  { pattern: /^(?:5[0678]|6304|67)/, type: 'maestro', color: 'yellow', icon: 'fas fa-credit-card', name: 'MAESTRO' },
  { pattern: /^62/, type: 'unionpay', color: 'orange', icon: 'fas fa-credit-card', name: 'UNIONPAY' }
];

function swapColor(baseColor) {
  const lightElements = document.querySelectorAll('.lightcolor');
  const darkElements = document.querySelectorAll('.darkcolor');
  const ccSingle = document.getElementById('ccsingle');
  const ccIcon = document.getElementById('ccicon');
  
  lightElements.forEach(el => {
    el.classList.remove('lightblue', 'red', 'purple', 'cyan', 'green', 'lime', 'yellow', 'orange', 'grey');
    el.classList.add(baseColor);
  });
  
  darkElements.forEach(el => {
    el.classList.remove('lightbluedark', 'reddark', 'purpledark', 'cyandark', 'greendark', 'limedark', 'yellowdark', 'orangedark', 'greydark');
    el.classList.add(baseColor + 'dark');
  });
  
  ccSingle.innerHTML = '';
  ccIcon.innerHTML = '';
}

const testCards = [
  '4532015112830366',
  '5425233430109903',
  '374245455400126',
  '6011111111111117',
  '36227206271667',
  '3530111333300000',
  '6304000000000000',
  '6221558812340000'
];

function randomCard() {
  const randomIndex = Math.floor(Math.random() * testCards.length);
  return testCards[randomIndex];
}

let cardNumberMask, expirationMask, securityCodeMask;

function openPaymentMethodModal(paymentData) {
  if (paymentData) {
    document.getElementById('methodPaymentConcepto').textContent = paymentData.concepto || 'Cuota Mensual';
    document.getElementById('methodPaymentPeriodo').textContent = paymentData.periodo || '-';
    document.getElementById('methodPaymentAmount').textContent = `$${paymentData.amount ? paymentData.amount.toFixed(2) : '0.00'}`;
    
    document.getElementById('paymentIdPago').value = paymentData.id_pago || '';
    document.getElementById('paymentConcepto').value = paymentData.concepto || '';
    document.getElementById('paymentPeriodo').value = paymentData.periodo || '';
    document.getElementById('paymentAmount').setAttribute('data-amount', paymentData.amount || 0);
  }
  
  document.getElementById('paymentMethodModal').classList.add('active');
}

function closePaymentMethodModal() {
  document.getElementById('paymentMethodModal').classList.remove('active');
}

function openCreditCardModal() {
  closePaymentMethodModal();
  document.getElementById('creditCardModal').classList.add('active');
}

function closeCreditCardModal() {
  document.getElementById('creditCardModal').classList.remove('active');
}

function backToPaymentMethod() {
  closeCreditCardModal();
  openPaymentMethodModal();
}

function openTransferModal() {
  closePaymentMethodModal();
  document.getElementById('transferModal').classList.add('active');
}

function closeTransferModal() {
  document.getElementById('transferModal').classList.remove('active');
}

function copyToClipboard(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const icon = button.querySelector('i');
    const originalIcon = icon.getAttribute('data-lucide');
    
    icon.setAttribute('data-lucide', 'check');
    button.classList.add('copied');
    
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
    
    setTimeout(() => {
      icon.setAttribute('data-lucide', 'copy');
      button.classList.remove('copied');
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 2000);
  }).catch(err => {
    console.error('Error al copiar:', err);
    alert('No se pudo copiar al portapapeles');
  });
}

window.creditCardForm = {
  openModal: openPaymentMethodModal
};

window.copyToClipboard = copyToClipboard;

window.onload = function() {
  const container = document.querySelector('.container');
  if (container) {
    container.classList.remove('preload');
  }
  
  const cardNumberInput = document.getElementById('cardnumber');
  if (cardNumberInput && typeof IMask !== 'undefined') {
    cardNumberMask = IMask(cardNumberInput, {
      mask: [
        { mask: '0000 000000 00000', regex: '^3[47]\\d{0,13}', cardtype: 'amex' },
        { mask: '0000 0000 0000 0000', regex: '^(?!3[47]\\d{0,13})\\d{0,16}', cardtype: 'general' }
      ],
      dispatch: function(appended, dynamicMasked) {
        const number = (dynamicMasked.value + appended).replace(/\D/g, '');
        
        let matchFound = false;
        for (let i = 0; i < cardTypes.length; i++) {
          if (cardTypes[i].pattern.test(number)) {
            swapColor(cardTypes[i].color);
            
            const ccSingle = document.getElementById('ccsingle');
            const ccIcon = document.getElementById('ccicon');
            
            const iconHTML = `<i class="${cardTypes[i].icon}" style="font-size: 48px; color: white;"></i>`;
            
            ccSingle.innerHTML = iconHTML;
            ccIcon.innerHTML = `<i class="${cardTypes[i].icon}" style="font-size: 32px;"></i>`;
            
            matchFound = true;
            break;
          }
        }
        
        if (!matchFound) {
          swapColor('grey');
          document.getElementById('ccsingle').innerHTML = '';
          document.getElementById('ccicon').innerHTML = '';
        }
        
        return dynamicMasked.compiledMasks.find(m => {
          if (number.match(/^3[47]/)) return m.cardtype === 'amex';
          return m.cardtype === 'general';
        });
      }
    });
  }
  
  const expirationInput = document.getElementById('expirationdate');
  if (expirationInput && typeof IMask !== 'undefined') {
    expirationMask = IMask(expirationInput, {
      mask: 'MM/YY',
      blocks: {
        MM: {
          mask: IMask.MaskedRange,
          from: 1,
          to: 12
        },
        YY: {
          mask: IMask.MaskedRange,
          from: 0,
          to: 99
        }
      }
    });
  }
  
  const securityCodeInput = document.getElementById('securitycode');
  if (securityCodeInput && typeof IMask !== 'undefined') {
    securityCodeMask = IMask(securityCodeInput, {
      mask: '0000'
    });
  }
  
  const nameInput = document.getElementById('name');
  if (nameInput) {
    nameInput.addEventListener('input', function() {
      const svgName = document.getElementById('svgname');
      const svgNameBack = document.getElementById('svgnameback');
      if (svgName) svgName.textContent = this.value.toUpperCase() || 'JUAN PÉREZ';
      if (svgNameBack) svgNameBack.textContent = this.value || 'Juan Pérez';
    });
  }
  
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', function() {
      const svgNumber = document.getElementById('svgnumber');
      if (svgNumber) {
        svgNumber.textContent = cardNumberMask ? cardNumberMask.value : this.value || '0123 4567 8910 1112';
      }
    });
  }
  
  if (expirationInput) {
    expirationInput.addEventListener('input', function() {
      const svgExpire = document.getElementById('svgexpire');
      if (svgExpire) {
        svgExpire.textContent = expirationMask ? expirationMask.value : this.value || '12/25';
      }
    });
  }
  
  if (securityCodeInput) {
    securityCodeInput.addEventListener('input', function() {
      const svgSecurity = document.getElementById('svgsecurity');
      if (svgSecurity) {
        svgSecurity.textContent = securityCodeMask ? securityCodeMask.value : this.value || '985';
      }
    });
    
    securityCodeInput.addEventListener('focus', function() {
      const creditcard = document.querySelector('.creditcard');
      if (creditcard) creditcard.classList.add('flipped');
    });
    
    securityCodeInput.addEventListener('blur', function() {
      const creditcard = document.querySelector('.creditcard');
      if (creditcard) creditcard.classList.remove('flipped');
    });
  }
  
  const generateCardBtn = document.getElementById('generatecard');
  if (generateCardBtn && cardNumberInput) {
    generateCardBtn.addEventListener('click', function() {
      const randomCardNumber = randomCard();
      cardNumberInput.value = randomCardNumber;
      
      if (cardNumberMask) {
        cardNumberMask.value = randomCardNumber;
      }
      
      const svgNumber = document.getElementById('svgnumber');
      if (svgNumber) {
        const formatted = randomCardNumber.replace(/(.{4})/g, '$1 ').trim();
        svgNumber.textContent = formatted;
      }
      
      cardNumberInput.dispatchEvent(new Event('input'));
    });
  }
  
  const creditcard = document.querySelector('.creditcard');
  if (creditcard) {
    creditcard.addEventListener('click', function() {
      this.classList.toggle('flipped');
    });
  }
  
  const btnCardPayment = document.getElementById('btnCardPayment');
  if (btnCardPayment) {
    btnCardPayment.addEventListener('click', openCreditCardModal);
  }
  
  const btnTransferPayment = document.getElementById('btnTransferPayment');
  if (btnTransferPayment) {
    btnTransferPayment.addEventListener('click', openTransferModal);
  }
  
  const btnCashPayment = document.getElementById('btnCashPayment');
  if (btnCashPayment) {
    btnCashPayment.addEventListener('click', function() {
      console.log(' Click en botón Efectivo detectado');
      closePaymentMethodModal();
      
      setTimeout(() => {
        if (typeof window.mostrarTicketEfectivo === 'function') {
          console.log(' Llamando a window.mostrarTicketEfectivo()');
          window.mostrarTicketEfectivo();
        } else {
          console.error(' window.mostrarTicketEfectivo no está definida');
        }
      }, 100);
    });
  }
  
  const closeTransferBtn = document.getElementById('closeTransferModal');
  if (closeTransferBtn) {
    closeTransferBtn.addEventListener('click', closeTransferModal);
  }
  
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', backToPaymentMethod);
  }
  
  const closeButtons = document.querySelectorAll('.close-button');
  closeButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      closePaymentMethodModal();
      closeCreditCardModal();
    });
  });
  
  const modalOverlays = document.querySelectorAll('.payment-method-modal-overlay, .credit-card-modal-overlay, .transfer-modal-overlay');
  modalOverlays.forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) {
        closePaymentMethodModal();
        closeCreditCardModal();
        closeTransferModal();
      }
    });
  });
};



