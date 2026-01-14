
const API_URL = window.API_URL || "http://localhost:3000/api";

const loginForm = document.getElementById('classroomLoginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginMessage = document.getElementById('loginMessage');
const loader = document.getElementById('loader');
const togglePasswordBtn = document.getElementById('togglePassword');


document.addEventListener('DOMContentLoaded', () => {
  verificarSesionActiva();
  
  loginForm.addEventListener('submit', handleLogin);
  
  togglePasswordBtn.addEventListener('click', togglePassword);
  
  usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') passwordInput.focus();
  });
  
  usernameInput.addEventListener('input', clearMessage);
  passwordInput.addEventListener('input', clearMessage);
});


function verificarSesionActiva() {
  const nombre = localStorage.getItem('nombre');
  const rol = localStorage.getItem('rol');
  
  if (nombre && rol) {
    Swal.fire({
      title: '¡Sesión Activa!',
      text: `Ya has iniciado sesión como ${nombre}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Continuar al Classroom',
      cancelButtonText: 'Cerrar Sesión',
      confirmButtonColor: '#4a5259',
      cancelButtonColor: '#757575'
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = 'classroom.html';
      } else if (result.isDismissed) {
        localStorage.clear();
        showMessage('Sesión cerrada', 'success');
      }
    });
  }
}


async function handleLogin(e) {
  e.preventDefault();
  
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  
  if (!username || !password) {
    showMessage('Por favor completa todos los campos', 'error');
    return;
  }
  
  showLoader();
  showMessage('Verificando credenciales...', 'info');
  
  try {
    const response = await fetch(`${API_URL}/auth/classroom-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      showMessage('¡Acceso concedido!', 'success');
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      localStorage.setItem('id_usuario', data.id_usuario);
      localStorage.setItem('rol', data.rol);
      localStorage.setItem('nombre', data.nombre);
      localStorage.setItem('username', data.username);
      
      if (data.avatar) {
        localStorage.setItem('avatar', data.avatar);
      }
      
      if (data.id_profesor) {
        localStorage.setItem('id_profesor', data.id_profesor);
      }
      if (data.id_alumno) {
        localStorage.setItem('id_alumno', data.id_alumno);
      }
      
      await mostrarAnimacionExito(data.nombre, data.rol);
      
      setTimeout(() => {
        window.location.href = 'classroom.html';
      }, 1500);
      
    } else {
      hideLoader();
      showMessage(data.message || 'Usuario o contraseña incorrectos', 'error');
      
      vibrarCampos();
    }
    
  } catch (error) {
    console.error('Error al conectar:', error);
    hideLoader();
    showMessage('No se pudo conectar con el servidor', 'error');
    vibrarCampos();
  }
}


function showMessage(message, type = 'info') {
  loginMessage.textContent = message;
  loginMessage.className = `login-message ${type}`;
}

function clearMessage() {
  loginMessage.textContent = '';
  loginMessage.className = 'login-message';
}

function showLoader() {
  loader.classList.add('show');
}

function hideLoader() {
  loader.classList.remove('show');
}

function togglePassword() {
  const type = passwordInput.type === 'password' ? 'text' : 'password';
  passwordInput.type = type;
  
  togglePasswordBtn.classList.add('eye-closing');
  
  setTimeout(() => {
    togglePasswordBtn.classList.remove('eye-closing');
    togglePasswordBtn.classList.add('eye-opening');
    
    const iconName = type === 'password' ? 'eye' : 'eye-off';
    const newSvg = type === 'password' 
      ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
      : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line></svg>';
    
    togglePasswordBtn.innerHTML = newSvg;
    
    setTimeout(() => {
      togglePasswordBtn.classList.remove('eye-opening');
    }, 200);
  }, 100);
}

function vibrarCampos() {
  usernameInput.style.animation = 'shake 0.5s';
  passwordInput.style.animation = 'shake 0.5s';
  
  setTimeout(() => {
    usernameInput.style.animation = '';
    passwordInput.style.animation = '';
  }, 500);
  
  if (!document.getElementById('shake-animation')) {
    const style = document.createElement('style');
    style.id = 'shake-animation';
    style.textContent = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
      }
    `;
    document.head.appendChild(style);
  }
}

async function mostrarAnimacionExito(nombre, rol) {
  return Swal.fire({
    title: '¡Bienvenido!',
    html: `
      <div style="text-align: center;">
        <div style="font-size: 64px; margin-bottom: 16px;"></div>
        <p style="font-size: 18px; margin-bottom: 8px;">${nombre}</p>
        <p style="font-size: 14px; color: #757575;">${rol.charAt(0).toUpperCase() + rol.slice(1)}</p>
      </div>
    `,
    icon: 'success',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    customClass: {
      popup: 'animated-popup'
    }
  });
}


const rememberMeCheckbox = document.getElementById('rememberMe');
const savedUsername = localStorage.getItem('rememberedUsername');

if (savedUsername) {
  usernameInput.value = savedUsername;
  rememberMeCheckbox.checked = true;
}

rememberMeCheckbox.addEventListener('change', (e) => {
  if (!e.target.checked) {
    localStorage.removeItem('rememberedUsername');
  }
});

loginForm.addEventListener('submit', () => {
  if (rememberMeCheckbox.checked) {
    localStorage.setItem('rememberedUsername', usernameInput.value.trim());
  } else {
    localStorage.removeItem('rememberedUsername');
  }
});


document.querySelector('.forgot-password').addEventListener('click', (e) => {
  e.preventDefault();
  
  Swal.fire({
    title: 'Recuperar Contraseña',
    html: `
      <p style="margin-bottom: 16px;">Ingresa tu correo electrónico y te enviaremos instrucciones para recuperar tu contraseña.</p>
      <input type="email" id="recoveryEmail" class="swal2-input" placeholder="correo@ejemplo.com">
    `,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Enviar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    preConfirm: () => {
      const email = document.getElementById('recoveryEmail').value;
      if (!email) {
        Swal.showValidationMessage('Por favor ingresa tu correo electrónico');
        return false;
      }
      if (!email.includes('@')) {
        Swal.showValidationMessage('Por favor ingresa un correo válido');
        return false;
      }
      return email;
    }
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: '¡Enviado!',
        text: 'Revisa tu correo electrónico para continuar con la recuperación de tu contraseña.',
        icon: 'success',
        confirmButtonColor: '#4a5259'
      });
    }
  });
});


setTimeout(() => {
  usernameInput.focus();
}, 300);

console.log('CEMI Classroom Login inicializado correctamente');



