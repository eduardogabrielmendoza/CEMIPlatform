
const API_URL = window.API_URL || "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  const welcomeMsg = document.getElementById("welcomeMessage");
  if (welcomeMsg && localStorage.getItem("nombre")) {
    welcomeMsg.textContent = `Bienvenido, ${localStorage.getItem("nombre")} `;
  }

  if (document.body.classList.contains("admin")) initAdminDashboard();
  if (document.body.classList.contains("profesor")) initProfesorDashboard();
  if (document.body.classList.contains("alumno")) initAlumnoDashboard();
});

async function handleLogin(e) {
  e.preventDefault();
  console.log(" Iniciando proceso de login...");

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("loginMessage");
  const loader = document.getElementById("loader");

  console.log(" Usuario:", username);

  // Mostrar loader
  if (loader) {
    loader.classList.add("show");
  }

  message.style.color = "gray";
  message.textContent = "";

  try {
    console.log(" Enviando petición a:", `${API_URL}/auth/login`);
    const startTime = Date.now();
    const resp = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    
    console.log(" Respuesta recibida - Status:", resp.status);
    const data = await resp.json();
    console.log(" Datos recibidos:", data);

    if (resp.ok && data.success) {
        console.log(" Login exitoso, guardando datos...");
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        localStorage.setItem("rol", data.rol);
        localStorage.setItem("id_usuario", data.id_usuario);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("username", data.username);
        if (data.id_profesor) localStorage.setItem("id_profesor", data.id_profesor);
        if (data.id_alumno) localStorage.setItem("id_alumno", data.id_alumno);
        if (data.id_administrador) localStorage.setItem("id_administrador", data.id_administrador);
        
      message.style.color = "green";
      message.textContent = "Inicio de sesión exitoso";

      const rol = data.rol.toLowerCase();
      console.log(" Rol detectado:", rol);
      console.log(" Redirigiendo...");
      
      // Delay mínimo de 1500ms para apreciar el loader
      const elapsedTime = Date.now() - startTime;
      const minDelay = 1500;
      const remainingDelay = Math.max(0, minDelay - elapsedTime);
      
      await new Promise(resolve => setTimeout(resolve, remainingDelay));
      
      if (rol === "admin" || rol === "administrador") {
        console.log("️ Redirigiendo a dashboard_admin.html");
        window.location.href = "dashboard_admin.html";
      } else if (rol === "profesor") {
        console.log("️ Redirigiendo a dashboard_profesor.html");
        window.location.href = "dashboard_profesor.html";
      } else if (rol === "alumno") {
        console.log("️ Redirigiendo a dashboard_alumno.html");
        window.location.href = "dashboard_alumno.html";
      } else {
        console.log("️ Redirigiendo a index.html");
        window.location.href = "index.html";
      }
    } else {
      console.error(" Login fallido:", data.message);
      // Ocultar loader en error
      if (loader) {
        loader.classList.remove("show");
      }
      message.style.color = "red";
      message.textContent = data.message || "Usuario o contraseña incorrectos.";
    }
  } catch (err) {
    console.error(" Error al conectar:", err);
    // Ocultar loader en error
    if (loader) {
      loader.classList.remove("show");
    }
    message.style.color = "red";
    message.textContent = "No se pudo conectar con el servidor.";
  }
}

function handleLogout() {
  localStorage.clear();
  window.location.href = "index.html";
}


document.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("admin")) {
    initAdminSPA();
  }
});

function initAdminSPA() {
  const buttons = document.querySelectorAll(".sidebar-menu button");
  const mainContent = document.getElementById("mainContent");
  const loader = document.getElementById("loader");

  buttons.forEach(btn => {
    btn.addEventListener("click", async () => {
      buttons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const section = btn.id.replace("btn", "").toLowerCase();
      await loadSection(section);
    });
  });

  loadSection("cursos");

  async function loadSection(section) {
    const chatContainer = document.getElementById('adminChatContainer');
    if (chatContainer) {
      chatContainer.style.display = 'none';
    }
    
    mainContent.classList.remove("active");
    loader.classList.remove("hidden");
    mainContent.innerHTML = "";

    try {
      let html = "";
      let endpoint = "";

      switch (section) {
        case "cursos":
          endpoint = `${API_URL}/cursos`;
          html = ``;
          break;
        case "alumnos":
          endpoint = `${API_URL}/alumnos`;
          html = ``;
          break;
        case "profesores":
          endpoint = `${API_URL}/profesores`;
          html = ``;
          break;
        case "administradores":
          endpoint = `${API_URL}/administradores`;
          html = ``;
          break;
        case "pagos":
          endpoint = `${API_URL}/pagos`;
          html = ``;
          break;
        case "aulas":
          endpoint = `${API_URL}/aulas`;
          html = ``;
          break;
        case "idiomas":
          endpoint = `${API_URL}/idiomas`;
          html = ``;
          break;
        case "investigacion":
          loader.classList.add("hidden");
          mainContent.innerHTML = await renderInvestigacionSection();
          mainContent.classList.add("active");
          lucide.createIcons();
          initInvestigacionInteractivity();
          return;
        case "chatsoporte":
          loader.classList.add("hidden");
          mainContent.innerHTML = "";
          mainContent.classList.add("active");
          
          const chatContainer = document.getElementById('adminChatContainer');
          if (chatContainer) {
            chatContainer.style.display = 'block';
            adminChatManager.renderChatView();
          }
          return; // Salir antes del setTimeout normal
        case "classroom":
          window.location.href = 'classroom-login.html';
          return;
        case "ayuda":
          loader.classList.add("hidden");
          mainContent.innerHTML = renderAdminAyuda();
          mainContent.classList.add("active");
          lucide.createIcons();
          initAyudaInteractivity();
          return;
        case "status":
          loader.classList.add("hidden");
          mainContent.innerHTML = renderStatusSection();
          mainContent.classList.add("active");
          lucide.createIcons();
          await initStatusInteractivity();
          return;
        default:
          endpoint = "";
          html = "<p>Seleccione una sección</p>";
      }

      if (endpoint) {
        const res = await fetch(endpoint);
        const data = await res.json();

        if (section === 'pagos') {
          html += generateTable(section, data);
        } else if (section === 'aulas' || section === 'idiomas') {
          html += generateTable(section, data);
        } else if (data && data.length > 0) {
          html += generateTable(section, data);
        } else {
          html += "<p>No hay datos disponibles.</p>";
        }
      }

      setTimeout(() => {
        loader.classList.add("hidden");
        mainContent.innerHTML = html;
        if (section === 'cursos') {
          lucide.createIcons();
          setupCursoFilters();
          
          document.querySelectorAll('.curso-card-new').forEach(card => {
            card.addEventListener('click', () => {
              const idCurso = card.getAttribute('data-id');
              openCursoPanel(idCurso);
            });
          });
        }
        if (section === 'alumnos') {
          lucide.createIcons();
          setupAlumnoFilters();
        }
        if (section === 'profesores') {
          lucide.createIcons();
          setupProfesorFilters();
        }
        if (section === 'administradores') {
          lucide.createIcons();
          setupAdministradorFilters();
        }
        if (section === 'pagos') {
          lucide.createIcons();
          loadPagosData();
        }
        if (section === 'aulas') {
          lucide.createIcons();
          setupAulaFilters();
        }
        if (section === 'idiomas') {
          lucide.createIcons();
          setupIdiomaFilters();
        }
        mainContent.classList.add("active");
      }, 400);
    } catch (err) {
      console.error("Error al cargar sección:", err);
      loader.classList.add("hidden");
      mainContent.innerHTML = "<p>Error al cargar los datos.</p>";
      mainContent.classList.add("active");
    }
  }
}

function recargarSeccionActiva() {
  const activeBtn = document.querySelector('.sidebar-menu button.active');
  if (activeBtn) {
    activeBtn.click();
  }
}


function renderAdminAyuda() {
  return `
    <div class="ayuda-container">
      <div class="ayuda-header">
        <h2 style="color: white;"><i data-lucide="help-circle"></i> Centro de Ayuda</h2>
        <p>Guías completas para administrar el sistema CEMI</p>
        <div class="ayuda-stats">
          <div class="ayuda-stat-item">
            <div class="ayuda-stat-number">30+</div>
            <div class="ayuda-stat-label">Guías disponibles</div>
          </div>
          <div class="ayuda-stat-item">
            <div class="ayuda-stat-number">10</div>
            <div class="ayuda-stat-label">Categorías</div>
          </div>
          <div class="ayuda-stat-item">
            <div class="ayuda-stat-number">24/7</div>
            <div class="ayuda-stat-label">Acceso disponible</div>
          </div>
        </div>
      </div>

      <div class="ayuda-search-container">
        <i data-lucide="search" class="search-icon"></i>
        <input type="text" class="ayuda-search-input" id="ayudaSearchInput" placeholder="¿Qué necesitas aprender hoy?" autocomplete="off">
        <div class="search-suggestions">
          <span class="search-suggestion" onclick="document.getElementById('ayudaSearchInput').value='curso'; document.getElementById('ayudaSearchInput').dispatchEvent(new Event('input'))">Cursos</span>
          <span class="search-suggestion" onclick="document.getElementById('ayudaSearchInput').value='alumno'; document.getElementById('ayudaSearchInput').dispatchEvent(new Event('input'))">Alumnos</span>
          <span class="search-suggestion" onclick="document.getElementById('ayudaSearchInput').value='pago'; document.getElementById('ayudaSearchInput').dispatchEvent(new Event('input'))">Pagos</span>
          <span class="search-suggestion" onclick="document.getElementById('ayudaSearchInput').value='profesor'; document.getElementById('ayudaSearchInput').dispatchEvent(new Event('input'))">Profesores</span>
        </div>
      </div>

      <div class="search-results-count" id="searchResultsCount"></div>
      <div class="no-results-message" id="noResultsMessage">
        <i data-lucide="search-x"></i>
        <h3>No se encontraron resultados</h3>
        <p>Intenta con otros términos de búsqueda o explora las categorías</p>
      </div>

      <div class="ayuda-quick-access">
        <div class="quick-access-card" onclick="document.querySelector('[data-category=cursos] .accordion-header').click()">
          <div class="qa-icon"><i data-lucide="book-open"></i></div>
          <div class="qa-text"><h4>Gestionar Cursos</h4><span>Crear y editar</span></div>
        </div>
        <div class="quick-access-card" onclick="document.querySelector('[data-category=alumnos] .accordion-header').click()">
          <div class="qa-icon"><i data-lucide="users"></i></div>
          <div class="qa-text"><h4>Gestionar Alumnos</h4><span>Registros</span></div>
        </div>
        <div class="quick-access-card" onclick="document.querySelector('[data-category=pagos] .accordion-header').click()">
          <div class="qa-icon"><i data-lucide="credit-card"></i></div>
          <div class="qa-text"><h4>Control de Pagos</h4><span>Cuotas</span></div>
        </div>
        <div class="quick-access-card" onclick="document.querySelector('[data-category=chat] .accordion-header').click()">
          <div class="qa-icon"><i data-lucide="message-circle"></i></div>
          <div class="qa-text"><h4>Soporte</h4><span>Mensajes</span></div>
        </div>
      </div>

      <div class="ayuda-categorias" id="ayudaCategorias">
        
        <!-- Primeros Pasos -->
        <div class="ayuda-accordion" data-category="inicio">
          <div class="accordion-header">
            <div class="accordion-title">
              <div class="cat-icon"><i data-lucide="home"></i></div>
              <div class="accordion-title-text"><span>Primeros Pasos</span><small>Aprende a navegar el panel administrativo</small></div>
            </div>
            <div class="accordion-meta">
              <span class="accordion-count">2 guías</span>
              <i data-lucide="chevron-down" class="accordion-icon"></i>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="guia-list">
                <div class="guia-item" data-keywords="inicio bienvenida panel dashboard navegacion menu">
                  <div class="guia-icon"><i data-lucide="layout-dashboard"></i></div>
                  <div class="guia-content">
                    <h4>Navegación del Panel</h4>
                    <p>El menú lateral izquierdo te da acceso a todas las secciones: Cursos, Alumnos, Profesores, Administradores, Pagos, Aulas, Idiomas y Chat.</p>
                    <div class="guia-tags"><span class="guia-tag">Básico</span><span class="guia-tag">Navegación</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="entender panel resumen funciones admin control total">
                  <div class="guia-icon"><i data-lucide="info"></i></div>
                  <div class="guia-content">
                    <h4>Funciones del Administrador</h4>
                    <p>Control total sobre: gestión de cursos, registro de alumnos y profesores, control de pagos, configuración de aulas e idiomas, y soporte.</p>
                    <div class="guia-tags"><span class="guia-tag">Roles</span><span class="guia-tag">Permisos</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de Cursos -->
        <div class="ayuda-accordion" data-category="cursos">
          <div class="accordion-header">
            <div class="accordion-title">
              <div class="cat-icon"><i data-lucide="book-open"></i></div>
              <div class="accordion-title-text"><span>Gestión de Cursos</span><small>Crear, editar y administrar cursos</small></div>
            </div>
            <div class="accordion-meta">
              <span class="accordion-count">5 guías</span>
              <i data-lucide="chevron-down" class="accordion-icon"></i>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="guia-list">
                <div class="guia-item" data-keywords="crear nuevo curso agregar añadir formulario">
                  <div class="guia-icon"><i data-lucide="plus-circle"></i></div>
                  <div class="guia-content">
                    <h4>Crear Nuevo Curso</h4>
                    <p>Haz clic en "Nuevo Curso", completa nombre, idioma, nivel, horario, cupo y aula. Luego podrás asignar profesor.</p>
                    <div class="guia-tags"><span class="guia-tag">Crear</span><span class="guia-tag">Curso</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="editar modificar curso cambiar actualizar">
                  <div class="guia-icon"><i data-lucide="edit"></i></div>
                  <div class="guia-content">
                    <h4>Editar Curso</h4>
                    <p>En cada tarjeta de curso, haz clic en el ícono de lápiz para modificar horario, aula, cupo y otros detalles.</p>
                    <div class="guia-tags"><span class="guia-tag">Editar</span><span class="guia-tag">Modificar</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="eliminar borrar curso quitar remover">
                  <div class="guia-icon"><i data-lucide="trash-2"></i></div>
                  <div class="guia-content">
                    <h4>Eliminar Curso</h4>
                    <p>Haz clic en papelera para eliminar. Solo puedes eliminar cursos sin alumnos inscritos.</p>
                    <div class="guia-tags"><span class="guia-tag">Eliminar</span><span class="guia-tag">Borrar</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="asignar profesor docente curso vincular">
                  <div class="guia-icon"><i data-lucide="user-check"></i></div>
                  <div class="guia-content">
                    <h4>Asignar Profesor</h4>
                    <p>Usa el botón verde para asignar o cambiar el profesor de un curso desde la lista disponible.</p>
                    <div class="guia-tags"><span class="guia-tag">Profesor</span><span class="guia-tag">Asignar</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="ver detalles curso informacion alumnos lista">
                  <div class="guia-icon"><i data-lucide="eye"></i></div>
                  <div class="guia-content">
                    <h4>Ver Detalles del Curso</h4>
                    <p>Haz clic en la tarjeta para ver información completa, lista de alumnos y opciones de gestión.</p>
                    <div class="guia-tags"><span class="guia-tag">Detalles</span><span class="guia-tag">Info</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de Alumnos -->
        <div class="ayuda-accordion" data-category="alumnos">
          <div class="accordion-header">
            <div class="accordion-title">
              <div class="cat-icon"><i data-lucide="users"></i></div>
              <div class="accordion-title-text"><span>Gestión de Alumnos</span><small>Registro, edición y seguimiento</small></div>
            </div>
            <div class="accordion-meta">
              <span class="accordion-count">5 guías</span>
              <i data-lucide="chevron-down" class="accordion-icon"></i>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="guia-list">
                <div class="guia-item" data-keywords="registrar nuevo alumno crear agregar estudiante matricula">
                  <div class="guia-icon"><i data-lucide="user-plus"></i></div>
                  <div class="guia-content">
                    <h4>Registrar Alumno</h4>
                    <p>Haz clic en "Nuevo Alumno" y completa datos. El sistema genera legajo y credenciales automáticamente.</p>
                    <div class="guia-tags"><span class="guia-tag">Registro</span><span class="guia-tag">Nuevo</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="editar modificar alumno informacion datos actualizar">
                  <div class="guia-icon"><i data-lucide="edit"></i></div>
                  <div class="guia-content">
                    <h4>Editar Información</h4>
                    <p>Accede a la tarjeta del alumno para modificar datos personales, contacto o cursos inscritos.</p>
                    <div class="guia-tags"><span class="guia-tag">Editar</span><span class="guia-tag">Datos</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="estado alumno activo inactivo cambiar baja alta">
                  <div class="guia-icon"><i data-lucide="toggle-left"></i></div>
                  <div class="guia-content">
                    <h4>Cambiar Estado</h4>
                    <p>Marca alumnos como "Activo" o "Inactivo". Los inactivos no acceden al sistema pero sus datos se conservan.</p>
                    <div class="guia-tags"><span class="guia-tag">Estado</span><span class="guia-tag">Activo</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="descargar pdf lista alumnos exportar reporte imprimir">
                  <div class="guia-icon"><i data-lucide="file-down"></i></div>
                  <div class="guia-content">
                    <h4>Descargar PDF</h4>
                    <p>Genera PDF con lista completa de alumnos para reportes e impresiones.</p>
                    <div class="guia-tags"><span class="guia-tag">PDF</span><span class="guia-tag">Exportar</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="buscar filtrar alumno nombre legajo email encontrar">
                  <div class="guia-icon"><i data-lucide="search"></i></div>
                  <div class="guia-content">
                    <h4>Buscar y Filtrar</h4>
                    <p>Usa el buscador para encontrar alumnos por nombre, legajo o email. Filtra por estado.</p>
                    <div class="guia-tags"><span class="guia-tag">Búsqueda</span><span class="guia-tag">Filtros</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de Profesores -->
        <div class="ayuda-accordion" data-category="profesores">
          <div class="accordion-header">
            <div class="accordion-title">
              <div class="cat-icon"><i data-lucide="graduation-cap"></i></div>
              <div class="accordion-title-text"><span>Gestión de Profesores</span><small>Registro y asignación de docentes</small></div>
            </div>
            <div class="accordion-meta">
              <span class="accordion-count">3 guías</span>
              <i data-lucide="chevron-down" class="accordion-icon"></i>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="guia-list">
                <div class="guia-item" data-keywords="registrar nuevo profesor crear agregar docente alta">
                  <div class="guia-icon"><i data-lucide="user-plus"></i></div>
                  <div class="guia-content">
                    <h4>Registrar Profesor</h4>
                    <p>Haz clic en "Nuevo Profesor" y completa los datos. El sistema genera las credenciales de acceso.</p>
                    <div class="guia-tags"><span class="guia-tag">Registro</span><span class="guia-tag">Docente</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="asignar curso profesor vincular multiple">
                  <div class="guia-icon"><i data-lucide="link"></i></div>
                  <div class="guia-content">
                    <h4>Asignar a Cursos</h4>
                    <p>Desde Cursos puedes asignar profesores. Un profesor puede tener múltiples cursos asignados.</p>
                    <div class="guia-tags"><span class="guia-tag">Asignar</span><span class="guia-tag">Cursos</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="descargar pdf profesores exportar lista reporte">
                  <div class="guia-icon"><i data-lucide="file-down"></i></div>
                  <div class="guia-content">
                    <h4>Descargar PDF</h4>
                    <p>Genera un reporte PDF con la lista de profesores usando "Descargar Información".</p>
                    <div class="guia-tags"><span class="guia-tag">PDF</span><span class="guia-tag">Exportar</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de Administradores -->
        <div class="ayuda-accordion" data-category="admins">
          <div class="accordion-header">
            <div class="accordion-title">
              <div class="cat-icon"><i data-lucide="shield"></i></div>
              <div class="accordion-title-text"><span>Gestión de Administradores</span><small>Control de acceso administrativo</small></div>
            </div>
            <div class="accordion-meta">
              <span class="accordion-count">2 guías</span>
              <i data-lucide="chevron-down" class="accordion-icon"></i>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="guia-list">
                <div class="guia-item" data-keywords="crear nuevo administrador agregar admin usuario">
                  <div class="guia-icon"><i data-lucide="shield-plus"></i></div>
                  <div class="guia-content">
                    <h4>Crear Nuevo Administrador</h4>
                    <p>Agrega nuevos administradores con acceso completo al sistema. Define sus credenciales de acceso.</p>
                    <div class="guia-tags"><span class="guia-tag">Admin</span><span class="guia-tag">Crear</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="permisos acceso administrador seguridad control">
                  <div class="guia-icon"><i data-lucide="lock"></i></div>
                  <div class="guia-content">
                    <h4>Permisos de Acceso</h4>
                    <p>Todos los administradores tienen acceso completo. Gestiona con cuidado quién tiene este rol.</p>
                    <div class="guia-tags"><span class="guia-tag">Permisos</span><span class="guia-tag">Seguridad</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de Pagos -->
        <div class="ayuda-accordion" data-category="pagos">
          <div class="accordion-header">
            <div class="accordion-title">
              <div class="cat-icon"><i data-lucide="credit-card"></i></div>
              <div class="accordion-title-text"><span>Gestión de Pagos</span><small>Control de cuotas y comprobantes</small></div>
            </div>
            <div class="accordion-meta">
              <span class="accordion-count">3 guías</span>
              <i data-lucide="chevron-down" class="accordion-icon"></i>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="guia-list">
                <div class="guia-item" data-keywords="ver historial pagos lista cuotas estado consultar">
                  <div class="guia-icon"><i data-lucide="list"></i></div>
                  <div class="guia-content">
                    <h4>Ver Historial de Pagos</h4>
                    <p>Visualiza pagos con filtros por estado (pagado, pendiente, efectivo pendiente), fecha y alumno.</p>
                    <div class="guia-tags"><span class="guia-tag">Historial</span><span class="guia-tag">Filtros</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="registrar pago efectivo confirmar aprobar validar ticket">
                  <div class="guia-icon"><i data-lucide="check-circle"></i></div>
                  <div class="guia-content">
                    <h4>Confirmar Pago en Efectivo</h4>
                    <p>Cuando un alumno paga con ticket, busca el pago pendiente y confírmalo para actualizarlo.</p>
                    <div class="guia-tags"><span class="guia-tag">Confirmar</span><span class="guia-tag">Efectivo</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="archivo archivar pagos ocultar antiguos limpiar">
                  <div class="guia-icon"><i data-lucide="archive"></i></div>
                  <div class="guia-content">
                    <h4>Archivo de Pagos</h4>
                    <p>Archiva pagos antiguos para mantener la lista limpia. Se pueden consultar en la sección de archivo.</p>
                    <div class="guia-tags"><span class="guia-tag">Archivar</span><span class="guia-tag">Organizar</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de Aulas -->
        <div class="ayuda-accordion" data-category="aulas">
          <div class="accordion-header">
            <div class="accordion-title">
              <div class="cat-icon"><i data-lucide="door-open"></i></div>
              <div class="accordion-title-text"><span>Gestión de Aulas</span><small>Espacios físicos del instituto</small></div>
            </div>
            <div class="accordion-meta">
              <span class="accordion-count">2 guías</span>
              <i data-lucide="chevron-down" class="accordion-icon"></i>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="guia-list">
                <div class="guia-item" data-keywords="crear nueva aula agregar salon espacio capacidad">
                  <div class="guia-icon"><i data-lucide="plus-circle"></i></div>
                  <div class="guia-content">
                    <h4>Crear Nueva Aula</h4>
                    <p>Define aulas con nombre/número y capacidad. Estarán disponibles para asignar a cursos.</p>
                    <div class="guia-tags"><span class="guia-tag">Crear</span><span class="guia-tag">Aula</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="asignar aula curso vincular espacio seleccionar">
                  <div class="guia-icon"><i data-lucide="link"></i></div>
                  <div class="guia-content">
                    <h4>Asignar a Cursos</h4>
                    <p>Al crear o editar un curso, selecciona el aula donde se dictará.</p>
                    <div class="guia-tags"><span class="guia-tag">Asignar</span><span class="guia-tag">Vincular</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gestión de Idiomas -->
        <div class="ayuda-accordion" data-category="idiomas">
          <div class="accordion-header">
            <div class="accordion-title">
              <div class="cat-icon"><i data-lucide="languages"></i></div>
              <div class="accordion-title-text"><span>Gestión de Idiomas</span><small>Configuración de lenguas disponibles</small></div>
            </div>
            <div class="accordion-meta">
              <span class="accordion-count">2 guías</span>
              <i data-lucide="chevron-down" class="accordion-icon"></i>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="guia-list">
                <div class="guia-item" data-keywords="agregar nuevo idioma crear lengua ingles frances portugues">
                  <div class="guia-icon"><i data-lucide="plus-circle"></i></div>
                  <div class="guia-content">
                    <h4>Agregar Idiomas</h4>
                    <p>Define los idiomas que se enseñan (Inglés, Francés, Portugués, etc.). Estarán disponibles al crear cursos.</p>
                    <div class="guia-tags"><span class="guia-tag">Idioma</span><span class="guia-tag">Agregar</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="configurar niveles idioma basico intermedio avanzado dificultad">
                  <div class="guia-icon"><i data-lucide="sliders"></i></div>
                  <div class="guia-content">
                    <h4>Configurar Niveles</h4>
                    <p>Los niveles (Básico, Intermedio, Avanzado) clasifican el grado de dificultad de cada curso.</p>
                    <div class="guia-tags"><span class="guia-tag">Niveles</span><span class="guia-tag">Config</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chat Soporte -->
        <div class="ayuda-accordion" data-category="chat">
          <div class="accordion-header">
            <div class="accordion-title">
              <div class="cat-icon"><i data-lucide="message-circle"></i></div>
              <div class="accordion-title-text"><span>Chat de Soporte</span><small>Atención a usuarios del sistema</small></div>
            </div>
            <div class="accordion-meta">
              <span class="accordion-count">3 guías</span>
              <i data-lucide="chevron-down" class="accordion-icon"></i>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="guia-list">
                <div class="guia-item" data-keywords="responder mensajes chat usuarios alumnos profesores atender">
                  <div class="guia-icon"><i data-lucide="message-square"></i></div>
                  <div class="guia-content">
                    <h4>Responder Mensajes</h4>
                    <p>Recibirás notificaciones cuando usuarios envíen mensajes. Accede al chat para ver y responder.</p>
                    <div class="guia-tags"><span class="guia-tag">Mensajes</span><span class="guia-tag">Responder</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="gestionar conversaciones atender cerrar chat pendientes activas">
                  <div class="guia-icon"><i data-lucide="inbox"></i></div>
                  <div class="guia-content">
                    <h4>Gestionar Conversaciones</h4>
                    <p>Ve todas las conversaciones activas, filtra por estado y atiende múltiples consultas.</p>
                    <div class="guia-tags"><span class="guia-tag">Gestión</span><span class="guia-tag">Filtros</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="notificaciones alerta badge nuevo mensaje tiempo real">
                  <div class="guia-icon"><i data-lucide="bell"></i></div>
                  <div class="guia-content">
                    <h4>Notificaciones</h4>
                    <p>El badge rojo indica mensajes sin leer. Habilita notificaciones del navegador para alertas en tiempo real.</p>
                    <div class="guia-tags"><span class="guia-tag">Alertas</span><span class="guia-tag">Badge</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- FAQ -->
        <div class="ayuda-accordion" data-category="faq">
          <div class="accordion-header">
            <div class="accordion-title">
              <div class="cat-icon"><i data-lucide="message-square-text"></i></div>
              <div class="accordion-title-text"><span>Preguntas Frecuentes</span><small>Respuestas rápidas a dudas comunes</small></div>
            </div>
            <div class="accordion-meta">
              <span class="accordion-count">4 guías</span>
              <i data-lucide="chevron-down" class="accordion-icon"></i>
            </div>
          </div>
          <div class="accordion-content">
            <div class="accordion-body">
              <div class="guia-list">
                <div class="guia-item" data-keywords="restablecer contraseña usuario olvidó password reset clave">
                  <div class="guia-icon"><i data-lucide="key"></i></div>
                  <div class="guia-content">
                    <h4>¿Cómo restablezco contraseña de un usuario?</h4>
                    <p>Accede al perfil del alumno o profesor y usa la opción de restablecer. Se genera contraseña temporal.</p>
                    <div class="guia-tags"><span class="guia-tag">Contraseña</span><span class="guia-tag">Reset</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="eliminar borrar curso alumnos inscritos error no puedo">
                  <div class="guia-icon"><i data-lucide="alert-triangle"></i></div>
                  <div class="guia-content">
                    <h4>¿No puedo eliminar un curso?</h4>
                    <p>Cursos con alumnos inscritos no pueden eliminarse. Primero desvincular o transferir alumnos.</p>
                    <div class="guia-tags"><span class="guia-tag">Eliminar</span><span class="guia-tag">Error</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="backup respaldo datos base datos automatico railway">
                  <div class="guia-icon"><i data-lucide="database"></i></div>
                  <div class="guia-content">
                    <h4>¿Se hacen respaldos automáticos?</h4>
                    <p>Railway realiza respaldos automáticos. Para respaldos manuales, contacta al administrador técnico.</p>
                    <div class="guia-tags"><span class="guia-tag">Backup</span><span class="guia-tag">Datos</span></div>
                  </div>
                </div>
                <div class="guia-item" data-keywords="problema error funciona mal bug reporte tecnico sistema">
                  <div class="guia-icon"><i data-lucide="bug"></i></div>
                  <div class="guia-content">
                    <h4>¿Encontré un error en el sistema?</h4>
                    <p>Documenta el error con capturas y pasos para reproducirlo. Contacta al equipo de desarrollo.</p>
                    <div class="guia-tags"><span class="guia-tag">Error</span><span class="guia-tag">Reporte</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div class="ayuda-tips">
        <h3><i data-lucide="lightbulb"></i> Tips para Administradores</h3>
        <div class="tips-list">
          <div class="tip-badge"><i data-lucide="refresh-cw"></i> Recarga la página si los datos no se actualizan</div>
          <div class="tip-badge"><i data-lucide="bell"></i> Habilita notificaciones del chat para responder rápido</div>
          <div class="tip-badge"><i data-lucide="file-down"></i> Exporta PDFs para reportes e impresiones</div>
          <div class="tip-badge"><i data-lucide="archive"></i> Archiva pagos antiguos regularmente para mantener orden</div>
        </div>
      </div>

      <div class="ayuda-footer">
        <p>¿No encontraste lo que buscabas? Consulta la documentación técnica.</p>
        <div class="ayuda-footer-links">
          <span class="ayuda-footer-link" onclick="window.open('ayuda.html', '_blank')">
            <i data-lucide="external-link"></i> Centro de Ayuda Completo
          </span>
        </div>
      </div>
    </div>
  `;
}

function initAyudaInteractivity() {
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const accordion = header.parentElement;
      accordion.classList.toggle('open');
    });
  });

  const searchInput = document.getElementById('ayudaSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      filterAyudaContent(query);
    });
  }

  document.querySelectorAll('.guia-item').forEach(item => {
    item.addEventListener('click', () => {
      openGuiaModal(item);
    });
  });
}

const guiasDetalladas = {
  'Navegación del Panel': {
    descripcion: 'El menú lateral izquierdo es tu centro de control. Desde aquí puedes acceder a todas las funcionalidades del sistema de manera organizada y eficiente.',
    pasos: [
      { titulo: 'Localiza el menú lateral', desc: 'El menú está ubicado en el lado izquierdo de la pantalla, siempre visible.' },
      { titulo: 'Explora las secciones', desc: 'Cada ícono representa una sección diferente del sistema.' },
      { titulo: 'Haz clic para navegar', desc: 'Un solo clic te llevará a la sección seleccionada.' },
      { titulo: 'Observa los indicadores', desc: 'Los badges rojos indican notificaciones pendientes.' }
    ],
    tip: 'En dispositivos móviles, el menú se oculta automáticamente. Usa el ícono de menú para desplegarlo.'
  },
  'Funciones del Administrador': {
    descripcion: 'Como administrador tienes acceso completo a todas las funciones del sistema. Tu rol es fundamental para mantener la operación del instituto.',
    pasos: [
      { titulo: 'Gestión de Cursos', desc: 'Crear, editar, eliminar cursos y asignar profesores.' },
      { titulo: 'Gestión de Usuarios', desc: 'Registrar alumnos, profesores y otros administradores.' },
      { titulo: 'Control Financiero', desc: 'Supervisar pagos, confirmar efectivo y generar reportes.' },
      { titulo: 'Soporte', desc: 'Responder consultas de usuarios a través del chat.' }
    ],
    tip: 'Realiza respaldos periódicos de información importante exportando PDFs de las listas de usuarios.'
  },
  'Crear Nuevo Curso': {
    descripcion: 'El proceso de creación de cursos es simple y te permite configurar todos los aspectos necesarios para que el curso funcione correctamente.',
    pasos: [
      { titulo: 'Haz clic en "Nuevo Curso"', desc: 'El botón está en la esquina superior derecha de la sección Cursos.' },
      { titulo: 'Completa el formulario', desc: 'Nombre, idioma, nivel, días, horario y cupo máximo.' },
      { titulo: 'Selecciona el aula', desc: 'Elige un aula disponible de la lista.' },
      { titulo: 'Guarda los cambios', desc: 'El curso aparecerá en la lista inmediatamente.' }
    ],
    tip: 'Puedes asignar un profesor después de crear el curso usando el botón de asignación.'
  },
  'Editar Curso': {
    descripcion: 'Modifica cualquier aspecto de un curso existente sin afectar a los alumnos ya inscritos.',
    pasos: [
      { titulo: 'Localiza el curso', desc: 'Usa el buscador o navega por las tarjetas de cursos.' },
      { titulo: 'Haz clic en editar', desc: 'Es el ícono de lápiz en la tarjeta del curso.' },
      { titulo: 'Modifica los campos', desc: 'Cambia los valores que necesites actualizar.' },
      { titulo: 'Confirma los cambios', desc: 'Haz clic en Guardar para aplicar las modificaciones.' }
    ],
    tip: 'Los cambios de horario se reflejan inmediatamente en los dashboards de profesores y alumnos.'
  },
  'Eliminar Curso': {
    descripcion: 'Elimina cursos que ya no se dictan. Esta acción requiere confirmación para evitar eliminaciones accidentales.',
    pasos: [
      { titulo: 'Localiza el curso', desc: 'Encuentra el curso que deseas eliminar.' },
      { titulo: 'Verifica que no tenga alumnos', desc: 'Un curso con alumnos no puede eliminarse directamente.' },
      { titulo: 'Haz clic en eliminar', desc: 'Es el ícono de papelera en la tarjeta.' },
      { titulo: 'Confirma la acción', desc: 'Acepta el diálogo de confirmación.' }
    ],
    tip: 'Si necesitas eliminar un curso con alumnos, primero transfiere o desvincula a los estudiantes.'
  },
  'Asignar Profesor': {
    descripcion: 'Vincula un profesor a un curso para que pueda gestionar calificaciones y asistencias de ese curso.',
    pasos: [
      { titulo: 'Abre la tarjeta del curso', desc: 'Haz clic en el curso al que quieres asignar profesor.' },
      { titulo: 'Busca el botón de asignación', desc: 'Es el ícono verde con silueta de usuario.' },
      { titulo: 'Selecciona el profesor', desc: 'Elige de la lista de profesores disponibles.' },
      { titulo: 'Confirma la asignación', desc: 'El profesor ya podrá ver este curso en su panel.' }
    ],
    tip: 'Un profesor puede tener múltiples cursos asignados. Verifica su carga horaria antes de asignar.'
  },
  'Ver Detalles del Curso': {
    descripcion: 'Accede a toda la información del curso incluyendo lista de alumnos, calificaciones y estadísticas.',
    pasos: [
      { titulo: 'Haz clic en la tarjeta', desc: 'Cualquier parte de la tarjeta abre los detalles.' },
      { titulo: 'Revisa la información', desc: 'Verás horario, aula, profesor y cupo.' },
      { titulo: 'Consulta los alumnos', desc: 'La lista muestra todos los estudiantes inscritos.' },
      { titulo: 'Usa las acciones rápidas', desc: 'Editar, eliminar o gestionar desde aquí.' }
    ],
    tip: 'Desde los detalles puedes ver el progreso general del curso y estadísticas de rendimiento.'
  },
  'Registrar Alumno': {
    descripcion: 'El registro de alumnos es el primer paso para incorporar estudiantes al sistema. Los datos se validan automáticamente.',
    pasos: [
      { titulo: 'Haz clic en "Nuevo Alumno"', desc: 'Botón ubicado en la sección Alumnos.' },
      { titulo: 'Completa los datos personales', desc: 'Nombre, apellido, DNI, email y teléfono.' },
      { titulo: 'Asigna un curso inicial', desc: 'Selecciona el curso donde se inscribirá.' },
      { titulo: 'Guarda el registro', desc: 'El sistema genera legajo y credenciales automáticamente.' }
    ],
    tip: 'Las credenciales iniciales usan el DNI como usuario y contraseña. El alumno puede cambiarlas.'
  },
  'Editar Información': {
    descripcion: 'Actualiza los datos de un alumno cuando sea necesario. Los cambios se aplican inmediatamente.',
    pasos: [
      { titulo: 'Busca al alumno', desc: 'Usa el buscador por nombre, legajo o DNI.' },
      { titulo: 'Abre su perfil', desc: 'Haz clic en la tarjeta del alumno.' },
      { titulo: 'Haz clic en editar', desc: 'Modifica los campos necesarios.' },
      { titulo: 'Guarda los cambios', desc: 'La información se actualiza en todo el sistema.' }
    ],
    tip: 'El legajo y DNI solo pueden modificarse por motivos de corrección de errores.'
  },
  'Cambiar Estado': {
    descripcion: 'Gestiona el estado de los usuarios: activos pueden acceder al sistema, inactivos no.',
    pasos: [
      { titulo: 'Localiza al usuario', desc: 'Encuentra el alumno o profesor.' },
      { titulo: 'Abre las opciones', desc: 'Accede al menú de acciones del usuario.' },
      { titulo: 'Cambia el estado', desc: 'Selecciona Activo o Inactivo según corresponda.' },
      { titulo: 'Confirma el cambio', desc: 'El estado se actualiza inmediatamente.' }
    ],
    tip: 'Los usuarios inactivos conservan todos sus datos históricos para futuras consultas.'
  },
  'Descargar PDF': {
    descripcion: 'Genera documentos PDF con listas de usuarios, útiles para reportes impresos o archivos.',
    pasos: [
      { titulo: 'Ve a la sección deseada', desc: 'Alumnos, Profesores o Administradores.' },
      { titulo: 'Busca el botón de descarga', desc: 'Generalmente dice "Descargar Información".' },
      { titulo: 'Haz clic para generar', desc: 'El PDF se crea con los datos actuales.' },
      { titulo: 'Guarda o imprime', desc: 'El archivo se descarga automáticamente.' }
    ],
    tip: 'Los PDFs incluyen fecha de generación para control de versiones.'
  },
  'Buscar y Filtrar': {
    descripcion: 'Encuentra rápidamente usuarios o información específica usando los potentes filtros del sistema.',
    pasos: [
      { titulo: 'Localiza el buscador', desc: 'Está en la parte superior de cada sección.' },
      { titulo: 'Escribe tu búsqueda', desc: 'Nombre, legajo, DNI o email.' },
      { titulo: 'Revisa los resultados', desc: 'La lista se filtra en tiempo real.' },
      { titulo: 'Usa filtros adicionales', desc: 'Estado, curso u otros criterios disponibles.' }
    ],
    tip: 'La búsqueda no distingue mayúsculas/minúsculas y busca coincidencias parciales.'
  },
  'Registrar Profesor': {
    descripcion: 'Agrega nuevos profesores al sistema para que puedan gestionar sus cursos asignados.',
    pasos: [
      { titulo: 'Haz clic en "Nuevo Profesor"', desc: 'Botón en la sección Profesores.' },
      { titulo: 'Ingresa los datos', desc: 'Nombre, apellido, DNI, email, teléfono.' },
      { titulo: 'Define especialidad', desc: 'Idiomas o áreas que puede dictar.' },
      { titulo: 'Guarda el registro', desc: 'Se generan credenciales de acceso.' }
    ],
    tip: 'Después del registro, asigna cursos al profesor desde la sección Cursos.'
  },
  'Asignar a Cursos': {
    descripcion: 'Vincula profesores con cursos para que puedan gestionar sus clases.',
    pasos: [
      { titulo: 'Ve a la sección Cursos', desc: 'Desde el menú lateral.' },
      { titulo: 'Selecciona un curso', desc: 'El curso debe existir previamente.' },
      { titulo: 'Usa el botón de asignación', desc: 'Ícono de usuario en verde.' },
      { titulo: 'Elige el profesor', desc: 'Selecciona de la lista disponible.' }
    ],
    tip: 'Verifica que el profesor no tenga conflictos de horario antes de asignar.'
  },
  'Crear Nuevo Administrador': {
    descripcion: 'Agrega otros administradores que compartirán las responsabilidades de gestión del sistema.',
    pasos: [
      { titulo: 'Ve a Administradores', desc: 'Sección en el menú lateral.' },
      { titulo: 'Haz clic en "Nuevo Admin"', desc: 'Se abre el formulario de registro.' },
      { titulo: 'Completa los datos', desc: 'Nombre, email y credenciales.' },
      { titulo: 'Define permisos', desc: 'Todos los admins tienen acceso completo.' }
    ],
    tip: 'Limita el número de administradores a los estrictamente necesarios por seguridad.'
  },
  'Permisos de Acceso': {
    descripcion: 'Comprende cómo funciona el sistema de permisos y roles en la plataforma.',
    pasos: [
      { titulo: 'Administrador', desc: 'Acceso total a todas las funciones.' },
      { titulo: 'Profesor', desc: 'Gestión de cursos asignados, notas y asistencias.' },
      { titulo: 'Alumno', desc: 'Visualización de sus cursos, notas y pagos.' },
      { titulo: 'Seguridad', desc: 'Cada rol solo ve lo que le corresponde.' }
    ],
    tip: 'Revisa periódicamente los accesos y desactiva usuarios que ya no deban tener acceso.'
  },
  'Ver Historial de Pagos': {
    descripcion: 'Consulta todos los pagos realizados con diferentes estados y filtros disponibles.',
    pasos: [
      { titulo: 'Ve a la sección Pagos', desc: 'Desde el menú lateral.' },
      { titulo: 'Revisa la lista', desc: 'Muestra pagos ordenados por fecha.' },
      { titulo: 'Aplica filtros', desc: 'Por estado, fecha o alumno.' },
      { titulo: 'Consulta detalles', desc: 'Haz clic en un pago para más información.' }
    ],
    tip: 'Usa los filtros de estado para encontrar rápidamente pagos pendientes de confirmar.'
  },
  'Confirmar Pago en Efectivo': {
    descripcion: 'Cuando un alumno paga en efectivo con su ticket, debes confirmar el pago en el sistema.',
    pasos: [
      { titulo: 'Recibe el ticket', desc: 'El alumno presenta su comprobante de pago.' },
      { titulo: 'Busca el pago', desc: 'Filtra por "Efectivo Pendiente" en Pagos.' },
      { titulo: 'Verifica el código', desc: 'Compara el código del ticket con el sistema.' },
      { titulo: 'Confirma el pago', desc: 'Haz clic en el botón de confirmación.' }
    ],
    tip: 'Guarda los tickets físicos por al menos 30 días para cualquier reclamo.'
  },
  'Archivo de Pagos': {
    descripcion: 'Mantén la lista de pagos organizada archivando los pagos antiguos ya procesados.',
    pasos: [
      { titulo: 'Identifica pagos antiguos', desc: 'Pagos de meses anteriores ya confirmados.' },
      { titulo: 'Selecciona para archivar', desc: 'Usa la opción de archivar en cada pago.' },
      { titulo: 'Confirma la acción', desc: 'Los pagos pasan a la sección de archivo.' },
      { titulo: 'Consulta cuando necesites', desc: 'El archivo está siempre disponible.' }
    ],
    tip: 'Archiva mensualmente para mantener un historial ordenado y fácil de consultar.'
  },
  'Crear Nueva Aula': {
    descripcion: 'Registra los espacios físicos disponibles para dictar clases en el instituto.',
    pasos: [
      { titulo: 'Ve a la sección Aulas', desc: 'Desde el menú lateral.' },
      { titulo: 'Haz clic en "Nueva Aula"', desc: 'Se abre el formulario.' },
      { titulo: 'Ingresa los datos', desc: 'Nombre o número y capacidad máxima.' },
      { titulo: 'Guarda el aula', desc: 'Estará disponible para asignar a cursos.' }
    ],
    tip: 'La capacidad del aula debe ser igual o mayor al cupo máximo de los cursos que se dicten allí.'
  },
  'Asignar a Cursos': {
    descripcion: 'Vincula aulas con cursos para definir dónde se dictarán las clases.',
    pasos: [
      { titulo: 'Crea o edita un curso', desc: 'Desde la sección Cursos.' },
      { titulo: 'Busca el campo Aula', desc: 'En el formulario de curso.' },
      { titulo: 'Selecciona el aula', desc: 'Elige de la lista de aulas disponibles.' },
      { titulo: 'Guarda los cambios', desc: 'El curso queda vinculado al aula.' }
    ],
    tip: 'Evita asignar la misma aula a cursos con horarios superpuestos.'
  },
  'Agregar Idiomas': {
    descripcion: 'Configura los idiomas que se enseñan en el instituto para clasificar los cursos.',
    pasos: [
      { titulo: 'Ve a la sección Idiomas', desc: 'Desde el menú lateral.' },
      { titulo: 'Haz clic en "Nuevo Idioma"', desc: 'Se abre el formulario.' },
      { titulo: 'Ingresa el nombre', desc: 'Inglés, Francés, Portugués, etc.' },
      { titulo: 'Guarda el idioma', desc: 'Estará disponible al crear cursos.' }
    ],
    tip: 'Usa nombres estandarizados para mantener consistencia en todo el sistema.'
  },
  'Configurar Niveles': {
    descripcion: 'Los niveles clasifican la dificultad de los cursos para orientar a los alumnos.',
    pasos: [
      { titulo: 'Entiende los niveles', desc: 'Básico, Intermedio, Avanzado son los estándar.' },
      { titulo: 'Asigna al crear curso', desc: 'Selecciona el nivel apropiado.' },
      { titulo: 'Considera prerrequisitos', desc: 'Algunos niveles requieren aprobar anteriores.' },
      { titulo: 'Comunica a alumnos', desc: 'Los niveles ayudan a elegir el curso correcto.' }
    ],
    tip: 'Define criterios claros para cada nivel y comunícalos a profesores y alumnos.'
  },
  'Responder Mensajes': {
    descripcion: 'Atiende las consultas de alumnos y profesores a través del sistema de chat integrado.',
    pasos: [
      { titulo: 'Observa las notificaciones', desc: 'El badge rojo indica mensajes nuevos.' },
      { titulo: 'Accede al Chat Soporte', desc: 'Desde el menú lateral.' },
      { titulo: 'Selecciona la conversación', desc: 'Haz clic en el usuario a responder.' },
      { titulo: 'Escribe y envía', desc: 'Tu respuesta llega instantáneamente.' }
    ],
    tip: 'Responde lo antes posible. Los usuarios valoran la atención rápida.'
  },
  'Gestionar Conversaciones': {
    descripcion: 'Organiza y prioriza las consultas de usuarios para una atención eficiente.',
    pasos: [
      { titulo: 'Revisa la bandeja', desc: 'Todas las conversaciones aparecen listadas.' },
      { titulo: 'Filtra por estado', desc: 'Pendientes, En curso, Resueltas.' },
      { titulo: 'Prioriza urgentes', desc: 'Atiende primero consultas críticas.' },
      { titulo: 'Cierra resueltas', desc: 'Marca como completadas las atendidas.' }
    ],
    tip: 'Crea respuestas frecuentes para agilizar la atención de consultas comunes.'
  },
  'Notificaciones': {
    descripcion: 'El sistema de notificaciones te mantiene informado sobre actividad importante.',
    pasos: [
      { titulo: 'Observa los badges', desc: 'Los números rojos indican pendientes.' },
      { titulo: 'Habilita en navegador', desc: 'Permite notificaciones push cuando se solicite.' },
      { titulo: 'Revisa periódicamente', desc: 'Algunas notificaciones requieren acción.' },
      { titulo: 'Atiende lo urgente', desc: 'Mensajes y pagos pendientes son prioritarios.' }
    ],
    tip: 'Las notificaciones push funcionan incluso con el navegador minimizado.'
  },
  '¿Cómo restablezco contraseña de un usuario?': {
    descripcion: 'Cuando un usuario olvida su contraseña, puedes generar una nueva temporal.',
    pasos: [
      { titulo: 'Busca al usuario', desc: 'En la sección correspondiente (Alumnos/Profesores).' },
      { titulo: 'Accede a su perfil', desc: 'Haz clic en la tarjeta del usuario.' },
      { titulo: 'Busca opción de contraseña', desc: 'Generalmente en configuración o editar.' },
      { titulo: 'Genera nueva contraseña', desc: 'El sistema crea una temporal.' }
    ],
    tip: 'Comunica la nueva contraseña de forma segura y pide que la cambie al ingresar.'
  },
  '¿No puedo eliminar un curso?': {
    descripcion: 'Los cursos con alumnos inscritos están protegidos contra eliminación accidental.',
    pasos: [
      { titulo: 'Verifica el motivo', desc: 'El sistema indica si hay alumnos inscritos.' },
      { titulo: 'Desvincula alumnos', desc: 'Transfiérelos a otro curso o dáles de baja.' },
      { titulo: 'Intenta de nuevo', desc: 'Con el curso vacío, podrás eliminarlo.' },
      { titulo: 'Considera alternativas', desc: 'Quizás solo necesitas desactivar el curso.' }
    ],
    tip: 'Considera desactivar cursos en lugar de eliminarlos para conservar el historial.'
  },
  '¿Se hacen respaldos automáticos?': {
    descripcion: 'Railway, nuestra plataforma de hosting, realiza respaldos automáticos de la base de datos.',
    pasos: [
      { titulo: 'Respaldos automáticos', desc: 'Railway realiza backups periódicos.' },
      { titulo: 'Recuperación', desc: 'Contacta al admin técnico si necesitas restaurar.' },
      { titulo: 'Respaldos manuales', desc: 'Exporta PDFs importantes como respaldo local.' },
      { titulo: 'Buenas prácticas', desc: 'Descarga información crítica periódicamente.' }
    ],
    tip: 'Aunque hay respaldos automáticos, mantén copias locales de información sensible.'
  },
  '¿Encontré un error en el sistema?': {
    descripcion: 'Los errores deben reportarse para que el equipo técnico pueda solucionarlos.',
    pasos: [
      { titulo: 'Documenta el error', desc: 'Anota qué estabas haciendo cuando ocurrió.' },
      { titulo: 'Captura pantalla', desc: 'Si es posible, toma una captura del error.' },
      { titulo: 'Anota los pasos', desc: 'Describe cómo reproducir el problema.' },
      { titulo: 'Reporta al equipo', desc: 'Envía la información al desarrollador.' }
    ],
    tip: 'Cuanto más detallada sea tu descripción, más rápido podremos solucionarlo.'
  },
  'Entender tu Dashboard': {
    descripcion: 'Tu dashboard es tu centro de información. Aquí ves un resumen de todo lo importante de un vistazo.',
    pasos: [
      { titulo: 'Tarjetas de estadísticas', desc: 'Muestran cursos activos, promedio y progreso.' },
      { titulo: 'Cursos destacados', desc: 'Acceso rápido a tus cursos principales.' },
      { titulo: 'Notificaciones', desc: 'Alertas sobre pagos, notas o mensajes.' },
      { titulo: 'Accesos directos', desc: 'Botones para las funciones más usadas.' }
    ],
    tip: 'Revisa tu dashboard al inicio de cada sesión para estar al día.'
  },
  'Ver Cursos Inscritos': {
    descripcion: 'Consulta todos los cursos donde estás matriculado y su información detallada.',
    pasos: [
      { titulo: 'Ve a Mis Cursos', desc: 'Desde el menú lateral.' },
      { titulo: 'Revisa las tarjetas', desc: 'Cada curso muestra su información básica.' },
      { titulo: 'Consulta el progreso', desc: 'La barra indica tu avance en el curso.' },
      { titulo: 'Accede a detalles', desc: 'Haz clic para ver más información.' }
    ],
    tip: 'El color de la barra de progreso indica tu estado: verde es bueno, amarillo es alerta.'
  },
  'Detalles de un Curso': {
    descripcion: 'Accede a toda la información de un curso: profesor, horario, aula y tus calificaciones.',
    pasos: [
      { titulo: 'Selecciona el curso', desc: 'Haz clic en la tarjeta del curso.' },
      { titulo: 'Ve la información', desc: 'Horario, aula, profesor asignado.' },
      { titulo: 'Consulta tus notas', desc: 'Parciales y final aparecen aquí.' },
      { titulo: 'Revisa tu asistencia', desc: 'Historial de asistencias del curso.' }
    ],
    tip: 'Guarda el horario en tu calendario personal para no olvidar las clases.'
  },
  'Entender el Progreso': {
    descripcion: 'La barra de progreso refleja tu rendimiento académico basado en tus calificaciones.',
    pasos: [
      { titulo: 'Verde (7-10)', desc: 'Excelente rendimiento, vas por buen camino.' },
      { titulo: 'Amarillo (5-6.99)', desc: 'Aprobado pero podrías mejorar.' },
      { titulo: 'Rojo (0-4.99)', desc: 'Necesitas atención, considera refuerzo.' },
      { titulo: 'Promedio general', desc: 'Se calcula con todas tus notas.' }
    ],
    tip: 'Habla con tu profesor si ves rojo, hay tiempo para mejorar.'
  },
  'Catálogo de Cursos': {
    descripcion: 'Explora todos los cursos disponibles en el instituto para futuras inscripciones.',
    pasos: [
      { titulo: 'Ve a Cursado', desc: 'Desde el menú lateral.' },
      { titulo: 'Navega el catálogo', desc: 'Todos los cursos disponibles aparecen aquí.' },
      { titulo: 'Usa filtros', desc: 'Por idioma, nivel o disponibilidad.' },
      { titulo: 'Revisa la info', desc: 'Cada tarjeta muestra horario y cupos.' }
    ],
    tip: 'Los cursos con pocos cupos se llenan rápido, solicita inscripción a tiempo.'
  },
  'Solicitar Inscripción': {
    descripcion: 'Pide inscribirte en nuevos cursos. Un administrador revisará tu solicitud.',
    pasos: [
      { titulo: 'Encuentra el curso', desc: 'Navega el catálogo de cursos.' },
      { titulo: 'Verifica requisitos', desc: 'Algunos cursos requieren nivel previo.' },
      { titulo: 'Haz clic en inscribir', desc: 'Botón "Solicitar Inscripción".' },
      { titulo: 'Espera confirmación', desc: 'Recibirás respuesta por el sistema.' }
    ],
    tip: 'Asegúrate de no tener conflictos de horario con tus cursos actuales.'
  },
  'Verificar Disponibilidad': {
    descripcion: 'Cada curso tiene un cupo máximo. Verifica si hay lugar antes de solicitar inscripción.',
    pasos: [
      { titulo: 'Busca el indicador', desc: 'Cada curso muestra cupos disponibles.' },
      { titulo: 'Interpreta los colores', desc: 'Verde hay lugar, rojo lleno.' },
      { titulo: 'Consulta alternativas', desc: 'Si está lleno, busca otros horarios.' },
      { titulo: 'Contacta soporte', desc: 'Para listas de espera o excepciones.' }
    ],
    tip: 'A inicio de cuatrimestre hay más movimiento, los cupos pueden liberarse.'
  },
  'Ver Calificaciones': {
    descripcion: 'Consulta tus notas de parciales y finales de cada curso.',
    pasos: [
      { titulo: 'Ve a Calificaciones', desc: 'Desde el menú lateral.' },
      { titulo: 'Selecciona el curso', desc: 'Si tienes varios, elige uno.' },
      { titulo: 'Revisa tus notas', desc: 'Parcial 1, Parcial 2, Final.' },
      { titulo: 'Consulta el promedio', desc: 'Se calcula automáticamente.' }
    ],
    tip: 'Las notas se actualizan cuando el profesor las carga, puede demorar unos días.'
  },
  'Entender Promedios': {
    descripcion: 'El promedio se calcula automáticamente basado en tus calificaciones registradas.',
    pasos: [
      { titulo: 'Promedio por curso', desc: 'Suma de notas dividido cantidad de evaluaciones.' },
      { titulo: 'Promedio general', desc: 'Incluye todos tus cursos activos.' },
      { titulo: 'Peso de evaluaciones', desc: 'Todas las evaluaciones valen igual.' },
      { titulo: 'Actualización', desc: 'Se recalcula con cada nueva nota.' }
    ],
    tip: 'El promedio general es importante para becas y certificados.'
  },
  'Historial Académico': {
    descripcion: 'Tu historial muestra toda tu trayectoria académica en el instituto.',
    pasos: [
      { titulo: 'Accede al historial', desc: 'Desde la sección Calificaciones.' },
      { titulo: 'Revisa cursos pasados', desc: 'Todos tus cursos completados.' },
      { titulo: 'Consulta notas finales', desc: 'Cada curso muestra nota de cierre.' },
      { titulo: 'Solicita certificados', desc: 'Contacta administración si necesitas.' }
    ],
    tip: 'El historial es tu carta de presentación académica, cuídalo.'
  },
  'Ver Estado de Pagos': {
    descripcion: 'Consulta el estado de tus cuotas: pagadas, pendientes o vencidas.',
    pasos: [
      { titulo: 'Ve a Mis Pagos', desc: 'Desde el menú lateral.' },
      { titulo: 'Revisa la lista', desc: 'Cada cuota aparece con su estado.' },
      { titulo: 'Identifica pendientes', desc: 'En amarillo o rojo según urgencia.' },
      { titulo: 'Consulta vencimientos', desc: 'Fechas límite de cada cuota.' }
    ],
    tip: 'Mantén tus pagos al día para evitar recargos e inconvenientes.'
  },
  'Realizar un Pago': {
    descripcion: 'Paga tus cuotas de forma simple eligiendo el método que prefieras.',
    pasos: [
      { titulo: 'Selecciona la cuota', desc: 'Elige el mes a pagar.' },
      { titulo: 'Elige método de pago', desc: 'Mercado Pago o Efectivo.' },
      { titulo: 'Completa el proceso', desc: 'Sigue las instrucciones según método.' },
      { titulo: 'Guarda el comprobante', desc: 'Siempre conserva tu recibo.' }
    ],
    tip: 'Mercado Pago se acredita al instante, efectivo requiere ir a secretaría.'
  },
  'Pago en Efectivo': {
    descripcion: 'Genera un ticket para pagar en efectivo presencialmente en secretaría.',
    pasos: [
      { titulo: 'Selecciona la cuota', desc: 'Elige el mes a pagar.' },
      { titulo: 'Elige "Efectivo"', desc: 'Como método de pago.' },
      { titulo: 'Descarga el ticket', desc: 'Se genera un PDF con código único.' },
      { titulo: 'Presenta en secretaría', desc: 'Paga en efectivo y entrégalo.' }
    ],
    tip: 'El ticket tiene fecha de vencimiento, preséntalo a tiempo.'
  },
  'Pago con Mercado Pago': {
    descripcion: 'Paga online con tarjeta o dinero en cuenta de Mercado Pago.',
    pasos: [
      { titulo: 'Selecciona la cuota', desc: 'Elige el mes a pagar.' },
      { titulo: 'Elige "Mercado Pago"', desc: 'Como método de pago.' },
      { titulo: 'Serás redirigido', desc: 'A la página segura de MP.' },
      { titulo: 'Completa el pago', desc: 'Con tarjeta o dinero en cuenta.' }
    ],
    tip: 'Asegúrate de tener fondos o tarjeta habilitada antes de iniciar.'
  },
  'Descargar Comprobantes': {
    descripcion: 'Descarga tickets y comprobantes de tus pagos para tu registro.',
    pasos: [
      { titulo: 'Ve a Mis Pagos', desc: 'Desde el menú lateral.' },
      { titulo: 'Busca el pago', desc: 'Localiza el pago del que necesitas comprobante.' },
      { titulo: 'Haz clic en descargar', desc: 'Ícono de descarga junto al pago.' },
      { titulo: 'Guarda el archivo', desc: 'Se descarga un PDF.' }
    ],
    tip: 'Guarda todos tus comprobantes en una carpeta organizada por fecha.'
  },
  'Cambiar Avatar': {
    descripcion: 'Personaliza tu perfil subiendo una foto o imagen.',
    pasos: [
      { titulo: 'Ve a Mi Perfil', desc: 'Desde el menú lateral.' },
      { titulo: 'Haz clic en tu avatar', desc: 'El círculo con tu imagen actual.' },
      { titulo: 'Selecciona archivo', desc: 'Elige una imagen de tu dispositivo.' },
      { titulo: 'Confirma el cambio', desc: 'La imagen se actualiza automáticamente.' }
    ],
    tip: 'Usa una foto clara de tu rostro para fácil identificación.'
  },
  'Actualizar Datos Personales': {
    descripcion: 'Mantén tu información de contacto actualizada para comunicaciones importantes.',
    pasos: [
      { titulo: 'Ve a Mi Perfil', desc: 'Desde el menú lateral.' },
      { titulo: 'Haz clic en editar', desc: 'Botón para modificar datos.' },
      { titulo: 'Actualiza la información', desc: 'Teléfono, email de contacto.' },
      { titulo: 'Guarda los cambios', desc: 'Confirma las modificaciones.' }
    ],
    tip: 'Datos como DNI y legajo solo los puede modificar administración.'
  },
  'Editar Información Personal': {
    descripcion: 'Actualiza tus datos de contacto para mantenernos comunicados.',
    pasos: [
      { titulo: 'Accede a tu perfil', desc: 'Desde el menú lateral.' },
      { titulo: 'Localiza campos editables', desc: 'Email, teléfono principalmente.' },
      { titulo: 'Modifica lo necesario', desc: 'Ingresa la información correcta.' },
      { titulo: 'Guarda los cambios', desc: 'Confirma con el botón guardar.' }
    ],
    tip: 'Un email actualizado es crucial para recuperar acceso si olvidas la contraseña.'
  },
  'Acceder a Classroom': {
    descripcion: 'Conecta con Google Classroom para acceder a materiales de estudio.',
    pasos: [
      { titulo: 'Ve a Classroom', desc: 'Desde el menú lateral.' },
      { titulo: 'Haz clic en acceder', desc: 'Serás redirigido a Google.' },
      { titulo: 'Inicia sesión', desc: 'Con tu cuenta de Google.' },
      { titulo: 'Explora los cursos', desc: 'Verás los cursos donde estás inscrito.' }
    ],
    tip: 'Usa la misma cuenta de Google siempre para no perder acceso.'
  },
  'Acceder a Materiales': {
    descripcion: 'Descarga materiales de estudio compartidos por tus profesores.',
    pasos: [
      { titulo: 'Ingresa a Classroom', desc: 'Conecta con tu cuenta Google.' },
      { titulo: 'Selecciona el curso', desc: 'El que te interesa revisar.' },
      { titulo: 'Busca Materiales', desc: 'Sección de recursos del curso.' },
      { titulo: 'Descarga lo que necesites', desc: 'PDFs, documentos, presentaciones.' }
    ],
    tip: 'Descarga los materiales a tu dispositivo para estudiar sin conexión.'
  },
  'Vincular Google Classroom': {
    descripcion: 'Conecta tu cuenta de Google para acceder a los recursos de Classroom.',
    pasos: [
      { titulo: 'Ten una cuenta Google', desc: 'Gmail o cuenta institucional.' },
      { titulo: 'Haz clic en Classroom', desc: 'Desde el menú del sistema.' },
      { titulo: 'Autoriza el acceso', desc: 'Google pedirá permisos.' },
      { titulo: 'Listo', desc: 'Ya puedes acceder a los recursos.' }
    ],
    tip: 'Si tienes problemas, limpia las cookies del navegador e intenta de nuevo.'
  },
  'Contactar Administración': {
    descripcion: 'Usa el chat de soporte para comunicarte directamente con el equipo administrativo.',
    pasos: [
      { titulo: 'Ve a Chat Soporte', desc: 'Desde el menú lateral.' },
      { titulo: 'Escribe tu mensaje', desc: 'Describe tu consulta o problema.' },
      { titulo: 'Envía el mensaje', desc: 'Presiona Enter o el botón enviar.' },
      { titulo: 'Espera respuesta', desc: 'Te notificarán cuando respondan.' }
    ],
    tip: 'Sé claro y específico en tu consulta para recibir mejor ayuda.'
  },
  'Notificaciones de Chat': {
    descripcion: 'Recibe alertas cuando el equipo de soporte responda a tus consultas.',
    pasos: [
      { titulo: 'Observa el badge', desc: 'Número rojo en Chat Soporte.' },
      { titulo: 'Habilita notificaciones', desc: 'Acepta cuando el navegador pregunte.' },
      { titulo: 'Recibirás alertas', desc: 'Incluso con la pestaña cerrada.' },
      { titulo: 'Revisa mensajes nuevos', desc: 'Haz clic para ver respuestas.' }
    ],
    tip: 'Las notificaciones funcionan mejor si mantienes sesión activa.'
  },
  'Ver Historial de Mensajes': {
    descripcion: 'Revisa conversaciones anteriores con administración cuando lo necesites.',
    pasos: [
      { titulo: 'Accede al chat', desc: 'Desde Chat Soporte.' },
      { titulo: 'Desplázate hacia arriba', desc: 'Los mensajes antiguos cargan.' },
      { titulo: 'Busca lo que necesitas', desc: 'Revisa respuestas anteriores.' },
      { titulo: 'Referencia en nuevos mensajes', desc: 'Si es relevante, menciona el tema previo.' }
    ],
    tip: 'El historial se conserva indefinidamente para tu referencia.'
  },
  '¿Olvidé mi contraseña?': {
    descripcion: 'Si olvidaste tu contraseña, hay formas de recuperar el acceso a tu cuenta.',
    pasos: [
      { titulo: 'No te preocupes', desc: 'Es un problema común con solución.' },
      { titulo: 'Contacta administración', desc: 'Vía email o presencialmente.' },
      { titulo: 'Verifica tu identidad', desc: 'Con DNI o datos personales.' },
      { titulo: 'Recibe nueva contraseña', desc: 'Te darán una temporal para cambiar.' }
    ],
    tip: 'Usa un gestor de contraseñas para no olvidarlas en el futuro.'
  },
  '¿Mis datos están incorrectos?': {
    descripcion: 'Si encuentras errores en tu información personal, puedes solicitar corrección.',
    pasos: [
      { titulo: 'Identifica el error', desc: 'Qué dato específico está mal.' },
      { titulo: 'Contacta administración', desc: 'Por chat o presencialmente.' },
      { titulo: 'Proporciona información correcta', desc: 'Y documentación si es necesario.' },
      { titulo: 'Espera la corrección', desc: 'Los cambios se reflejan pronto.' }
    ],
    tip: 'DNI y legajo requieren documentación para modificarse.'
  },
  '¿Cómo me doy de baja de un curso?': {
    descripcion: 'Si necesitas abandonar un curso, debes solicitar la baja formalmente.',
    pasos: [
      { titulo: 'Evalúa tu decisión', desc: 'La baja puede afectar tu historial.' },
      { titulo: 'Contacta administración', desc: 'Explica tu situación.' },
      { titulo: 'Completa el proceso', desc: 'Puede requerir firma o confirmación.' },
      { titulo: 'Verifica la baja', desc: 'El curso desaparecerá de tu lista.' }
    ],
    tip: 'Consulta sobre períodos de baja sin penalización antes de decidir.'
  },
  'Tu Primer Día': {
    descripcion: 'Guía para comenzar a usar el sistema como profesor.',
    pasos: [
      { titulo: 'Revisa tus cursos', desc: 'Ve a Mis Cursos para ver asignaciones.' },
      { titulo: 'Configura tu perfil', desc: 'Sube una foto y verifica tus datos.' },
      { titulo: 'Explora las secciones', desc: 'Familiarízate con el menú.' },
      { titulo: 'Prueba las funciones', desc: 'Calificaciones y asistencias.' }
    ],
    tip: 'Si tienes dudas, el chat de soporte está disponible para ayudarte.'
  },
  'Ver Cursos Asignados': {
    descripcion: 'Consulta los cursos que te han sido asignados para dictar.',
    pasos: [
      { titulo: 'Ve a Mis Cursos', desc: 'Desde el menú lateral.' },
      { titulo: 'Revisa las tarjetas', desc: 'Cada curso muestra información clave.' },
      { titulo: 'Consulta horarios', desc: 'Días y horas de clase.' },
      { titulo: 'Ve los alumnos', desc: 'Cantidad inscrita en cada curso.' }
    ],
    tip: 'Si falta un curso que deberías tener, contacta a administración.'
  },
  'Información del Curso': {
    descripcion: 'Accede a todos los detalles de los cursos que dictas.',
    pasos: [
      { titulo: 'Selecciona el curso', desc: 'Haz clic en la tarjeta.' },
      { titulo: 'Revisa la información', desc: 'Horario, aula, nivel.' },
      { titulo: 'Consulta alumnos', desc: 'Lista completa de inscritos.' },
      { titulo: 'Ve estadísticas', desc: 'Promedio del curso y asistencia.' }
    ],
    tip: 'Descarga la lista de alumnos para pasar asistencia en papel si lo prefieres.'
  },
  'Cargar Notas': {
    descripcion: 'Ingresa las calificaciones de tus alumnos en el sistema.',
    pasos: [
      { titulo: 'Ve a Calificaciones', desc: 'Desde el menú lateral.' },
      { titulo: 'Selecciona el curso', desc: 'Del desplegable de cursos.' },
      { titulo: 'Busca al alumno', desc: 'En la lista aparecen todos.' },
      { titulo: 'Ingresa las notas', desc: 'Parcial 1, Parcial 2, Final.' }
    ],
    tip: 'Guarda frecuentemente para no perder el trabajo.'
  },
  'Editar Calificaciones': {
    descripcion: 'Modifica notas ya ingresadas si es necesario hacer correcciones.',
    pasos: [
      { titulo: 'Busca la calificación', desc: 'En la sección de notas del curso.' },
      { titulo: 'Haz clic en editar', desc: 'Junto a la nota a modificar.' },
      { titulo: 'Cambia el valor', desc: 'Ingresa la nota correcta.' },
      { titulo: 'Guarda el cambio', desc: 'Se recalcula el promedio.' }
    ],
    tip: 'Los cambios quedan registrados, úsalos solo para correcciones legítimas.'
  },
  'Ver Promedio de Alumnos': {
    descripcion: 'Consulta el rendimiento general de tus alumnos en cada curso.',
    pasos: [
      { titulo: 'Accede a Calificaciones', desc: 'Del curso correspondiente.' },
      { titulo: 'Revisa la columna promedio', desc: 'Se calcula automáticamente.' },
      { titulo: 'Identifica tendencias', desc: 'Alumnos que necesitan apoyo.' },
      { titulo: 'Exporta si necesitas', desc: 'Para análisis fuera del sistema.' }
    ],
    tip: 'Los promedios bajos generalizados pueden indicar necesidad de refuerzo.'
  },
  'Tomar Asistencia': {
    descripcion: 'Registra la asistencia de tus alumnos en cada clase.',
    pasos: [
      { titulo: 'Ve a Asistencias', desc: 'Desde el menú lateral.' },
      { titulo: 'Selecciona curso y fecha', desc: 'La fecha actual viene por defecto.' },
      { titulo: 'Marca cada alumno', desc: 'Presente, Ausente o Tarde.' },
      { titulo: 'Se guarda automáticamente', desc: 'No necesitas botón guardar.' }
    ],
    tip: 'Toma asistencia al inicio de clase para mayor precisión.'
  },
  'Historial de Asistencias': {
    descripcion: 'Consulta registros de asistencia de fechas anteriores.',
    pasos: [
      { titulo: 'Ve a Asistencias', desc: 'Del curso que te interesa.' },
      { titulo: 'Cambia la fecha', desc: 'Usa el calendario para navegar.' },
      { titulo: 'Revisa el registro', desc: 'Verás el estado de cada alumno.' },
      { titulo: 'Identifica patrones', desc: 'Alumnos con muchas ausencias.' }
    ],
    tip: 'Comunica a administración si un alumno tiene ausencias excesivas.'
  },
  '¿No veo un curso asignado?': {
    descripcion: 'Si un curso que deberías tener no aparece, puede haber un problema de asignación.',
    pasos: [
      { titulo: 'Verifica la asignación', desc: 'Confirma con administración.' },
      { titulo: 'Recarga la página', desc: 'A veces es un problema de caché.' },
      { titulo: 'Cierra y abre sesión', desc: 'Puede actualizar tus datos.' },
      { titulo: 'Contacta soporte', desc: 'Si el problema persiste.' }
    ],
    tip: 'Los cursos nuevos pueden demorar unos minutos en aparecer.'
  },
  '¿Las calificaciones no se guardan?': {
    descripcion: 'Si las notas no se guardan, puede haber un problema técnico.',
    pasos: [
      { titulo: 'Verifica conexión', desc: 'Asegúrate de tener internet.' },
      { titulo: 'Haz clic en guardar', desc: 'No solo cambies el valor, confirma.' },
      { titulo: 'Espera el mensaje', desc: 'Debe aparecer confirmación.' },
      { titulo: 'Recarga y verifica', desc: 'La nota debe persistir.' }
    ],
    tip: 'Si el problema continúa, reporta el error con capturas de pantalla.'
  }
};

function openGuiaModal(item) {
  const title = item.querySelector('h4')?.textContent || 'Guía';
  const description = item.querySelector('p')?.textContent || '';
  const iconHTML = item.querySelector('.guia-icon')?.innerHTML || '';
  const tags = item.querySelectorAll('.guia-tag');
  
  const datos = guiasDetalladas[title] || {
    descripcion: description,
    pasos: [
      { titulo: 'Paso 1', desc: 'Sigue las instrucciones en pantalla.' },
      { titulo: 'Paso 2', desc: 'Completa la información requerida.' },
      { titulo: 'Paso 3', desc: 'Confirma los cambios realizados.' },
      { titulo: 'Paso 4', desc: 'Verifica que todo esté correcto.' }
    ],
    tip: 'Si necesitas ayuda adicional, contacta al equipo de soporte.'
  };
  
  let tagsHTML = '';
  tags.forEach(tag => {
    tagsHTML += `<span class="guia-tag">${tag.textContent}</span>`;
  });
  
  const modalHTML = `
    <div class="guia-modal-overlay active" onclick="closeGuiaModal(event)">
      <div class="guia-modal" onclick="event.stopPropagation()">
        <div class="guia-modal-header">
          <button class="guia-modal-close" onclick="closeGuiaModal()">
            <i data-lucide="x"></i>
          </button>
          <div class="guia-modal-icon">${iconHTML}</div>
          <h3>${title}</h3>
          <p>${datos.descripcion}</p>
        </div>
        <div class="guia-modal-body">
          <div class="guia-modal-section">
            <h4><i data-lucide="list-ordered"></i> Pasos a seguir</h4>
            <ul class="guia-modal-steps">
              ${datos.pasos.map((paso, i) => `
                <li>
                  <span class="step-number">${i + 1}</span>
                  <div class="step-content">
                    <strong>${paso.titulo}</strong>
                    <span>${paso.desc}</span>
                  </div>
                </li>
              `).join('')}
            </ul>
          </div>
          <div class="guia-modal-section">
            <div class="guia-modal-tip">
              <i data-lucide="lightbulb"></i>
              <p><strong>Tip:</strong> ${datos.tip}</p>
            </div>
          </div>
        </div>
        <div class="guia-modal-footer">
          <div class="guia-modal-tags">${tagsHTML}</div>
          <button class="guia-modal-action" onclick="closeGuiaModal()">
            <i data-lucide="check"></i> Entendido
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  lucide.createIcons();
  
  document.addEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
  if (e.key === 'Escape') {
    closeGuiaModal();
  }
}

function closeGuiaModal(event) {
  if (event && event.target !== event.currentTarget) return;
  
  const overlay = document.querySelector('.guia-modal-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => overlay.remove(), 300);
  }
  document.removeEventListener('keydown', handleEscapeKey);
}

function filterAyudaContent(query) {
  const accordions = document.querySelectorAll('.ayuda-accordion');
  const guiaItems = document.querySelectorAll('.guia-item');
  const noResults = document.getElementById('noResultsMessage');
  const resultsCount = document.getElementById('searchResultsCount');
  let totalVisible = 0;

  if (!query) {
    accordions.forEach(acc => {
      acc.classList.remove('hidden', 'open');
    });
    guiaItems.forEach(item => {
      item.classList.remove('hidden', 'highlight');
    });
    noResults.classList.remove('visible');
    resultsCount.classList.remove('visible');
    return;
  }

  accordions.forEach(accordion => {
    const items = accordion.querySelectorAll('.guia-item');
    let hasVisibleItems = false;

    items.forEach(item => {
      const keywords = item.dataset.keywords || '';
      const title = item.querySelector('h4')?.textContent.toLowerCase() || '';
      const desc = item.querySelector('p')?.textContent.toLowerCase() || '';
      const searchText = keywords + ' ' + title + ' ' + desc;

      if (searchText.includes(query)) {
        item.classList.remove('hidden');
        item.classList.add('highlight');
        hasVisibleItems = true;
        totalVisible++;
      } else {
        item.classList.add('hidden');
        item.classList.remove('highlight');
      }
    });

    if (hasVisibleItems) {
      accordion.classList.remove('hidden');
      accordion.classList.add('open');
    } else {
      accordion.classList.add('hidden');
    }
  });

  if (totalVisible === 0) {
    noResults.classList.add('visible');
    resultsCount.classList.remove('visible');
  } else {
    noResults.classList.remove('visible');
    resultsCount.textContent = `Se encontraron ${totalVisible} resultado${totalVisible !== 1 ? 's' : ''}`;
    resultsCount.classList.add('visible');
  }
}


const STATUS_CONFIG = {
  labels: {
    operational: 'Operativo',
    degraded: 'Degradado',
    outage: 'Interrupción',
    maintenance: 'Mantenimiento'
  },
  icons: {
    operational: 'check-circle',
    degraded: 'alert-triangle',
    outage: 'x-circle',
    maintenance: 'wrench'
  },
  colors: {
    operational: '#16a34a',
    degraded: '#d97706',
    outage: '#dc2626',
    maintenance: '#4a5259'
  }
};

let currentStatusData = null;
let statusActivityInterval = null;
let statusMetricsInterval = null;
let activityEvents = [];

// Generadores de datos simulados realistas
const StatusSimulator = {
  // Nombres y acciones para eventos simulados
  userNames: ['María García', 'Carlos López', 'Ana Martínez', 'Juan Rodríguez', 'Laura Sánchez', 'Pedro Fernández', 'Sofia Ruiz', 'Diego Torres', 'Valentina Díaz', 'Mateo Herrera'],
  courses: ['Inglés B1', 'Francés A2', 'Alemán B2', 'Italiano A1', 'Portugués B1', 'Inglés C1', 'Francés B1'],
  
  getRandomLatency(baseLatency = 45) {
    // Genera latencia realista con variación
    const variation = Math.random() * 30 - 15;
    return Math.max(8, Math.round(baseLatency + variation));
  },
  
  getRandomUser() {
    return this.userNames[Math.floor(Math.random() * this.userNames.length)];
  },
  
  getRandomCourse() {
    return this.courses[Math.floor(Math.random() * this.courses.length)];
  },
  
  generateEvent() {
    const eventTypes = [
      { type: 'login', icon: 'log-in', message: `${this.getRandomUser()} inició sesión` },
      { type: 'api', icon: 'database', message: `Query ejecutado correctamente` },
      { type: 'api', icon: 'zap', message: `API REST: ${Math.floor(Math.random() * 50 + 100)} requests/s` },
      { type: 'login', icon: 'user-plus', message: `Nuevo usuario registrado` },
      { type: 'db', icon: 'hard-drive', message: `Backup automático completado` },
      { type: 'cache', icon: 'refresh-cw', message: `Cache actualizado exitosamente` },
      { type: 'api', icon: 'check-circle', message: `Health check: todos los servicios OK` },
      { type: 'login', icon: 'shield-check', message: `Verificación 2FA completada` },
      { type: 'warning', icon: 'alert-triangle', message: `Latencia elevada detectada` },
      { type: 'api', icon: 'server', message: `${Math.floor(Math.random() * 10 + 5)} conexiones activas` },
      { type: 'db', icon: 'database', message: `Query optimizado: ${Math.floor(Math.random() * 50 + 10)}ms` },
      { type: 'login', icon: 'log-out', message: `${this.getRandomUser()} cerró sesión` },
    ];
    
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    return {
      ...event,
      time: Date.now() - Math.floor(Math.random() * 300000) // últimos 5 minutos
    };
  },
  
  getServiceMetrics(status = 'operational') {
    const baseLatency = status === 'operational' ? 35 : status === 'degraded' ? 180 : 0;
    const latency = this.getRandomLatency(baseLatency);
    
    // Generar historial de latencia para el mini-gráfico
    const latencyHistory = [];
    for (let i = 0; i < 10; i++) {
      latencyHistory.push(this.getRandomLatency(baseLatency * (0.8 + Math.random() * 0.4)));
    }
    
    // Errores realistas: 0-2 para operacional, 3-6 para degradado, 7-10 para outage
    const errorBase = status === 'operational' ? 0 : status === 'degraded' ? 3 : 7;
    const errorVariation = status === 'operational' ? 2 : 3;
    const errors = Math.floor(Math.random() * errorVariation) + errorBase;
    
    return {
      latency: latency,
      latencyHistory: latencyHistory,
      uptime: status === 'operational' ? (99 + Math.random()).toFixed(2) : status === 'degraded' ? (95 + Math.random() * 3).toFixed(2) : '0.00',
      requestsPerMin: status === 'operational' ? Math.floor(Math.random() * 300 + 150) : status === 'degraded' ? Math.floor(Math.random() * 80 + 30) : 0,
      errors: Math.min(errors, 10), // Máximo 10 errores
      trend: status === 'operational' ? Math.floor(Math.random() * 8 - 2) : -Math.floor(Math.random() * 15 + 3)
    };
  },
  
  getGlobalMetrics() {
    return {
      activeUsers: Math.floor(Math.random() * 80 + 40),
      serverLoad: Math.floor(Math.random() * 40 + 20),
      memoryUsage: Math.floor(Math.random() * 30 + 45),
      requestsPerSec: Math.floor(Math.random() * 30 + 15)
    };
  }
};

function renderStatusSection() {
  return `
    <style>
      .status-admin-container {
        padding: 0;
        max-width: 100%;
      }

      .status-hero {
        background: linear-gradient(135deg, #4a5259 0%, #3d444a 100%);
        border-radius: 16px;
        padding: 30px;
        margin-bottom: 25px;
        color: white;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
      }

      .status-hero-info h2 {
        font-size: 1.5rem;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .status-hero-info h2 i { width: 28px; height: 28px; }

      .status-hero-info p {
        opacity: 0.9;
        font-size: 0.95rem;
      }

      .status-hero-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }

      .status-btn {
        padding: 10px 20px;
        border-radius: 10px;
        border: none;
        cursor: pointer;
        font-weight: 600;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s;
      }

      .status-btn i { width: 18px; height: 18px; }

      .status-btn-primary {
        background: white;
        color: #4a5259;
      }

      .status-btn-primary:hover {
        background: #f1f5f9;
        transform: translateY(-2px);
      }

      .status-btn-secondary {
        background: rgba(255,255,255,0.15);
        color: white;
        border: 1px solid rgba(255,255,255,0.3);
      }

      .status-btn-secondary:hover {
        background: rgba(255,255,255,0.25);
      }

      /* ========== MONITORING CENTER LAYOUT ========== */
      .monitoring-center {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 25px;
        margin-bottom: 25px;
      }

      @media (max-width: 1200px) {
        .monitoring-center { grid-template-columns: 1fr; }
      }

      .monitoring-main {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      /* Services Monitor Header */
      .services-monitor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        background: white;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      }

      .services-monitor-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
      }

      .services-monitor-title i { width: 24px; height: 24px; color: #4a5259; }

      .services-status-summary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: #dcfce7;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        color: #16a34a;
      }

      .services-status-summary.degraded {
        background: #fef3c7;
        color: #d97706;
      }

      .services-status-summary.outage {
        background: #fee2e2;
        color: #dc2626;
      }

      .services-status-summary .live-dot {
        width: 8px;
        height: 8px;
        background: currentColor;
        border-radius: 50%;
        animation: livePulse 2s ease-in-out infinite;
      }

      @keyframes livePulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
      }

      /* Service Cards */
      .services-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .service-monitor-card {
        background: white;
        border-radius: 14px;
        border: 1px solid #e2e8f0;
        overflow: hidden;
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .service-monitor-card:hover {
        border-color: #cbd5e1;
        box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      }

      .service-monitor-card.expanded {
        border-color: #4a5259;
      }

      .service-monitor-card.degraded { border-left: 4px solid #f59e0b; }
      .service-monitor-card.outage { border-left: 4px solid #ef4444; }
      .service-monitor-card.maintenance { border-left: 4px solid #4a5259; }
      .service-monitor-card.operational { border-left: 4px solid #16a34a; }

      .service-card-main {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        gap: 16px;
      }

      .service-icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f1f5f9;
      }

      .service-icon-wrapper i { width: 24px; height: 24px; color: #4a5259; }

      .service-icon-wrapper.operational { background: #dcfce7; }
      .service-icon-wrapper.operational i { color: #16a34a; }
      .service-icon-wrapper.degraded { background: #fef3c7; }
      .service-icon-wrapper.degraded i { color: #d97706; }
      .service-icon-wrapper.outage { background: #fee2e2; }
      .service-icon-wrapper.outage i { color: #dc2626; }

      .service-card-info {
        flex: 1;
      }

      .service-card-info h4 {
        font-size: 0.95rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 2px;
      }

      .service-card-info p {
        font-size: 0.8rem;
        color: #64748b;
      }

      .service-card-metrics {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .service-latency {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
      }

      .latency-value {
        font-size: 1.1rem;
        font-weight: 700;
        color: #16a34a;
      }

      .latency-value.warning { color: #d97706; }
      .latency-value.critical { color: #dc2626; }

      .latency-label {
        font-size: 0.7rem;
        color: #94a3b8;
        text-transform: uppercase;
      }

      .latency-bar-container {
        width: 120px;
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
      }

      .latency-bar {
        height: 100%;
        background: linear-gradient(90deg, #16a34a, #22c55e);
        border-radius: 3px;
        transition: width 0.5s ease;
      }

      .latency-bar.warning {
        background: linear-gradient(90deg, #f59e0b, #fbbf24);
      }

      .latency-bar.critical {
        background: linear-gradient(90deg, #ef4444, #f87171);
      }

      .service-status-indicator {
        padding: 6px 14px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .service-status-indicator i { width: 14px; height: 14px; }

      .service-status-indicator.operational { background: #dcfce7; color: #16a34a; }
      .service-status-indicator.degraded { background: #fef3c7; color: #d97706; }
      .service-status-indicator.outage { background: #fee2e2; color: #dc2626; }
      .service-status-indicator.maintenance { background: #e5e7eb; color: #4a5259; }

      /* Service Expanded Panel */
      .service-expanded-panel {
        display: none;
        padding: 0 20px 20px;
        border-top: 1px solid #e2e8f0;
        background: #f8fafc;
      }

      .service-monitor-card.expanded .service-expanded-panel {
        display: block;
        animation: slideDown 0.3s ease;
      }

      @keyframes slideDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .expanded-metrics-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 16px;
        padding-top: 20px;
      }

      @media (max-width: 768px) {
        .expanded-metrics-grid { grid-template-columns: repeat(2, 1fr); }
      }

      .metric-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        text-align: center;
        border: 1px solid #e2e8f0;
      }

      /* ========== SERVICE MONITOR MAIN (Card Principal) ========== */
      .service-monitor-main {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        gap: 16px;
        background: white;
        transition: background 0.2s;
      }

      .service-monitor-card:hover .service-monitor-main {
        background: #f8fafc;
      }

      .service-monitor-info {
        flex: 1;
        min-width: 0;
      }

      .service-monitor-info h4 {
        font-size: 0.95rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 2px;
      }

      .service-description {
        font-size: 0.8rem;
        color: #64748b;
        margin-bottom: 8px;
      }

      .service-latency-bar {
        width: 100px;
        height: 4px;
        background: #e2e8f0;
        border-radius: 2px;
        overflow: hidden;
      }

      .latency-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.5s ease;
      }

      .latency-fill.good { background: linear-gradient(90deg, #16a34a, #22c55e); }
      .latency-fill.medium { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
      .latency-fill.slow { background: linear-gradient(90deg, #ef4444, #f87171); }

      .latency-value {
        font-size: 0.75rem;
        color: #64748b;
        margin-top: 2px;
      }

      .status-pulse {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
      }

      .status-pulse.operational {
        background: #22c55e;
        animation: statusPulse 2s ease-in-out infinite;
      }

      .status-pulse.degraded { background: #f59e0b; }
      .status-pulse.outage { background: #ef4444; }
      .status-pulse.maintenance { background: #4a5259; }

      @keyframes statusPulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
        50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0); }
      }

      .service-icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f1f5f9;
        position: relative;
      }

      .service-icon-wrapper i { width: 24px; height: 24px; color: #4a5259; }

      .service-icon-wrapper.operational { background: #dcfce7; }
      .service-icon-wrapper.operational i { color: #16a34a; }
      .service-icon-wrapper.degraded { background: #fef3c7; }
      .service-icon-wrapper.degraded i { color: #d97706; }
      .service-icon-wrapper.outage { background: #fee2e2; }
      .service-icon-wrapper.outage i { color: #dc2626; }
      .service-icon-wrapper.maintenance { background: #e5e7eb; }
      .service-icon-wrapper.maintenance i { color: #4a5259; }

      .service-expand-btn {
        background: #f1f5f9;
        border: none;
        padding: 8px;
        border-radius: 8px;
        cursor: pointer;
        color: #64748b;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .service-expand-btn:hover {
        background: #e2e8f0;
        color: #1e293b;
      }

      .service-expand-btn i { width: 18px; height: 18px; }

      /* ========== METRIC BOXES (Panel Expandido) ========== */
      .metric-box {
        background: white;
        border-radius: 12px;
        padding: 16px;
        border: 1px solid #e2e8f0;
      }

      .metric-box .metric-label {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
        margin-bottom: 6px;
        display: block;
      }

      .metric-box .metric-value {
        font-size: 1.3rem;
        font-weight: 700;
        color: #1e293b;
      }

      .metric-box .metric-value.error { color: #dc2626; }

      .metric-sublabel {
        font-size: 0.7rem;
        color: #94a3b8;
        display: block;
        margin-top: 2px;
      }

      .metric-trend {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 0.75rem;
        font-weight: 600;
        margin-top: 4px;
      }

      .metric-trend i { width: 14px; height: 14px; }
      .metric-trend.up { color: #16a34a; }
      .metric-trend.down { color: #dc2626; }

      /* Mini Charts */
      .mini-chart {
        margin-top: 10px;
        height: 30px;
      }

      .mini-chart-svg {
        width: 100%;
        height: 100%;
        color: #4a5259;
      }

      .uptime-bar {
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
        margin-top: 10px;
      }

      .uptime-fill {
        height: 100%;
        background: linear-gradient(90deg, #16a34a, #22c55e);
        border-radius: 3px;
      }

      /* Service Actions Row */
      .service-actions-row {
        display: flex;
        gap: 10px;
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid #e2e8f0;
      }

      .service-action-btn {
        flex: 1;
        padding: 10px 14px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 500;
        color: #4a5259;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .service-action-btn:hover {
        background: #e2e8f0;
        border-color: #cbd5e1;
      }

      .service-action-btn i { width: 14px; height: 14px; }

      /* ========== ACTIVITY PANEL HEADER ========== */
      .activity-header {
        padding: 20px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1rem;
        font-weight: 600;
        color: #1e293b;
      }

      .activity-header i { width: 20px; height: 20px; color: #4a5259; }

      .activity-item.login .activity-icon { background: #dbeafe; }
      .activity-item.login .activity-icon i { color: #2563eb; }
      .activity-item.api .activity-icon { background: #dcfce7; }
      .activity-item.api .activity-icon i { color: #16a34a; }
      .activity-item.error .activity-icon { background: #fee2e2; }
      .activity-item.error .activity-icon i { color: #dc2626; }
      .activity-item.warning .activity-icon { background: #fef3c7; }
      .activity-item.warning .activity-icon i { color: #d97706; }
      .activity-item.db .activity-icon { background: #f3e8ff; }
      .activity-item.db .activity-icon i { color: #9333ea; }
      .activity-item.cache .activity-icon { background: #e0f2fe; }
      .activity-item.cache .activity-icon i { color: #0284c7; }
      
      /* Colores por categoría del eventLogger */
      .activity-item.auth .activity-icon { background: #dbeafe; }
      .activity-item.classroom .activity-icon { background: #dcfce7; }
      .activity-item.chat .activity-icon { background: #e0f2fe; }
      .activity-item.community .activity-icon { background: #fef3c7; }
      .activity-item.payments .activity-icon { background: #d1fae5; }
      .activity-item.users .activity-icon { background: #f3e8ff; }
      .activity-item.system .activity-icon { background: #f1f5f9; }
      
      /* Colores por severidad */
      .activity-icon.success { background: #dcfce7 !important; }
      .activity-icon.info { background: #dbeafe !important; }
      .activity-icon.warning { background: #fef3c7 !important; }
      .activity-icon.error { background: #fee2e2 !important; }

      /* Metrics Title */
      .metrics-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .metrics-title i { width: 16px; height: 16px; color: #4a5259; }

      /* Monitor Actions */
      .monitor-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
      }

      .monitor-title i { width: 24px; height: 24px; color: #4a5259; }

      .live-indicator {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: #dcfce7;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 700;
        color: #16a34a;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .live-dot {
        width: 6px;
        height: 6px;
        background: #16a34a;
        border-radius: 50%;
        animation: livePulse 2s ease-in-out infinite;
      }

      .monitor-actions {
        display: flex;
        gap: 8px;
      }

      .monitor-btn {
        background: #f1f5f9;
        border: none;
        padding: 10px;
        border-radius: 10px;
        cursor: pointer;
        color: #64748b;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .monitor-btn:hover {
        background: #e2e8f0;
        color: #4a5259;
      }

      .monitor-btn i { width: 18px; height: 18px; }

      /* Services Monitor Grid */
      .services-monitor-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      @keyframes slideInActivity {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      /* Activity Feed inside panel */
      .activity-panel .activity-feed {
        flex: 1;
        overflow-y: auto;
        max-height: 300px;
      }
        border: 1px solid #e2e8f0;
      }

      .metric-value {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1e293b;
        margin-bottom: 4px;
      }

      .metric-label {
        font-size: 0.75rem;
        color: #64748b;
        text-transform: uppercase;
      }

      .latency-graph {
        margin-top: 20px;
        padding: 16px;
        background: white;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
      }

      .latency-graph-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .latency-graph-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: #1e293b;
      }

      .latency-graph-live {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 0.75rem;
        color: #16a34a;
        font-weight: 600;
      }

      .latency-graph-bars {
        display: flex;
        align-items: flex-end;
        gap: 3px;
        height: 50px;
      }

      .graph-bar {
        flex: 1;
        background: linear-gradient(to top, #16a34a, #22c55e);
        border-radius: 2px 2px 0 0;
        min-height: 4px;
        transition: height 0.3s ease;
      }

      .graph-bar.warning { background: linear-gradient(to top, #f59e0b, #fbbf24); }
      .graph-bar.critical { background: linear-gradient(to top, #ef4444, #f87171); }

      .service-events {
        margin-top: 16px;
      }

      .service-events-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 10px;
      }

      .service-event-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 0;
        font-size: 0.8rem;
        color: #64748b;
        border-bottom: 1px solid #e2e8f0;
      }

      .service-event-item:last-child { border-bottom: none; }

      .service-event-item i { width: 14px; height: 14px; }

      /* ========== ACTIVITY PANEL (Sidebar) ========== */
      .activity-panel {
        background: white;
        border-radius: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 12px rgba(0,0,0,0.06);
        display: flex;
        flex-direction: column;
        max-height: calc(100vh - 300px);
        min-height: 500px;
      }

      .activity-panel-header {
        padding: 20px;
        border-bottom: 1px solid #e2e8f0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .activity-panel-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1rem;
        font-weight: 600;
        color: #1e293b;
      }

      .activity-panel-title i { width: 20px; height: 20px; color: #4a5259; }

      .activity-live-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        background: #dcfce7;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        color: #16a34a;
        text-transform: uppercase;
      }

      .activity-live-badge .live-dot {
        width: 6px;
        height: 6px;
        background: #16a34a;
        border-radius: 50%;
        animation: livePulse 2s ease-in-out infinite;
      }

      .activity-feed {
        flex: 1;
        overflow-y: auto;
        padding: 0;
      }

      .activity-feed::-webkit-scrollbar { width: 6px; }
      .activity-feed::-webkit-scrollbar-track { background: #f1f5f9; }
      .activity-feed::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

      .activity-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 20px;
        border-bottom: 1px solid #f1f5f9;
        animation: fadeInSlide 0.3s ease;
      }

      @keyframes fadeInSlide {
        from { opacity: 0; transform: translateX(-10px); }
        to { opacity: 1; transform: translateX(0); }
      }

      .activity-item:hover {
        background: #f8fafc;
      }

      .activity-icon {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f1f5f9;
        flex-shrink: 0;
      }

      .activity-icon i { width: 16px; height: 16px; }

      .activity-content {
        flex: 1;
        min-width: 0;
      }

      .activity-text {
        font-size: 0.85rem;
        color: #1e293b;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .activity-time {
        font-size: 0.7rem;
        color: #94a3b8;
      }

      /* Global Metrics Section */
      .global-metrics-section {
        padding: 20px;
        border-top: 1px solid #e2e8f0;
        background: #f8fafc;
      }

      .global-metrics-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .global-metrics-title i { width: 16px; height: 16px; color: #4a5259; }

      .global-metric-item {
        margin-bottom: 14px;
      }

      .global-metric-item:last-child { margin-bottom: 0; }

      .global-metric-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .global-metric-label {
        font-size: 0.8rem;
        color: #64748b;
      }

      .global-metric-value {
        font-size: 0.85rem;
        font-weight: 600;
        color: #1e293b;
      }

      .global-metric-bar {
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
      }

      .global-metric-fill {
        height: 100%;
        border-radius: 3px;
        transition: width 0.5s ease;
      }

      .global-metric-fill.green { background: linear-gradient(90deg, #16a34a, #22c55e); }
      .global-metric-fill.blue { background: linear-gradient(90deg, #0ea5e9, #38bdf8); }
      .global-metric-fill.purple { background: linear-gradient(90deg, #8b5cf6, #a78bfa); }
      .global-metric-fill.orange { background: linear-gradient(90deg, #f59e0b, #fbbf24); }

      .sync-indicator {
        padding: 12px 20px;
        border-top: 1px solid #e2e8f0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        font-size: 0.75rem;
        color: #64748b;
      }

      .sync-indicator i { width: 14px; height: 14px; animation: spin 2s linear infinite; }

      @keyframes spin { to { transform: rotate(360deg); } }

      /* Status Card Header - para modales */
      .status-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #f1f5f9;
      }

      .status-card-title {
        font-size: 1.1rem;
        font-weight: 600;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .status-card-title i { width: 20px; height: 20px; color: #4a5259; }

      /* Global Status Display */
      .global-status-display {
        text-align: center;
        padding: 30px 20px;
        border-radius: 12px;
        margin-bottom: 20px;
      }

      .global-status-display.operational { background: linear-gradient(135deg, #dcfce7, #bbf7d0); }
      .global-status-display.degraded { background: linear-gradient(135deg, #fef3c7, #fde68a); }
      .global-status-display.outage { background: linear-gradient(135deg, #fee2e2, #fecaca); }
      .global-status-display.maintenance { background: linear-gradient(135deg, #e5e7eb, #bfdbfe); }

      .global-status-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 15px;
        background: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }

      .global-status-icon i { width: 30px; height: 30px; }
      .global-status-icon.operational i { color: #16a34a; }
      .global-status-icon.degraded i { color: #d97706; }
      .global-status-icon.outage i { color: #dc2626; }
      .global-status-icon.maintenance i { color: #4a5259; }

      .global-status-text {
        font-size: 1.25rem;
        font-weight: 700;
      }

      .global-status-text.operational { color: #16a34a; }
      .global-status-text.degraded { color: #d97706; }
      .global-status-text.outage { color: #dc2626; }
      .global-status-text.maintenance { color: #4a5259; }

      .global-status-time {
        font-size: 0.85rem;
        color: #64748b;
        margin-top: 8px;
      }

      /* Service Items - Fallback para lista básica */
      .service-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 14px 0;
        border-bottom: 1px solid #f1f5f9;
      }

      .service-item:last-child { border-bottom: none; }

      .service-info h4 {
        font-size: 0.95rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 2px;
      }

      .service-info p {
        font-size: 0.8rem;
        color: #64748b;
      }

      .service-status-badge {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .service-status-badge i { width: 14px; height: 14px; }

      .service-status-badge.operational { background: #dcfce7; color: #16a34a; }
      .service-status-badge.degraded { background: #fef3c7; color: #d97706; }
      .service-status-badge.outage { background: #fee2e2; color: #dc2626; }
      .service-status-badge.maintenance { background: #e5e7eb; color: #4a5259; }

      .active-incident-card {
        background: #fffbeb;
        border: 2px solid #fbbf24;
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 20px;
      }

      .active-incident-card.outage {
        background: #fef2f2;
        border-color: #ef4444;
      }

      .active-incident-card.maintenance {
        background: #f5f5f7;
        border-color: #4a5259;
      }

      .incident-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        margin-bottom: 10px;
      }

      .incident-badge.degraded { background: #fef3c7; color: #b45309; }
      .incident-badge.outage { background: #fee2e2; color: #b91c1c; }
      .incident-badge.maintenance { background: #e5e7eb; color: #1d4ed8; }

      .incident-title {
        font-size: 1rem;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 8px;
      }

      .incident-message {
        font-size: 0.9rem;
        color: #475569;
        margin-bottom: 12px;
        line-height: 1.5;
      }

      .incident-meta {
        font-size: 0.8rem;
        color: #64748b;
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }

      .incident-meta span {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .incident-meta i { width: 14px; height: 14px; }

      .incident-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid rgba(0,0,0,0.1);
      }

      .incident-action-btn {
        padding: 8px 16px;
        border-radius: 8px;
        border: none;
        font-size: 0.85rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s;
      }

      .incident-action-btn i { width: 16px; height: 16px; }

      .incident-action-btn.resolve {
        background: #16a34a;
        color: white;
      }

      .incident-action-btn.resolve:hover { background: #15803d; }

      .incident-action-btn.update {
        background: #f1f5f9;
        color: #475569;
      }

      .incident-action-btn.update:hover { background: #e2e8f0; }

      .incident-action-btn.delete {
        background: #fee2e2;
        color: #dc2626;
      }

      .incident-action-btn.delete:hover { background: #fecaca; }

      .history-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .history-item {
        padding: 14px;
        background: #f8fafc;
        border-radius: 10px;
        margin-bottom: 10px;
        border-left: 3px solid;
      }

      .history-item.degraded { border-color: #f59e0b; }
      .history-item.outage { border-color: #ef4444; }
      .history-item.maintenance { border-color: #4a5259; }

      .history-item-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 6px;
      }

      .history-item-title {
        font-weight: 600;
        color: #1e293b;
        font-size: 0.9rem;
      }

      .history-item-resolved {
        font-size: 0.75rem;
        color: #16a34a;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .history-item-resolved i { width: 12px; height: 12px; }

      .history-item-dates {
        font-size: 0.8rem;
        color: #64748b;
      }

      .no-history {
        text-align: center;
        padding: 30px;
        color: #94a3b8;
      }

      .no-history i { width: 40px; height: 40px; margin-bottom: 10px; opacity: 0.5; }

      .status-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(15, 23, 42, 0.8);
        backdrop-filter: blur(8px);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      .status-modal-overlay.active { 
        display: flex;
        opacity: 1;
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .status-modal {
        background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
        border-radius: 24px;
        width: 100%;
        max-width: 550px;
        max-height: 85vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.25),
                    0 10px 30px rgba(0, 0, 0, 0.15),
                    inset 0 1px 0 rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.5);
        animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
      }

      @keyframes modalSlideIn {
        from { 
          opacity: 0;
          transform: translateY(30px) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .status-modal::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: linear-gradient(90deg, #4a5259, #4a5259, #6b7280);
        animation: shimmer 2s infinite;
        z-index: 10;
      }

      @keyframes shimmer {
        0%, 100% { background-position: -200% center; }
        50% { background-position: 200% center; }
      }

      .status-modal-header {
        padding: 28px 28px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e2e8f0;
        flex-shrink: 0;
      }

      .status-modal-header h3 {
        font-size: 1.4rem;
        font-weight: 700;
        color: #1e293b;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .status-modal-header h3::before {
        content: '';
        width: 4px;
        height: 24px;
        background: rgba(74, 82, 89, 0.1);
        border-radius: 2px;
      }

      .status-modal-close {
        background: #f1f5f9;
        border: none;
        cursor: pointer;
        color: #64748b;
        padding: 10px;
        border-radius: 12px;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .status-modal-close:hover { 
        background: #fee2e2;
        color: #dc2626;
        transform: rotate(90deg);
      }

      .status-modal-close i { width: 20px; height: 20px; }

      .status-modal-body { 
        padding: 24px 28px;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
      }

      .status-modal-body::-webkit-scrollbar {
        width: 6px;
      }

      .status-modal-body::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 10px;
      }

      .status-modal-body::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
      }

      .status-modal-body::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      .status-form-group {
        margin-bottom: 24px;
        animation: fadeInUp 0.4s ease both;
      }

      .status-form-group:nth-child(1) { animation-delay: 0.1s; }
      .status-form-group:nth-child(2) { animation-delay: 0.15s; }
      .status-form-group:nth-child(3) { animation-delay: 0.2s; }
      .status-form-group:nth-child(4) { animation-delay: 0.25s; }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(15px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .status-form-group label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        color: #1e293b;
        margin-bottom: 10px;
        font-size: 0.9rem;
      }

      .status-form-group label i {
        width: 16px;
        height: 16px;
        color: #4a5259;
      }

      .status-form-group input,
      .status-form-group textarea,
      .status-form-group select {
        width: 100%;
        padding: 12px;
        border: 2px solid #e2e8f0;
        border-radius: 12px;
        font-size: 0.95rem;
        transition: all 0.3s ease;
        background: white;
        color: #1e293b;
        font-family: inherit;
      }

      .status-form-group input::placeholder,
      .status-form-group textarea::placeholder {
        color: #94a3b8;
        font-family: inherit;
      }

      .status-form-group input:focus,
      .status-form-group textarea:focus,
      .status-form-group select:focus {
        outline: none;
        border-color: #4a5259;
        box-shadow: 0 0 0 4px rgba(84, 113, 148, 0.15);
      }

      .status-form-group input:hover,
      .status-form-group textarea:hover,
      .status-form-group select:hover {
        border-color: #cbd5e1;
      }

      .status-form-group textarea { 
        resize: vertical; 
        min-height: 100px;
        line-height: 1.6;
      }

      .status-form-group select {
        cursor: pointer;
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 14px center;
        background-size: 18px;
        padding-right: 45px;
      }

      .status-checkbox-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }

      .status-checkbox-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 14px;
        background: linear-gradient(145deg, #f8fafc, #f1f5f9);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
      }

      .status-checkbox-item:hover { 
        background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }

      .status-checkbox-item:has(input:checked) {
        border-color: #4a5259;
        background: linear-gradient(145deg, #f5f5f7, #e5e7eb);
      }

      .status-checkbox-item input { 
        width: 18px; 
        height: 18px; 
        cursor: pointer;
        accent-color: #4a5259;
      }

      .status-checkbox-item span { 
        font-size: 0.85rem; 
        color: #475569;
        font-weight: 500;
      }

      .banner-toggle {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 18px;
        background: linear-gradient(145deg, #f0fdf4, #dcfce7);
        border-radius: 14px;
        border: 2px solid #86efac;
        transition: all 0.3s ease;
        animation: fadeInUp 0.4s ease 0.3s both;
      }

      .banner-toggle:has(input:not(:checked)) {
        background: linear-gradient(145deg, #f8fafc, #f1f5f9);
        border-color: #e2e8f0;
      }

      .banner-toggle input { 
        width: 20px; 
        height: 20px;
        accent-color: #22c55e;
        cursor: pointer;
      }

      .banner-toggle label { 
        font-weight: 600; 
        color: #166534;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .banner-toggle:has(input:not(:checked)) label {
        color: #64748b;
      }

      .status-modal-footer {
        padding: 20px 28px;
        display: flex;
        gap: 14px;
        justify-content: flex-end;
        background: linear-gradient(to top, #ffffff 0%, #f8fafc 100%);
        border-top: 1px solid #e2e8f0;
        flex-shrink: 0;
      }

      .status-modal-btn {
        padding: 14px 28px;
        border-radius: 14px;
        font-weight: 600;
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.3s ease;
        border: none;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .status-modal-btn i { width: 18px; height: 18px; }

      .status-modal-btn.cancel {
        background: linear-gradient(145deg, #f8fafc, #f1f5f9);
        color: #64748b;
        border: 2px solid #e2e8f0;
      }

      .status-modal-btn.cancel:hover { 
        background: linear-gradient(145deg, #f1f5f9, #e2e8f0);
        border-color: #cbd5e1;
        transform: translateY(-2px);
      }

      .status-modal-btn.submit {
        background: linear-gradient(135deg, #4a5259, #3d444a);
        color: white;
        box-shadow: 0 4px 15px rgba(84, 113, 148, 0.3);
      }

      .status-modal-btn.submit:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 25px rgba(84, 113, 148, 0.4);
        background: linear-gradient(135deg, #3d444a, #2d4a6a);
      }

      .status-modal-btn.submit:active {
        transform: translateY(-1px);
      }

      .banner-preview {
        margin-top: 24px;
        padding: 20px;
        border-radius: 16px;
        background: linear-gradient(145deg, #f8fafc, #f1f5f9);
        border: 2px solid #e2e8f0;
        animation: fadeInUp 0.4s ease 0.4s both;
      }

      .banner-preview-label {
        font-size: 0.75rem;
        color: #64748b;
        margin-bottom: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .banner-preview-label::before {
        content: '';
        width: 8px;
        height: 8px;
        background: #22c55e;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
      }

      .banner-preview-content {
        background: linear-gradient(145deg, #fef3c7, #fde68a);
        border-left: 4px solid #f59e0b;
        padding: 16px 20px;
        border-radius: 0 14px 14px 0;
        display: flex;
        align-items: center;
        gap: 14px;
        box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
        transition: all 0.3s ease;
      }

      .banner-preview-content.outage {
        background: linear-gradient(145deg, #fee2e2, #fecaca);
        border-color: #ef4444;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
      }

      .banner-preview-content.maintenance {
        background: linear-gradient(145deg, #e5e7eb, #bfdbfe);
        border-color: #4a5259;
        box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
      }

      .banner-preview-content i { width: 22px; height: 22px; }
      .banner-preview-content.degraded i { color: #d97706; }
      .banner-preview-content.outage i { color: #dc2626; }
      .banner-preview-content.maintenance i { color: #4a5259; }

      .banner-preview-text {
        flex: 1;
        font-size: 0.95rem;
        color: #1e293b;
        font-weight: 500;
      }

      .status-modal::-webkit-scrollbar {
        width: 8px;
      }

      .status-modal::-webkit-scrollbar-track {
        background: #f1f5f9;
        border-radius: 10px;
      }

      .status-modal::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 10px;
      }

      .status-modal::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
      }

      .status-loading {
        text-align: center;
        padding: 40px;
      }

      .status-loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #e2e8f0;
        border-top-color: #4a5259;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 15px;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>

    <div class="status-admin-container">
      <!-- Hero -->
      <div class="status-hero">
        <div class="status-hero-info">
          <h2 style="color: white;"><i data-lucide="activity"></i> Status del Sistema</h2>
          <p>Gestiona el estado de los servicios y comunica incidentes a los usuarios.</p>
        </div>
        <div class="status-hero-actions">
          <button class="status-btn status-btn-primary" onclick="openNewIncidentModal()">
            <i data-lucide="alert-circle"></i>
            Reportar Incidente
          </button>
          <button class="status-btn status-btn-secondary" onclick="window.open('/status.html', '_blank')">
            <i data-lucide="external-link"></i>
            Ver Página Pública
          </button>
        </div>
      </div>

      <div class="status-grid">
        <!-- Panel Principal -->
        <div class="status-main">
          <!-- Estado Global -->
          <div class="status-card">
            <div class="status-card-header">
              <span class="status-card-title"><i data-lucide="globe"></i> Estado Global</span>
              <button class="status-btn status-btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="refreshStatusData()">
                <i data-lucide="refresh-cw"></i> Actualizar
              </button>
            </div>
            <div id="globalStatusDisplay" class="global-status-display operational">
              <div class="status-loading">
                <div class="status-loading-spinner"></div>
                <p>Cargando...</p>
              </div>
            </div>
          </div>

          <!-- Incidente Activo -->
          <div id="activeIncidentContainer"></div>

          <!-- 🔥 NUEVO: Centro de Monitoreo en Tiempo Real -->
          <div class="monitoring-center">
            <div class="monitoring-main">
              <div class="services-monitor-header">
                <div class="monitor-title">
                  <i data-lucide="activity"></i>
                  <span>Centro de Monitoreo en Tiempo Real</span>
                  <span class="live-indicator">
                    <span class="live-dot"></span>
                    EN VIVO
                  </span>
                </div>
                <div class="monitor-actions">
                  <button class="monitor-btn" onclick="toggleAllServices()" title="Expandir/Colapsar todos">
                    <i data-lucide="layers"></i>
                  </button>
                  <button class="monitor-btn" onclick="refreshStatusData()" title="Actualizar">
                    <i data-lucide="refresh-cw"></i>
                  </button>
                </div>
              </div>
              
              <div class="services-monitor-grid" id="servicesMonitorGrid">
                <div class="status-loading">
                  <div class="status-loading-spinner"></div>
                  <p>Conectando con servicios...</p>
                </div>
              </div>
            </div>
            
            <!-- Panel de Actividad en Tiempo Real -->
            <div class="activity-panel">
              <div class="activity-header">
                <i data-lucide="radio"></i>
                <span>Actividad del Sistema</span>
              </div>
              
              <div class="activity-feed" id="activityFeed">
                <!-- Se llena dinámicamente -->
              </div>
              
              <div class="global-metrics-section">
                <div class="metrics-title">
                  <i data-lucide="bar-chart-3"></i>
                  Métricas Globales
                </div>
                <div id="globalMetricsDisplay">
                  <!-- Se llena dinámicamente -->
                </div>
              </div>
              
              <div class="sync-indicator">
                <i data-lucide="loader"></i>
                <span id="syncTime">Sincronizando...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar - Historial -->
        <div class="status-sidebar">
          <div class="status-card">
            <div class="status-card-header">
              <span class="status-card-title"><i data-lucide="history"></i> Historial</span>
            </div>
            <div class="history-list" id="historyList">
              <div class="status-loading">
                <div class="status-loading-spinner"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nuevo Incidente -->
    <div class="status-modal-overlay" id="incidentModal">
      <div class="status-modal">
        <div class="status-modal-header">
          <h3 id="incidentModalTitle">Reportar Incidente</h3>
          <button class="status-modal-close" onclick="closeIncidentModal()">
            <i data-lucide="x"></i>
          </button>
        </div>
        <div class="status-modal-body">
          <div class="status-form-group">
            <label>Título del Incidente *</label>
            <input type="text" id="incidentTitle" placeholder="Ej: Mantenimiento programado del sistema">
          </div>
          
          <div class="status-form-group">
            <label>Severidad *</label>
            <select id="incidentSeverity" onchange="updateBannerPreview()">
              <option value="">Selecciona la severidad...</option>
              <option value="degraded">️ Degradado - Rendimiento reducido</option>
              <option value="outage"> Interrupción - Servicio no disponible</option>
              <option value="maintenance"> Mantenimiento - Trabajo programado</option>
            </select>
          </div>

          <div class="status-form-group">
            <label>Mensaje (opcional)</label>
            <textarea id="incidentMessage" placeholder="Describe el incidente y las acciones que se están tomando..." oninput="updateBannerPreview()"></textarea>
          </div>

          <div class="status-form-group">
            <label>Servicios Afectados</label>
            <div class="status-checkbox-group" id="servicesCheckboxes">
              <!-- Se llena dinámicamente -->
            </div>
          </div>

          <div class="banner-toggle">
            <input type="checkbox" id="showBanner" checked>
            <label for="showBanner">Mostrar banner en la página de inicio</label>
          </div>

          <div class="banner-preview" id="bannerPreview" style="display: none;">
            <div class="banner-preview-label">Vista previa del banner</div>
            <div class="banner-preview-content degraded" id="bannerPreviewContent">
              <i data-lucide="alert-triangle"></i>
              <span class="banner-preview-text" id="bannerPreviewText">Título del incidente</span>
            </div>
          </div>
        </div>
        <div class="status-modal-footer">
          <button class="status-modal-btn cancel" onclick="closeIncidentModal()">Cancelar</button>
          <button class="status-modal-btn submit" onclick="submitIncident()">Publicar Incidente</button>
        </div>
      </div>
    </div>
  `;
}

async function initStatusInteractivity() {
  await loadStatusData();
}

async function loadStatusData() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/status', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    if (response.ok) {
      currentStatusData = await response.json();
      renderStatusUI();
    }
  } catch (error) {
    console.error('Error cargando status:', error);
  }
}

function renderStatusUI() {
  if (!currentStatusData) return;

  const { global_status, services, active_incident, incidents_history, last_updated } = currentStatusData;

  const globalDisplay = document.getElementById('globalStatusDisplay');
  globalDisplay.className = `global-status-display ${global_status}`;
  globalDisplay.innerHTML = `
    <div class="global-status-icon ${global_status}">
      <i data-lucide="${STATUS_CONFIG.icons[global_status]}"></i>
    </div>
    <div class="global-status-text ${global_status}">${STATUS_CONFIG.labels[global_status]}</div>
    <div class="global-status-time">Última actualización: ${formatStatusTime(last_updated)}</div>
  `;

  const incidentContainer = document.getElementById('activeIncidentContainer');
  if (active_incident) {
    incidentContainer.innerHTML = `
      <div class="active-incident-card ${active_incident.severity}">
        <span class="incident-badge ${active_incident.severity}">
          <i data-lucide="${STATUS_CONFIG.icons[active_incident.severity]}"></i>
          ${STATUS_CONFIG.labels[active_incident.severity]}
        </span>
        <div class="incident-title">${active_incident.title}</div>
        ${active_incident.message ? `<div class="incident-message">${active_incident.message}</div>` : ''}
        <div class="incident-meta">
          <span><i data-lucide="clock"></i> ${formatStatusDate(active_incident.created_at)}</span>
          ${active_incident.affected_services?.length ? `
            <span><i data-lucide="layers"></i> ${active_incident.affected_services.length} servicio(s) afectado(s)</span>
          ` : ''}
          ${active_incident.show_banner ? '<span><i data-lucide="eye"></i> Banner activo</span>' : ''}
        </div>
        <div class="incident-actions">
          <button class="incident-action-btn resolve" onclick="resolveIncident(${active_incident.id})">
            <i data-lucide="check"></i> Resolver
          </button>
          <button class="incident-action-btn update" onclick="openUpdateModal(${active_incident.id})">
            <i data-lucide="edit-3"></i> Actualizar
          </button>
          <button class="incident-action-btn delete" onclick="deleteIncident(${active_incident.id})">
            <i data-lucide="trash-2"></i> Eliminar
          </button>
        </div>
      </div>
    `;
  } else {
    incidentContainer.innerHTML = '';
  }

  // 🔥 NUEVO: Renderizar Centro de Monitoreo con servicios interactivos
  renderServicesMonitor(services);
  
  // Renderizar panel de actividad
  renderActivityFeed();
  
  // Renderizar métricas globales
  renderGlobalMetrics();
  
  // Actualizar indicador de sincronización
  updateSyncIndicator();

  const historyList = document.getElementById('historyList');
  if (incidents_history.length === 0) {
    historyList.innerHTML = `
      <div class="no-history">
        <i data-lucide="check-circle"></i>
        <p>No hay incidentes en el historial</p>
      </div>
    `;
  } else {
    historyList.innerHTML = incidents_history.slice(0, 10).map(inc => `
      <div class="history-item ${inc.severity}">
        <div class="history-item-header">
          <span class="history-item-title">${inc.title}</span>
          <span class="history-item-resolved"><i data-lucide="check"></i> Resuelto</span>
        </div>
        <div class="history-item-dates">
          ${formatStatusDate(inc.created_at)} - ${formatStatusDate(inc.resolved_at)}
        </div>
      </div>
    `).join('');
  }

  const checkboxContainer = document.getElementById('servicesCheckboxes');
  if (checkboxContainer) {
    checkboxContainer.innerHTML = services.map(s => `
      <label class="status-checkbox-item">
        <input type="checkbox" name="affected_service" value="${s.id}">
        <span>${s.name}</span>
      </label>
    `).join('');
  }

  lucide.createIcons();
  
  // Iniciar actualizaciones automáticas del monitor
  startStatusMonitoring();
}

// 🔥 Estado expandido de servicios
let expandedServices = new Set();
let statusMonitorInterval = null;
let serviceMetricsCache = {};

async function renderServicesMonitor(services) {
  const grid = document.getElementById('servicesMonitorGrid');
  if (!grid) return;
  
  const serviceIcons = {
    'Plataforma Principal': 'globe',
    'Classroom': 'book-open',
    'Sistema de Pagos': 'credit-card',
    'Chat de Soporte': 'message-circle',
    'API / Backend': 'code-2',
    'Base de Datos': 'database',
    'Autenticación': 'shield',
    'Servicio de Email': 'mail',
    'Almacenamiento': 'hard-drive'
  };
  
  // Obtener métricas reales para cada servicio
  const token = localStorage.getItem('token');
  for (const service of services) {
    try {
      const response = await fetch(`/api/status/service/${service.id}/metrics`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (response.ok) {
        serviceMetricsCache[service.id] = await response.json();
      }
    } catch (e) {
      // Usar datos simulados como fallback
      serviceMetricsCache[service.id] = StatusSimulator.getServiceMetrics(service.status);
    }
  }
  
  grid.innerHTML = services.map(s => {
    const metrics = serviceMetricsCache[s.id] || StatusSimulator.getServiceMetrics(s.status);
    const isExpanded = expandedServices.has(s.id);
    const icon = serviceIcons[s.name] || 'server';
    
    // Extraer datos del formato de métricas reales o simulados - asegurar números enteros
    const latency = Math.round(metrics.latency?.current || metrics.latency || 0);
    const uptime = typeof metrics.uptime === 'number' ? metrics.uptime.toFixed(1) : (metrics.uptime?.percentage || '99.9');
    const reqPerMin = Math.round(metrics.requests?.perMinute || metrics.requestsPerMinute || metrics.requestsPerMin || 0);
    const errors = Math.min(metrics.errors?.last1h || metrics.errors || 0, 10); // Máximo 10 errores
    const latencyHistory = metrics.latencyHistory || Array(10).fill(0).map(() => Math.round(latency * (0.8 + Math.random() * 0.4)));
    const trend = metrics.trend || (Math.random() > 0.5 ? Math.floor(Math.random() * 8) : -Math.floor(Math.random() * 5));
    
    return `
      <div class="service-monitor-card ${s.status} ${isExpanded ? 'expanded' : ''}" data-service-id="${s.id}">
        <div class="service-monitor-main" onclick="toggleServiceCard('${s.id}')">
          <div class="service-icon-wrapper ${s.status}">
            <i data-lucide="${icon}"></i>
            <span class="status-pulse ${s.status}"></span>
          </div>
          <div class="service-monitor-info">
            <h4>${s.name}</h4>
            <p class="service-description">${s.description}</p>
            <div class="service-latency-bar">
              <div class="latency-fill ${latency < 50 ? 'good' : latency < 150 ? 'medium' : 'slow'}" 
                   style="width: ${Math.min(latency / 3, 100)}%"></div>
            </div>
            <span class="latency-value">${latency}ms</span>
          </div>
          <div class="service-status-indicator ${s.status}">
            <i data-lucide="${STATUS_CONFIG.icons[s.status]}"></i>
            <span>${STATUS_CONFIG.labels[s.status]}</span>
          </div>
          <button class="service-expand-btn" onclick="event.stopPropagation(); toggleServiceCard('${s.id}')">
            <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}"></i>
          </button>
        </div>
        
        <div class="service-expanded-panel" style="display: ${isExpanded ? 'block' : 'none'}">
          <div class="expanded-metrics-grid">
            <div class="metric-box">
              <span class="metric-label">Tiempo de respuesta</span>
              <span class="metric-value">${latency}ms</span>
              <div class="mini-chart" id="chart-latency-${s.id}">
                ${generateMiniChart(latencyHistory)}
              </div>
            </div>
            <div class="metric-box">
              <span class="metric-label">Uptime (24h)</span>
              <span class="metric-value">${uptime}%</span>
              <div class="uptime-bar">
                <div class="uptime-fill" style="width: ${parseFloat(uptime)}%"></div>
              </div>
            </div>
            <div class="metric-box">
              <span class="metric-label">Solicitudes/min</span>
              <span class="metric-value">${reqPerMin}</span>
              <span class="metric-trend ${trend > 0 ? 'up' : 'down'}">
                <i data-lucide="${trend > 0 ? 'trending-up' : 'trending-down'}"></i>
                ${Math.abs(trend)}%
              </span>
            </div>
            <div class="metric-box">
              <span class="metric-label">Errores</span>
              <span class="metric-value ${errors > 0 ? 'error' : ''}">${errors}</span>
              <span class="metric-sublabel">en la última hora</span>
            </div>
          </div>
          <div class="service-actions-row">
            <button class="service-action-btn" onclick="event.stopPropagation(); viewServiceLogs('${s.id}', '${s.name}')">
              <i data-lucide="file-text"></i> Ver Logs
            </button>
            <button class="service-action-btn" onclick="event.stopPropagation(); pingService('${s.id}', '${s.name}')">
              <i data-lucide="activity"></i> Ping
            </button>
            <button class="service-action-btn" onclick="event.stopPropagation(); restartService('${s.id}', '${s.name}')">
              <i data-lucide="refresh-cw"></i> Reiniciar
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  lucide.createIcons();
}

function generateMiniChart(history) {
  const max = Math.max(...history);
  const min = Math.min(...history);
  const range = max - min || 1;
  
  return `
    <svg viewBox="0 0 100 30" class="mini-chart-svg">
      <polyline
        points="${history.map((v, i) => `${i * (100 / (history.length - 1))},${30 - ((v - min) / range) * 25}`).join(' ')}"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}

function toggleServiceCard(serviceId) {
  const card = document.querySelector(`.service-monitor-card[data-service-id="${serviceId}"]`);
  if (!card) return;
  
  const panel = card.querySelector('.service-expanded-panel');
  const btn = card.querySelector('.service-expand-btn i');
  
  if (expandedServices.has(serviceId)) {
    expandedServices.delete(serviceId);
    card.classList.remove('expanded');
    panel.style.display = 'none';
    if (btn) btn.setAttribute('data-lucide', 'chevron-down');
  } else {
    expandedServices.add(serviceId);
    card.classList.add('expanded');
    panel.style.display = 'block';
    if (btn) btn.setAttribute('data-lucide', 'chevron-up');
  }
  
  lucide.createIcons();
}

function toggleAllServices() {
  const services = currentStatusData?.services || [];
  const allExpanded = services.every(s => expandedServices.has(s.id));
  
  if (allExpanded) {
    expandedServices.clear();
  } else {
    services.forEach(s => expandedServices.add(s.id));
  }
  
  renderServicesMonitor(services);
}

function renderActivityFeed() {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;
  
  // Obtener actividad real del backend
  const token = localStorage.getItem('token');
  fetch('/api/status/activity?limit=12', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  })
    .then(res => res.json())
    .then(data => {
      if (data.activities && data.activities.length > 0) {
        feed.innerHTML = data.activities.map(activity => {
          // Siempre usar icono Lucide
          const iconName = activity.icon || 'activity';
          
          // Clase de severidad para estilizar
          const severityClass = activity.severity || 'info';
          
          return `
            <div class="activity-item ${activity.category || activity.type} ${severityClass}" style="animation: slideInActivity 0.3s ease">
              <div class="activity-icon ${severityClass}">
                <i data-lucide="${iconName}"></i>
              </div>
              <div class="activity-content">
                <span class="activity-text">${activity.message}</span>
                <span class="activity-time">${activity.time || formatActivityTimeFromISO(activity.timestamp)}</span>
              </div>
            </div>
          `;
        }).join('');
        lucide.createIcons();
      } else {
        feed.innerHTML = `
          <div class="activity-item info" style="padding: 20px; text-align: center; color: #6c757d;">
            <i data-lucide="inbox" style="width: 24px; height: 24px; margin-bottom: 8px;"></i>
            <span class="activity-text">Sin actividad reciente</span>
            <br><small>Los eventos aparecerán cuando los usuarios interactúen con la plataforma</small>
          </div>
        `;
        lucide.createIcons();
      }
    })
    .catch(err => {
      // Fallback a datos simulados si falla
      const events = [];
      for (let i = 0; i < 8; i++) {
        events.push(StatusSimulator.generateEvent());
      }
      events.sort((a, b) => b.time - a.time);
      
      feed.innerHTML = events.map(event => `
        <div class="activity-item ${event.type}" style="animation: slideInActivity 0.3s ease">
          <div class="activity-icon">
            <i data-lucide="${event.icon}"></i>
          </div>
          <div class="activity-content">
            <span class="activity-text">${event.message}</span>
            <span class="activity-time">${formatActivityTime(event.time)}</span>
          </div>
        </div>
      `).join('');
      lucide.createIcons();
    });
}

function formatActivityTimeFromISO(isoString) {
  const timestamp = new Date(isoString).getTime();
  return formatActivityTime(timestamp);
}

function formatActivityTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  
  if (seconds < 60) return `hace ${seconds}s`;
  if (minutes < 60) return `hace ${minutes}m`;
  return `hace ${Math.floor(minutes / 60)}h`;
}

function renderGlobalMetrics() {
  const container = document.getElementById('globalMetricsDisplay');
  if (!container) return;
  
  // Obtener métricas reales del sistema
  const token = localStorage.getItem('token');
  fetch('/api/status/metrics', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
  })
    .then(res => res.json())
    .then(data => {
      const cpuUsage = data.cpu?.usage || 0;
      const memoryUsage = data.memory?.usagePercent || 0;
      const reqPerSec = data.network?.requestsPerSecond || 0;
      const connections = data.network?.activeConnections || 0;
      
      container.innerHTML = `
        <div class="global-metric-item">
          <div class="global-metric-header">
            <span class="global-metric-label">Conexiones activas</span>
            <span class="global-metric-value">${connections}</span>
          </div>
          <div class="global-metric-bar">
            <div class="global-metric-fill green" style="width: ${Math.min(connections * 10, 100)}%"></div>
          </div>
        </div>
        <div class="global-metric-item">
          <div class="global-metric-header">
            <span class="global-metric-label">CPU</span>
            <span class="global-metric-value">${cpuUsage}%</span>
          </div>
          <div class="global-metric-bar">
            <div class="global-metric-fill ${cpuUsage < 60 ? 'blue' : cpuUsage < 80 ? 'orange' : 'red'}" 
                 style="width: ${cpuUsage}%"></div>
          </div>
        </div>
        <div class="global-metric-item">
          <div class="global-metric-header">
            <span class="global-metric-label">Memoria RAM</span>
            <span class="global-metric-value">${memoryUsage}%</span>
          </div>
          <div class="global-metric-bar">
            <div class="global-metric-fill purple" style="width: ${memoryUsage}%"></div>
          </div>
        </div>
        <div class="global-metric-item">
          <div class="global-metric-header">
            <span class="global-metric-label">Requests/seg</span>
            <span class="global-metric-value">${reqPerSec}</span>
          </div>
          <div class="global-metric-bar">
            <div class="global-metric-fill orange" style="width: ${Math.min(reqPerSec * 5, 100)}%"></div>
          </div>
        </div>
      `;
    })
    .catch(err => {
      // Fallback a datos simulados
      const metrics = StatusSimulator.getGlobalMetrics();
      container.innerHTML = `
        <div class="global-metric-item">
          <div class="global-metric-header">
            <span class="global-metric-label">Usuarios activos</span>
            <span class="global-metric-value">${metrics.activeUsers}</span>
          </div>
          <div class="global-metric-bar">
            <div class="global-metric-fill green" style="width: ${Math.min(metrics.activeUsers / 2, 100)}%"></div>
          </div>
        </div>
        <div class="global-metric-item">
          <div class="global-metric-header">
            <span class="global-metric-label">Carga del servidor</span>
            <span class="global-metric-value">${metrics.serverLoad}%</span>
          </div>
          <div class="global-metric-bar">
            <div class="global-metric-fill ${metrics.serverLoad < 60 ? 'blue' : metrics.serverLoad < 80 ? 'orange' : 'red'}" 
                 style="width: ${metrics.serverLoad}%"></div>
          </div>
        </div>
        <div class="global-metric-item">
          <div class="global-metric-header">
            <span class="global-metric-label">Memoria utilizada</span>
            <span class="global-metric-value">${metrics.memoryUsage}%</span>
          </div>
          <div class="global-metric-bar">
            <div class="global-metric-fill purple" style="width: ${metrics.memoryUsage}%"></div>
          </div>
        </div>
        <div class="global-metric-item">
          <div class="global-metric-header">
            <span class="global-metric-label">Solicitudes/seg</span>
            <span class="global-metric-value">${metrics.requestsPerSec}</span>
          </div>
          <div class="global-metric-bar">
            <div class="global-metric-fill orange" style="width: ${Math.min(metrics.requestsPerSec * 2, 100)}%"></div>
          </div>
        </div>
      `;
    });
}

function updateSyncIndicator() {
  const syncTime = document.getElementById('syncTime');
  if (syncTime) {
    const now = new Date();
    syncTime.textContent = `Última sincronización: ${now.toLocaleTimeString('es-AR')}`;
  }
}

function startStatusMonitoring() {
  // Limpiar intervalo anterior si existe
  if (statusMonitorInterval) {
    clearInterval(statusMonitorInterval);
  }
  
  // Actualizar métricas cada 10 segundos
  statusMonitorInterval = setInterval(() => {
    if (currentStatusData && document.getElementById('servicesMonitorGrid')) {
      renderServicesMonitor(currentStatusData.services);
      renderActivityFeed();
      renderGlobalMetrics();
      updateSyncIndicator();
      lucide.createIcons();
    }
  }, 10000);
}

function stopStatusMonitoring() {
  if (statusMonitorInterval) {
    clearInterval(statusMonitorInterval);
    statusMonitorInterval = null;
  }
}

// Acciones de servicio con datos reales
async function viewServiceLogs(serviceId, serviceName) {
  // Mostrar modal de carga inicial
  Swal.fire({
    title: `📋 Logs de ${serviceName}`,
    html: `
      <div style="display: flex; gap: 10px; margin-bottom: 15px; flex-wrap: wrap; justify-content: center;">
        <button onclick="filterLogs('all')" class="log-filter-btn active" data-filter="all" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0; background: #4a5259; color: white; cursor: pointer; font-size: 0.8rem;">Todos</button>
        <button onclick="filterLogs('INFO')" class="log-filter-btn" data-filter="INFO" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-size: 0.8rem;">Info</button>
        <button onclick="filterLogs('WARN')" class="log-filter-btn" data-filter="WARN" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-size: 0.8rem;">Warning</button>
        <button onclick="filterLogs('ERROR')" class="log-filter-btn" data-filter="ERROR" style="padding: 6px 12px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; cursor: pointer; font-size: 0.8rem;">Error</button>
      </div>
      <div id="logsStats" style="display: flex; gap: 15px; justify-content: center; margin-bottom: 15px; font-size: 0.75rem; color: #64748b;">
        <span>Total: <strong id="statTotal">-</strong></span>
        <span>Última hora: <strong id="statHour">-</strong></span>
      </div>
      <div id="logsContainer" style="text-align: left; font-family: 'Consolas', 'Monaco', monospace; font-size: 0.75rem; background: #0f172a; color: #94a3b8; padding: 15px; border-radius: 8px; height: 350px; overflow-y: auto;">
        <div style="color: #64748b; text-align: center; padding: 20px;">
          <i data-lucide="loader" style="animation: spin 1s linear infinite;"></i>
          Conectando con el servicio...
        </div>
      </div>
      <div style="margin-top: 15px; display: flex; gap: 10px; justify-content: center;">
        <button onclick="refreshLogs('${serviceId}')" class="swal2-confirm swal2-styled" style="background: #4a5259; font-size: 0.85rem; padding: 8px 16px;">
          <i data-lucide="refresh-cw" style="width: 14px; height: 14px; margin-right: 5px;"></i> Actualizar
        </button>
        <button onclick="exportLogs()" class="swal2-styled" style="background: #2563eb; font-size: 0.85rem; padding: 8px 16px;">
          <i data-lucide="download" style="width: 14px; height: 14px; margin-right: 5px;"></i> Exportar
        </button>
        <button onclick="clearLogsDisplay()" class="swal2-cancel swal2-styled" style="background: #64748b; font-size: 0.85rem; padding: 8px 16px;">
          <i data-lucide="trash-2" style="width: 14px; height: 14px; margin-right: 5px;"></i> Limpiar
        </button>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Cerrar',
    confirmButtonColor: '#4a5259',
    width: 800,
    didOpen: () => {
      lucide.createIcons();
      window.currentServiceId = serviceId;
      window.currentLogFilter = 'all';
      window.allLogsData = [];
      loadServiceLogs(serviceId);
      // Auto-refresh cada 5 segundos
      window.logsInterval = setInterval(() => loadServiceLogs(serviceId), 5000);
    },
    willClose: () => {
      if (window.logsInterval) {
        clearInterval(window.logsInterval);
      }
    }
  });
}

async function loadServiceLogs(serviceId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/status/logs?service=${serviceId}&limit=50`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await response.json();
    
    const container = document.getElementById('logsContainer');
    if (!container) return;
    
    // Guardar datos para filtrado
    window.allLogsData = data.logs || [];
    
    // Actualizar estadísticas
    if (data.stats) {
      const statTotal = document.getElementById('statTotal');
      const statHour = document.getElementById('statHour');
      if (statTotal) statTotal.textContent = data.stats.totalEvents || data.total;
      if (statHour) statHour.textContent = data.stats.lastHour || 0;
    }
    
    // Aplicar filtro actual
    renderFilteredLogs();
    
  } catch (error) {
    console.error('Error cargando logs:', error);
  }
}

function filterLogs(level) {
  window.currentLogFilter = level;
  
  // Actualizar botones activos
  document.querySelectorAll('.log-filter-btn').forEach(btn => {
    if (btn.dataset.filter === level) {
      btn.style.background = '#4a5259';
      btn.style.color = 'white';
    } else {
      btn.style.background = 'white';
      btn.style.color = '#1e293b';
    }
  });
  
  renderFilteredLogs();
}

function renderFilteredLogs() {
  const container = document.getElementById('logsContainer');
  if (!container) return;
  
  let logs = window.allLogsData || [];
  
  // Filtrar por nivel si no es "all"
  if (window.currentLogFilter && window.currentLogFilter !== 'all') {
    logs = logs.filter(log => log.level === window.currentLogFilter);
  }
  
  if (logs.length > 0) {
    container.innerHTML = logs.map(log => {
      const color = log.level === 'ERROR' ? '#ef4444' : 
                    log.level === 'WARN' ? '#fbbf24' : 
                    log.level === 'DEBUG' ? '#64748b' : '#22c55e';
      const bgColor = log.level === 'ERROR' ? 'rgba(239,68,68,0.1)' : 
                      log.level === 'WARN' ? 'rgba(251,191,36,0.1)' : 
                      'transparent';
      const time = new Date(log.timestamp).toLocaleString('es-AR', {
        day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      
      // Mostrar icono emoji si está disponible
      const icon = log.icon || '';
      
      // Construir detalles adicionales si existen
      let detailsHtml = '';
      if (log.details && Object.keys(log.details).length > 0) {
        const cleanDetails = Object.entries(log.details)
          .filter(([key, val]) => val !== undefined && val !== null && key !== 'password' && key !== 'token')
          .map(([key, val]) => `<span style="color: #60a5fa;">${key}</span>: <span style="color: #a5b4fc;">${val}</span>`)
          .join(' | ');
        if (cleanDetails) {
          detailsHtml = `<div style="font-size: 0.7rem; color: #64748b; margin-top: 2px; padding-left: 20px;">└─ ${cleanDetails}</div>`;
        }
      }
      
      // Badge de categoría
      const categoryBadge = log.category ? 
        `<span style="background: #1e40af; color: white; padding: 1px 6px; border-radius: 4px; font-size: 0.65rem; margin-left: 8px;">${log.category}</span>` : '';
      
      return `
        <div style="background: ${bgColor}; padding: 8px 10px; border-bottom: 1px solid #1e293b; border-radius: 4px; margin-bottom: 4px;">
          <div style="display: flex; align-items: flex-start; gap: 8px;">
            <i data-lucide="${log.icon || 'activity'}" style="width: 16px; height: 16px; color: ${color}; flex-shrink: 0; margin-top: 2px;"></i>
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <span style="color: #475569; font-size: 0.7rem;">${time}</span>
                <span style="color: ${color}; font-weight: 600; font-size: 0.7rem; background: ${bgColor}; padding: 1px 6px; border-radius: 3px;">${log.level}</span>
                ${categoryBadge}
              </div>
              <div style="color: #e2e8f0; margin-top: 4px; font-size: 0.8rem;">${log.message}</div>
              ${detailsHtml}
            </div>
          </div>
        </div>
      `;
    }).join('');
  } else {
    container.innerHTML = `
      <div style="color: #64748b; text-align: center; padding: 40px;">
        <i data-lucide="inbox" style="width: 40px; height: 40px; opacity: 0.5;"></i>
        <p style="margin-top: 10px;">No hay logs disponibles${window.currentLogFilter !== 'all' ? ` de tipo ${window.currentLogFilter}` : ''}</p>
        <p style="font-size: 0.75rem; margin-top: 5px;">Los eventos aparecerán cuando los usuarios interactúen con la plataforma</p>
      </div>
    `;
  }
  
  // Auto-scroll al final
  container.scrollTop = container.scrollHeight;
  lucide.createIcons();
}

function exportLogs() {
  const logs = window.allLogsData || [];
  if (logs.length === 0) {
    Swal.fire('Sin datos', 'No hay logs para exportar', 'info');
    return;
  }
  
  const csvContent = [
    ['Timestamp', 'Level', 'Category', 'Message', 'Details'].join(','),
    ...logs.map(log => [
      log.timestamp,
      log.level,
      log.category || log.service || '',
      `"${log.message.replace(/"/g, '""')}"`,
      log.details ? `"${JSON.stringify(log.details).replace(/"/g, '""')}"` : ''
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `logs_${window.currentServiceId}_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
}

function refreshLogs(serviceId) {
  loadServiceLogs(serviceId);
}

function clearLogsDisplay() {
  const container = document.getElementById('logsContainer');
  if (container) {
    container.innerHTML = `<div style="color: #64748b; text-align: center; padding: 40px;">Logs limpiados</div>`;
  }
}

async function pingService(serviceId, serviceName) {
  // Mostrar modal de carga
  Swal.fire({
    title: `Ping a ${serviceName}`,
    html: `
      <div style="text-align: center; padding: 30px;">
        <div class="ping-animation" style="width: 80px; height: 80px; margin: 0 auto 20px; border: 4px solid #e2e8f0; border-top-color: #4a5259; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <div style="color: #64748b;">Enviando paquetes...</div>
      </div>
    `,
    showConfirmButton: false,
    allowOutsideClick: false
  });
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/status/ping/${serviceId}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    const data = await response.json();
    
    const latency = data.latency || 0;
    const status = data.status || 'unknown';
    
    Swal.fire({
      title: `Ping a ${serviceName}`,
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 3.5rem; font-weight: 700; color: ${latency < 50 ? '#22c55e' : latency < 150 ? '#fbbf24' : '#ef4444'}; margin-bottom: 10px;">
            ${latency}ms
          </div>
          <div style="color: #64748b; margin-bottom: 25px;">Tiempo de respuesta</div>
          
          <div style="background: #f8fafc; border-radius: 12px; padding: 20px; text-align: left;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
              <div>
                <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Estado</div>
                <div style="font-weight: 600; color: ${status === 'ok' ? '#22c55e' : '#ef4444'};">${status === 'ok' ? '✓ Conectado' : '✗ Error'}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Servicio</div>
                <div style="font-weight: 600; color: #1e293b;">${data.service}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Paquetes enviados</div>
                <div style="font-weight: 600; color: #1e293b;">${data.packets?.sent || 4}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Paquetes recibidos</div>
                <div style="font-weight: 600; color: #1e293b;">${data.packets?.received || 4}</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Pérdida</div>
                <div style="font-weight: 600; color: ${data.packets?.lossPercent === 0 ? '#22c55e' : '#ef4444'};">${data.packets?.lossPercent || 0}%</div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Detalles</div>
                <div style="font-weight: 600; color: #1e293b; font-size: 0.85rem;">${data.details ? Object.values(data.details).join(', ') : 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>
      `,
      icon: latency < 100 ? 'success' : latency < 300 ? 'warning' : 'error',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#4a5259'
    });
  } catch (error) {
    Swal.fire({
      title: 'Error de conexión',
      text: `No se pudo hacer ping a ${serviceName}`,
      icon: 'error',
      confirmButtonColor: '#4a5259'
    });
  }
}

async function restartService(serviceId, serviceName) {
  const result = await Swal.fire({
    title: '¿Reiniciar servicio?',
    html: `
      <div style="text-align: left; padding: 10px;">
        <p style="color: #64748b; margin-bottom: 15px;">¿Estás seguro de que deseas reiniciar <strong>${serviceName}</strong>?</p>
        <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px; display: flex; gap: 10px; align-items: flex-start;">
          <i data-lucide="alert-triangle" style="width: 20px; height: 20px; color: #d97706; flex-shrink: 0;"></i>
          <span style="font-size: 0.85rem; color: #92400e;">Esto podría causar una breve interrupción en el servicio. Los usuarios activos podrían experimentar desconexiones temporales.</span>
        </div>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Sí, reiniciar',
    cancelButtonText: 'Cancelar',
    didOpen: () => lucide.createIcons()
  });
  
  if (result.isConfirmed) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/status/restart/${serviceId}`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      
      if (data.success && data.steps) {
        const steps = data.steps;
        
        // Ejecutar cada paso secuencialmente
        const runSteps = async () => {
          for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const progress = ((i + 1) / steps.length) * 100;
            
            Swal.fire({
              title: `Reiniciando ${serviceName}`,
              html: `
                <div style="text-align: center; padding: 20px;">
                  <div style="width: 100%; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; margin-bottom: 20px;">
                    <div style="width: ${progress}%; height: 100%; background: linear-gradient(90deg, #4a5259, #64748b); transition: width 0.3s;"></div>
                  </div>
                  <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
                    <div style="width: 20px; height: 20px; border: 2px solid #e2e8f0; border-top-color: #4a5259; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                    <span style="font-weight: 600; color: #1e293b;">${step.message}</span>
                  </div>
                  <div style="font-size: 0.8rem; color: #94a3b8;">Paso ${i + 1} de ${steps.length}</div>
                </div>
              `,
              showConfirmButton: false,
              allowOutsideClick: false
            });
            
            // Esperar el delay del paso
            await new Promise(resolve => setTimeout(resolve, step.delay));
          }
          
          // Mostrar éxito al final
          Swal.fire({
            title: '¡Servicio reiniciado!',
            html: `
              <div style="text-align: center;">
                <div style="width: 60px; height: 60px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                  <i data-lucide="check" style="width: 30px; height: 30px; color: #16a34a;"></i>
                </div>
                <p style="color: #64748b;">${serviceName} se ha reiniciado correctamente.</p>
              </div>
            `,
            icon: 'success',
            confirmButtonColor: '#4a5259',
            didOpen: () => lucide.createIcons()
          });
        };
        
        runSteps();
      }
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: `No se pudo reiniciar ${serviceName}`,
        icon: 'error',
        confirmButtonColor: '#4a5259'
      });
    }
  }
}

function formatStatusDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatStatusTime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Hace un momento';
  if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  
  return formatStatusDate(dateStr);
}

function refreshStatusData() {
  loadStatusData();
  Swal.fire({
    icon: 'success',
    title: 'Actualizado',
    timer: 1500,
    showConfirmButton: false
  });
}

function openNewIncidentModal() {
  document.getElementById('incidentTitle').value = '';
  document.getElementById('incidentSeverity').value = '';
  document.getElementById('incidentMessage').value = '';
  document.getElementById('showBanner').checked = true;
  document.getElementById('bannerPreview').style.display = 'none';
  
  document.querySelectorAll('input[name="affected_service"]').forEach(cb => cb.checked = false);
  
  document.getElementById('incidentModalTitle').textContent = 'Reportar Incidente';
  document.getElementById('incidentModal').classList.add('active');
  lucide.createIcons();
}

function closeIncidentModal() {
  document.getElementById('incidentModal').classList.remove('active');
}

function updateBannerPreview() {
  const severityEl = document.getElementById('incidentSeverity');
  const titleEl = document.getElementById('incidentTitle');
  const preview = document.getElementById('bannerPreview');
  const content = document.getElementById('bannerPreviewContent');
  const text = document.getElementById('bannerPreviewText');
  
  // Verificar que todos los elementos existan
  if (!severityEl || !preview || !content || !text) return;
  
  const severity = severityEl.value;
  const title = titleEl?.value || 'Título del incidente';
  
  if (severity) {
    preview.style.display = 'block';
    content.className = `banner-preview-content ${severity}`;
    text.textContent = title;
    
    const icon = content.querySelector('i');
    if (icon && STATUS_CONFIG?.icons?.[severity]) {
      icon.setAttribute('data-lucide', STATUS_CONFIG.icons[severity]);
      lucide.createIcons();
    }
  } else {
    preview.style.display = 'none';
  }
}

async function submitIncident() {
  const title = document.getElementById('incidentTitle').value.trim();
  const severity = document.getElementById('incidentSeverity').value;
  const message = document.getElementById('incidentMessage').value.trim();
  const showBanner = document.getElementById('showBanner').checked;
  
  const affectedServices = [];
  document.querySelectorAll('input[name="affected_service"]:checked').forEach(cb => {
    affectedServices.push(cb.value);
  });
  
  if (!title) {
    Swal.fire({ icon: 'warning', title: 'Título requerido', text: 'Ingresa un título para el incidente.', confirmButtonColor: '#4a5259' });
    return;
  }
  
  if (!severity) {
    Swal.fire({ icon: 'warning', title: 'Severidad requerida', text: 'Selecciona la severidad del incidente.', confirmButtonColor: '#4a5259' });
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/status/incident', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({
        title,
        severity,
        message,
        affected_services: affectedServices,
        show_banner: showBanner
      })
    });
    
    if (response.ok) {
      closeIncidentModal();
      await loadStatusData();
      Swal.fire({
        icon: 'success',
        title: 'Incidente publicado',
        text: showBanner ? 'El banner se mostrará en la página de inicio.' : 'El incidente ha sido registrado.',
        confirmButtonColor: '#4a5259'
      });
    } else {
      const error = await response.json();
      throw new Error(error.error);
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Error', text: error.message, confirmButtonColor: '#4a5259' });
  }
}

async function resolveIncident(id) {
  const result = await Swal.fire({
    icon: 'question',
    title: '¿Resolver incidente?',
    text: 'Esto marcará el incidente como resuelto y restaurará todos los servicios.',
    showCancelButton: true,
    confirmButtonText: 'Sí, resolver',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#16a34a'
  });
  
  if (!result.isConfirmed) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/status/incident/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify({ resolve: true })
    });
    
    if (response.ok) {
      await loadStatusData();
      Swal.fire({
        icon: 'success',
        title: 'Incidente resuelto',
        text: 'El sistema ha vuelto a la normalidad.',
        timer: 2000,
        showConfirmButton: false
      });
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo resolver el incidente.', confirmButtonColor: '#4a5259' });
  }
}

async function deleteIncident(id) {
  const result = await Swal.fire({
    icon: 'warning',
    title: '¿Eliminar incidente?',
    text: 'Esto eliminará el incidente sin agregarlo al historial.',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#dc2626'
  });
  
  if (!result.isConfirmed) return;
  
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/status/incident/${id}`, {
      method: 'DELETE',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    
    if (response.ok) {
      await loadStatusData();
      Swal.fire({
        icon: 'success',
        title: 'Incidente eliminado',
        timer: 1500,
        showConfirmButton: false
      });
    }
  } catch (error) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el incidente.', confirmButtonColor: '#4a5259' });
  }
}

function openUpdateModal(id) {
  Swal.fire({
    title: 'Agregar actualización',
    input: 'textarea',
    inputPlaceholder: 'Escribe una actualización sobre el incidente...',
    showCancelButton: true,
    confirmButtonText: 'Publicar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    inputValidator: (value) => {
      if (!value) return 'Escribe un mensaje';
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/status/incident/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: JSON.stringify({ update_message: result.value })
        });
        
        if (response.ok) {
          await loadStatusData();
          Swal.fire({
            icon: 'success',
            title: 'Actualización publicada',
            timer: 1500,
            showConfirmButton: false
          });
        }
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Error', confirmButtonColor: '#4a5259' });
      }
    }
  });
}


function generateTable(section, data) {
  switch (section) {
    case "cursos":
      return `
        <div class="cursos-header" style="display: flex; align-items: center; margin-bottom: 25px; gap: 20px; flex-wrap: wrap;">
          <div style="flex-shrink: 0;">
            <h2 style="color: #4a5259; margin: 0 0 5px 0;">Gestión de Cursos</h2>
            <p style="color: #666; margin: 0; font-size: 14px;">${data.length} curso${data.length !== 1 ? 's' : ''} disponible${data.length !== 1 ? 's' : ''}</p>
          </div>
          <div style="position: relative; flex: 1; max-width: 400px;">
            <i data-lucide="search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #999; width: 18px; height: 18px;"></i>
            <input type="text" id="cursosSearch" placeholder="Buscar por nombre, idioma o nivel..." style="width: 100%; padding: 12px 16px 12px 44px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; transition: all 0.2s;">
          </div>
          <button class="btn-primary" style="margin-left: auto;" onclick="openNuevoCursoModal()">
            <i data-lucide="plus"></i>
            Nuevo Curso
          </button>
        </div>
        <div class="cursos-grid" id="cursosGrid">
          ${data.map(c => {
            const cuposMax = c.cupo_maximo || 30;
            const inscritos = c.alumnos_inscritos || 0;
            const porcentaje = (inscritos / cuposMax) * 100;
            let barColor = '#22c55e';
            if (porcentaje >= 90) barColor = '#ef4444';
            else if (porcentaje >= 70) barColor = '#f59e0b';

            return `
            <div class="curso-card-new" data-id="${c.id_curso}" data-name="${c.nombre_curso}" style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.2s ease; position: relative; overflow: hidden; border: 1px solid #e5e7eb; cursor: pointer;" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'; this.style.transform='translateY(-2px)';" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.transform='translateY(0)';">
              
              <div style="position: absolute; top: 12px; right: 12px; background: rgba(74, 82, 89, 0.1); color: #4a5259; font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 12px;">${c.nivel || "Sin nivel"}</div>
              
              <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px;">
                <div style="background: rgba(74, 82, 89, 0.08); border-radius: 12px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <i data-lucide="book-open" style="width: 28px; height: 28px; color: #4a5259;"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                  <h3 style="margin: 0 0 4px 0; color: #1e1e1e; font-size: 16px; font-weight: 500; font-family: 'Inter', sans-serif; padding-right: 60px;">${c.nombre_curso}</h3>
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">${c.nombre_idioma || "Sin idioma"}</p>
                </div>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="user" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>${c.profesor || "Sin profesor asignado"}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="clock" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>${c.horario || "Horario por definir"}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="map-pin" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>${c.nombre_aula || "Sin aula asignada"}</span>
                </div>
              </div>
              
              <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <span style="color: #6b7280; font-size: 12px;">Capacidad</span>
                  <span style="color: #1e1e1e; font-size: 12px; font-weight: 500;">${inscritos} / ${cuposMax}</span>
                </div>
                <div style="height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
                  <div style="height: 100%; width: ${Math.min(porcentaje, 100)}%; background: ${barColor}; border-radius: 3px; transition: width 0.3s ease;"></div>
                </div>
              </div>
              
              <div style="height: 1px; background: #e5e7eb; margin: 16px 0;"></div>
              
              <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <button class="btn-icon-success" onclick="event.stopPropagation(); asignarProfesorACurso(${c.id_curso}, '${c.nombre_curso}')" title="Asignar Profesor">
                  <i data-lucide="user-check"></i>
                </button>
                <button class="btn-icon-primary" onclick="event.stopPropagation(); openCursoPanel(${c.id_curso})" title="Ver detalles">
                  <i data-lucide="eye"></i>
                </button>
                <button class="btn-icon-edit" onclick="event.stopPropagation(); editarCurso(${c.id_curso})" title="Editar">
                  <i data-lucide="edit-2"></i>
                </button>
                <button class="btn-icon-danger" onclick="event.stopPropagation(); eliminarCurso(${c.id_curso}, '${c.nombre_curso}')" title="Eliminar">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          `}).join('')}
        </div>`;
    case "alumnos":
      return `
        <div class="alumnos-header">
          <div style="flex-shrink: 0;">
            <h2 style="color: #4a5259; margin: 0 0 5px 0;">Gestión de Alumnos</h2>
            <p style="color: #666; margin: 0; font-size: 14px;">${data.length} alumno${data.length !== 1 ? 's' : ''} registrado${data.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="alumnos-search-filter">
            <div style="position: relative; flex: 1;">
              <i data-lucide="search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #999; width: 18px; height: 18px;"></i>
              <input type="text" id="alumnosSearch" placeholder="Buscar por nombre, legajo o email..." style="width: 100%;">
            </div>
            <button class="btn-secondary" onclick="descargarPDFAlumnos()" style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="download"></i>
              Descargar PDF
            </button>
            <button class="btn-primary" onclick="openNuevoAlumnoModal()">
              <i data-lucide="user-plus"></i>
              Nuevo Alumno
            </button>
          </div>
        </div>
        <div class="cursos-grid" id="alumnosGrid">
          ${data.map(a => {
            const estado = a.estado || 'activo';
            const cursos = a.cursos_inscritos || 0;
            const iniciales = `${a.nombre.charAt(0)}${a.apellido.charAt(0)}`.toUpperCase();
            const avatarUrl = a.avatar ? a.avatar : null;
            
            return `
            <div class="persona-card alumno-card" data-id="${a.id_alumno}" style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.2s ease; position: relative; overflow: hidden; border: 1px solid #e5e7eb; cursor: pointer;" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'; this.style.transform='translateY(-2px)';" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.transform='translateY(0)';">
              
              <div style="position: absolute; top: 12px; right: 12px; background: ${estado === 'activo' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${estado === 'activo' ? '#16a34a' : '#dc2626'}; font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 12px;">${estado.charAt(0).toUpperCase() + estado.slice(1)}</div>
              
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="background: ${avatarUrl ? 'transparent' : 'rgba(74, 82, 89, 0.08)'}; border-radius: 50%; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; ${avatarUrl ? 'border: 2px solid #e5e7eb;' : ''}">
                  ${avatarUrl 
                    ? `<img src="${avatarUrl}" alt="${a.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<span style="color: #4a5259; font-size: 18px; font-weight: 500; font-family: 'Inter', sans-serif;">${iniciales}</span>`
                  }
                </div>
                <div>
                  <h3 style="margin: 0 0 4px 0; color: #1e1e1e; font-size: 16px; font-weight: 500; font-family: 'Inter', sans-serif;">${a.nombre} ${a.apellido}</h3>
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Legajo: ${a.legajo}</p>
                </div>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="mail" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>${a.mail}</span>
                </div>
                ${a.dni ? `
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="credit-card" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>DNI: ${a.dni}</span>
                </div>` : ''}
                ${a.telefono ? `
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="phone" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>${a.telefono}</span>
                </div>` : ''}
              </div>
              
              <div style="height: 1px; background: #e5e7eb; margin: 16px 0;"></div>
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="book-open" style="width: 14px; height: 14px;"></i>
                  ${cursos} ${cursos === 1 ? 'curso' : 'cursos'}
                </span>
                <div style="display: flex; gap: 8px;">
                  <button class="btn-icon-docs" onclick="event.stopPropagation(); openDocumentosModal(${a.id_alumno}, '${a.nombre} ${a.apellido}')" title="Generar documentos">
                    <i data-lucide="file-text"></i>
                  </button>
                  <button class="btn-icon-primary" onclick="event.stopPropagation(); openAlumnoPanel(${a.id_alumno})" title="Ver detalles">
                    <i data-lucide="eye"></i>
                  </button>
                  <button class="btn-icon-edit" onclick="event.stopPropagation(); editarAlumno(${a.id_alumno})" title="Editar">
                    <i data-lucide="edit-2"></i>
                  </button>
                  <button class="btn-icon-danger" onclick="event.stopPropagation(); eliminarAlumno(${a.id_alumno}, '${a.nombre} ${a.apellido}')" title="Eliminar">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </div>
            </div>
          `}).join('')}
        </div>`;

    case "profesores":
      return `
        <div class="profesores-header">
          <div style="flex-shrink: 0;">
            <h2 style="color: #4a5259; margin: 0 0 5px 0;">Gestión de Profesores</h2>
            <p style="color: #666; margin: 0; font-size: 14px;">${data.length} profesor${data.length !== 1 ? 'es' : ''} registrado${data.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="profesores-search-filter">
            <div style="position: relative; flex: 1;">
              <i data-lucide="search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #999; width: 18px; height: 18px;"></i>
              <input type="text" id="profesoresSearch" placeholder="Buscar por nombre, especialidad o idioma..." style="width: 100%;">
            </div>
            <button class="btn-primary" onclick="openNuevoProfesorModal()">
              <i data-lucide="user-plus"></i>
              Nuevo Profesor
            </button>
          </div>
        </div>
        <div class="cursos-grid" id="profesoresGrid">
          ${data.map(p => {
            const estado = p.estado || 'activo';
            const cursos = p.total_cursos || 0;
            const iniciales = `${p.nombre.charAt(0)}${p.apellido.charAt(0)}`.toUpperCase();
            const idiomas = p.idiomas || 'Sin idiomas';
            const avatarUrl = p.avatar ? p.avatar : null;
            
            return `
            <div class="persona-card profesor-card" data-id="${p.id_profesor}" data-idioma="${idiomas}" style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.2s ease; position: relative; overflow: hidden; border: 1px solid #e5e7eb; cursor: pointer;" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'; this.style.transform='translateY(-2px)';" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.transform='translateY(0)';">
              
              <div style="position: absolute; top: 12px; right: 12px; background: ${estado === 'activo' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${estado === 'activo' ? '#16a34a' : '#dc2626'}; font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 12px;">${estado.charAt(0).toUpperCase() + estado.slice(1)}</div>
              
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="background: ${avatarUrl ? 'transparent' : 'rgba(74, 82, 89, 0.08)'}; border-radius: 50%; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; ${avatarUrl ? 'border: 2px solid #e5e7eb;' : ''}">
                  ${avatarUrl 
                    ? `<img src="${avatarUrl}" alt="${p.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<span style="color: #4a5259; font-size: 18px; font-weight: 500; font-family: 'Inter', sans-serif;">${iniciales}</span>`
                  }
                </div>
                <div>
                  <h3 style="margin: 0 0 4px 0; color: #1e1e1e; font-size: 16px; font-weight: 500; font-family: 'Inter', sans-serif;">${p.nombre} ${p.apellido}</h3>
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">${p.especialidad || 'Sin especialidad'}</p>
                </div>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="mail" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>${p.mail}</span>
                </div>
                ${p.dni ? `
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="credit-card" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>DNI: ${p.dni}</span>
                </div>` : ''}
                ${p.telefono ? `
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="phone" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>${p.telefono}</span>
                </div>` : ''}
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="languages" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>${idiomas}</span>
                </div>
              </div>
              
              <div style="height: 1px; background: #e5e7eb; margin: 16px 0;"></div>
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 6px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="book-open" style="width: 14px; height: 14px;"></i>
                  ${cursos} ${cursos === 1 ? 'curso' : 'cursos'}
                </span>
                <div style="display: flex; gap: 8px;">
                  <button class="btn-icon-primary" onclick="event.stopPropagation(); openProfesorPanel(${p.id_profesor})" title="Ver detalles">
                    <i data-lucide="eye"></i>
                  </button>
                  <button class="btn-icon-edit" onclick="event.stopPropagation(); editarProfesor(${p.id_profesor})" title="Editar">
                    <i data-lucide="edit-2"></i>
                  </button>
                  <button class="btn-icon-danger" onclick="event.stopPropagation(); eliminarProfesor(${p.id_profesor}, '${p.nombre} ${p.apellido}')" title="Eliminar">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </div>
            </div>
          `}).join('')}
        </div>`;

    case "administradores":
      return `
        <div class="profesores-header">
          <div style="flex-shrink: 0;">
            <h2 style="color: #4a5259; margin: 0 0 5px 0;">Gestión de Administradores</h2>
            <p style="color: #666; margin: 0; font-size: 14px;">${data.length} administrador${data.length !== 1 ? 'es' : ''} registrado${data.length !== 1 ? 's' : ''}</p>
          </div>
          <div class="profesores-search-filter">
            <div style="position: relative; flex: 1;">
              <i data-lucide="search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #999; width: 18px; height: 18px;"></i>
              <input type="text" id="administradoresSearch" placeholder="Buscar por nombre, email o DNI..." style="width: 100%;">
            </div>
            <button class="btn-primary" onclick="openNuevoAdministradorModal()">
              <i data-lucide="user-plus"></i>
              Nuevo Administrador
            </button>
          </div>
        </div>
        <div class="cursos-grid" id="administradoresGrid">
          ${data.map(admin => {
            const iniciales = `${admin.nombre.charAt(0)}${admin.apellido.charAt(0)}`.toUpperCase();
            const estado = admin.estado || 'activo';
            const avatarUrl = admin.avatar ? admin.avatar : null;
            
            return `
            <div class="persona-card admin-card" data-id="${admin.id_persona}" style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.2s ease; position: relative; overflow: hidden; border: 1px solid #e5e7eb; cursor: pointer;" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'; this.style.transform='translateY(-2px)';" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.transform='translateY(0)';">
              
              <div style="position: absolute; top: 12px; right: 12px; background: ${estado === 'activo' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${estado === 'activo' ? '#16a34a' : '#dc2626'}; font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 12px;">${estado === 'activo' ? 'Activo' : 'Sin acceso'}</div>
              
              <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
                <div style="background: ${avatarUrl ? 'transparent' : 'rgba(74, 82, 89, 0.08)'}; border-radius: 50%; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; ${avatarUrl ? 'border: 2px solid #e5e7eb;' : ''}">
                  ${avatarUrl 
                    ? `<img src="${avatarUrl}" alt="${admin.nombre}" style="width: 100%; height: 100%; object-fit: cover;">`
                    : `<span style="color: #4a5259; font-size: 18px; font-weight: 500; font-family: 'Inter', sans-serif;">${iniciales}</span>`
                  }
                </div>
                <div>
                  <h3 style="margin: 0 0 4px 0; color: #1e1e1e; font-size: 16px; font-weight: 500; font-family: 'Inter', sans-serif;">${admin.nombre} ${admin.apellido}</h3>
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">Administrador</p>
                </div>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="mail" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>${admin.mail}</span>
                </div>
                ${admin.telefono ? `
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="phone" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>${admin.telefono}</span>
                </div>` : ''}
                ${admin.dni ? `
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="credit-card" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>DNI: ${admin.dni}</span>
                </div>` : ''}
                <div style="display: flex; align-items: center; gap: 8px; color: #6b7280; font-size: 13px;">
                  <i data-lucide="user" style="width: 14px; height: 14px; color: #9ca3af;"></i>
                  <span>@${admin.username || 'Sin usuario'}</span>
                </div>
              </div>
              
              <div style="height: 1px; background: #e5e7eb; margin: 16px 0;"></div>
              
              <div style="display: flex; justify-content: flex-end; gap: 8px;">
                <button class="btn-icon-edit" onclick="event.stopPropagation(); editarAdministrador(${admin.id_persona})" title="Editar">
                  <i data-lucide="edit-2"></i>
                </button>
                <button class="btn-icon-warning" onclick="event.stopPropagation(); abrirModalCredencialesAdministrador(${admin.id_persona})" title="Editar Credenciales">
                  <i data-lucide="key"></i>
                </button>
                <button class="btn-icon-danger" onclick="event.stopPropagation(); eliminarAdministrador(${admin.id_persona}, '${admin.nombre} ${admin.apellido}')" title="Eliminar">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          `}).join('')}
        </div>`;

case "pagos":
  const pagosArray = data && data.pagos ? data.pagos : [];
  const pagosCount = pagosArray.length;
  return `
    <h2 style="color: #4a5259; margin: 0 0 5px 0;">Gestión de Pagos</h2>
    <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">${pagosCount} pago${pagosCount !== 1 ? 's' : ''} registrado${pagosCount !== 1 ? 's' : ''}</p>
    <div class="pagos-tabs" style="display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
      <button class="pagos-tab active" data-tab="activos" onclick="switchPagosTab('activos')" style="padding: 12px 24px; background: none; border: none; border-bottom: 3px solid #4a5259; color: #4a5259; font-weight: 600; cursor: pointer; transition: all 0.3s;">
        <i data-lucide="list"></i> Pagos Activos
      </button>
      <button class="pagos-tab" data-tab="archivo" onclick="switchPagosTab('archivo')" style="padding: 12px 24px; background: none; border: none; border-bottom: 3px solid transparent; color: #666; font-weight: 600; cursor: pointer; transition: all 0.3s;">
        <i data-lucide="archive"></i> Archivo
      </button>
      <button class="pagos-tab" data-tab="cuotas" onclick="switchPagosTab('cuotas')" style="padding: 12px 24px; background: none; border: none; border-bottom: 3px solid transparent; color: #666; font-weight: 600; cursor: pointer; transition: all 0.3s;">
        <i data-lucide="unlock"></i> Gestionar Cuotas
      </button>
    </div>

    <div class="pagos-metrics" id="pagosMetrics">
      <div class="metric-card">
        <div class="metric-card-header">
          <div class="metric-card-title">Total Recaudado (Mes)</div>
          <div class="metric-card-icon success">
            <i data-lucide="dollar-sign"></i>
          </div>
        </div>
        <div class="metric-card-value">$<span id="metricTotalMes">0</span></div>
        <div class="metric-card-subtitle">Noviembre 2025</div>
      </div>

      <div class="metric-card">
        <div class="metric-card-header">
          <div class="metric-card-title">Cuotas Cobradas</div>
          <div class="metric-card-icon info">
            <i data-lucide="check-circle"></i>
          </div>
        </div>
        <div class="metric-card-value" id="metricCobradas">0</div>
        <div class="metric-card-subtitle"><span id="metricPendientes">0</span> pendientes</div>
      </div>

      <div class="metric-card">
        <div class="metric-card-header">
          <div class="metric-card-title">Promedio por Pago</div>
          <div class="metric-card-icon warning">
            <i data-lucide="trending-up"></i>
          </div>
        </div>
        <div class="metric-card-value">$<span id="metricPromedio">0</span></div>
        <div class="metric-card-subtitle">Histórico</div>
      </div>
    </div>

    <div class="pagos-filters" id="pagosFilters">
      <div class="filter-group">
        <label>Buscar alumno</label>
        <input type="text" id="pagoSearchAlumno" placeholder="Nombre, legajo o email...">
      </div>
      <div class="filter-group">
        <label>Medio de Pago</label>
        <select id="pagoFilterMedio">
          <option value="">Todos</option>
        </select>
      </div>
      <div>
        <button class="btn-add-pago" onclick="openRegistrarPagoModal()">
          <i data-lucide="plus"></i>
          Registrar Pago
        </button>
      </div>
    </div>

    <div class="pagos-table-container" id="pagosTableContainer">
      <table class="pagos-table">
        <thead>
          <tr>
            <th>Alumno</th>
            <th>Concepto</th>
            <th>Periodo</th>
            <th>Monto</th>
            <th>Fecha Pago</th>
            <th>Medio</th>
            <th>Estado</th>
            <th style="width: 80px; text-align: center;">Acciones</th>
          </tr>
        </thead>
        <tbody id="pagosTableBody">
          <tr><td colspan="8" style="text-align: center; padding: 40px; color: #999;">Cargando pagos...</td></tr>
        </tbody>
      </table>
    </div>

    <div class="cuotas-gestion-container" id="cuotasGestionContainer" style="display: none;">
      <!-- Contenedor para la gestión de cuotas -->
    </div>
  `;
  
    case "inscripciones":
      return `
        <div class="inscripciones-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
          <div></div>
          <button class="btn-primary" onclick="openNuevaInscripcionModal()">
            <i data-lucide="user-plus"></i>
            Nueva Inscripción
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Alumno</th>
              <th>Curso</th>
              <th>Fecha Inscripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${data.length > 0 ? data.map(i => `
              <tr>
                <td>${i.id_inscripcion}</td>
                <td>${i.alumno}</td>
                <td>${i.nombre_curso}</td>
                <td>${new Date(i.fecha_inscripcion).toLocaleDateString()}</td>
                <td><span class="badge ${i.estado === 'activo' ? 'success' : 'inactive'}">${i.estado}</span></td>
                <td>
                  <button class="btn-icon-danger" onclick="eliminarInscripcion(${i.id_inscripcion}, '${i.alumno}', '${i.nombre_curso}')" title="Eliminar">
                    <i data-lucide="trash-2"></i>
                  </button>
                </td>
              </tr>
            `).join('') : '<tr><td colspan="6" style="text-align: center; padding: 40px;">No hay inscripciones registradas</td></tr>'}
          </tbody>
        </table>
      `;
    
    case "aulas":
      return `
        <div class="aulas-header" style="display: flex; align-items: center; margin-bottom: 25px; gap: 20px; flex-wrap: wrap;">
          <div style="flex-shrink: 0;">
            <h2 style="color: #4a5259; margin: 0 0 5px 0;">Gestión de Aulas</h2>
            <p style="color: #666; margin: 0; font-size: 14px;">${data.length} aula${data.length !== 1 ? 's' : ''} disponible${data.length !== 1 ? 's' : ''}</p>
          </div>
          <div style="position: relative; flex: 1; max-width: 350px;">
            <i data-lucide="search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #999; width: 18px; height: 18px;"></i>
            <input type="text" id="aulasSearch" placeholder="Buscar por nombre o capacidad..." style="width: 100%; padding: 12px 16px 12px 44px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; transition: all 0.2s;">
          </div>
          <button class="btn-primary" style="margin-left: auto;" onclick="openNuevaAulaModal()">
            <i data-lucide="plus"></i>
            Nueva Aula
          </button>
        </div>
        <div class="aulas-grid" id="aulasGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
          ${data.length > 0 ? data.map(a => {
            const capacidadColor = '#4a5259';
            const capacidadIcon = a.capacidad >= 40 ? 'users' : a.capacidad >= 25 ? 'user-check' : 'user';
            
            return `
            <div class="aula-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); transition: all 0.3s ease; border-left: 4px solid ${capacidadColor};" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.15)'; this.style.transform='translateY(-2px)';" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'; this.style.transform='translateY(0)';">
              <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                <div style="width: 50px; height: 50px; border-radius: 10px; background: linear-gradient(135deg, ${capacidadColor}20, ${capacidadColor}40); display: flex; align-items: center; justify-content: center;">
                  <i data-lucide="door-open" style="width: 24px; height: 24px; color: ${capacidadColor};"></i>
                </div>
                <div style="flex: 1;">
                  <h3 style="margin: 0 0 5px 0; color: #4a5259; font-size: 18px;">${a.nombre_aula}</h3>
                  <p style="margin: 0; color: #666; font-size: 13px;">Aula ${a.id_aula}</p>
                </div>
              </div>
              
              <div style="background: #f8f9fa; border-radius: 8px; padding: 12px; margin-bottom: 15px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div style="width: 35px; height: 35px; border-radius: 8px; background: ${capacidadColor}20; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="${capacidadIcon}" style="width: 18px; height: 18px; color: ${capacidadColor};"></i>
                  </div>
                  <div>
                    <div style="font-size: 24px; font-weight: 700; color: ${capacidadColor};">${a.capacidad}</div>
                    <div style="font-size: 12px; color: #666;">Capacidad máxima</div>
                  </div>
                </div>
              </div>
              
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="btn-icon-edit" onclick="editarAula(${a.id_aula}, '${a.nombre_aula}', ${a.capacidad})" title="Editar">
                  <i data-lucide="edit-2"></i>
                </button>
                <button class="btn-icon-danger" onclick="eliminarAula(${a.id_aula}, '${a.nombre_aula}')" title="Eliminar">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          `}).join('') : '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><i data-lucide="inbox" style="width: 48px; height: 48px; color: #ccc; margin-bottom: 15px;"></i><p style="color: #999; font-size: 16px;">No hay aulas registradas</p><p style="color: #ccc; font-size: 14px;">Comienza agregando una nueva aula</p></div>'}
        </div>
      `;
    
    case "idiomas":
      const idiomasStats = {
        total: data.length,
        populares: ['Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués']
      };
      
      return `
        <div class="idiomas-header" style="display: flex; align-items: center; margin-bottom: 25px; gap: 20px; flex-wrap: wrap;">
          <div style="flex-shrink: 0;">
            <h2 style="color: #4a5259; margin: 0 0 5px 0;">Gestión de Idiomas</h2>
            <p style="color: #666; margin: 0; font-size: 14px;">${data.length} idioma${data.length !== 1 ? 's' : ''} disponible${data.length !== 1 ? 's' : ''}</p>
          </div>
          <div style="position: relative; flex: 1; max-width: 300px;">
            <i data-lucide="search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #999; width: 18px; height: 18px;"></i>
            <input type="text" id="idiomasSearch" placeholder="Buscar idioma..." style="width: 100%; padding: 12px 16px 12px 44px; border: 1px solid #e0e0e0; border-radius: 10px; font-size: 14px; transition: all 0.2s;">
          </div>
          <button class="btn-primary" style="margin-left: auto;" onclick="openNuevoIdiomaModal()">
            <i data-lucide="plus"></i>
            Nuevo Idioma
          </button>
        </div>
        <div class="idiomas-grid" id="idiomasGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
          ${data.length > 0 ? data.map((idioma, index) => {
            const isPopular = idiomasStats.populares.includes(idioma.nombre_idioma);
            
            return `
            <div class="idioma-card" style="background: white; border-radius: 16px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s ease; position: relative; overflow: hidden; border: 1px solid #e5e7eb;" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.12)'; this.style.transform='translateY(-2px)';" onmouseleave="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.08)'; this.style.transform='translateY(0)';">
              ${isPopular ? '<div style="position: absolute; top: 12px; right: 12px; background: rgba(74, 82, 89, 0.1); color: #4a5259; font-size: 11px; font-weight: 500; padding: 4px 10px; border-radius: 12px; display: flex; align-items: center; gap: 4px;"><i data-lucide="star" style="width: 12px; height: 12px;"></i> Popular</div>' : ''}
              
              <div style="background: rgba(74, 82, 89, 0.08); border-radius: 12px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <i data-lucide="languages" style="width: 28px; height: 28px; color: #4a5259;"></i>
              </div>
              
              <h3 style="margin: 0 0 6px 0; color: #1e1e1e; font-size: 18px; font-weight: 500; font-family: 'Inter', sans-serif;">${idioma.nombre_idioma}</h3>
              <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 13px;">ID: ${idioma.id_idioma}</p>
              
              <div style="height: 1px; background: #e5e7eb; margin: 16px 0;"></div>
              
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button class="btn-icon-edit" onclick="editarIdioma(${idioma.id_idioma}, '${idioma.nombre_idioma}')" title="Editar">
                  <i data-lucide="edit-2"></i>
                </button>
                <button class="btn-icon-danger" onclick="eliminarIdioma(${idioma.id_idioma}, '${idioma.nombre_idioma}')" title="Eliminar">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </div>
          `}).join('') : '<div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;"><div style="background: rgba(74, 82, 89, 0.08); border-radius: 12px; width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;"><i data-lucide="languages" style="width: 28px; height: 28px; color: #6b7280;"></i></div><p style="color: #6b7280; font-size: 16px; margin: 0 0 4px 0;">No hay idiomas registrados</p><p style="color: #9ca3af; font-size: 14px; margin: 0;">Comienza agregando un nuevo idioma</p></div>'}
        </div>
      `;
      
    default:
      return "<p>Sección no disponible.</p>";
  }
}

async function generateDashboardHome() {
  try {
    const [statsRes, registrosRes, pagosRes] = await Promise.all([
      fetch(`${API_URL}/stats/general`),
      fetch(`${API_URL}/stats/ultimos-registros`),
      fetch(`${API_URL}/stats/ultimos-pagos`)
    ]);

    const stats = await statsRes.json();
    const registros = await registrosRes.json();
    const pagos = await pagosRes.json();

    return `
      <h2 style="margin-bottom: 30px;">Dashboard Administrativo</h2>
      
      <!-- Cards de Estadísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon blue">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div class="stat-info">
              <h3>Total Alumnos</h3>
              <p class="stat-number">${stats.totalAlumnos}</p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon purple">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
            </div>
            <div class="stat-info">
              <h3>Total Profesores</h3>
              <p class="stat-number">${stats.totalProfesores}</p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon green">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            </div>
            <div class="stat-info">
              <h3>Total Cursos</h3>
              <p class="stat-number">${stats.totalCursos}</p>
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-card-header">
            <div class="stat-icon orange">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="stat-info">
              <h3>Ingresos del Mes</h3>
              <p class="stat-number">$${stats.ingresosMes.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tablas de resumen -->
      <div class="dashboard-tables">
        <!-- Últimos Registros -->
        <div class="dashboard-table-card">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
            Últimos Registros
          </h3>
          ${registros.length > 0 ? `
            <table class="mini-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                ${registros.map(r => `
                  <tr>
                    <td>${r.nombre} ${r.apellido}</td>
                    <td><span class="badge-tipo ${r.tipo.toLowerCase()}">${r.tipo}</span></td>
                    <td>${new Date(r.fecha).toLocaleDateString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<div class="empty-state">No hay registros recientes</div>'}
        </div>

        <!-- Últimos Pagos -->
        <div class="dashboard-table-card">
          <h3>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            Últimos Pagos
          </h3>
          ${pagos.length > 0 ? `
            <table class="mini-table">
              <thead>
                <tr>
                  <th>Alumno</th>
                  <th>Monto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${pagos.map(p => `
                  <tr>
                    <td>${p.alumno}</td>
                    <td>$${parseFloat(p.monto).toLocaleString()}</td>
                    <td><span class="badge ${p.estado === 'pagado' ? 'success' : 'warning'}">${p.estado}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<div class="empty-state">No hay pagos recientes</div>'}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error al cargar dashboard:', error);
    return '<p>Error al cargar el dashboard</p>';
  }
}

function ensureInscribirModal() {
  if (document.getElementById('modalInscribir')) return;

  const modalHtml = `
    <div id="modalInscribir" class="modal">
      <div class="modal-content" style="max-width: 900px; max-height: 90vh;">
        <div class="modal-header">
          <h3 id="modalInscribirTitle">Gestión de Alumnos</h3>
          <button type="button" class="close-modal" aria-label="Cerrar">&times;</button>
        </div>
        
        <div class="tabs-container">
          <button class="tab-btn active" data-tab="inscritos">
            <i data-lucide="users"></i>
            Alumnos Inscritos
            <span class="tab-badge" id="badgeInscritos">0</span>
          </button>
          <button class="tab-btn" data-tab="inscribir">
            <i data-lucide="user-plus"></i>
            Inscribir Nuevos
            <span class="tab-badge" id="badgeDisponibles">0</span>
          </button>
        </div>
        
        <div class="tab-content active" id="tabInscritos">
          <div id="alumnosInscritosList"></div>
        </div>
        
        <div class="tab-content" id="tabInscribir">
          <div class="search-box-wrapper">
            <i data-lucide="search" class="search-icon"></i>
            <input type="text" id="searchAlumnos" placeholder="Buscar por nombre, apellido o email..." class="search-input-with-icon">
          </div>
          <div id="alumnosDisponiblesList"></div>
        </div>
        
        <div class="modal-footer-actions" id="footerInscribir" style="display: none;">
          <span class="selected-count" id="selectedCount">0 alumnos seleccionados</span>
          <button type="button" id="btnConfirmInscribir" class="btn-primary">
            <i data-lucide="check"></i> Inscribir Seleccionados
          </button>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('modalInscribir');

  modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => {
    modal.classList.remove('active');
    recargarSeccionActiva();
  }));
  modal.addEventListener('click', e => { 
    if (e.target === modal) {
      modal.classList.remove('active');
      recargarSeccionActiva();
    }
  });

  modal.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      
      modal.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      modal.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`tab${tabId.charAt(0).toUpperCase() + tabId.slice(1)}`).classList.add('active');
      
      document.getElementById('footerInscribir').style.display = tabId === 'inscribir' ? 'flex' : 'none';
      
      lucide.createIcons();
    });
  });
}

async function openInscribirModal(idCurso, nombre) {
  ensureInscribirModal();
  const modal = document.getElementById('modalInscribir');
  document.getElementById('modalInscribirTitle').textContent = `Gestión de Alumnos - ${nombre}`;
  modal.dataset.idCurso = idCurso;
  modal.classList.add('active');

  await Promise.all([
    cargarAlumnosInscritos(idCurso),
    cargarAlumnosDisponibles(idCurso)
  ]);

  lucide.createIcons();
}

async function cargarAlumnosInscritos(idCurso) {
  const container = document.getElementById('alumnosInscritosList');
  container.innerHTML = '<p style="text-align:center;padding:20px;">Cargando...</p>';

  try {
    const res = await fetch(`${API_URL}/inscripciones/curso/${idCurso}`);
    const inscritos = await res.json();

    document.getElementById('badgeInscritos').textContent = inscritos.length;

    if (inscritos.length === 0) {
      container.innerHTML = '<div class="empty-state"><i data-lucide="users"></i><p>No hay alumnos inscritos en este curso</p></div>';
      lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="alumnos-grid">
        ${inscritos.map(a => {
          const iniciales = `${(a.nombre || 'A')[0]}${(a.apellido || 'A')[0]}`.toUpperCase();
          return `
            <div class="alumno-card">
              <div class="alumno-card-header">
                <div class="alumno-card-avatar">${iniciales}</div>
                <div class="alumno-card-info">
                  <h4>${a.nombre} ${a.apellido}</h4>
                </div>
              </div>
              <div class="alumno-card-email">
                <i data-lucide="mail"></i>
                ${a.mail || 'Sin email'}
              </div>
              <div class="alumno-card-actions">
                <button class="btn-small btn-baja" onclick="darDeBajaAlumno(${idCurso}, ${a.id_alumno}, '${a.nombre} ${a.apellido}')">
                  <i data-lucide="user-minus"></i> Dar de Baja
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    lucide.createIcons();
  } catch (error) {
    console.error('Error al cargar inscritos:', error);
    container.innerHTML = '<p style="color:red;text-align:center;">Error al cargar alumnos inscritos</p>';
  }
}

async function cargarAlumnosDisponibles(idCurso) {
  const container = document.getElementById('alumnosDisponiblesList');
  container.innerHTML = '<p style="text-align:center;padding:20px;">Cargando...</p>';

  try {
    const [resAlumnos, resInscritos] = await Promise.all([
      fetch(`${API_URL}/alumnos`),
      fetch(`${API_URL}/inscripciones/curso/${idCurso}`)
    ]);

    const todosAlumnos = await resAlumnos.json();
    const inscritos = await resInscritos.json();

    const inscritosIds = inscritos.map(i => i.id_alumno);
    const disponibles = todosAlumnos.filter(a => !inscritosIds.includes(a.id_alumno));

    document.getElementById('badgeDisponibles').textContent = disponibles.length;

    if (disponibles.length === 0) {
      container.innerHTML = '<div class="empty-state"><i data-lucide="user-check"></i><p>Todos los alumnos ya están inscritos</p></div>';
      lucide.createIcons();
      return;
    }

    container.innerHTML = `
      <div class="alumnos-grid" id="alumnosGridDisponibles">
        ${disponibles.map(a => {
          const iniciales = `${(a.nombre || 'A')[0]}${(a.apellido || 'A')[0]}`.toUpperCase();
          return `
            <div class="alumno-card" data-alumno-id="${a.id_alumno}" data-search="${(a.nombre + ' ' + a.apellido + ' ' + (a.mail || '')).toLowerCase()}" onclick="toggleSelectAlumno(this)">
              <input type="checkbox" class="checkbox-card" value="${a.id_alumno}" onclick="event.stopPropagation(); toggleSelectAlumno(this.parentElement)">
              <div class="alumno-card-header">
                <div class="alumno-card-avatar">${iniciales}</div>
                <div class="alumno-card-info">
                  <h4>${a.nombre} ${a.apellido}</h4>
                  <span class="legajo">${a.legajo || 'Sin legajo'}</span>
                </div>
              </div>
              <div class="alumno-card-email">
                <i data-lucide="mail"></i>
                ${a.mail || 'Sin email'}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    lucide.createIcons();

    document.getElementById('searchAlumnos').oninput = (e) => {
      const search = e.target.value.toLowerCase();
      document.querySelectorAll('#alumnosGridDisponibles .alumno-card').forEach(card => {
        const searchText = card.dataset.search;
        card.style.display = searchText.includes(search) ? 'block' : 'none';
      });
    };

    document.getElementById('btnConfirmInscribir').onclick = async () => {
      const seleccionados = Array.from(document.querySelectorAll('#alumnosGridDisponibles .alumno-card.selected'))
        .map(card => card.dataset.alumnoId);

      if (seleccionados.length === 0) {
        showToast('Selecciona al menos un alumno', 'error');
        return;
      }

      try {
        const resp = await fetch(`${API_URL}/inscripciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_curso: idCurso, alumnos: seleccionados })
        });

        const data = await resp.json();

        if (resp.ok) {
          showToast(`${seleccionados.length} alumno(s) inscrito(s) correctamente`, 'success');
          await Promise.all([
            cargarAlumnosInscritos(idCurso),
            cargarAlumnosDisponibles(idCurso)
          ]);
          updateSelectedCount();
        } else {
          showToast(data.message || 'Error al inscribir', 'error');
        }
      } catch (error) {
        console.error('Error al inscribir:', error);
        showToast('Error al inscribir alumnos', 'error');
      }
    };

  } catch (error) {
    console.error('Error al cargar disponibles:', error);
    container.innerHTML = '<p style="color:red;text-align:center;">Error al cargar alumnos disponibles</p>';
  }
}

function toggleSelectAlumno(card) {
  card.classList.toggle('selected');
  const checkbox = card.querySelector('.checkbox-card');
  if (checkbox) checkbox.checked = card.classList.contains('selected');
  updateSelectedCount();
}

function updateSelectedCount() {
  const count = document.querySelectorAll('#alumnosGridDisponibles .alumno-card.selected').length;
  document.getElementById('selectedCount').textContent = `${count} alumno(s) seleccionado(s)`;
}

async function darDeBajaAlumno(idCurso, idAlumno, nombreAlumno) {
  if (!confirm(`¿Estás seguro de dar de baja a ${nombreAlumno}?`)) return;

  try {
    const resp = await fetch(`${API_URL}/inscripciones/${idCurso}/${idAlumno}`, {
      method: 'DELETE'
    });

    const data = await resp.json();

    if (resp.ok && data.success) {
      showToast(`${nombreAlumno} dado de baja correctamente`, 'success');
      const modal = document.getElementById('modalInscribir');
      const cursoId = modal.dataset.idCurso;
      await Promise.all([
        cargarAlumnosInscritos(cursoId),
        cargarAlumnosDisponibles(cursoId)
      ]);
    } else {
      showToast(data.message || 'Error al dar de baja', 'error');
    }
  } catch (error) {
    console.error('Error al dar de baja:', error);
    showToast('Error al dar de baja al alumno', 'error');
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function ensureCursoPanel() {
  if (document.getElementById('cursoPanelOverlay')) return;

  const panelHtml = `
    <div id="cursoPanelOverlay" class="curso-panel-overlay"></div>
    <div id="cursoPanel" class="curso-panel">
      <div class="curso-panel-header">
        <h2 id="cursoPanelTitle">Detalle del Curso</h2>
        <button class="close-panel" aria-label="Cerrar">×</button>
      </div>
      
      <div class="curso-panel-content">
        <div class="panel-section">
          <h3><i data-lucide="info"></i> Información del Curso</h3>
          <div class="curso-stats-grid" id="cursoStats"></div>
        </div>
        
        <div class="panel-section">
          <h3><i data-lucide="users"></i> Alumnos Inscritos</h3>
          <div id="alumnosInscritos" class="alumnos-inscritos-list"></div>
        </div>
      </div>
      
      <div class="panel-actions">
        <button class="panel-btn primary" id="btnInscribirPanel">
          <i data-lucide="user-plus"></i> Inscribir Alumnos
        </button>
        <button class="panel-btn secondary" id="btnEditarCurso">
          <i data-lucide="edit"></i> Editar
        </button>
        <button class="panel-btn danger" id="btnEliminarCurso">
          <i data-lucide="trash-2"></i> Eliminar
        </button>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', panelHtml);

  const panel = document.getElementById('cursoPanel');
  const overlay = document.getElementById('cursoPanelOverlay');

  const closePanel = () => {
    panel.classList.remove('active');
    overlay.classList.remove('active');
  };

  const closeBtn = panel.querySelector('.close-panel');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }
  overlay.addEventListener('click', closePanel);
}

async function openCursoPanel(idCurso) {
  ensureCursoPanel();
  
  const panel = document.getElementById('cursoPanel');
  const overlay = document.getElementById('cursoPanelOverlay');
  
  panel.classList.add('active');
  overlay.classList.add('active');

  try {
    const [resCurso, resInscritos] = await Promise.all([
      fetch(`${API_URL}/cursos/${idCurso}`),
      fetch(`${API_URL}/inscripciones/curso/${idCurso}`)
    ]);

    const curso = await resCurso.json();
    const inscritos = await resInscritos.json();

    document.getElementById('cursoPanelTitle').textContent = curso.nombre_curso || 'Detalle del Curso';

    const cuposMax = curso.cupo_maximo || 30;
    const cuposDisponibles = cuposMax - inscritos.length;

    document.getElementById('cursoStats').innerHTML = `
      <div class="stat-card info">
        <div class="stat-label">Idioma</div>
        <div class="stat-value" style="font-size: 20px;">${curso.nombre_idioma || 'N/A'}</div>
      </div>
      <div class="stat-card success">
        <div class="stat-label">Nivel</div>
        <div class="stat-value" style="font-size: 20px;">${curso.nivel || 'N/A'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Profesor</div>
        <div class="stat-value" style="font-size: 16px;">${curso.profesor || 'Sin asignar'}</div>
      </div>
      <div class="stat-card info">
        <div class="stat-label">Horario</div>
        <div class="stat-value" style="font-size: 16px;">${curso.horario || 'Por definir'}</div>
      </div>
      <div class="stat-card ${cuposDisponibles <= 5 ? 'warning' : 'success'}">
        <div class="stat-label">Aula</div>
        <div class="stat-value" style="font-size: 18px;">${curso.nombre_aula || 'Sin asignar'}</div>
      </div>
      <div class="stat-card info">
        <div class="stat-label">Cupos</div>
        <div class="stat-value">${inscritos.length} / ${cuposMax}</div>
      </div>
    `;

    if (inscritos.length === 0) {
      document.getElementById('alumnosInscritos').innerHTML = `
        <div class="empty-state">
          <i data-lucide="users"></i>
          <p>No hay alumnos inscritos en este curso</p>
        </div>`;
    } else {
      document.getElementById('alumnosInscritos').innerHTML = inscritos.map(a => {
        const iniciales = `${(a.nombre || 'A')[0]}${(a.apellido || 'A')[0]}`.toUpperCase();
        return `
          <div class="alumno-item">
            <div class="alumno-avatar">${iniciales}</div>
            <div class="alumno-info">
              <div class="alumno-nombre">${a.nombre} ${a.apellido}</div>
              <div class="alumno-email">${a.mail || 'Sin email'}</div>
            </div>
          </div>`;
      }).join('');
    }

    lucide.createIcons();

    document.getElementById('btnInscribirPanel').onclick = () => {
      panel.classList.remove('active');
      overlay.classList.remove('active');
      openInscribirModal(idCurso, curso.nombre_curso);
    };

    document.getElementById('btnEditarCurso').onclick = () => {
      panel.classList.remove('active');
      overlay.classList.remove('active');
      openEditarCursoModal(curso);
    };

    document.getElementById('btnEliminarCurso').onclick = () => {
      if (confirm(`¿Estás seguro de eliminar el curso "${curso.nombre_curso}"?`)) {
        alert('Funcionalidad de eliminar curso próximamente');
      }
    };

  } catch (err) {
    console.error('Error al cargar detalles del curso:', err);
    document.getElementById('cursoStats').innerHTML = '<p>Error al cargar estadísticas</p>';
    document.getElementById('alumnosInscritos').innerHTML = '<p>Error al cargar alumnos</p>';
  }
}

function ensureEditarCursoModal() {
  if (document.getElementById('modalEditarCurso')) return;

  const modalHtml = `
    <div id="modalEditarCurso" class="modal">
      <div class="modal-content" style="max-width: 600px;">
        <div class="modal-header">
          <h3>Editar Curso</h3>
          <button type="button" class="close-modal" aria-label="Cerrar">&times;</button>
        </div>
        <form id="formEditarCurso" style="padding: 24px;">
          <div style="display: grid; grid-template-columns: 1fr; gap: 16px;">
            <div>
              <label for="editNombreCurso">Nombre del Curso:</label>
              <input type="text" id="editNombreCurso" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label for="editIdioma">Idioma:</label>
                <select id="editIdioma" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                  <option value="">Seleccione...</option>
                </select>
              </div>
              
              <div>
                <label for="editNivel">Nivel:</label>
                <select id="editNivel" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                  <option value="">Seleccione...</option>
                </select>
              </div>
            </div>
            
            <div>
              <label for="editProfesor">Profesor:</label>
              <select id="editProfesor" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option value="">Seleccione...</option>
              </select>
            </div>
            
            <div>
              <label for="editHorario">Horario:</label>
              <input type="text" id="editHorario" placeholder="Ej: Lunes y Miércoles 18:00-20:00" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label for="editAula">Aula:</label>
                <select id="editAula" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                  <option value="">Sin aula</option>
                </select>
              </div>
              
              <div>
                <label for="editCupo">Cupo Máximo:</label>
                <input type="number" id="editCupo" min="1" max="100" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
            </div>
          </div>
          
          <div class="form-actions" style="margin-top: 24px;">
            <button type="button" class="close-modal">Cancelar</button>
            <button type="submit" class="btn-primary">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('modalEditarCurso');
  modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => modal.classList.remove('active')));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });
}

async function openEditarCursoModal(curso) {
  ensureEditarCursoModal();
  const modal = document.getElementById('modalEditarCurso');

  try {
    const resCursoCompleto = await fetch(`${API_URL}/cursos/${curso.id_curso}`);
    const cursoCompleto = await resCursoCompleto.json();

    const [resIdiomas, resProfesores] = await Promise.all([
      fetch(`${API_URL}/idiomas`),
      fetch(`${API_URL}/profesores`)
    ]);

    const idiomas = await resIdiomas.json();
    const profesores = await resProfesores.json();

    document.getElementById('editIdioma').innerHTML = `
      <option value="">Seleccione...</option>
      ${idiomas.map(i => `<option value="${i.id_idioma}" ${i.id_idioma === cursoCompleto.id_idioma ? 'selected' : ''}>${i.nombre_idioma}</option>`).join('')}
    `;

    document.getElementById('editNivel').innerHTML = `
      <option value="">Seleccione...</option>
      <option value="1" ${cursoCompleto.id_nivel === 1 ? 'selected' : ''}>A1</option>
      <option value="2" ${cursoCompleto.id_nivel === 2 ? 'selected' : ''}>A2</option>
      <option value="3" ${cursoCompleto.id_nivel === 3 ? 'selected' : ''}>B1</option>
      <option value="4" ${cursoCompleto.id_nivel === 4 ? 'selected' : ''}>B2</option>
      <option value="5" ${cursoCompleto.id_nivel === 5 ? 'selected' : ''}>C1</option>
      <option value="6" ${cursoCompleto.id_nivel === 6 ? 'selected' : ''}>C2</option>
    `;

    document.getElementById('editProfesor').innerHTML = `
      <option value="">Seleccione...</option>
      ${profesores.map(p => `<option value="${p.id_profesor}" ${p.id_profesor === cursoCompleto.id_profesor ? 'selected' : ''}>${p.nombre_completo}</option>`).join('')}
    `;

    document.getElementById('editAula').innerHTML = `
      <option value="">Sin aula</option>
      <option value="1" ${cursoCompleto.id_aula === 1 ? 'selected' : ''}>Aula 101</option>
      <option value="2" ${cursoCompleto.id_aula === 2 ? 'selected' : ''}>Aula 102</option>
    `;

    document.getElementById('editNombreCurso').value = cursoCompleto.nombre_curso || '';
    document.getElementById('editHorario').value = cursoCompleto.horario || '';
    document.getElementById('editCupo').value = cursoCompleto.cupo_maximo || 30;

    modal.classList.add('active');

    document.getElementById('formEditarCurso').onsubmit = async (e) => {
      e.preventDefault();

      const datosActualizados = {
        nombre_curso: document.getElementById('editNombreCurso').value,
        horario: document.getElementById('editHorario').value,
        cupo_maximo: parseInt(document.getElementById('editCupo').value),
        id_aula: document.getElementById('editAula').value || null,
        id_idioma: parseInt(document.getElementById('editIdioma').value),
        id_nivel: parseInt(document.getElementById('editNivel').value),
        id_profesor: parseInt(document.getElementById('editProfesor').value)
      };

      try {
        const resp = await fetch(`${API_URL}/cursos/${curso.id_curso}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datosActualizados)
        });

        const data = await resp.json();

        if (resp.ok && data.success) {
          alert('Curso actualizado correctamente');
          modal.classList.remove('active');
          document.getElementById('btnCursos').click();
        } else {
          alert(data.message || 'Error al actualizar el curso');
        }
      } catch (error) {
        console.error('Error al actualizar curso:', error);
        alert('Error al actualizar el curso');
      }
    };

  } catch (error) {
    console.error('Error al cargar datos para editar:', error);
    alert('Error al cargar los datos del curso');
  }
}


async function initAdminDashboard() {
  console.log(" Dashboard ADMIN cargado");
}


async function initProfesorDashboard() {
  console.log("‍ Dashboard PROFESOR cargado");

  const loader = document.getElementById("loader");
  const mainContent = document.getElementById("mainContent");
  const botones = document.querySelectorAll(".sidebar-menu button");

  const nombreProfesor = localStorage.getItem("nombre") || "Profesor";
  const idProfesor = localStorage.getItem("id_profesor");
  document.getElementById("welcomeMessage").textContent = `Bienvenido, ${nombreProfesor} `;

  const sections = {
    btnCursos: async () => {
      loader.classList.remove("hidden");
      try {
        const res = await fetch(`${API_URL}/cursos?id_profesor=${idProfesor}`);
        const data = await res.json();
        loader.classList.add("hidden");

        if (!data.length) {
          mainContent.innerHTML = `<p>No tienes cursos asignados actualmente.</p>`;
          return;
        }

        mainContent.innerHTML = `
          <h2>Mis Cursos</h2>
          <table>
            <tr>
              <th>ID</th>
              <th>Curso</th>
              <th>Idioma</th>
              <th>Nivel</th>
            </tr>
            ${data.map(c => `
              <tr>
                <td>${c.id_curso}</td>
                <td>${c.nombre_curso}</td>
                <td>${c.nombre_idioma || "-"}</td>
                <td>${c.nivel || "-"}</td>
              </tr>`).join("")}
          </table>`;
      } catch (error) {
        loader.classList.add("hidden");
        mainContent.innerHTML = `<p>Error al cargar los cursos.</p>`;
        console.error(error);
      }
    },

    btnCalificaciones: async () => {
      loader.classList.remove("hidden");
      mainContent.classList.remove("active");
      try {
        const resCursos = await fetch(`${API_URL}/cursos?id_profesor=${idProfesor}`);
        const cursos = await resCursos.json();
        
        mainContent.innerHTML = `
          <h2>Calificaciones</h2>
          <div class="calificaciones-container">
            <div class="actions-header">
              <div class="curso-selector">
                <label for="selectCurso">Seleccionar Curso:</label>
                <select id="selectCurso">
                  <option value="">Seleccione un curso...</option>
                  ${cursos.map(c => `
                    <option value="${c.id_curso}">${c.nombre_curso} - ${c.nombre_idioma} (${c.nivel || '-'})</option>
                  `).join('')}
                </select>
              </div>
            </div>
            
            <div id="tablaCalificaciones" class="calificaciones-table">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Parcial 1</th>
                    <th>Parcial 2</th>
                    <th>Final</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody id="calificacionesBody">
                  <tr>
                    <td colspan="5">Seleccione un curso para ver las calificaciones</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        `;

        document.getElementById('selectCurso').addEventListener('change', async (e) => {
          const cursoId = e.target.value;
          if (!cursoId) {
            document.getElementById('calificacionesBody').innerHTML = `
              <tr><td colspan="5">Seleccione un curso para ver las calificaciones</td></tr>
            `;
            return;
          }

          try {
            const res = await fetch(`${API_URL}/calificaciones/curso/${cursoId}`);
            const alumnos = await res.json();
            
            document.getElementById('calificacionesBody').innerHTML = alumnos.map(alumno => `
              <tr data-alumno-id="${alumno.id_alumno}">
                <td>${alumno.nombre} ${alumno.apellido}</td>
                <td>${alumno.parcial1 || '-'}</td>
                <td>${alumno.parcial2 || '-'}</td>
                <td>${alumno.final || '-'}</td>
                <td>
                  <button class="btn-primary">
                    Editar
                  </button>
                </td>
              </tr>
            `).join('') || '<tr><td colspan="5">No hay alumnos inscritos en este curso</td></tr>';

          } catch (error) {
            console.error('Error al cargar alumnos:', error);
            document.getElementById('calificacionesBody').innerHTML = `
              <tr><td colspan="5">Error al cargar los alumnos</td></tr>
            `;
          }
        });

      } catch (error) {
        console.error('Error:', error);
        mainContent.innerHTML = `
          <h2>Calificaciones</h2>
          <p class="error">Error al cargar las calificaciones. Por favor, intente nuevamente.</p>
        `;
      }
      
      loader.classList.add("hidden");
      setTimeout(() => mainContent.classList.add("active"), 100);
    },

    btnAsistencias: async () => {
      mainContent.innerHTML = `
        <h2>Asistencias</h2>
        <p>En desarrollo...</p>`;
    },

    btnMensajes: async () => {
      mainContent.innerHTML = `
        <h2>Mensajes</h2>
        <div class="message-list">
          <div class="message-item">
            <i data-lucide="mail"></i>
            <div><h3>Coordinación Académica</h3><p>Reunión el jueves a las 14hs</p></div>
          </div>
          <div class="message-item">
            <i data-lucide="mail"></i>
            <div><h3>Administración</h3><p>Por favor enviar lista de asistencia</p></div>
          </div>
        </div>`;
      lucide.createIcons();
    }
  };

  botones.forEach(btn => {
    btn.addEventListener("click", async () => {
      botones.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      mainContent.classList.remove("active");
      loader.classList.remove("hidden");

      setTimeout(async () => {
        await sections[btn.id]?.();
        loader.classList.add("hidden");
        mainContent.classList.add("active");
      }, 300);
    });
  });

  document.getElementById("btnCursos").click();
}

async function initAlumnoDashboard() {
  console.log(" Dashboard ALUMNO cargado");
  document.getElementById("btnMisInscripciones")?.addEventListener("click", verMisInscripciones);
  document.getElementById("btnMisPagos")?.addEventListener("click", verMisPagos);
}

async function verMisInscripciones() {
  const table = document.getElementById("tablaMisInscripciones");
  table.innerHTML = "<tr><td>Cargando inscripciones...</td></tr>";
  try {
    const res = await fetch(`${API_URL}/inscripciones`);
    const data = await res.json();
    table.innerHTML = `
      <tr><th>ID</th><th>Curso</th><th>Fecha</th><th>Estado</th></tr>
      ${data.map(i => `
        <tr>
          <td>${i.id_inscripcion}</td>
          <td>${i.id_curso}</td>
          <td>${i.fecha_inscripcion}</td>
          <td>${i.estado}</td>
        </tr>`).join("")}
    `;
  } catch (err) {
    console.error("Error al obtener inscripciones:", err);
    table.innerHTML = "<tr><td>Error al cargar inscripciones</td></tr>";
  }
}

async function verMisPagos() {
  const table = document.getElementById("tablaMisPagos");
  table.innerHTML = "<tr><td>Cargando pagos...</td></tr>";
  try {
    const res = await fetch(`${API_URL}/pagos`);
    const data = await res.json();
    const nombreAlumno = localStorage.getItem("nombre");
    const propios = data.filter(p => p.alumno?.includes(nombreAlumno));
    table.innerHTML = `
      <tr><th>ID</th><th>Concepto</th><th>Monto</th><th>Fecha</th><th>Medio</th></tr>
      ${propios.map(p => `
        <tr>
          <td>${p.id_pago}</td>
          <td>${p.concepto}</td>
          <td>${p.monto}</td>
          <td>${p.fecha_pago}</td>
          <td>${p.medio_pago}</td>
        </tr>`).join("")}
    `;
  } catch (err) {
    console.error("Error al obtener pagos del alumno:", err);
    table.innerHTML = "<tr><td>Error al cargar pagos</td></tr>";
  }
}

function ensureAlumnoPanel() {
  if (document.getElementById('alumnoPanel')) return;

  const panelHtml = `
    <div id="alumnoPanelOverlay" class="curso-panel-overlay"></div>
    <div id="alumnoPanel" class="alumno-panel">
      <div class="alumno-panel-header">
        <button class="close-panel" aria-label="Cerrar">×</button>
        <div class="alumno-panel-header-content">
          <div class="alumno-panel-avatar" id="panelAlumnoAvatar">AA</div>
          <div class="alumno-panel-info">
            <h2 id="panelAlumnoNombre">Cargando...</h2>
            <div class="legajo-info">
              <span id="panelAlumnoLegajo"></span> • 
              <span id="panelAlumnoEstado" class="alumno-estado-badge activo">Activo</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="alumno-panel-content" id="panelAlumnoContent">
        <div style="text-align: center; padding: 40px; color: #999;">
          <i data-lucide="loader" style="width: 32px; height: 32px; animation: spin 1s linear infinite;"></i>
          <p>Cargando información...</p>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', panelHtml);
  
  const panel = document.getElementById('alumnoPanel');
  const overlay = document.getElementById('alumnoPanelOverlay');
  
  const closePanel = () => {
    panel.classList.remove('active');
    overlay.classList.remove('active');
  };

  const closeBtn = panel.querySelector('.close-panel');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }
  overlay.addEventListener('click', closePanel);
  
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('active') && !panel.contains(e.target) && !e.target.closest('.alumno-card')) {
      closePanel();
    }
  });
  
  let mouseLeaveTimeout;
  panel.addEventListener('mouseleave', () => {
    mouseLeaveTimeout = setTimeout(() => {
      closePanel();
    }, 500);
  });
  
  panel.addEventListener('mouseenter', () => {
    clearTimeout(mouseLeaveTimeout);
  });
}

async function openAlumnoPanel(idAlumno) {
  ensureAlumnoPanel();
  const panel = document.getElementById('alumnoPanel');
  const overlay = document.getElementById('alumnoPanelOverlay');
  
  panel.classList.add('active');
  overlay.classList.add('active');

  try {
    const resAlumno = await fetch(`${API_URL}/alumnos/${idAlumno}`);
    const alumno = await resAlumno.json();

    const iniciales = `${alumno.nombre.charAt(0)}${alumno.apellido.charAt(0)}`.toUpperCase();
    document.getElementById('panelAlumnoAvatar').textContent = iniciales;
    document.getElementById('panelAlumnoNombre').textContent = `${alumno.nombre} ${alumno.apellido}`;
    document.getElementById('panelAlumnoLegajo').textContent = `Legajo: ${alumno.legajo}`;
    
    const estadoBadge = document.getElementById('panelAlumnoEstado');
    estadoBadge.textContent = (alumno.estado || 'activo').charAt(0).toUpperCase() + (alumno.estado || 'activo').slice(1);
    estadoBadge.className = `alumno-estado-badge ${alumno.estado || 'activo'}`;

    const content = document.getElementById('panelAlumnoContent');
    content.innerHTML = `
      <!-- Información Personal -->
      <div class="info-section">
        <h3><i data-lucide="user"></i> Información Personal</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-item-label">Email</div>
            <div class="info-item-value">${alumno.mail}</div>
          </div>
          <div class="info-item">
            <div class="info-item-label">Teléfono</div>
            <div class="info-item-value">${alumno.telefono || 'No registrado'}</div>
          </div>
          <div class="info-item">
            <div class="info-item-label">Fecha de Registro</div>
            <div class="info-item-value">${alumno.fecha_registro ? new Date(alumno.fecha_registro).toLocaleDateString('es-AR') : 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-item-label">Estado</div>
            <div class="info-item-value">
              <span class="alumno-estado-badge ${alumno.estado || 'activo'}">${(alumno.estado || 'activo').charAt(0).toUpperCase() + (alumno.estado || 'activo').slice(1)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas Académicas -->
      <div class="info-section">
        <h3><i data-lucide="bar-chart-2"></i> Estadísticas Académicas</h3>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number">${alumno.cursos_activos || 0}</div>
            <div class="stat-label">Cursos Activos</div>
          </div>
          <div class="stat-box success">
            <div class="stat-number">${alumno.promedio_general || '0.0'}</div>
            <div class="stat-label">Promedio General</div>
            <div class="progress-bar">
              <div class="progress-bar-fill ${alumno.promedio_general >= 7 ? 'success' : alumno.promedio_general >= 4 ? 'warning' : 'danger'}" 
                   style="width: ${Math.min((alumno.promedio_general / 10) * 100, 100)}%"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cursos Inscritos -->
      <div class="info-section">
        <h3><i data-lucide="book-open"></i> Cursos Inscritos (${alumno.cursos?.length || 0})</h3>
        ${alumno.cursos && alumno.cursos.length > 0 ? `
          <div class="cursos-list">
            ${alumno.cursos.map(c => `
              <div class="curso-item">
                <div class="curso-item-info">
                  <h4>${c.nombre_curso}</h4>
                  <p>${c.nombre_idioma} - ${c.nivel} ${c.horario ? `• ${c.horario}` : ''}</p>
                </div>
                <div class="curso-item-calificacion">
                  ${c.promedio !== null ? `
                    <div class="promedio">${parseFloat(c.promedio).toFixed(1)}</div>
                    <div class="label">Promedio</div>
                  ` : '<div class="label" style="font-size: 13px; color: #999;">Sin calificaciones</div>'}
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p style="color: #999; text-align: center; padding: 20px;">No está inscrito en ningún curso actualmente</p>'}
      </div>

      <!-- Resumen de Pagos -->
      <div class="info-section">
        <h3><i data-lucide="dollar-sign"></i> Resumen de Pagos</h3>
        <div class="pagos-summary">
          <h4>Total Pagado</h4>
          <div class="pagos-total">$${alumno.total_pagado ? parseFloat(alumno.total_pagado).toLocaleString('es-AR', {minimumFractionDigits: 2}) : '0.00'}</div>
          ${alumno.ultimo_pago ? `<div class="pagos-ultimo">Último pago: ${new Date(alumno.ultimo_pago).toLocaleDateString('es-AR')}</div>` : '<div class="pagos-ultimo">Sin pagos registrados</div>'}
        </div>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number">${alumno.total_pagos || 0}</div>
            <div class="stat-label">Pagos Realizados</div>
          </div>
          <div class="stat-box warning">
            <div class="stat-number">$${alumno.promedio_pago ? parseFloat(alumno.promedio_pago).toLocaleString('es-AR', {minimumFractionDigits: 0}) : '0'}</div>
            <div class="stat-label">Promedio por Pago</div>
          </div>
        </div>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } catch (err) {
    console.error('Error al cargar panel de alumno:', err);
    document.getElementById('panelAlumnoContent').innerHTML = `
      <div style="text-align: center; padding: 40px; color: #f44336;">
        <i data-lucide="alert-circle" style="width: 32px; height: 32px;"></i>
        <p>Error al cargar la información del alumno</p>
      </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function setupAlumnoFilters() {
  const searchInput = document.getElementById('alumnosSearch');

  if (searchInput) {
    searchInput.addEventListener('input', filterAlumnos);
  }
}

function filterAlumnos() {
  const searchTerm = document.getElementById('alumnosSearch')?.value.toLowerCase() || '';
  
  const cards = document.querySelectorAll('.alumno-card');
  
  cards.forEach(card => {
    const cardText = card.textContent.toLowerCase();
    
    const matchesSearch = cardText.includes(searchTerm);
    const matchesEstado = true;
    
    if (matchesSearch && matchesEstado) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// Filtros para Cursos
function setupCursoFilters() {
  const searchInput = document.getElementById('cursosSearch');
  if (searchInput) {
    searchInput.addEventListener('input', filterCursos);
  }
}

function filterCursos() {
  const searchTerm = document.getElementById('cursosSearch')?.value.toLowerCase() || '';
  const cards = document.querySelectorAll('.curso-card-new');
  
  cards.forEach(card => {
    const cardText = card.textContent.toLowerCase();
    const matchesSearch = cardText.includes(searchTerm);
    
    if (matchesSearch) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// Filtros para Aulas
function setupAulaFilters() {
  const searchInput = document.getElementById('aulasSearch');
  if (searchInput) {
    searchInput.addEventListener('input', filterAulas);
  }
}

function filterAulas() {
  const searchTerm = document.getElementById('aulasSearch')?.value.toLowerCase() || '';
  const cards = document.querySelectorAll('.aula-card');
  
  cards.forEach(card => {
    const cardText = card.textContent.toLowerCase();
    const matchesSearch = cardText.includes(searchTerm);
    
    if (matchesSearch) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// Filtros para Idiomas
function setupIdiomaFilters() {
  const searchInput = document.getElementById('idiomasSearch');
  if (searchInput) {
    searchInput.addEventListener('input', filterIdiomas);
  }
}

function filterIdiomas() {
  const searchTerm = document.getElementById('idiomasSearch')?.value.toLowerCase() || '';
  const cards = document.querySelectorAll('.idioma-card');
  
  cards.forEach(card => {
    const cardText = card.textContent.toLowerCase();
    const matchesSearch = cardText.includes(searchTerm);
    
    if (matchesSearch) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function ensureProfesorPanel() {
  if (document.getElementById('profesorPanel')) return;

  const panelHtml = `
    <div id="profesorPanelOverlay" class="curso-panel-overlay"></div>
    <div id="profesorPanel" class="profesor-panel">
      <div class="profesor-panel-header">
        <button class="close-panel" aria-label="Cerrar">×</button>
        <div class="profesor-panel-header-content">
          <div class="profesor-panel-avatar" id="panelProfesorAvatar">PP</div>
          <div class="profesor-panel-info">
            <h2 id="panelProfesorNombre">Cargando...</h2>
            <div class="especialidad-info">
              <i data-lucide="award"></i>
              <span id="panelProfesorEspecialidad"></span> • 
              <span id="panelProfesorEstado" class="profesor-estado-badge activo">Activo</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="profesor-panel-content" id="panelProfesorContent">
        <div style="text-align: center; padding: 40px; color: #999;">
          <i data-lucide="loader" style="width: 32px; height: 32px; animation: spin 1s linear infinite;"></i>
          <p>Cargando información...</p>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', panelHtml);
  
  const panel = document.getElementById('profesorPanel');
  const overlay = document.getElementById('profesorPanelOverlay');
  
  const closePanel = () => {
    panel.classList.remove('active');
    overlay.classList.remove('active');
  };

  const closeBtn = panel.querySelector('.close-panel');
  if (closeBtn) {
    closeBtn.addEventListener('click', closePanel);
  }
  overlay.addEventListener('click', closePanel);
  
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('active') && !panel.contains(e.target) && !e.target.closest('.profesor-card')) {
      closePanel();
    }
  });
  
  let mouseLeaveTimeout;
  panel.addEventListener('mouseleave', () => {
    mouseLeaveTimeout = setTimeout(() => {
      closePanel();
    }, 500);
  });
  
  panel.addEventListener('mouseenter', () => {
    clearTimeout(mouseLeaveTimeout);
  });
}

async function openProfesorPanel(idProfesor) {
  ensureProfesorPanel();
  const panel = document.getElementById('profesorPanel');
  const overlay = document.getElementById('profesorPanelOverlay');
  
  panel.classList.add('active');
  overlay.classList.add('active');

  try {
    const resProfesor = await fetch(`${API_URL}/profesores/${idProfesor}`);
    const profesor = await resProfesor.json();

    const iniciales = `${profesor.nombre.charAt(0)}${profesor.apellido.charAt(0)}`.toUpperCase();
    document.getElementById('panelProfesorAvatar').textContent = iniciales;
    document.getElementById('panelProfesorNombre').textContent = `${profesor.nombre} ${profesor.apellido}`;
    document.getElementById('panelProfesorEspecialidad').textContent = profesor.especialidad || 'Sin especialidad';
    
    const estadoBadge = document.getElementById('panelProfesorEstado');
    estadoBadge.textContent = (profesor.estado || 'activo').charAt(0).toUpperCase() + (profesor.estado || 'activo').slice(1);
    estadoBadge.className = `profesor-estado-badge ${profesor.estado || 'activo'}`;

    const horasPorCurso = 3; // Estimación promedio
    const horasTotales = profesor.total_cursos * horasPorCurso;
    const horasMaximas = 40;
    const porcentajeCarga = (horasTotales / horasMaximas) * 100;
    let claseCarga = 'baja';
    if (porcentajeCarga >= 80) claseCarga = 'alta';
    else if (porcentajeCarga >= 50) claseCarga = 'media';

    const content = document.getElementById('panelProfesorContent');
    content.innerHTML = `
      <!-- Información Personal -->
      <div class="info-section">
        <h3><i data-lucide="user"></i> Información Personal</h3>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-item-label">Email</div>
            <div class="info-item-value">${profesor.mail}</div>
          </div>
          <div class="info-item">
            <div class="info-item-label">Teléfono</div>
            <div class="info-item-value">${profesor.telefono || 'No registrado'}</div>
          </div>
          <div class="info-item">
            <div class="info-item-label">Fecha de Ingreso</div>
            <div class="info-item-value">${profesor.fecha_ingreso ? new Date(profesor.fecha_ingreso).toLocaleDateString('es-AR') : 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-item-label">Antigüedad</div>
            <div class="info-item-value">${profesor.antiguedad_anos} ${profesor.antiguedad_anos === 1 ? 'año' : 'años'}</div>
          </div>
        </div>
      </div>

      <!-- Carga Horaria -->
      <div class="info-section">
        <h3><i data-lucide="clock"></i> Carga Horaria</h3>
        <div class="carga-horaria-chart">
          <div class="carga-bar-container">
            <div class="carga-bar-label">Horas semanales</div>
            <div class="carga-bar-track">
              <div class="carga-bar-fill ${claseCarga}" style="width: ${Math.min(porcentajeCarga, 100)}%">
                ${horasTotales}h / ${horasMaximas}h
              </div>
            </div>
          </div>
          <div class="carga-bar-container">
            <div class="carga-bar-label">Cursos activos</div>
            <div class="carga-bar-track">
              <div class="carga-bar-fill" style="width: ${Math.min((profesor.total_cursos / 10) * 100, 100)}%">
                ${profesor.total_cursos} cursos
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas de Alumnos -->
      <div class="info-section">
        <h3><i data-lucide="users"></i> Estadísticas de Alumnos</h3>
        <div class="stats-grid">
          <div class="stat-box">
            <div class="stat-number">${profesor.total_alumnos || 0}</div>
            <div class="stat-label">Alumnos Activos</div>
          </div>
          <div class="stat-box success">
            <div class="stat-number">${profesor.promedio_general || 'N/A'}</div>
            <div class="stat-label">Promedio General</div>
            ${profesor.promedio_general ? `
            <div class="progress-bar">
              <div class="progress-bar-fill ${profesor.promedio_general >= 7 ? 'success' : profesor.promedio_general >= 4 ? 'warning' : 'danger'}" 
                   style="width: ${Math.min((profesor.promedio_general / 10) * 100, 100)}%"></div>
            </div>` : ''}
          </div>
          <div class="stat-box">
            <div class="stat-number">${profesor.total_cursos || 0}</div>
            <div class="stat-label">Cursos Dictando</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${profesor.idiomas?.length || 0}</div>
            <div class="stat-label">Idiomas</div>
          </div>
        </div>
      </div>

      <!-- Cursos que Dicta -->
      <div class="info-section">
        <h3><i data-lucide="book-open"></i> Cursos que Dicta (${profesor.cursos?.length || 0})</h3>
        ${profesor.cursos && profesor.cursos.length > 0 ? `
          <div class="profesor-cursos-list">
            ${profesor.cursos.map(c => `
              <div class="profesor-curso-item">
                <div class="profesor-curso-info">
                  <h4>${c.nombre_curso}</h4>
                  <p>${c.nombre_idioma} - ${c.nivel || 'Sin nivel'} ${c.horario ? `• ${c.horario}` : ''} ${c.nombre_aula ? `• ${c.nombre_aula}` : ''}</p>
                </div>
                <div class="profesor-curso-stats">
                  <div class="numero">${c.total_alumnos || 0}</div>
                  <div class="label">Alumnos</div>
                  ${c.promedio_curso ? `<div style="font-size: 12px; color: #666; margin-top: 4px;">Prom: ${parseFloat(c.promedio_curso).toFixed(1)}</div>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p style="color: #999; text-align: center; padding: 20px;">No está dictando cursos actualmente</p>'}
      </div>

      <!-- Idiomas que Enseña -->
      <div class="info-section">
        <h3><i data-lucide="languages"></i> Idiomas que Enseña</h3>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          ${profesor.idiomas && profesor.idiomas.length > 0 ? 
            profesor.idiomas.map(idioma => `
              <span style="background: #f0f1f2; color: #4a5259; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 500;">
                ${idioma}
              </span>
            `).join('') :
            '<p style="color: #999;">Sin idiomas asignados</p>'
          }
        </div>
      </div>

      <!-- Botones de Acción -->
      <div class="panel-actions">
        <button class="btn-danger" onclick="darDeBajaProfesor(${idProfesor}, '${profesor.nombre} ${profesor.apellido}')">
          <i data-lucide="user-x"></i>
          Dar de Baja
        </button>
      </div>
    `;

    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  } catch (err) {
    console.error('Error al cargar panel de profesor:', err);
    document.getElementById('panelProfesorContent').innerHTML = `
      <div style="text-align: center; padding: 40px; color: #f44336;">
        <i data-lucide="alert-circle" style="width: 32px; height: 32px;"></i>
        <p>Error al cargar la información del profesor</p>
      </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

function setupProfesorFilters() {
  const searchInput = document.getElementById('profesoresSearch');

  if (searchInput) {
    searchInput.addEventListener('input', filterProfesores);
  }
}

function filterProfesores() {
  const searchTerm = document.getElementById('profesoresSearch')?.value.toLowerCase() || '';
  
  const cards = document.querySelectorAll('.profesor-card');
  
  cards.forEach(card => {
    const cardText = card.textContent.toLowerCase();
    
    const matchesSearch = cardText.includes(searchTerm);
    const matchesEstado = true;
    const matchesIdioma = true;
    
    if (matchesSearch && matchesEstado && matchesIdioma) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}


async function initIdiomasMultiSelect(mode = 'edit', selectedIds = []) {
  const prefix = mode === 'edit' ? '' : 'Nuevo';
  const display = document.getElementById(`idiomasSelectedDisplay${prefix}`);
  const dropdown = document.getElementById(`idiomasDropdown${prefix}`);
  const hiddenInput = document.getElementById(mode === 'edit' ? 'editProfesorIdiomas' : 'idiomasSeleccionados');
  
  console.log(' Buscando elementos:', {
    mode,
    prefix,
    displayId: `idiomasSelectedDisplay${prefix}`,
    dropdownId: `idiomasDropdown${prefix}`,
    displayFound: !!display,
    dropdownFound: !!dropdown,
    hiddenInputFound: !!hiddenInput
  });
  
  if (!display || !dropdown) {
    console.error(' No se encontraron los elementos del selector de idiomas');
    return;
  }
  
  let selectedIdiomas = new Set(selectedIds);
  
  try {
    const resp = await fetch(`${API_URL}/idiomas`);
    const idiomas = await resp.json();
    
    console.log(' Idiomas cargados:', idiomas.length);
    
    dropdown.innerHTML = idiomas.map(idioma => `
      <label style="display: flex; align-items: center; padding: 10px; cursor: pointer; transition: background 0.2s;" 
             onmouseover="this.style.background='#f3f4f6'" 
             onmouseout="this.style.background='white'"
             data-idioma-id="${idioma.id_idioma}">
        <input type="checkbox" value="${idioma.id_idioma}" 
               ${selectedIdiomas.has(idioma.id_idioma) ? 'checked' : ''}
               style="margin-right: 8px; cursor: pointer;">
        <span style="font-size: 14px;">${idioma.nombre_idioma}</span>
      </label>
    `).join('');
    
    updateIdiomasDisplay();
    
    display.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
    
    document.addEventListener('click', (e) => {
      if (!display.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
    
    dropdown.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = parseInt(e.target.value);
        if (e.target.checked) {
          selectedIdiomas.add(id);
        } else {
          selectedIdiomas.delete(id);
        }
        updateIdiomasDisplay();
      });
    });
    
    function updateIdiomasDisplay() {
      display.innerHTML = '';
      
      if (selectedIdiomas.size === 0) {
        const placeholderSpan = document.createElement('span');
        placeholderSpan.id = `idiomasPlaceholder${prefix}`;
        placeholderSpan.style.color = '#999';
        placeholderSpan.style.fontSize = '14px';
        placeholderSpan.textContent = 'Seleccionar idiomas...';
        display.appendChild(placeholderSpan);
      } else {
        selectedIdiomas.forEach(id => {
          const idioma = idiomas.find(i => i.id_idioma === id);
          if (idioma) {
            const tag = document.createElement('span');
            tag.style.cssText = 'background: #4a5259; color: white; padding: 4px 10px; border-radius: 12px; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;';
            tag.innerHTML = `
              ${idioma.nombre_idioma}
              <button type="button" onclick="event.stopPropagation(); this.parentElement.remove(); document.querySelector('#idiomasDropdown${prefix} input[value=\\'${id}\\']').checked = false; document.querySelector('#idiomasDropdown${prefix} input[value=\\'${id}\\']').dispatchEvent(new Event('change'));" 
                      style="background: none; border: none; color: white; cursor: pointer; font-size: 16px; line-height: 1; padding: 0; margin: 0;">×</button>
            `;
            display.appendChild(tag);
          }
        });
      }
      
      if (hiddenInput) {
        hiddenInput.value = Array.from(selectedIdiomas).join(',');
      }
    }
    
  } catch (error) {
    console.error('Error al cargar idiomas:', error);
  }
}

function ensureEditarProfesorModal() {
  document.querySelectorAll('#modalEditarProfesor').forEach(m => {
    console.log('️ Eliminando modal viejo por ID');
    m.remove();
  });
  
  document.querySelectorAll('.modal').forEach(m => {
    if (m.innerHTML && m.innerHTML.includes('Editar Profesor')) {
      console.log('️ Eliminando modal viejo por contenido');
      m.remove();
    }
  });

  const timestamp = Date.now();
  console.log(` CREANDO MODAL PROFESOR - Timestamp: ${timestamp}`);
  console.log('️ Si NO ves el campo DNI después de esto, el problema es CACHE del navegador');
  console.log(' Verificar en Elements: buscar id="editProfesorDNI"');

  const modalHtml = `
    <div id="modalEditarProfesor" class="modal" style="z-index: 3000;">
      <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <div class="modal-header">
          <h2>Editar Profesor</h2>
          <button class="close-modal">&times;</button>
        </div>
        
        <div style="padding: 24px;">
          <form id="formEditarProfesor">
            <input type="hidden" id="editProfesorId">
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div>
                <label for="editProfesorNombre">Nombre:</label>
                <input type="text" id="editProfesorNombre" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              
              <div>
                <label for="editProfesorApellido">Apellido:</label>
                <input type="text" id="editProfesorApellido" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
            </div>
            
            <div style="margin-bottom: 16px;">
              <label for="editProfesorMail">Email:</label>
              <input type="email" id="editProfesorMail" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div>
                <label for="editProfesorDNI">DNI:</label>
                <input type="text" id="editProfesorDNI" placeholder="Ej: 12345678" maxlength="8" oninput="this.value=this.value.replace(/[^0-9]/g,'')" pattern="[0-9]*" inputmode="numeric" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              
              <div>
                <label for="editProfesorEspecialidad">Especialidad:</label>
                <input type="text" id="editProfesorEspecialidad" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
              <div>
                <label for="editProfesorTelefono">Teléfono:</label>
                <input type="tel" id="editProfesorTelefono" oninput="this.value=this.value.replace(/[^0-9]/g,'')" pattern="[0-9]*" inputmode="numeric" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
              </div>
              
              <div>
                <label for="editProfesorEstado">Estado:</label>
                <select id="editProfesorEstado" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                  <option value="licencia">En Licencia</option>
                </select>
              </div>
            </div>
            
            <div style="margin-bottom: 16px; background: #fff3cd; padding: 15px; border: 2px solid #ff0000; border-radius: 8px;">
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #000;"> IDIOMAS QUE ENSEÑA (CAMPO DE PRUEBA):</label>
              <div id="idiomasMultiSelect" style="position: relative;">
                <div id="idiomasSelectedDisplay" style="min-height: 42px; padding: 8px; border: 2px solid #ff0000; border-radius: 4px; cursor: pointer; background: white; display: flex; flex-wrap: wrap; gap: 6px; align-items: center;">
                  <span style="color: #ff0000; font-size: 14px; font-weight: bold;" id="idiomasPlaceholder">Seleccionar idiomas...</span>
                </div>
                <div id="idiomasDropdown" style="display: none; position: absolute; z-index: 1000; width: 100%; max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; background: white; margin-top: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                  <!-- Se llenarán los idiomas dinámicamente -->
                </div>
              </div>
              <input type="hidden" id="editProfesorIdiomas" value="">
            </div>
            
            <div class="form-actions" style="margin-top: 24px; display: flex; gap: 10px; justify-content: space-between;">
              <button type="button" id="btnEditarCredencialesProfesor" class="btn-secondary" style="display: flex; align-items: center; gap: 8px;">
                <i data-lucide="key" style="width: 16px; height: 16px;"></i>
                Editar Credenciales
              </button>
              <div style="display: flex; gap: 10px;">
                <button type="button" class="close-modal">Cancelar</button>
                <button type="submit" class="btn-primary">Guardar Cambios</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);

  const modal = document.getElementById('modalEditarProfesor');
  
  modal.querySelectorAll('.close-modal').forEach(btn => btn.addEventListener('click', () => modal.classList.remove('active')));
  modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('active'); });

  const btnCredenciales = document.getElementById('btnEditarCredencialesProfesor');
  btnCredenciales.addEventListener('click', () => {
    const idProfesor = document.getElementById('editProfesorId').value;
    abrirModalCredencialesProfesor(idProfesor);
  });

  document.getElementById('formEditarProfesor').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const idProfesor = document.getElementById('editProfesorId').value;
    const idiomasValue = document.getElementById('editProfesorIdiomas').value;
    const data = {
      nombre: document.getElementById('editProfesorNombre').value.trim(),
      apellido: document.getElementById('editProfesorApellido').value.trim(),
      mail: document.getElementById('editProfesorMail').value.trim(),
      dni: document.getElementById('editProfesorDNI').value.trim(),
      especialidad: document.getElementById('editProfesorEspecialidad').value.trim(),
      telefono: document.getElementById('editProfesorTelefono').value.trim(),
      estado: document.getElementById('editProfesorEstado').value,
      idiomas: idiomasValue ? idiomasValue.split(',').map(id => parseInt(id)) : []
    };

    if (!data.nombre || !data.apellido || !data.mail || !data.dni || !data.especialidad || !data.telefono) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Todos los campos son obligatorios',
        heightAuto: false,
        didOpen: () => {
          const swalContainer = document.querySelector('.swal2-container');
          if (swalContainer) {
            swalContainer.style.zIndex = '99999';
          }
        }
      });
      return;
    }

    try {
      const resp = await fetch(`${API_URL}/profesores/${idProfesor}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await resp.json();

      if (resp.ok) {
        showToast('Profesor actualizado correctamente', 'success');
        modal.classList.remove('active');
        
        const section = document.querySelector('.sidebar-menu button.active').id.replace('btn', '').toLowerCase();
        if (section === 'profesores') {
          document.getElementById('btnProfesores').click();
        }
        
        if (document.getElementById('profesorPanel').classList.contains('active')) {
          openProfesorPanel(idProfesor);
        }
      } else {
        showToast(result.message || 'Error al actualizar', 'error');
      }
    } catch (error) {
      console.error('Error al actualizar profesor:', error);
      showToast('Error al actualizar profesor', 'error');
    }
  });
}

async function openEditarProfesorModal(idProfesor) {
  ensureEditarProfesorModal();
  const modal = document.getElementById('modalEditarProfesor');

  try {
    const resp = await fetch(`${API_URL}/profesores/${idProfesor}`);
    const profesor = await resp.json();
    
    console.log('Datos del profesor:', profesor);
    console.log('Idiomas IDs:', profesor.idiomas_ids);

    document.getElementById('editProfesorId').value = idProfesor;
    document.getElementById('editProfesorNombre').value = profesor.nombre;
    document.getElementById('editProfesorApellido').value = profesor.apellido;
    document.getElementById('editProfesorMail').value = profesor.mail;
    document.getElementById('editProfesorDNI').value = profesor.dni || '';
    document.getElementById('editProfesorEspecialidad').value = profesor.especialidad || '';
    document.getElementById('editProfesorTelefono').value = profesor.telefono || '';
    document.getElementById('editProfesorEstado').value = profesor.estado || 'activo';

    modal.classList.add('active');
    
    setTimeout(async () => {
      console.log('Inicializando selector de idiomas...');
      await initIdiomasMultiSelect('edit', profesor.idiomas_ids || []);
      lucide.createIcons();
    }, 100);
  } catch (error) {
    console.error('Error al cargar datos del profesor:', error);
    showToast('Error al cargar datos', 'error');
  }
}

async function abrirModalCredencialesProfesor(idProfesor) {
  try {
    const resp = await fetch(`${API_URL}/profesores/${idProfesor}`);
    const profesor = await resp.json();
    
    let usuarioActual = '';
    let passwordActual = '';
    let tienePassword = false;
    try {
      const respUsuario = await fetch(`${API_URL}/auth/usuario-classroom/${profesor.id_persona}`);
      if (respUsuario.ok) {
        const usuario = await respUsuario.json();
        usuarioActual = usuario.username || '';
        passwordActual = usuario.password_plain || '';
        tienePassword = usuario.password_plain ? true : false;
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }

    let accessKeyActual = '';
    try {
      const respAccessKey = await fetch(`${API_URL}/profesores/${idProfesor}/access-key`);
      if (respAccessKey.ok) {
        const dataKey = await respAccessKey.json();
        accessKeyActual = dataKey.access_key || '';
      }
    } catch (error) {
      console.error('Error al cargar access key:', error);
    }

    const result = await Swal.fire({
      title: 'Editar Credenciales',
      html: `
        <div style="text-align: left;">
          <div style="background: #f5f5f7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4a5259;">
            <p style="margin: 0; font-size: 13px; color: #4a5259;">
              Estas credenciales se usan para <strong>Dashboard y Classroom</strong>
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">
              Usuario <span style="color: #9ca3af; font-weight: 400;">(actual: ${usuarioActual})</span>
            </label>
            <input type="text" id="usuarioProfesor" value="${usuarioActual}" 
                   onfocus="if(this.value === '${usuarioActual}') this.value = '';"
                   style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; color: #9ca3af;">
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">
              Contrasena <span style="color: #9ca3af; font-weight: 400;">(actual: ${passwordActual || 'sin configurar'})</span>
            </label>
            <div style="position: relative;">
              <input type="text" id="passwordProfesor" value="${passwordActual}"
                     onfocus="if(this.value === '${passwordActual}') this.value = '';"
                     style="width: 100%; padding: 10px 40px 10px 10px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-size: 14px; color: #9ca3af;">
              <button type="button" id="togglePasswordProfesor" 
                      style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px;">
                <i data-lucide="eye" style="width: 20px; height: 20px; color: #6b7280;"></i>
              </button>
            </div>
            <p style="font-size: 11px; color: #6b7280; margin-top: 4px;">
              Deja vacio para mantener la contrasena actual
            </p>
          </div>

          <!-- CEMIKEY -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 16px; border-radius: 10px; margin-bottom: 16px; border: 1px solid #fbbf24;">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #92400e; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="key" style="width: 18px; height: 18px;"></i>
              Clave de Acceso (CemiKey)
            </h4>
            
            <div style="position: relative;">
              <input type="text" id="accessKeyProfesor" value="${accessKeyActual}"
                     placeholder="Ingresa una clave de acceso..."
                     style="width: 100%; padding: 10px 40px 10px 10px; border: 1px solid #fbbf24; border-radius: 6px; box-sizing: border-box; background: white; font-size: 14px;">
              <button type="button" id="clearAccessKeyProfesor" 
                      style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; color: #b45309;"
                      title="Limpiar clave">
                <i data-lucide="x" style="width: 18px; height: 18px;"></i>
              </button>
            </div>
            <p style="font-size: 11px; color: #92400e; margin-top: 6px;">
              Esta clave permite acceso directo sin usuario/contrasena. Deja vacio para eliminar.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 14px 16px; border-radius: 10px; border: 1px solid #86efac; margin-top: 16px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; margin: 0;">
              <input type="checkbox" id="enviarEmailProfesor" 
                     style="width: 18px; height: 18px; accent-color: #22c55e; cursor: pointer;">
              <div>
                <span style="font-size: 13px; font-weight: 600; color: #166534;">Notificar al usuario por email</span>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #15803d;">
                  Se enviara un correo con las nuevas credenciales
                </p>
              </div>
            </label>
          </div>
        </div>
      `,
      width: '500px',
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4a5259',
      didOpen: () => {
        lucide.createIcons();
        
        const inputUsuario = document.getElementById('usuarioProfesor');
        inputUsuario.addEventListener('blur', () => {
          if (inputUsuario.value.trim() === '') {
            inputUsuario.value = '${usuarioActual}';
            inputUsuario.style.color = '#9ca3af';
          } else {
            inputUsuario.style.color = '#111827';
          }
        });
        
        const inputPassword = document.getElementById('passwordProfesor');
        inputPassword.addEventListener('blur', () => {
          if (inputPassword.value.trim() === '') {
            inputPassword.value = '${passwordActual}';
            inputPassword.style.color = '#9ca3af';
          } else {
            inputPassword.style.color = '#111827';
          }
        });
        
        const toggleBtn = document.getElementById('togglePasswordProfesor');
        toggleBtn.addEventListener('click', () => {
          const isPassword = inputPassword.type === 'password';
          inputPassword.type = isPassword ? 'text' : 'password';
          
          const iconHtml = isPassword ? '<i data-lucide="eye-off" style="width: 20px; height: 20px; color: #6b7280;"></i>' : '<i data-lucide="eye" style="width: 20px; height: 20px; color: #6b7280;"></i>';
          toggleBtn.innerHTML = iconHtml;
          lucide.createIcons();
        });

        const clearBtn = document.getElementById('clearAccessKeyProfesor');
        const accessInput = document.getElementById('accessKeyProfesor');
        clearBtn.addEventListener('click', () => {
          accessInput.value = '';
          accessInput.focus();
        });
      },
      preConfirm: async () => {
        const usuario = document.getElementById('usuarioProfesor').value.trim();
        const password = document.getElementById('passwordProfesor').value.trim();
        const enviarEmail = document.getElementById('enviarEmailProfesor').checked;
        const accessKey = document.getElementById('accessKeyProfesor').value.trim();
        
        const nuevoUsuario = (usuario === '' || usuario === '${usuarioActual}') ? '${usuarioActual}' : usuario;
        
        const nuevoPassword = (password === '' || password === '${passwordActual}') ? '' : password;
        
        if (!nuevoUsuario) {
          Swal.showValidationMessage('El usuario es obligatorio');
          return false;
        }

        if (enviarEmail && !nuevoPassword) {
          Swal.showValidationMessage('Debes ingresar una nueva contrasena para enviar el email');
          return false;
        }
        
        return { 
          usuario: nuevoUsuario, 
          password: nuevoPassword, 
          enviarEmail, 
          accessKey,
          accessKeyChanged: accessKey !== accessKeyActual
        };
      }
    });

    if (result.isConfirmed && result.value) {
      const { usuario, password, enviarEmail, accessKey, accessKeyChanged } = result.value;

      try {
        const bodyData = {
          id_persona: profesor.id_persona,
          username: usuario,
          enviarEmail: enviarEmail
        };
        
        if (password && password.trim().length > 0) {
          bodyData.password = password;
        }
        
        const response = await fetch(`${API_URL}/auth/admin-cambiar-password-classroom`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
        
        // Actualizar CemiKey si cambió
        if (accessKeyChanged) {
          try {
            await fetch(`${API_URL}/profesores/${idProfesor}/access-key`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ access_key: accessKey || null })
            });
          } catch (keyError) {
            console.error('Error al actualizar access key:', keyError);
          }
        }
        
        if (response.ok) {
          const data = await response.json();
          let mensaje = password ? 'Usuario y contrasena actualizados correctamente' : 'Usuario actualizado correctamente';
          if (accessKeyChanged) {
            mensaje += accessKey ? '. Clave de acceso configurada.' : '. Clave de acceso eliminada.';
          }
          if (data.emailEnviado) {
            mensaje += ' Se ha enviado un email con las credenciales.';
          }
          Swal.fire('Actualizado!', mensaje, 'success');
        } else {
          const data = await response.json();
          Swal.fire('Error', data.message || 'Error al actualizar credenciales', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire('Error', 'No se pudieron cargar las credenciales', 'error');
  }
}

async function cambiarEstadoProfesor(idProfesor, estadoActual) {
  const estados = {
    'activo': { siguiente: 'licencia', label: 'En Licencia', icon: 'pause-circle', color: 'warning' },
    'licencia': { siguiente: 'activo', label: 'Activo', icon: 'check-circle', color: 'success' },
    'inactivo': { siguiente: 'activo', label: 'Activo', icon: 'check-circle', color: 'success' }
  };

  const cambio = estados[estadoActual];
  if (!cambio) return;

  const confirmed = await showConfirm(
    '¿Cambiar estado del profesor?',
    `Se cambiará el estado a: <strong>${cambio.label}</strong>`,
    cambio.icon
  );

  if (!confirmed) return;

  try {
    const resp = await fetch(`${API_URL}/profesores/${idProfesor}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: cambio.siguiente })
    });

    const result = await resp.json();

    if (resp.ok) {
      showToast(`Estado cambiado a ${cambio.label}`, 'success');
      
      document.getElementById('btnProfesores').click();
      
      if (document.getElementById('profesorPanel').classList.contains('active')) {
        openProfesorPanel(idProfesor);
      }
    } else {
      showToast(result.message || 'Error al cambiar estado', 'error');
    }
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    showToast('Error al cambiar estado', 'error');
  }
}

async function cambiarPasswordProfesorDashboard(idProfesor) {
  const { value: formValues } = await Swal.fire({
    title: 'Cambiar Contraseña del Dashboard',
    html: `
      <div style="text-align: left;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Nueva Contraseña:</label>
        <input id="swal-password" type="password" class="swal2-input" placeholder="Mínimo 6 caracteres" style="margin: 0 0 16px 0;">
        
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Confirmar Contraseña:</label>
        <input id="swal-password-confirm" type="password" class="swal2-input" placeholder="Repetir contraseña" style="margin: 0;">
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Cambiar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const password = document.getElementById('swal-password').value;
      const confirm = document.getElementById('swal-password-confirm').value;
      
      if (!password || !confirm) {
        Swal.showValidationMessage('Por favor complete ambos campos');
        return false;
      }
      
      if (password.length < 6) {
        Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
      
      if (password !== confirm) {
        Swal.showValidationMessage('Las contraseñas no coinciden');
        return false;
      }
      
      return { password };
    }
  });

  if (!formValues) return;

  try {
    const resp = await fetch(`${API_URL}/profesores/${idProfesor}/cambiar-password-dashboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: formValues.password })
    });

    const result = await resp.json();

    if (resp.ok) {
      Swal.fire('¡Éxito!', 'Contraseña del Dashboard actualizada correctamente', 'success');
    } else {
      Swal.fire('Error', result.message || 'No se pudo cambiar la contraseña', 'error');
    }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    Swal.fire('Error', 'Ocurrió un error al cambiar la contraseña', 'error');
  }
}

async function cambiarPasswordProfesorClassroom(idProfesor) {
  let idPersona;
  try {
    const resp = await fetch(`${API_URL}/profesores/${idProfesor}`);
    const profesor = await resp.json();
    idPersona = profesor.id_persona;
  } catch (error) {
    Swal.fire('Error', 'No se pudo obtener la información del profesor', 'error');
    return;
  }

  const { value: formValues } = await Swal.fire({
    title: 'Cambiar Contraseña del Classroom',
    html: `
      <div style="text-align: left;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Nueva Contraseña:</label>
        <input id="swal-password-class" type="password" class="swal2-input" placeholder="Mínimo 6 caracteres" style="margin: 0 0 16px 0;">
        
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Confirmar Contraseña:</label>
        <input id="swal-password-class-confirm" type="password" class="swal2-input" placeholder="Repetir contraseña" style="margin: 0;">
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Cambiar',
    cancelButtonText: 'Cancelar',
    preConfirm: () => {
      const password = document.getElementById('swal-password-class').value;
      const confirm = document.getElementById('swal-password-class-confirm').value;
      
      if (!password || !confirm) {
        Swal.showValidationMessage('Por favor complete ambos campos');
        return false;
      }
      
      if (password.length < 6) {
        Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
      
      if (password !== confirm) {
        Swal.showValidationMessage('Las contraseñas no coinciden');
        return false;
      }
      
      return { password };
    }
  });

  if (!formValues) return;

  try {
    const resp = await fetch(`${API_URL}/auth/admin-cambiar-password-classroom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id_persona: idPersona,
        password: formValues.password 
      })
    });

    const result = await resp.json();

    if (resp.ok) {
      Swal.fire('¡Éxito!', 'Contraseña del Classroom actualizada correctamente', 'success');
    } else {
      Swal.fire('Error', result.message || 'No se pudo cambiar la contraseña', 'error');
    }
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    Swal.fire('Error', 'Ocurrió un error al cambiar la contraseña', 'error');
  }
}

async function darDeBajaProfesor(idProfesor, nombre) {
  const confirmed = await showConfirm(
    '¿Dar de baja al profesor?',
    `¿Estás seguro de dar de baja a <strong>${nombre}</strong>?<br>El profesor será marcado como inactivo.`,
    'user-x',
    true
  );

  if (!confirmed) return;

  try {
    const resp = await fetch(`${API_URL}/profesores/${idProfesor}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'inactivo' })
    });

    const result = await resp.json();

    if (resp.ok) {
      showToast('Profesor dado de baja correctamente', 'success');
      
      document.getElementById('profesorPanel').classList.remove('active');
      
      document.getElementById('btnProfesores').click();
    } else {
      showToast(result.message || 'Error al dar de baja', 'error');
    }
  } catch (error) {
    console.error('Error al dar de baja:', error);
    showToast('Error al dar de baja', 'error');
  }
}

function showConfirm(title, message, icon = 'alert-circle', isDanger = false) {
  return new Promise((resolve) => {
    const existingModal = document.getElementById('confirmModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
      <div id="confirmModal" class="confirm-modal">
        <div class="confirm-modal-content">
          <div class="confirm-modal-icon ${isDanger ? 'danger' : ''}">
            <i data-lucide="${icon}" style="width: 32px; height: 32px;"></i>
          </div>
          <h3>${title}</h3>
          <p>${message}</p>
          <div class="confirm-modal-actions">
            <button class="btn-cancel" onclick="document.getElementById('confirmModal').remove()">Cancelar</button>
            <button class="btn-confirm ${isDanger ? 'danger' : ''}" id="btnConfirmAction">Confirmar</button>
          </div>
        </div>
      </div>`;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = document.getElementById('confirmModal');
    setTimeout(() => modal.classList.add('active'), 10);

    if (typeof lucide !== 'undefined') lucide.createIcons();

    document.getElementById('btnConfirmAction').onclick = () => {
      modal.remove();
      resolve(true);
    };

    modal.querySelector('.btn-cancel').onclick = () => {
      modal.remove();
      resolve(false);
    };

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(false);
      }
    });
  });
}


let allPagos = [];
let pagosStats = {};

async function loadPagosData(queryParams = '') {
  try {
    console.log('Cargando datos de pagos con query:', queryParams);
    const resp = await fetch(`${API_URL}/pagos${queryParams}`);
    console.log('Response status:', resp.status);
    
    const data = await resp.json();
    console.log('Datos recibidos:', data);
    
    allPagos = data.pagos || [];
    pagosStats = data.estadisticas || {};

    console.log('Pagos:', allPagos.length, 'Stats:', pagosStats);

    document.getElementById('metricTotalMes').textContent = parseFloat(pagosStats.total_mes || 0).toLocaleString('es-AR', {minimumFractionDigits: 2});
    document.getElementById('metricCobradas').textContent = pagosStats.cuotas_cobradas || 0;
    document.getElementById('metricPendientes').textContent = pagosStats.cuotas_pendientes || 0;
    document.getElementById('metricPromedio').textContent = parseFloat(pagosStats.promedio_pago || 0).toLocaleString('es-AR', {minimumFractionDigits: 0});

    const mediosPago = [...new Set(allPagos.map(p => p.medio_pago))];
    const selectMedio = document.getElementById('pagoFilterMedio');
    selectMedio.innerHTML = '<option value="">Todos</option>' + 
      mediosPago.map(m => `<option value="${m}">${m}</option>`).join('');

    renderPagosTable(allPagos);

    setupPagosFilters();

  } catch (error) {
    console.error('Error al cargar pagos:', error);
    document.getElementById('pagosTableBody').innerHTML = `
      <tr><td colspan="7" style="text-align: center; padding: 40px; color: #f44336;">
        Error al cargar los pagos
      </td></tr>`;
  }
}

function renderPagosTable(pagos) {
  const tbody = document.getElementById('pagosTableBody');
  
  if (pagos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 40px; color: #999;">No hay pagos para mostrar</td></tr>`;
    return;
  }

  tbody.innerHTML = pagos.map(p => {
    const estadoBadgeClass = {
      'en_proceso': 'warning',
      'pagado': 'success',
      'anulado': 'danger'
    };

    const estadoTexto = {
      'en_proceso': 'En Proceso',
      'pagado': 'Pagado',
      'anulado': 'Anulado'
    };

    const estado = p.estado_pago || 'en_proceso';
    const badgeClass = estadoBadgeClass[estado] || 'warning';
    const textoEstado = estadoTexto[estado] || estado;
    const archivado = p.archivado || 0;

    let botonesAccion = '';
    
    if (estado === 'en_proceso') {
      botonesAccion = `
        <button 
          class="btn-confirm-pago" 
          onclick="event.stopPropagation(); confirmarPago(${p.id_pago}, '${p.alumno}', '${p.concepto}')"
          title="Confirmar pago">
          <i data-lucide="check"></i>
        </button>
        <button 
          class="btn-delete-pago" 
          onclick="event.stopPropagation(); anularPago(${p.id_pago}, '${p.alumno}', '${p.concepto}')"
          title="Anular pago">
          <i data-lucide="trash-2"></i>
        </button>
      `;
    } else if (estado === 'pagado') {
      botonesAccion = `
        <button 
          class="btn-print-ticket" 
          onclick="event.stopPropagation(); generarComprobantePago(${p.id_pago})"
          title="Generar comprobante">
          <i data-lucide="file-text"></i>
        </button>
        <button 
          class="btn-delete-pago" 
          onclick="event.stopPropagation(); anularPago(${p.id_pago}, '${p.alumno}', '${p.concepto}')"
          title="Anular pago">
          <i data-lucide="trash-2"></i>
        </button>
      `;
    } else if (estado === 'anulado' && archivado === 0) {
      botonesAccion = `
        <button 
          class="btn-archive-pago" 
          onclick="event.stopPropagation(); archivarPago(${p.id_pago}, '${p.alumno}', '${p.concepto}')"
          title="Archivar pago">
          <i data-lucide="archive"></i>
        </button>
      `;
    } else if (estado === 'anulado' && archivado === 1) {
      const alumnoEscaped = p.alumno.replace(/'/g, "\\'");
      const conceptoEscaped = p.concepto.replace(/'/g, "\\'");
      
      botonesAccion = `
        <button 
          class="btn-unarchive-pago" 
          onclick="event.stopPropagation(); desarchivarPago(${p.id_pago}, '${alumnoEscaped}', '${conceptoEscaped}')"
          title="Devolver a pagos activos">
          <i data-lucide="archive-restore"></i>
        </button>
        <button 
          class="btn-delete-permanent" 
          onclick="event.stopPropagation(); eliminarPagoDefinitivamente(${p.id_pago}, '${alumnoEscaped}', '${conceptoEscaped}')"
          title="Eliminar permanentemente">
          <i data-lucide="x"></i>
        </button>
      `;
    }

    return `
      <tr>
        <td onclick="openPagoPanel(${p.id_alumno})" style="cursor: pointer;">
          <div style="font-weight: 600;">${p.alumno}</div>
          <div style="font-size: 12px; color: #999;">Legajo: ${p.legajo}</div>
        </td>
        <td onclick="openPagoPanel(${p.id_alumno})" style="cursor: pointer;">${p.concepto}</td>
        <td onclick="openPagoPanel(${p.id_alumno})" style="cursor: pointer;">${p.periodo || '-'}</td>
        <td onclick="openPagoPanel(${p.id_alumno})" style="cursor: pointer; font-weight: 600; color: #4caf50;">$${parseFloat(p.monto).toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
        <td onclick="openPagoPanel(${p.id_alumno})" style="cursor: pointer;">${p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString('es-AR') : '-'}</td>
        <td onclick="openPagoPanel(${p.id_alumno})" style="cursor: pointer;">${p.medio_pago}</td>
        <td onclick="openPagoPanel(${p.id_alumno})" style="cursor: pointer;">
          <span class="badge-estado ${badgeClass}">
            ${textoEstado}
          </span>
        </td>
        <td style="text-align: center;">
          ${botonesAccion}
        </td>
      </tr>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function switchPagosTab(tab) {
  document.querySelectorAll('.pagos-tab').forEach(t => {
    if (t.dataset.tab === tab) {
      t.classList.add('active');
      t.style.borderBottomColor = '#4a5259';
      t.style.color = '#4a5259';
    } else {
      t.classList.remove('active');
      t.style.borderBottomColor = 'transparent';
      t.style.color = '#666';
    }
  });

  const metricsContainer = document.getElementById('pagosMetrics');
  const filtersContainer = document.getElementById('pagosFilters');
  const tableContainer = document.getElementById('pagosTableContainer');
  const cuotasContainer = document.getElementById('cuotasGestionContainer');

  if (tab === 'cuotas') {
    if (metricsContainer) metricsContainer.style.display = 'none';
    if (filtersContainer) filtersContainer.style.display = 'none';
    if (tableContainer) tableContainer.style.display = 'none';
    if (cuotasContainer) {
      cuotasContainer.style.display = 'block';
      loadCuotasGestion();
    }
  } else {
    if (metricsContainer) metricsContainer.style.display = 'grid';
    if (filtersContainer) filtersContainer.style.display = 'flex';
    if (tableContainer) tableContainer.style.display = 'block';
    if (cuotasContainer) cuotasContainer.style.display = 'none';

    if (tab === 'archivo') {
      loadPagosData('?archivo=true');
    } else {
      loadPagosData();
    }
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setupPagosFilters() {
  const searchInput = document.getElementById('pagoSearchAlumno');
  const medioFilter = document.getElementById('pagoFilterMedio');

  if (searchInput) searchInput.addEventListener('input', filterPagos);
  if (medioFilter) medioFilter.addEventListener('change', filterPagos);
}

function filterPagos() {
  const searchTerm = document.getElementById('pagoSearchAlumno')?.value.toLowerCase() || '';
  const medioFilter = document.getElementById('pagoFilterMedio')?.value || '';

  const filtered = allPagos.filter(p => {
    const matchesSearch = 
      p.alumno.toLowerCase().includes(searchTerm) ||
      p.legajo.toLowerCase().includes(searchTerm) ||
      (p.concepto && p.concepto.toLowerCase().includes(searchTerm));
    
    const matchesMedio = !medioFilter || p.medio_pago === medioFilter;

    return matchesSearch && matchesMedio;
  });

  renderPagosTable(filtered);
}

function ensurePagoPanel() {
  if (document.getElementById('pagoPanel')) return;

  const panelHtml = `
    <div id="pagoPanel" class="pago-panel">
      <div class="pago-panel-header">
        <div class="pago-panel-alumno-info">
          <div class="pago-panel-avatar" id="pagoPanelAvatar">AA</div>
          <div class="pago-panel-details">
            <h2 id="pagoPanelNombre">Cargando...</h2>
            <p id="pagoPanelLegajo">Legajo: ---</p>
          </div>
        </div>
      </div>
      <div class="pago-panel-content" id="pagoPanelContent">
        <div style="text-align: center; padding: 40px; color: #999;">
          <i data-lucide="loader" style="width: 32px; height: 32px; animation: spin 1s linear infinite;"></i>
          <p>Cargando historial...</p>
        </div>
      </div>
    </div>`;

  document.body.insertAdjacentHTML('beforeend', panelHtml);

  const panel = document.getElementById('pagoPanel');
  
  document.addEventListener('click', (e) => {
    if (panel.classList.contains('active') && !panel.contains(e.target) && !e.target.closest('.pagos-table tbody tr')) {
      panel.classList.remove('active');
    }
  });
  
  let mouseLeaveTimeout;
  panel.addEventListener('mouseleave', () => {
    mouseLeaveTimeout = setTimeout(() => {
      panel.classList.remove('active');
    }, 500);
  });
  
  panel.addEventListener('mouseenter', () => {
    clearTimeout(mouseLeaveTimeout);
  });
}

async function openPagoPanel(idAlumno) {
  ensurePagoPanel();
  const panel = document.getElementById('pagoPanel');
  panel.classList.add('active');

  try {
    const [alumnoResp, pagosResp] = await Promise.all([
      fetch(`${API_URL}/alumnos/${idAlumno}`),
      fetch(`${API_URL}/pagos/alumno/${idAlumno}/historial`)
    ]);
    
    const alumno = await alumnoResp.json();
    const pagosData = await pagosResp.json();

    const historial = pagosData.pagos_realizados || [];
    const estado_cuenta = {
      total_pagado: pagosData.estadisticas?.total_pagado || 0,
      total_pagos: pagosData.estadisticas?.cantidad_pagos || 0,
      pagos_vencidos: pagosData.pagos_pendientes?.filter(p => p.estado === 'vencido').length || 0,
      ultimo_pago: historial.length > 0 ? historial[0].fecha_pago : null
    };

    const nombreCompleto = `${alumno.nombre} ${alumno.apellido}`;
    const iniciales = nombreCompleto.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
    document.getElementById('pagoPanelAvatar').textContent = iniciales;
    document.getElementById('pagoPanelNombre').textContent = nombreCompleto;
    document.getElementById('pagoPanelLegajo').textContent = `Legajo: ${alumno.legajo} • ${alumno.mail}`;

    const content = document.getElementById('pagoPanelContent');
    content.innerHTML = `
      <!-- Estado de Cuenta -->
      <div class="pago-section">
        <h3><i data-lucide="credit-card"></i> Estado de Cuenta</h3>
        <div class="estado-cuenta-grid">
          <div class="estado-cuenta-card highlight">
            <div class="estado-cuenta-label">Total Pagado</div>
            <div class="estado-cuenta-value">$${parseFloat(estado_cuenta.total_pagado || 0).toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
          </div>
          <div class="estado-cuenta-card">
            <div class="estado-cuenta-label">Pagos Realizados</div>
            <div class="estado-cuenta-value">${estado_cuenta.total_pagos || 0}</div>
          </div>
          <div class="estado-cuenta-card ${estado_cuenta.pagos_vencidos > 0 ? 'danger' : ''}">
            <div class="estado-cuenta-label">Pagos Vencidos</div>
            <div class="estado-cuenta-value">${estado_cuenta.pagos_vencidos || 0}</div>
          </div>
        </div>
        ${estado_cuenta.ultimo_pago ? `
          <p style="font-size: 13px; color: #666; margin-top: 12px;">
            Último pago: ${new Date(estado_cuenta.ultimo_pago).toLocaleDateString('es-AR', {year: 'numeric', month: 'long', day: 'numeric'})}
          </p>
        ` : '<p style="font-size: 13px; color: #999; margin-top: 12px;">Sin pagos registrados</p>'}
      </div>

      <!-- Historial de Pagos -->
      <div class="pago-section">
        <h3><i data-lucide="history"></i> Historial de Pagos (${historial.length})</h3>
        ${historial.length > 0 ? `
          <div class="historial-timeline">
            ${historial.map(h => `
              <div class="historial-item">
                <div class="historial-item-header">
                  <div class="historial-item-title">${h.concepto}</div>
                  <div class="historial-item-monto">$${parseFloat(h.monto).toLocaleString('es-AR', {minimumFractionDigits: 2})}</div>
                </div>
                <div class="historial-item-details">
                  <div class="historial-item-detail">
                    <i data-lucide="calendar"></i>
                    <span>${h.periodo || 'Sin periodo'}</span>
                  </div>
                  <div class="historial-item-detail">
                    <i data-lucide="credit-card"></i>
                    <span>${h.medio_pago}</span>
                  </div>
                  <div class="historial-item-detail">
                    <i data-lucide="check-circle"></i>
                    <span>${h.fecha_pago ? new Date(h.fecha_pago).toLocaleDateString('es-AR') : 'Pendiente'}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p style="text-align: center; color: #999; padding: 40px;">No hay historial de pagos</p>'}
      </div>
    `;

    if (typeof lucide !== 'undefined') lucide.createIcons();

  } catch (error) {
    console.error('Error al cargar panel de pago:', error);
    document.getElementById('pagoPanelContent').innerHTML = `
      <div style="text-align: center; padding: 40px; color: #f44336;">
        <i data-lucide="alert-circle" style="width: 32px; height: 32px;"></i>
        <p>Error al cargar el historial de pagos</p>
      </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

async function confirmarPago(idPago, nombreAlumno, concepto) {
  const confirmed = await showConfirm(
    '¿Confirmar pago?',
    `¿Estás seguro de confirmar el pago de <strong>${nombreAlumno}</strong>?<br>Concepto: ${concepto}<br><br>El estado cambiará a <strong>PAGADO</strong> y se registrará la fecha actual.`,
    'check',
    false
  );

  if (!confirmed) return;

  try {
    const resp = await fetch(`${API_URL}/pagos/${idPago}/confirmar`, {
      method: 'PUT'
    });

    const result = await resp.json();

    if (resp.ok && result.success) {
      showToast('Pago confirmado correctamente', 'success');
      await loadPagosData();
    } else {
      showToast(result.message || 'Error al confirmar pago', 'error');
    }
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    showToast('Error al confirmar pago', 'error');
  }
}

async function anularPago(idPago, nombreAlumno, concepto) {
  const confirmed = await showConfirm(
    '¿Anular pago?',
    `¿Estás seguro de anular el pago de <strong>${nombreAlumno}</strong>?<br>Concepto: ${concepto}<br><br>El estado cambiará a <strong>ANULADO</strong> y se conservará en el registro.`,
    'trash-2',
    true
  );

  if (!confirmed) return;

  try {
    const resp = await fetch(`${API_URL}/pagos/${idPago}/anular`, {
      method: 'PUT'
    });

    const result = await resp.json();

    if (resp.ok && result.success) {
      showToast('Pago anulado correctamente', 'success');
      await loadPagosData();
    } else {
      showToast(result.message || 'Error al anular pago', 'error');
    }
  } catch (error) {
    console.error('Error al anular pago:', error);
    showToast('Error al anular pago', 'error');
  }
}

async function archivarPago(idPago, nombreAlumno, concepto) {
  const confirmed = await showConfirm(
    '¿Archivar pago?',
    `¿Estás seguro de archivar el pago anulado de <strong>${nombreAlumno}</strong>?<br>Concepto: ${concepto}<br><br>Se moverá a la pestaña de <strong>ARCHIVO</strong>.`,
    'archive',
    false
  );

  if (!confirmed) return;

  try {
    const resp = await fetch(`${API_URL}/pagos/${idPago}/archivar`, {
      method: 'PUT'
    });

    const result = await resp.json();

    if (resp.ok && result.success) {
      showToast('Pago archivado correctamente', 'success');
      await loadPagosData();
    } else {
      showToast(result.message || 'Error al archivar pago', 'error');
    }
  } catch (error) {
    console.error('Error al archivar pago:', error);
    showToast('Error al archivar pago', 'error');
  }
}

async function desarchivarPago(idPago, nombreAlumno, concepto) {
  const confirmed = await showConfirm(
    '¿Devolver a pagos activos?',
    `¿Estás seguro de devolver el pago de <strong>${nombreAlumno}</strong> a pagos activos?<br>Concepto: ${concepto}<br><br>Mantendrá su estado de <strong>ANULADO</strong>.`,
    'archive',
    false
  );

  if (!confirmed) return;

  try {
    const resp = await fetch(`${API_URL}/pagos/${idPago}/desarchivar`, {
      method: 'PUT'
    });

    const result = await resp.json();

    if (resp.ok && result.success) {
      showToast('Pago devuelto a pagos activos', 'success');
      await loadPagosData('?archivo=true');
    } else {
      showToast(result.message || 'Error al desarchivar pago', 'error');
    }
  } catch (error) {
    console.error('Error al desarchivar pago:', error);
    showToast('Error al desarchivar pago', 'error');
  }
}

async function eliminarPagoDefinitivamente(idPago, nombreAlumno, concepto) {
  const result = await Swal.fire({
    title: '️ ELIMINAR PERMANENTEMENTE',
    html: `
      <div style="text-align: left; margin: 20px 0;">
        <p style="font-size: 15px; margin-bottom: 15px;">
          Estás a punto de <strong style="color: #f44336;">eliminar permanentemente</strong> el siguiente registro:
        </p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Alumno:</strong> ${nombreAlumno}</p>
          <p style="margin: 5px 0;"><strong>Concepto:</strong> ${concepto}</p>
        </div>
        <p style="color: #f44336; font-weight: 600; margin-top: 15px;">
          ️ Esta acción NO se puede deshacer
        </p>
        <p style="font-size: 14px; color: #666; margin-top: 10px;">
          El registro será eliminado completamente de la base de datos.
        </p>
      </div>
    `,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#999',
    confirmButtonText: 'Sí, eliminar permanentemente',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    customClass: {
      popup: 'swal2-popup-large'
    }
  });

  if (!result.isConfirmed) return;

  try {
    console.log('Eliminando pago ID:', idPago);
    const resp = await fetch(`${API_URL}/pagos/${idPago}`, {
      method: 'DELETE'
    });

    console.log('DELETE Response status:', resp.status);
    const data = await resp.json();
    console.log('DELETE Response data:', data);

    if (resp.ok && data.success) {
      showToast('Pago eliminado permanentemente', 'success');
      window.currentPagosTab = 'archivo';
      await loadPagosData('?archivo=true');
      switchPagosTab('archivo');
    } else {
      showToast(data.message || 'Error al eliminar pago', 'error');
    }
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    showToast('Error al eliminar pago', 'error');
  }
}

async function openRegistrarPagoModal() {
  try {
    const responseInscripciones = await fetch(`${API_URL}/inscripciones`);
    const todasInscripciones = await responseInscripciones.json();
    
    if (!todasInscripciones || todasInscripciones.length === 0) {
      showToast('No hay alumnos con cursos activos', 'warning');
      return;
    }

    const alumnosConCursos = [...new Map(
      todasInscripciones
        .filter(insc => insc.estado === 'activo')
        .map(insc => [insc.id_alumno, insc.alumno])
    ).entries()].map(([id, nombre]) => ({ id_alumno: id, nombre_completo: nombre }));

    if (alumnosConCursos.length === 0) {
      showToast('No hay alumnos con cursos activos', 'warning');
      return;
    }

    const alumnosOptions = alumnosConCursos.map(alumno => 
      `<option value="${alumno.id_alumno}">${alumno.nombre_completo}</option>`
    ).join('');

    const { value: formValues } = await Swal.fire({
      title: '<div style="text-align: center; align-items: center; gap: 12px;"><i class="lucide-credit-card" style="width: 28px; height: 28px; color: #4a5259;"></i> Registrar Pago Manual</div>',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 400; color: #1e1e1e; padding-bottom: 10px; text-align: left;">
              <i class="lucide-user" style="width: 16px; height: 16px;"></i> Alumno
            </label>
            <select id="swal-alumno" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="">Seleccionar alumno...</option>
              ${alumnosOptions}
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 400; color: #1e1e1e; padding-bottom: 10px; text-align: left;">
              <i class="lucide-book-open" style="width: 16px; height: 16px;"></i> Curso
            </label>
            <select id="swal-curso" class="swal2-input" style="width: 100%; margin: 0;" disabled>
              <option value="">Primero selecciona un alumno</option>
            </select>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 400; color: #1e1e1e; padding-bottom: 10px; text-align: left;">
              <i class="lucide-calendar" style="width: 16px; height: 16px;"></i> Mes de Cuota
            </label>
            <select id="swal-mes" class="swal2-input" style="width: 100%; margin: 0;" disabled>
              <option value="">Primero selecciona un curso</option>
            </select>
            <div id="meses-pagados-info" style="margin-top: 8px; font-size: 12px;"></div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 400; color: #1e1e1e; padding-bottom: 10px; text-align: left;">
              <i class="lucide-dollar-sign" style="width: 16px; height: 16px;"></i> Monto
            </label>
            <input id="swal-monto" type="number" class="swal2-input" placeholder="Ej: 15000" style="width: 100%; margin: 0;" step="0.01">
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; font-weight: 400; color: #1e1e1e; padding-bottom: 10px; text-align: left;">
              <i class="lucide-wallet" style="width: 16px; height: 16px;"></i> Medio de Pago
            </label>
            <select id="swal-medio-pago" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Tarjeta de Débito">Tarjeta de Débito</option>
            </select>
          </div>

          <div style="background: #f0f1f2; border-left: 4px solid #4a5259; padding: 12px; border-radius: 4px; margin-top: 20px;">
            <p style="margin: 0; font-size: 13px; color: #494947;">
              <i class="lucide-info" style="width: 14px; height: 14px;"></i> 
              Este pago se registrará como pagado en la fecha actual
            </p>
          </div>
        </div>
      `,
      width: '600px',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '<i class="lucide-check" style="width: 16px; height: 16px;"></i> Registrar Pago',
      cancelButtonText: '<i class="lucide-x" style="width: 16px; height: 16px;"></i> Cancelar',
      confirmButtonColor: '#4a5259',
      cancelButtonColor: '#6b7280',
      didOpen: () => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }

        const alumnoSelect = document.getElementById('swal-alumno');
        const cursoSelect = document.getElementById('swal-curso');
        const mesSelect = document.getElementById('swal-mes');
        const montoInput = document.getElementById('swal-monto');
        const mesesPagadosInfo = document.getElementById('meses-pagados-info');

        let pagosPorCurso = {}; // Guardar pagos ya realizados por curso

        alumnoSelect.addEventListener('change', async (e) => {
          const idAlumno = e.target.value;
          
          if (!idAlumno) {
            cursoSelect.innerHTML = '<option value="">Primero selecciona un alumno</option>';
            cursoSelect.disabled = true;
            mesSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
            mesSelect.disabled = true;
            montoInput.value = '';
            mesesPagadosInfo.innerHTML = '';
            return;
          }

          try {
            cursoSelect.innerHTML = '<option value="">Cargando cursos...</option>';
            cursoSelect.disabled = true;

            const response = await fetch(`${API_URL}/inscripciones/alumno/${idAlumno}`);
            const inscripciones = await response.json();

            if (!inscripciones || inscripciones.length === 0) {
              cursoSelect.innerHTML = '<option value="">Este alumno no tiene cursos</option>';
              cursoSelect.disabled = true;
              return;
            }

            const cursosActivos = inscripciones.filter(i => i.estado === 'activo');

            if (cursosActivos.length === 0) {
              cursoSelect.innerHTML = '<option value="">No hay cursos activos</option>';
              cursoSelect.disabled = true;
              return;
            }

            const responsePagos = await fetch(`${API_URL}/pagos/alumno/${idAlumno}`);
            const datosPagos = await responsePagos.json();

            pagosPorCurso = {};
            if (datosPagos.cursos) {
              datosPagos.cursos.forEach(curso => {
                const mesesPagados = curso.meses
                  .filter(m => m.estado === 'pagado')
                  .map(m => m.mes);
                pagosPorCurso[curso.id_curso] = mesesPagados;
                console.log(`Curso ${curso.id_curso} - Meses pagados:`, mesesPagados);
              });
            }

            cursoSelect.innerHTML = '<option value="">Seleccionar curso...</option>' + 
              cursosActivos.map(insc => 
                `<option value="${insc.id_curso}" data-monto="${insc.costo_mensual}">
                  ${insc.idioma} ${insc.nivel}
                </option>`
              ).join('');
            cursoSelect.disabled = false;

          } catch (error) {
            console.error('Error al cargar cursos:', error);
            cursoSelect.innerHTML = '<option value="">Error al cargar cursos</option>';
          }
        });

        cursoSelect.addEventListener('change', async (e) => {
          const idCurso = e.target.value;
          const selectedOption = e.target.options[e.target.selectedIndex];
          const monto = selectedOption.dataset.monto;
          
          if (!idCurso) {
            mesSelect.innerHTML = '<option value="">Primero selecciona un curso</option>';
            mesSelect.disabled = true;
            mesesPagadosInfo.innerHTML = '';
            montoInput.value = '';
            return;
          }

          let cuotasHabilitadas = [];
          try {
            const respCuotas = await fetch(`${API_URL}/cursos/${idCurso}/cuotas`);
            const dataCuotas = await respCuotas.json();
            cuotasHabilitadas = dataCuotas.cuotasHabilitadas || [];
            console.log(`Cuotas habilitadas para curso ${idCurso}:`, cuotasHabilitadas);
          } catch (error) {
            console.error('Error al obtener cuotas habilitadas:', error);
            cuotasHabilitadas = ['Matricula', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'];
          }

          const mesesPagados = pagosPorCurso[idCurso] || [];
          console.log(`Curso seleccionado: ${idCurso}, Meses pagados:`, mesesPagados);
          
          const todosMeses = ['Matricula', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'];
          
          const mesesNoHabilitados = todosMeses.filter(mes => !cuotasHabilitadas.includes(mes));
          const hayAlgunMesDisponible = todosMeses.some(mes => cuotasHabilitadas.includes(mes) && !mesesPagados.includes(mes));
          
          if (!hayAlgunMesDisponible) {
            mesSelect.innerHTML = '<option value="">No hay cuotas disponibles para este curso</option>';
            mesSelect.disabled = true;
            
            if (mesesPagados.length === todosMeses.length) {
              mesesPagadosInfo.innerHTML = '<div style="color: #43a047; background: #e8f5e9; padding: 8px; border-radius: 4px;"><i class="lucide-check-circle" style="width: 14px; height: 14px;"></i>  Todas las cuotas de este curso están pagadas</div>';
            } else if (cuotasHabilitadas.length === 0) {
              mesesPagadosInfo.innerHTML = '<div style="color: #f57c00; background: #fff3e0; padding: 8px; border-radius: 4px;"><i class="lucide-alert-circle" style="width: 14px; height: 14px;"></i> Este curso no tiene cuotas habilitadas</div>';
            } else {
              mesesPagadosInfo.innerHTML = '<div style="color: #43a047; background: #e8f5e9; padding: 8px; border-radius: 4px;"><i class="lucide-check-circle" style="width: 14px; height: 14px;"></i> Todas las cuotas habilitadas están pagadas</div>';
            }
          } else {
            const opciones = todosMeses.map(mes => {
              const yaPagado = mesesPagados.includes(mes);
              const noHabilitado = !cuotasHabilitadas.includes(mes);
              const disabled = yaPagado || noHabilitado;
              
              let label = mes;
              if (yaPagado) label += ' (Ya pagado)';
              else if (noHabilitado) label += ' (No habilitado)';
              
              return `<option value="${mes}" ${disabled ? 'disabled' : ''} style="${disabled ? 'color: #999; background: #f5f5f5;' : ''}">${label}</option>`;
            }).join('');
            
            mesSelect.innerHTML = '<option value="">Seleccionar mes...</option>' + opciones;
            mesSelect.disabled = false;
            
            const infoParts = [];
            if (mesesPagados.length > 0) {
              infoParts.push(`<div style="color: #1565c0; background: #f0f1f2; padding: 8px; border-radius: 4px; margin-bottom: 4px;">
                <i class="lucide-check" style="width: 14px; height: 14px;"></i> Ya pagado: ${mesesPagados.join(', ')}
              </div>`);
            }
            if (mesesNoHabilitados.length > 0) {
              infoParts.push(`<div style="color: #f57c00; background: #fff3e0; padding: 8px; border-radius: 4px;">
                <i class="lucide-lock" style="width: 14px; height: 14px;"></i> No habilitado: ${mesesNoHabilitados.join(', ')}
              </div>`);
            }
            if (infoParts.length === 0) {
              infoParts.push('<div style="color: #757575;">Todas las cuotas están disponibles</div>');
            }
            mesesPagadosInfo.innerHTML = infoParts.join('');
          }

          if (monto) {
            montoInput.value = monto;
          }

          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          }
        });
      },
      preConfirm: () => {
        const idAlumno = document.getElementById('swal-alumno').value;
        const idCurso = document.getElementById('swal-curso').value;
        const mesCuota = document.getElementById('swal-mes').value;
        const monto = document.getElementById('swal-monto').value;
        const medioPago = document.getElementById('swal-medio-pago').value;

        if (!idAlumno) {
          Swal.showValidationMessage('Selecciona un alumno');
          return false;
        }
        if (!idCurso) {
          Swal.showValidationMessage('Selecciona un curso');
          return false;
        }
        if (!mesCuota) {
          Swal.showValidationMessage('Selecciona el mes de cuota');
          return false;
        }
        if (!monto || parseFloat(monto) <= 0) {
          Swal.showValidationMessage('Ingresa un monto válido');
          return false;
        }
        if (!medioPago) {
          Swal.showValidationMessage('Selecciona un medio de pago');
          return false;
        }

        return {
          id_alumno: parseInt(idAlumno),
          id_curso: parseInt(idCurso),
          mes_cuota: mesCuota,
          monto: parseFloat(monto),
          medio_pago: medioPago
        };
      }
    });

    if (formValues) {
      try {
        Swal.fire({
          title: 'Registrando pago...',
          html: '<i class="lucide-loader" style="width: 48px; height: 48px; animation: spin 1s linear infinite;"></i>',
          showConfirmButton: false,
          allowOutsideClick: false
        });

        const response = await fetch(`${API_URL}/pagos/realizar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formValues)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          await Swal.fire({
            icon: 'success',
            title: '¡Pago Registrado!',
            html: `
              <div style="text-align: left; padding: 20px;">
                <p style="margin: 0 0 12px 0;"><strong>Comprobante:</strong> ${data.comprobante.numero}</p>
                <p style="margin: 0 0 12px 0;"><strong>Monto:</strong> $${parseFloat(data.comprobante.monto).toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
                <p style="margin: 0 0 12px 0;"><strong>Detalle:</strong> ${data.comprobante.detalle}</p>
                <p style="margin: 0 0 12px 0;"><strong>Mes:</strong> ${data.comprobante.mes_cuota}</p>
                <p style="margin: 0;"><strong>Fecha:</strong> ${new Date(data.comprobante.fecha).toLocaleDateString('es-ES')}</p>
              </div>
            `,
            confirmButtonColor: '#4a5259'
          });

          await loadPagosData();
          
          const panel = document.getElementById('pagoPanel');
          if (panel && panel.classList.contains('active')) {
            await openPagoPanel(formValues.id_alumno);
          }
        } else {
          throw new Error(data.message || 'Error al registrar el pago');
        }
      } catch (error) {
        console.error('Error al registrar pago:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'No se pudo registrar el pago',
          confirmButtonColor: '#4a5259'
        });
      }
    }
  } catch (error) {
    console.error('Error al abrir modal:', error);
    showToast('Error al cargar datos', 'error');
  }
}

async function openNuevaAulaModal() {
  const { value: formValues } = await Swal.fire({
    title: 'Nueva Aula',
    html: `
      <div style="text-align: left;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nombre del Aula</label>
          <input id="nombre_aula" class="swal2-input" placeholder="Ej: Aula 101" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Capacidad</label>
          <input id="capacidad" type="number" class="swal2-input" placeholder="Ej: 30" style="width: 100%; margin: 0;">
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Crear',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    preConfirm: () => {
      const nombre = document.getElementById('nombre_aula').value;
      const capacidad = document.getElementById('capacidad').value;
      
      if (!nombre) {
        Swal.showValidationMessage('El nombre es obligatorio');
        return false;
      }
      if (!capacidad || capacidad < 1) {
        Swal.showValidationMessage('La capacidad debe ser mayor a 0');
        return false;
      }
      return { nombre, capacidad };
    }
  });

  if (formValues) {
    try {
      const res = await fetch(`${API_URL}/aulas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_aula: formValues.nombre,
          capacidad: formValues.capacidad
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Creada!', 'Aula creada exitosamente', 'success');
        document.getElementById('btnAulas').click();
      } else {
        Swal.fire('Error', data.message || 'Error al crear aula', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function editarAula(id, nombre, capacidad) {
  const { value: formValues } = await Swal.fire({
    title: 'Editar Aula',
    html: `
      <div style="text-align: left;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nombre del Aula</label>
          <input id="nombre_aula" class="swal2-input" value="${nombre}" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Capacidad</label>
          <input id="capacidad" type="number" class="swal2-input" value="${capacidad}" style="width: 100%; margin: 0;">
        </div>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    preConfirm: () => {
      const nombre = document.getElementById('nombre_aula').value;
      const capacidad = document.getElementById('capacidad').value;
      
      if (!nombre) {
        Swal.showValidationMessage('El nombre es obligatorio');
        return false;
      }
      if (!capacidad || capacidad < 1) {
        Swal.showValidationMessage('La capacidad debe ser mayor a 0');
        return false;
      }
      return { nombre, capacidad };
    }
  });

  if (formValues) {
    try {
      const res = await fetch(`${API_URL}/aulas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_aula: formValues.nombre,
          capacidad: formValues.capacidad
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Actualizada!', 'Aula actualizada exitosamente', 'success');
        document.getElementById('btnAulas').click();
      } else {
        Swal.fire('Error', data.message || 'Error al actualizar aula', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function eliminarAula(id, nombre) {
  const result = await Swal.fire({
    title: '¿Eliminar aula?',
    html: `¿Estás seguro de eliminar el aula <strong>${nombre}</strong>?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/aulas/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Eliminada!', 'Aula eliminada exitosamente', 'success');
        document.getElementById('btnAulas').click();
      } else {
        Swal.fire('Error', data.message || 'Error al eliminar aula', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function openNuevoIdiomaModal() {
  const { value: nombre } = await Swal.fire({
    title: 'Nuevo Idioma',
    input: 'text',
    inputLabel: 'Nombre del idioma',
    inputPlaceholder: 'Ej: Inglés',
    showCancelButton: true,
    confirmButtonText: 'Crear',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    inputValidator: (value) => {
      if (!value) {
        return 'El nombre es obligatorio';
      }
    }
  });

  if (nombre) {
    try {
      const res = await fetch(`${API_URL}/idiomas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_idioma: nombre })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Creado!', 'Idioma creado exitosamente', 'success');
        document.getElementById('btnIdiomas').click();
      } else {
        Swal.fire('Error', data.message || 'Error al crear idioma', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function editarIdioma(id, nombreActual) {
  const { value: nombre } = await Swal.fire({
    title: 'Editar Idioma',
    input: 'text',
    inputLabel: 'Nombre del idioma',
    inputValue: nombreActual,
    showCancelButton: true,
    confirmButtonText: 'Guardar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    inputValidator: (value) => {
      if (!value) {
        return 'El nombre es obligatorio';
      }
    }
  });

  if (nombre) {
    try {
      const res = await fetch(`${API_URL}/idiomas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre_idioma: nombre })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Actualizado!', 'Idioma actualizado exitosamente', 'success');
        document.getElementById('btnIdiomas').click();
      } else {
        Swal.fire('Error', data.message || 'Error al actualizar idioma', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function eliminarIdioma(id, nombre) {
  const result = await Swal.fire({
    title: '¿Eliminar idioma?',
    html: `¿Estás seguro de eliminar el idioma <strong>${nombre}</strong>?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/idiomas/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Eliminado!', 'Idioma eliminado exitosamente', 'success');
        document.getElementById('btnIdiomas').click();
      } else {
        Swal.fire('Error', data.message || 'Error al eliminar idioma', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function openNuevaInscripcionModal() {
  try {
    const [alumnosRes, cursosRes] = await Promise.all([
      fetch(`${API_URL}/alumnos`),
      fetch(`${API_URL}/cursos`)
    ]);
    
    const alumnos = await alumnosRes.json();
    const cursos = await cursosRes.json();
    
    const { value: formValues } = await Swal.fire({
      title: 'Nueva Inscripción',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Seleccionar Alumno</label>
            <select id="id_alumno" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="">-- Seleccione un alumno --</option>
              ${alumnos.map(a => `<option value="${a.id_alumno}">${a.nombre} ${a.apellido} (${a.legajo})</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 600;">Seleccionar Curso</label>
            <select id="id_curso" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="">-- Seleccione un curso --</option>
              ${cursos.map(c => `<option value="${c.id_curso}">${c.nombre_curso} - ${c.nombre_idioma || 'Sin idioma'}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Inscribir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4a5259',
      preConfirm: () => {
        const id_alumno = document.getElementById('id_alumno').value;
        const id_curso = document.getElementById('id_curso').value;
        
        if (!id_alumno) {
          Swal.showValidationMessage('Debe seleccionar un alumno');
          return false;
        }
        if (!id_curso) {
          Swal.showValidationMessage('Debe seleccionar un curso');
          return false;
        }
        return { id_alumno, id_curso };
      }
    });

    if (formValues) {
      const res = await fetch(`${API_URL}/inscripciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Inscrito!', 'Alumno inscrito exitosamente', 'success');
        document.getElementById('btnInscripciones').click();
      } else {
        Swal.fire('Error', data.message || 'Error al inscribir alumno', 'error');
      }
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
  }
}

async function eliminarInscripcion(id, alumno, curso) {
  const result = await Swal.fire({
    title: '¿Eliminar inscripción?',
    html: `¿Estás seguro de eliminar la inscripción de <strong>${alumno}</strong> al curso <strong>${curso}</strong>?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/inscripciones/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Eliminada!', 'Inscripción eliminada exitosamente', 'success');
        document.getElementById('btnInscripciones').click();
      } else {
        Swal.fire('Error', data.message || 'Error al eliminar inscripción', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function openNuevoAlumnoModal() {
  const { value: formValues } = await Swal.fire({
    title: 'Nuevo Alumno',
    html: `
      <div style="text-align: left;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nombre</label>
          <input id="nombre" class="swal2-input" placeholder="Nombre" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Apellido</label>
          <input id="apellido" class="swal2-input" placeholder="Apellido" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">DNI</label>
          <input id="dni" class="swal2-input" placeholder="Ej: 12345678" maxlength="8" oninput="this.value=this.value.replace(/[^0-9]/g,'')" pattern="[0-9]*" inputmode="numeric" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Email</label>
          <input id="mail" type="email" class="swal2-input" placeholder="email@ejemplo.com" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Legajo</label>
          <input id="legajo" class="swal2-input" placeholder="Ej: A0001" oninput="this.value=this.value.replace(/[^a-zA-Z0-9]/g,'').toUpperCase()" pattern="[A-Z0-9]*" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Teléfono</label>
          <input id="telefono" type="tel" class="swal2-input" placeholder="Ej: 1234567890" oninput="this.value=this.value.replace(/[^0-9]/g,'')" pattern="[0-9]*" inputmode="numeric" style="width: 100%; margin: 0;">
        </div>
      </div>
    `,
    width: '500px',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Crear',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    preConfirm: () => {
      const nombre = document.getElementById('nombre').value;
      const apellido = document.getElementById('apellido').value;
      const dni = document.getElementById('dni').value;
      const mail = document.getElementById('mail').value;
      const legajo = document.getElementById('legajo').value;
      const telefono = document.getElementById('telefono').value;
      
      if (!nombre) {
        Swal.showValidationMessage('El nombre es obligatorio');
        return false;
      }
      if (!apellido) {
        Swal.showValidationMessage('El apellido es obligatorio');
        return false;
      }
      if (!dni) {
        Swal.showValidationMessage('El DNI es obligatorio');
        return false;
      }
      if (!mail) {
        Swal.showValidationMessage('El email es obligatorio');
        return false;
      }
      if (!legajo) {
        Swal.showValidationMessage('El legajo es obligatorio');
        return false;
      }
      if (!telefono) {
        Swal.showValidationMessage('El teléfono es obligatorio');
        return false;
      }
      return { nombre, apellido, dni, mail, legajo, telefono };
    }
  });

  if (formValues) {
    try {
      const res = await fetch(`${API_URL}/alumnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        const idAlumno = data.id_alumno;
        const nombreCompleto = `${formValues.nombre} ${formValues.apellido}`;
        
        await Swal.fire({
          icon: 'success',
          title: '¡Alumno creado!',
          text: `${nombreCompleto} ha sido registrado exitosamente`,
          timer: 1500,
          showConfirmButton: false
        });

        await crearCredencialesAlumno(idAlumno, nombreCompleto);
        
        document.getElementById('btnAlumnos').click();
      } else {
        Swal.fire('Error', data.message || 'Error al crear alumno', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function crearCredencialesAlumno(idAlumno, nombreCompleto) {
  const { value: credenciales } = await Swal.fire({
    title: 'Crear Credenciales de Acceso',
    html: `
      <div style="text-align: left;">
        <p style="margin-bottom: 20px; color: #666;">
          Crea las credenciales de acceso para <strong>${nombreCompleto}</strong>
        </p>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Usuario</label>
          <input id="username" class="swal2-input" placeholder="Nombre de usuario" style="width: 100%; margin: 0;">
          <small style="color: #999; font-size: 12px;">Este será el usuario para iniciar sesión</small>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Contraseña</label>
          <input id="password" type="password" class="swal2-input" placeholder="Contraseña" style="width: 100%; margin: 0;">
          <small style="color: #999; font-size: 12px;">Mínimo 6 caracteres</small>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Confirmar Contraseña</label>
          <input id="password2" type="password" class="swal2-input" placeholder="Confirmar contraseña" style="width: 100%; margin: 0;">
        </div>
      </div>
    `,
    width: '500px',
    focusConfirm: false,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: 'Crear Credenciales',
    denyButtonText: 'Omitir (crear después)',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    preConfirm: () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const password2 = document.getElementById('password2').value;
      
      if (!username || !password || !password2) {
        Swal.showValidationMessage('Todos los campos son obligatorios');
        return false;
      }
      
      if (password.length < 6) {
        Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
      
      if (password !== password2) {
        Swal.showValidationMessage('Las contraseñas no coinciden');
        return false;
      }
      
      return { username, password };
    }
  });

  if (credenciales) {
    try {
      const res = await fetch(`${API_URL}/alumnos/${idAlumno}/credenciales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Credenciales creadas!',
          html: `
            <p>Las credenciales de acceso han sido creadas exitosamente.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 5px 0;"><strong>Usuario:</strong> ${credenciales.username}</p>
              <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${credenciales.password}</p>
            </div>
            <p style="color: #999; font-size: 13px; margin-top: 15px;">
              ️ Guarda estas credenciales de forma segura
            </p>
          `,
          confirmButtonColor: '#4a5259'
        });
      } else {
        Swal.fire('Error', data.message || 'Error al crear credenciales', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudieron crear las credenciales', 'error');
    }
  }
}


async function editarAlumno(id) {
  try {
    const res = await fetch(`${API_URL}/alumnos/${id}`);
    const alumno = await res.json();
    
    const { value: formValues, isDenied } = await Swal.fire({
      title: 'Editar Alumno',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nombre</label>
            <input id="nombre" class="swal2-input" value="${alumno.nombre}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Apellido</label>
            <input id="apellido" class="swal2-input" value="${alumno.apellido}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Email</label>
            <input id="mail" type="email" class="swal2-input" value="${alumno.mail}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">DNI</label>
            <input id="dni" class="swal2-input" placeholder="Ej: 12345678" maxlength="8" oninput="this.value=this.value.replace(/[^0-9]/g,'')" pattern="[0-9]*" inputmode="numeric" value="${alumno.dni || ''}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Legajo</label>
            <input id="legajo" class="swal2-input" placeholder="Ej: A0001" oninput="this.value=this.value.replace(/[^a-zA-Z0-9]/g,'').toUpperCase()" pattern="[A-Z0-9]*" value="${alumno.legajo}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Teléfono</label>
            <input id="telefono" type="tel" class="swal2-input" oninput="this.value=this.value.replace(/[^0-9]/g,'')" pattern="[0-9]*" inputmode="numeric" value="${alumno.telefono || ''}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Estado</label>
            <select id="estado" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="activo" ${alumno.estado === 'activo' ? 'selected' : ''}>Activo</option>
              <option value="inactivo" ${alumno.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
            </select>
          </div>
        </div>
      `,
      width: '500px',
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Guardar',
      denyButtonText: '<i data-lucide="key"></i> Editar Credenciales',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4a5259',
      denyButtonColor: '#6b7280',
      didOpen: () => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      },
      preConfirm: () => {
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const mail = document.getElementById('mail').value.trim();
        const dni = document.getElementById('dni').value.trim();
        const legajo = document.getElementById('legajo').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const estado = document.getElementById('estado').value;
        
        if (!nombre || !apellido || !mail || !dni || !legajo || !telefono) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        return { nombre, apellido, mail, dni, legajo, telefono, estado };
      }
    });

    if (isDenied) {
      await abrirModalCredencialesAlumno(id);
      return;
    }

    if (formValues) {
      const updateRes = await fetch(`${API_URL}/alumnos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      
      const data = await updateRes.json();
      
      if (updateRes.ok && data.success) {
        await Swal.fire('¡Listo!', 'Alumno actualizado correctamente', 'success');
        document.getElementById('btnAlumnos').click();
      } else {
        Swal.fire('Error', data.message || 'Error al actualizar alumno', 'error');
      }
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
  }
}

async function abrirModalCredencialesAlumno(idAlumno) {
  try {
    const resp = await fetch(`${API_URL}/alumnos/${idAlumno}`);
    const alumno = await resp.json();
    
    let usuarioActual = '';
    let passwordActual = '';
    let tienePassword = false;
    try {
      const respUsuario = await fetch(`${API_URL}/auth/usuario-classroom/${alumno.id_persona}`);
      if (respUsuario.ok) {
        const usuario = await respUsuario.json();
        usuarioActual = usuario.username || '';
        passwordActual = usuario.password_plain || '';
        tienePassword = usuario.password_plain ? true : false;
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }

    let accessKeyActual = '';
    try {
      const respAccessKey = await fetch(`${API_URL}/alumnos/${idAlumno}/access-key`);
      if (respAccessKey.ok) {
        const dataKey = await respAccessKey.json();
        accessKeyActual = dataKey.access_key || '';
      }
    } catch (error) {
      console.error('Error al cargar access key:', error);
    }

    const result = await Swal.fire({
      title: 'Editar Credenciales',
      html: `
        <div style="text-align: left;">
          <div style="background: #f5f5f7; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #4a5259;">
            <p style="margin: 0; font-size: 13px; color: #4a5259;">
              Estas credenciales se usan para <strong>Dashboard y Classroom</strong>
            </p>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">
              Usuario <span style="color: #9ca3af; font-weight: 400;">(actual: ${usuarioActual})</span>
            </label>
            <input type="text" id="usuarioAlumno" value="${usuarioActual}" 
                   onfocus="if(this.value === '${usuarioActual}') this.value = '';"
                   style="width: 100%; padding: 10px; border: 1px solid #d1d5db; border-radius: 6px; font-family: 'Courier New', monospace; font-size: 14px; color: #9ca3af;">
          </div>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px;">
              Contrasena <span style="color: #9ca3af; font-weight: 400;">(actual: ${passwordActual || 'sin configurar'})</span>
            </label>
            <div style="position: relative;">
              <input type="text" id="passwordAlumno" value="${passwordActual}"
                     onfocus="if(this.value === '${passwordActual}') this.value = '';"
                     style="width: 100%; padding: 10px 40px 10px 10px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-size: 14px; color: #9ca3af;">
              <button type="button" id="togglePasswordAlumno" 
                      style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px;">
                <i data-lucide="eye" style="width: 20px; height: 20px; color: #6b7280;"></i>
              </button>
            </div>
            <p style="font-size: 11px; color: #6b7280; margin-top: 4px;">
              Deja vacio para mantener la contrasena actual
            </p>
          </div>

          <!-- CEMIKEY -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 16px; border-radius: 10px; margin-bottom: 16px; border: 1px solid #fbbf24;">
            <h4 style="margin: 0 0 12px 0; font-size: 14px; color: #92400e; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="key" style="width: 18px; height: 18px;"></i>
              Clave de Acceso (CemiKey)
            </h4>
            
            <div style="position: relative;">
              <input type="text" id="accessKeyAlumno" value="${accessKeyActual}"
                     placeholder="Ingresa una clave de acceso..."
                     style="width: 100%; padding: 10px 40px 10px 10px; border: 1px solid #fbbf24; border-radius: 6px; box-sizing: border-box; background: white; font-size: 14px;">
              <button type="button" id="clearAccessKeyAlumno" 
                      style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; color: #b45309;"
                      title="Limpiar clave">
                <i data-lucide="x" style="width: 18px; height: 18px;"></i>
              </button>
            </div>
            <p style="font-size: 11px; color: #92400e; margin-top: 6px;">
              Esta clave permite acceso directo sin usuario/contrasena. Deja vacio para eliminar.
            </p>
          </div>

          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 14px 16px; border-radius: 10px; border: 1px solid #86efac; margin-top: 16px;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; margin: 0;">
              <input type="checkbox" id="enviarEmailAlumno" 
                     style="width: 18px; height: 18px; accent-color: #22c55e; cursor: pointer;">
              <div>
                <span style="font-size: 13px; font-weight: 600; color: #166534;">Notificar al usuario por email</span>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #15803d;">
                  Se enviara un correo con las nuevas credenciales
                </p>
              </div>
            </label>
          </div>
        </div>
      `,
      width: '500px',
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4a5259',
      didOpen: () => {
        lucide.createIcons();
        
        const inputUsuario = document.getElementById('usuarioAlumno');
        inputUsuario.addEventListener('blur', () => {
          if (inputUsuario.value.trim() === '') {
            inputUsuario.value = '${usuarioActual}';
            inputUsuario.style.color = '#9ca3af';
          } else {
            inputUsuario.style.color = '#111827';
          }
        });
        
        const inputPassword = document.getElementById('passwordAlumno');
        inputPassword.addEventListener('blur', () => {
          if (inputPassword.value.trim() === '') {
            inputPassword.value = '${passwordActual}';
            inputPassword.style.color = '#9ca3af';
          } else {
            inputPassword.style.color = '#111827';
          }
        });
        
        const toggleBtn = document.getElementById('togglePasswordAlumno');
        toggleBtn.addEventListener('click', () => {
          const isPassword = inputPassword.type === 'password';
          inputPassword.type = isPassword ? 'text' : 'password';
          
          const iconHtml = isPassword ? '<i data-lucide="eye-off" style="width: 20px; height: 20px; color: #6b7280;"></i>' : '<i data-lucide="eye" style="width: 20px; height: 20px; color: #6b7280;"></i>';
          toggleBtn.innerHTML = iconHtml;
          lucide.createIcons();
        });

        const clearBtn = document.getElementById('clearAccessKeyAlumno');
        const accessInput = document.getElementById('accessKeyAlumno');
        clearBtn.addEventListener('click', () => {
          accessInput.value = '';
          accessInput.focus();
        });
      },
      preConfirm: async () => {
        const usuario = document.getElementById('usuarioAlumno').value.trim();
        const password = document.getElementById('passwordAlumno').value.trim();
        const enviarEmail = document.getElementById('enviarEmailAlumno').checked;
        const accessKey = document.getElementById('accessKeyAlumno').value.trim();
        
        const nuevoUsuario = (usuario === '' || usuario === '${usuarioActual}') ? '${usuarioActual}' : usuario;
        
        const nuevoPassword = (password === '' || password === '${passwordActual}') ? '' : password;
        
        if (!nuevoUsuario) {
          Swal.showValidationMessage('El usuario es obligatorio');
          return false;
        }

        if (enviarEmail && !nuevoPassword) {
          Swal.showValidationMessage('Debes ingresar una nueva contrasena para enviar el email');
          return false;
        }
        
        return { 
          usuario: nuevoUsuario, 
          password: nuevoPassword, 
          enviarEmail,
          accessKey,
          accessKeyChanged: accessKey !== accessKeyActual
        };
      }
    });

    if (result.isConfirmed && result.value) {
      const { usuario, password, enviarEmail, accessKey, accessKeyChanged } = result.value;

      try {
        const bodyData = {
          id_persona: alumno.id_persona,
          username: usuario,
          enviarEmail: enviarEmail
        };
        
        if (password && password.trim().length > 0) {
          bodyData.password = password;
        }
        
        const response = await fetch(`${API_URL}/auth/admin-cambiar-password-classroom`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
        
        // Actualizar CemiKey si cambió
        if (accessKeyChanged) {
          try {
            await fetch(`${API_URL}/alumnos/${idAlumno}/access-key`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ access_key: accessKey || null })
            });
          } catch (keyError) {
            console.error('Error al actualizar access key:', keyError);
          }
        }
        
        if (response.ok) {
          const data = await response.json();
          let mensaje = password ? 'Usuario y contrasena actualizados correctamente' : 'Usuario actualizado correctamente';
          if (accessKeyChanged) {
            mensaje += accessKey ? '. Clave de acceso configurada.' : '. Clave de acceso eliminada.';
          }
          if (data.emailEnviado) {
            mensaje += ' Se ha enviado un email con las credenciales.';
          }
          Swal.fire('Actualizado!', mensaje, 'success');
        } else {
          const data = await response.json();
          Swal.fire('Error', data.message || 'Error al actualizar credenciales', 'error');
        }
      } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
      }
    }
  } catch (error) {
    console.error('Error:', error);
    Swal.fire('Error', 'No se pudieron cargar las credenciales', 'error');
  }
}

async function eliminarAlumno(id, nombre) {
  const result = await Swal.fire({
    title: '¿Eliminar alumno?',
    html: `¿Estás seguro de eliminar al alumno <strong>${nombre}</strong>?<br><br>
           <span style="color: #d33; font-size: 14px;">Esta acción eliminará también sus calificaciones, asistencias y pagos.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/alumnos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Eliminado!', 'Alumno eliminado exitosamente', 'success');
        document.getElementById('btnAlumnos').click();
      } else {
        Swal.fire('Error', data.message || 'Error al eliminar alumno', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function cambiarPasswordAlumnoDashboard(idAlumno) {
  const { value: formValues } = await Swal.fire({
    title: 'Cambiar Contraseña Dashboard',
    html: `
      <div style="text-align: left;">
        <p style="margin-bottom: 15px; color: #666;">Esta contraseña se usa para acceder al Dashboard administrativo.</p>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nueva Contraseña</label>
          <input id="password" type="password" class="swal2-input" placeholder="Mínimo 6 caracteres" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Confirmar Contraseña</label>
          <input id="confirmPassword" type="password" class="swal2-input" placeholder="Repite la contraseña" style="width: 100%; margin: 0;">
        </div>
      </div>
    `,
    width: '450px',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Cambiar Contraseña',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    preConfirm: () => {
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if (!password || !confirmPassword) {
        Swal.showValidationMessage('Ambos campos son obligatorios');
        return false;
      }
      
      if (password.length < 6) {
        Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
      
      if (password !== confirmPassword) {
        Swal.showValidationMessage('Las contraseñas no coinciden');
        return false;
      }
      
      return { password };
    }
  });

  if (formValues) {
    try {
      const res = await fetch(`${API_URL}/alumnos/${idAlumno}/cambiar-password-dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Actualizado!', 'Contraseña Dashboard actualizada exitosamente', 'success');
      } else {
        Swal.fire('Error', data.message || 'Error al actualizar contraseña', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function cambiarPasswordAlumnoClassroom(idAlumno) {
  const { value: formValues } = await Swal.fire({
    title: 'Cambiar Contraseña Classroom',
    html: `
      <div style="text-align: left;">
        <p style="margin-bottom: 15px; color: #666;">Esta contraseña se usa para acceder a la plataforma educativa Classroom.</p>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Nueva Contraseña</label>
          <input id="password" type="password" class="swal2-input" placeholder="Mínimo 6 caracteres" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Confirmar Contraseña</label>
          <input id="confirmPassword" type="password" class="swal2-input" placeholder="Repite la contraseña" style="width: 100%; margin: 0;">
        </div>
      </div>
    `,
    width: '450px',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Cambiar Contraseña',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    preConfirm: () => {
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      if (!password || !confirmPassword) {
        Swal.showValidationMessage('Ambos campos son obligatorios');
        return false;
      }
      
      if (password.length < 6) {
        Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
      
      if (password !== confirmPassword) {
        Swal.showValidationMessage('Las contraseñas no coinciden');
        return false;
      }
      
      return { password };
    }
  });

  if (formValues) {
    try {
      const alumnoRes = await fetch(`${API_URL}/alumnos/${idAlumno}`);
      const alumno = await alumnoRes.json();
      
      const res = await fetch(`${API_URL}/auth/admin-cambiar-password-classroom`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_persona: alumno.id_persona,
          password: formValues.password
        })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Actualizado!', 'Contraseña Classroom actualizada exitosamente', 'success');
      } else {
        Swal.fire('Error', data.message || 'Error al actualizar contraseña', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function openNuevoProfesorModal() {
  const { value: formValues } = await Swal.fire({
    title: 'Nuevo Profesor',
    html: `
      <div style="text-align: left;">
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nombre</label>
          <input id="nombre" class="swal2-input" placeholder="Nombre" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Apellido</label>
          <input id="apellido" class="swal2-input" placeholder="Apellido" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">DNI</label>
          <input id="dni" class="swal2-input" placeholder="Ej: 12345678" maxlength="8" oninput="this.value=this.value.replace(/[^0-9]/g,'')" pattern="[0-9]*" inputmode="numeric" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Email</label>
          <input id="mail" type="email" class="swal2-input" placeholder="email@ejemplo.com" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Especialidad</label>
          <input id="especialidad" class="swal2-input" placeholder="Ej: Inglés Avanzado" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Teléfono</label>
          <input id="telefono" type="tel" class="swal2-input" placeholder="Ej: 1234567890" oninput="this.value=this.value.replace(/[^0-9]/g,'')" pattern="[0-9]*" inputmode="numeric" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 8px; font-weight: 400; padding-bottom: 10px; text-align: left;">Idiomas que enseña</label>
          <div id="idiomasContainerNuevo" style="border: 1px solid #d0d5dd; border-radius: 8px; padding: 12px; max-height: 150px; overflow-y: auto; background: #f9fafb;">
            <div style="color: #666; font-size: 13px; text-align: center;">Cargando idiomas...</div>
          </div>
        </div>
      </div>
    `,
    width: '500px',
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Crear',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    didOpen: async () => {
      try {
        const resp = await fetch(`${API_URL}/idiomas`);
        const idiomas = await resp.json();
        
        const container = document.getElementById('idiomasContainerNuevo');
        container.innerHTML = idiomas.map(idioma => `
          <label style="display: flex; align-items: center; padding: 8px; cursor: pointer; border-radius: 4px; transition: background 0.2s;" 
                 onmouseover="this.style.background='#e5e7eb'" 
                 onmouseout="this.style.background='transparent'">
            <input type="checkbox" value="${idioma.id_idioma}" class="idioma-checkbox" 
                   style="margin-right: 8px; cursor: pointer; width: 16px; height: 16px;">
            <span style="font-size: 14px; color: #374151;">${idioma.nombre_idioma}</span>
          </label>
        `).join('');
      } catch (error) {
        console.error('Error al cargar idiomas:', error);
        document.getElementById('idiomasContainerNuevo').innerHTML = '<div style="color: #ef4444; font-size: 13px; text-align: center;">Error al cargar idiomas</div>';
      }
    },
    preConfirm: () => {
      const nombre = document.getElementById('nombre').value;
      const apellido = document.getElementById('apellido').value;
      const dni = document.getElementById('dni').value;
      const mail = document.getElementById('mail').value;
      const especialidad = document.getElementById('especialidad').value;
      const telefono = document.getElementById('telefono').value;
      
      const idiomasSeleccionados = Array.from(document.querySelectorAll('.idioma-checkbox:checked'))
        .map(cb => parseInt(cb.value));
      
      if (!nombre) {
        Swal.showValidationMessage('El nombre es obligatorio');
        return false;
      }
      if (!apellido) {
        Swal.showValidationMessage('El apellido es obligatorio');
        return false;
      }
      if (!dni) {
        Swal.showValidationMessage('El DNI es obligatorio');
        return false;
      }
      if (!mail) {
        Swal.showValidationMessage('El email es obligatorio');
        return false;
      }
      if (!especialidad) {
        Swal.showValidationMessage('La especialidad es obligatoria');
        return false;
      }
      if (!telefono) {
        Swal.showValidationMessage('El teléfono es obligatorio');
        return false;
      }
      return { nombre, apellido, dni, mail, especialidad, telefono, idiomas: idiomasSeleccionados };
    }
  });

  if (formValues) {
    try {
      console.log('Enviando datos de profesor:', formValues);
      const res = await fetch(`${API_URL}/profesores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      
      console.log('Respuesta del servidor:', res.status, res.statusText);
      const data = await res.json();
      console.log('Datos recibidos:', data);
      
      if (res.ok && data.success) {
        const idProfesor = data.id_profesor;
        const nombreCompleto = `${formValues.nombre} ${formValues.apellido}`;
        
        await Swal.fire({
          icon: 'success',
          title: '¡Profesor creado!',
          text: `${nombreCompleto} ha sido registrado exitosamente`,
          timer: 1500,
          showConfirmButton: false
        });

        await crearCredencialesProfesor(idProfesor, nombreCompleto);
        
        document.getElementById('btnProfesores').click();
      } else {
        console.error('Error del servidor:', data);
        Swal.fire('Error', data.message || 'Error al crear profesor', 'error');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function crearCredencialesProfesor(idProfesor, nombreCompleto) {
  const { value: credenciales } = await Swal.fire({
    title: 'Crear Credenciales de Acceso',
    html: `
      <div style="text-align: left;">
        <p style="margin-bottom: 20px; color: #666;">
          Crea las credenciales de acceso para <strong>${nombreCompleto}</strong>
        </p>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Usuario</label>
          <input id="username" class="swal2-input" placeholder="Nombre de usuario" style="width: 100%; margin: 0;">
          <small style="color: #999; font-size: 12px;">Este será el usuario para iniciar sesión</small>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Contraseña</label>
          <input id="password" type="password" class="swal2-input" placeholder="Contraseña" style="width: 100%; margin: 0;">
          <small style="color: #999; font-size: 12px;">Mínimo 6 caracteres</small>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 600;">Confirmar Contraseña</label>
          <input id="password2" type="password" class="swal2-input" placeholder="Confirmar contraseña" style="width: 100%; margin: 0;">
        </div>
      </div>
    `,
    width: '500px',
    focusConfirm: false,
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: 'Crear Credenciales',
    denyButtonText: 'Omitir (crear después)',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#4a5259',
    preConfirm: () => {
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      const password2 = document.getElementById('password2').value;
      
      if (!username || !password || !password2) {
        Swal.showValidationMessage('Todos los campos son obligatorios');
        return false;
      }
      
      if (password.length < 6) {
        Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }
      
      if (password !== password2) {
        Swal.showValidationMessage('Las contraseñas no coinciden');
        return false;
      }
      
      return { username, password };
    }
  });

  if (credenciales) {
    try {
      const res = await fetch(`${API_URL}/profesores/${idProfesor}/credenciales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Credenciales creadas!',
          html: `
            <p>Las credenciales de acceso han sido creadas exitosamente.</p>
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 5px 0;"><strong>Usuario:</strong> ${credenciales.username}</p>
              <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${credenciales.password}</p>
            </div>
            <p style="color: #999; font-size: 13px; margin-top: 15px;">
              ️ Guarda estas credenciales de forma segura
            </p>
          `,
          confirmButtonColor: '#4a5259'
        });
      } else {
        Swal.fire('Error', data.message || 'Error al crear credenciales', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudieron crear las credenciales', 'error');
    }
  }
}

async function editarProfesor(id) {
  try {
    const res = await fetch(`${API_URL}/profesores/${id}`);
    const profesor = await res.json();
    
    const idiomasRes = await fetch(`${API_URL}/idiomas`);
    const idiomas = await idiomasRes.json();
    
    const { value: formValues, isDenied } = await Swal.fire({
      title: 'Editar Profesor',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nombre</label>
            <input id="nombre" class="swal2-input" value="${profesor.nombre}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Apellido</label>
            <input id="apellido" class="swal2-input" value="${profesor.apellido}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Email</label>
            <input id="mail" type="email" class="swal2-input" value="${profesor.mail}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">DNI</label>
            <input id="dni" class="swal2-input" placeholder="Ej: 12345678" maxlength="8" oninput="this.value=this.value.replace(/[^0-9]/g,'')" pattern="[0-9]*" inputmode="numeric" value="${profesor.dni || ''}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Especialidad</label>
            <input id="especialidad" class="swal2-input" value="${profesor.especialidad || ''}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Idiomas que enseña</label>
            <div id="idiomasContainerEditar" style="max-height: 150px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px; background: #f9f9f9;">
              ${idiomas.map(idioma => `
                <label style="display: block; margin-bottom: 8px; cursor: pointer;">
                  <input type="checkbox" value="${idioma.id_idioma}" ${(profesor.idiomas_ids || []).includes(idioma.id_idioma) ? 'checked' : ''} style="margin-right: 8px;">
                  ${idioma.nombre_idioma}
                </label>
              `).join('')}
            </div>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Teléfono</label>
            <input id="telefono" type="tel" class="swal2-input" oninput="this.value=this.value.replace(/[^0-9]/g,'')" pattern="[0-9]*" inputmode="numeric" value="${profesor.telefono || ''}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Estado</label>
            <select id="estado" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="activo" ${profesor.estado === 'activo' ? 'selected' : ''}>Activo</option>
              <option value="inactivo" ${profesor.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
              <option value="licencia" ${profesor.estado === 'licencia' ? 'selected' : ''}>En Licencia</option>
            </select>
          </div>
        </div>
      `,
      width: '550px',
      focusConfirm: false,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Guardar',
      denyButtonText: '<i data-lucide="key"></i> Editar Credenciales',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4a5259',
      denyButtonColor: '#6b7280',
      didOpen: () => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      },
      preConfirm: () => {
        const nombre = document.getElementById('nombre').value.trim();
        const apellido = document.getElementById('apellido').value.trim();
        const mail = document.getElementById('mail').value.trim();
        const dni = document.getElementById('dni').value.trim();
        const especialidad = document.getElementById('especialidad').value.trim();
        const telefono = document.getElementById('telefono').value.trim();
        const estado = document.getElementById('estado').value;
        
        const idiomasSeleccionados = Array.from(
          document.querySelectorAll('#idiomasContainerEditar input[type="checkbox"]:checked')
        ).map(cb => parseInt(cb.value));
        
        if (!nombre || !apellido || !mail || !dni || !especialidad || !telefono) {
          Swal.showValidationMessage('Todos los campos son obligatorios');
          return false;
        }
        return { nombre, apellido, mail, dni, especialidad, telefono, estado, idiomas: idiomasSeleccionados };
      }
    });

    if (isDenied) {
      await abrirModalCredencialesProfesor(id);
      return;
    }

    if (formValues) {
      const updateRes = await fetch(`${API_URL}/profesores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      
      const data = await updateRes.json();
      
      if (updateRes.ok && data.success) {
        Swal.fire('¡Actualizado!', 'Profesor actualizado exitosamente', 'success');
        document.getElementById('btnProfesores').click();
      } else {
        Swal.fire('Error', data.message || 'Error al actualizar profesor', 'error');
      }
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
  }
}

async function eliminarProfesor(id, nombre) {
  const result = await Swal.fire({
    title: '¿Eliminar profesor?',
    html: `¿Estás seguro de eliminar al profesor <strong>${nombre}</strong>?<br><br>
           <span style="color: #d33; font-size: 14px;">Los cursos que dicta quedarán sin profesor asignado.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      console.log('Eliminando profesor ID:', id);
      const res = await fetch(`${API_URL}/profesores/${id}`, { method: 'DELETE' });
      console.log('Respuesta del servidor:', res.status, res.statusText);
      const data = await res.json();
      console.log('Datos recibidos:', data);
      
      if (res.ok && data.success) {
        Swal.fire('¡Eliminado!', 'Profesor eliminado exitosamente', 'success');
        document.getElementById('btnProfesores').click();
      } else {
        console.error('Error del servidor:', data);
        Swal.fire('Error', data.message || 'Error al eliminar profesor', 'error');
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}


function setupAdministradorFilters() {
  const searchInput = document.getElementById('administradoresSearch');

  if (searchInput) {
    searchInput.addEventListener('input', filterAdministradores);
  }
}

function filterAdministradores() {
  const searchTerm = document.getElementById('administradoresSearch')?.value.toLowerCase() || '';
  const cards = document.querySelectorAll('.admin-card');
  
  cards.forEach(card => {
    const cardText = card.textContent.toLowerCase();
    const matchesSearch = cardText.includes(searchTerm);
    
    if (matchesSearch) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

async function openNuevoAdministradorModal() {
  const { value: formValues } = await Swal.fire({
    title: 'Nuevo Administrador',
    html: `
      <div style="text-align: left;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nombre</label>
            <input id="admin_nombre" class="swal2-input" placeholder="Nombre" style="width: 100%; margin: 0;">
          </div>
          <div>
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Apellido</label>
            <input id="admin_apellido" class="swal2-input" placeholder="Apellido" style="width: 100%; margin: 0;">
          </div>
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Email</label>
          <input id="admin_mail" type="email" class="swal2-input" placeholder="email@ejemplo.com" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">DNI</label>
          <input id="admin_dni" class="swal2-input" placeholder="12345678" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Teléfono</label>
          <input id="admin_telefono" class="swal2-input" placeholder="+54 9 11 1234-5678" style="width: 100%; margin: 0;">
        </div>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
        <h4 style="margin-bottom: 15px; color: #333;">Credenciales de acceso</h4>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Usuario</label>
          <input id="admin_username" class="swal2-input" placeholder="nombreusuario" style="width: 100%; margin: 0;">
        </div>
        <div style="margin-bottom: 15px;">
          <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Contraseña</label>
          <input id="admin_password" type="password" class="swal2-input" placeholder="Mínimo 6 caracteres" style="width: 100%; margin: 0;">
        </div>
      </div>
    `,
    width: '600px',
    showCancelButton: true,
    confirmButtonText: 'Crear Administrador',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#000',
    preConfirm: () => {
      const nombre = document.getElementById('admin_nombre').value.trim();
      const apellido = document.getElementById('admin_apellido').value.trim();
      const mail = document.getElementById('admin_mail').value.trim();
      const dni = document.getElementById('admin_dni').value.trim();
      const telefono = document.getElementById('admin_telefono').value.trim();
      const username = document.getElementById('admin_username').value.trim();
      const password = document.getElementById('admin_password').value.trim();

      if (!nombre || !apellido || !mail || !username || !password) {
        Swal.showValidationMessage('Por favor complete todos los campos obligatorios');
        return false;
      }

      if (password.length < 6) {
        Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      return { nombre, apellido, mail, dni, telefono, username, password };
    }
  });

  if (formValues) {
    try {
      const res = await fetch(`${API_URL}/administradores`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await Swal.fire({
          icon: 'success',
          title: '¡Administrador creado!',
          html: `
            <p>El administrador <strong>${formValues.nombre} ${formValues.apellido}</strong> ha sido creado correctamente.</p>
            <div style="background: #f5f5f7; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 5px 0;"><strong>Usuario:</strong> ${formValues.username}</p>
              <p style="margin: 5px 0;"><strong>Contraseña:</strong> ${formValues.password}</p>
            </div>
            <p style="margin-top: 15px; font-size: 13px; color: #666;">Asegúrate de compartir estas credenciales de forma segura.</p>
          `,
          confirmButtonColor: '#000'
        });

        document.getElementById('btnAdministradores').click();
      } else {
        Swal.fire('Error', data.message || 'Error al crear administrador', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function editarAdministrador(id) {
  try {
    const res = await fetch(`${API_URL}/administradores/${id}`);
    const admin = await res.json();

    const { value: formValues, isDenied } = await Swal.fire({
      title: 'Editar Administrador',
      html: `
        <div style="text-align: left;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nombre</label>
              <input id="edit_admin_nombre" class="swal2-input" value="${admin.nombre}" style="width: 100%; margin: 0;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Apellido</label>
              <input id="edit_admin_apellido" class="swal2-input" value="${admin.apellido}" style="width: 100%; margin: 0;">
            </div>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Email</label>
            <input id="edit_admin_mail" type="email" class="swal2-input" value="${admin.mail}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">DNI</label>
            <input id="edit_admin_dni" class="swal2-input" value="${admin.dni || ''}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Teléfono</label>
            <input id="edit_admin_telefono" class="swal2-input" value="${admin.telefono || ''}" style="width: 100%; margin: 0;">
          </div>
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: 'Guardar Cambios',
      denyButtonText: '<i data-lucide="key"></i> Editar Credenciales',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#000',
      denyButtonColor: '#6b7280',
      didOpen: () => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
      },
      preConfirm: () => {
        const nombre = document.getElementById('edit_admin_nombre').value.trim();
        const apellido = document.getElementById('edit_admin_apellido').value.trim();
        const mail = document.getElementById('edit_admin_mail').value.trim();
        const dni = document.getElementById('edit_admin_dni').value.trim();
        const telefono = document.getElementById('edit_admin_telefono').value.trim();

        if (!nombre || !apellido || !mail) {
          Swal.showValidationMessage('Por favor complete todos los campos obligatorios');
          return false;
        }

        return { nombre, apellido, mail, dni, telefono };
      }
    });

    if (isDenied) {
      await abrirModalCredencialesAdministrador(id);
      return;
    }

    if (formValues) {
      const updateRes = await fetch(`${API_URL}/administradores/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });

      const data = await updateRes.json();

      if (updateRes.ok && data.success) {
        Swal.fire('¡Actualizado!', 'Administrador actualizado correctamente', 'success');
        document.getElementById('btnAdministradores').click();
      } else {
        Swal.fire('Error', data.message || 'Error al actualizar administrador', 'error');
      }
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
  }
}

async function abrirModalCredencialesAdministrador(idAdmin) {
  try {
    const response = await fetch(`${API_URL}/administradores/${idAdmin}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (!response.ok) throw new Error('Error al cargar datos del administrador');
    const admin = await response.json();

    let passwordActual = '';
    try {
      const respUsuario = await fetch(`${API_URL}/auth/usuario-classroom/${admin.id_persona}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (respUsuario.ok) {
        const usuario = await respUsuario.json();
        passwordActual = usuario.password_plain || '';
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    }

    let accessKeyActual = '';
    try {
      const respAccessKey = await fetch(`${API_URL}/administradores/${admin.id_persona}/access-key`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (respAccessKey.ok) {
        const dataKey = await respAccessKey.json();
        accessKeyActual = dataKey.accessKey || '';
      }
    } catch (error) {
      console.error('Error al cargar access key:', error);
    }

    const { value: formValues } = await Swal.fire({
      title: 'Editar Credenciales - Dashboard',
      html: `
        <div style="text-align: left; max-width: 500px; margin: 0 auto;">
          <!-- DASHBOARD -->
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #111827; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="layout-dashboard" style="width: 20px; height: 20px;"></i>
              Dashboard
            </h3>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #374151;">
                Usuario <span style="color: #9ca3af; font-weight: 400;">(actual: ${admin.usuario || ''})</span>
              </label>
              <input type="text" id="usuarioDashboard" value="${admin.usuario || ''}" 
                     onfocus="if(this.value === '${admin.usuario || ''}') this.value = '';"
                     style="width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; color: #9ca3af;">
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #374151;">
                Contrasena <span style="color: #9ca3af; font-weight: 400;">(actual: ${passwordActual || 'sin configurar'})</span>
              </label>
              <div style="position: relative;">
                <input type="text" id="passwordDashboard" value="${passwordActual}"
                       onfocus="if(this.value === '${passwordActual}') this.value = '';"
                       style="width: 100%; padding: 8px 40px 8px 8px; border: 1px solid #d1d5db; border-radius: 4px; box-sizing: border-box; color: #9ca3af;">
                <button type="button" id="togglePasswordDashboard" 
                        style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; color: #6b7280;">
                  <i data-lucide="eye" style="width: 18px; height: 18px;"></i>
                </button>
              </div>
              <small style="color: #6b7280; font-size: 12px;">Deja vacio para mantener la contrasena actual</small>
            </div>
          </div>

          <!-- CLAVE DE ACCESO -->
          <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fbbf24;">
            <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #92400e; display: flex; align-items: center; gap: 8px;">
              <i data-lucide="key" style="width: 20px; height: 20px;"></i>
              Clave de Acceso (CemiKey)
            </h3>
            
            <div style="margin-bottom: 10px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #92400e;">
                Clave de acceso <span style="color: #b45309; font-weight: 400;">${accessKeyActual ? '(configurada)' : '(sin configurar)'}</span>
              </label>
              <div style="position: relative;">
                <input type="text" id="accessKeyInput" value="${accessKeyActual}"
                       placeholder="Ingresa una clave de acceso..."
                       style="width: 100%; padding: 8px 40px 8px 8px; border: 1px solid #fbbf24; border-radius: 4px; box-sizing: border-box; background: white;">
                <button type="button" id="clearAccessKey" 
                        style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; color: #b45309;"
                        title="Limpiar clave">
                  <i data-lucide="x" style="width: 18px; height: 18px;"></i>
                </button>
              </div>
              <small style="color: #92400e; font-size: 12px;">Esta clave permite acceso directo al dashboard sin usuario/contrasena. Deja vacio para eliminar.</small>
            </div>
          </div>

          <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); padding: 14px 16px; border-radius: 10px; border: 1px solid #86efac;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; margin: 0;">
              <input type="checkbox" id="enviarEmailAdmin" 
                     style="width: 18px; height: 18px; accent-color: #22c55e; cursor: pointer;">
              <div>
                <span style="font-size: 13px; font-weight: 600; color: #166534;">Notificar al usuario por email</span>
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #15803d;">
                  Se enviara un correo con las nuevas credenciales
                </p>
              </div>
            </label>
          </div>
        </div>
      `,
      width: '600px',
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#000',
      didOpen: () => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }

        const usuarioActualAdmin = admin.usuario || '';
        const passwordActualAdmin = passwordActual;

        const inputUsuario = document.getElementById('usuarioDashboard');
        inputUsuario.addEventListener('blur', () => {
          if (inputUsuario.value.trim() === '') {
            inputUsuario.value = usuarioActualAdmin;
            inputUsuario.style.color = '#9ca3af';
          } else {
            inputUsuario.style.color = '#111827';
          }
        });

        const inputDash = document.getElementById('passwordDashboard');
        inputDash.addEventListener('blur', () => {
          if (inputDash.value.trim() === '') {
            inputDash.value = passwordActualAdmin;
            inputDash.style.color = '#9ca3af';
          } else {
            inputDash.style.color = '#111827';
          }
        });

        const toggleDash = document.getElementById('togglePasswordDashboard');
        
        toggleDash.addEventListener('click', () => {
          const isPassword = inputDash.type === 'password';
          inputDash.type = isPassword ? 'text' : 'password';
          const icon = toggleDash.querySelector('i');
          icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
          lucide.createIcons();
        });

        const clearBtn = document.getElementById('clearAccessKey');
        const accessInput = document.getElementById('accessKeyInput');
        clearBtn.addEventListener('click', () => {
          accessInput.value = '';
          accessInput.focus();
        });
      },
      preConfirm: () => {
        const usuarioDash = document.getElementById('usuarioDashboard').value.trim();
        const passwordDash = document.getElementById('passwordDashboard').value.trim();
        const enviarEmail = document.getElementById('enviarEmailAdmin').checked;
        const accessKey = document.getElementById('accessKeyInput').value.trim();

        const usuarioActualAdmin = admin.usuario || '';
        const passwordActualAdmin = passwordActual;

        const nuevoUsuario = (usuarioDash === '' || usuarioDash === usuarioActualAdmin) ? usuarioActualAdmin : usuarioDash;
        
        const nuevoPassword = (passwordDash === '' || passwordDash === passwordActualAdmin) ? '' : passwordDash;

        if (!nuevoUsuario) {
          Swal.showValidationMessage('El usuario del Dashboard es obligatorio');
          return false;
        }

        if (enviarEmail && !nuevoPassword) {
          Swal.showValidationMessage('Debes ingresar una nueva contrasena para enviar el email');
          return false;
        }

        return {
          usuarioDashboard: nuevoUsuario,
          passwordDashboard: nuevoPassword,
          enviarEmail: enviarEmail,
          accessKey: accessKey,
          accessKeyChanged: accessKey !== accessKeyActual
        };
      }
    });

    if (formValues) {
      const { usuarioDashboard, passwordDashboard, enviarEmail, accessKey, accessKeyChanged } = formValues;

      try {
        const responseUsuario = await fetch(`${API_URL}/administradores/${idAdmin}/usuario`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ usuario: usuarioDashboard })
        });

        const dataUsuario = await responseUsuario.json();
        
        if (!responseUsuario.ok) {
          Swal.fire('Error', dataUsuario.message || 'Error al actualizar usuario', 'error');
          return;
        }
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'No se pudo actualizar el usuario', 'error');
        return;
      }

      if (accessKeyChanged) {
        try {
          const responseKey = await fetch(`${API_URL}/administradores/${admin.id_persona}/access-key`, {
            method: 'PATCH',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ accessKey: accessKey })
          });

          const dataKey = await responseKey.json();
          
          if (!responseKey.ok) {
            Swal.fire('Error', dataKey.message || 'Error al actualizar clave de acceso', 'error');
            return;
          }
        } catch (error) {
          console.error(error);
          Swal.fire('Error', 'No se pudo actualizar la clave de acceso', 'error');
          return;
        }
      }

      if (passwordDashboard && passwordDashboard.length > 0) {
        try {
          const responsePassword = await fetch(`${API_URL}/auth/admin-cambiar-password-classroom`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ 
              id_persona: admin.id_persona,
              username: usuarioDashboard,
              password: passwordDashboard,
              enviarEmail: enviarEmail
            })
          });

          const dataPassword = await responsePassword.json();
          
          if (!responsePassword.ok) {
            Swal.fire('Error', dataPassword.message || 'Error al actualizar contrasena', 'error');
            return;
          }

          let mensaje = 'Credenciales actualizadas correctamente';
          if (dataPassword.emailEnviado) {
            mensaje += '. Se ha enviado un email con las credenciales.';
          }
          Swal.fire('Exito!', mensaje, 'success');
          return;
        } catch (error) {
          console.error(error);
          Swal.fire('Error', 'No se pudo actualizar la contrasena', 'error');
          return;
        }
      }

      Swal.fire('Exito!', 'Credenciales actualizadas correctamente', 'success');
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudo cargar los datos del administrador', 'error');
  }
}

async function cambiarPasswordAdministrador(id, nombre) {
  const { value: password } = await Swal.fire({
    title: 'Cambiar Contraseña',
    html: `
      <p>Ingresa la nueva contraseña para <strong>${nombre}</strong></p>
      <input id="nueva_password" type="password" class="swal2-input" placeholder="Nueva contraseña (mín. 6 caracteres)" style="width: 90%;">
      <input id="confirmar_password" type="password" class="swal2-input" placeholder="Confirmar contraseña" style="width: 90%; margin-top: 10px;">
    `,
    showCancelButton: true,
    confirmButtonText: 'Cambiar Contraseña',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#000',
    preConfirm: () => {
      const pass = document.getElementById('nueva_password').value;
      const confirm = document.getElementById('confirmar_password').value;

      if (!pass || pass.length < 6) {
        Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
        return false;
      }

      if (pass !== confirm) {
        Swal.showValidationMessage('Las contraseñas no coinciden');
        return false;
      }

      return pass;
    }
  });

  if (password) {
    try {
      const res = await fetch(`${API_URL}/administradores/${id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Contraseña actualizada',
          html: `
            <p>La contraseña de <strong>${nombre}</strong> ha sido actualizada.</p>
            <div style="background: #f5f5f7; padding: 15px; border-radius: 8px; margin-top: 15px;">
              <p style="margin: 5px 0;"><strong>Nueva contraseña:</strong> ${password}</p>
            </div>
            <p style="margin-top: 15px; font-size: 13px; color: #666;">Asegúrate de compartir esta información de forma segura.</p>
          `,
          confirmButtonColor: '#000'
        });
      } else {
        Swal.fire('Error', data.message || 'Error al cambiar contraseña', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function eliminarAdministrador(id, nombre) {
  const result = await Swal.fire({
    title: '¿Eliminar administrador?',
    html: `¿Estás seguro de eliminar al administrador <strong>${nombre}</strong>?<br><br>
           <span style="color: #d33; font-size: 14px;">Esta acción no se puede deshacer.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/administradores/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Eliminado!', 'Administrador eliminado exitosamente', 'success');
        document.getElementById('btnAdministradores').click();
      } else {
        Swal.fire('Error', data.message || 'Error al eliminar administrador', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function openNuevoCursoModal() {
  try {
    const [idiomasRes, nivelesRes, profesoresRes, aulasRes] = await Promise.all([
      fetch(`${API_URL}/idiomas`),
      fetch(`${API_URL}/niveles`),
      fetch(`${API_URL}/profesores`),
      fetch(`${API_URL}/aulas`)
    ]);

    const idiomas = await idiomasRes.json();
    const niveles = await nivelesRes.json();
    const profesores = await profesoresRes.json();
    const aulas = await aulasRes.json();

    const { value: formValues } = await Swal.fire({
      title: 'Nuevo Curso',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nombre del Curso</label>
            <input id="nombre_curso" class="swal2-input" placeholder="Ej: Inglés Básico A1" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Idioma</label>
            <select id="id_idioma" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="">Seleccionar idioma</option>
              ${idiomas.map(i => `<option value="${i.id_idioma}">${i.nombre_idioma}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nivel (opcional)</label>
            <select id="id_nivel" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="">Sin nivel</option>
              ${niveles.map(n => `<option value="${n.id_nivel}">${n.descripcion}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Profesor</label>
            <select id="id_profesor" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="">Seleccionar profesor</option>
              ${profesores.map(p => `<option value="${p.id_profesor}">${p.nombre} ${p.apellido}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Horario (opcional)</label>
            <input id="horario" class="swal2-input" placeholder="Ej: Lun-Mie 18:00-20:00" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Cupo Máximo</label>
            <input id="cupo_maximo" type="number" class="swal2-input" value="30" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Aula (opcional)</label>
            <select id="id_aula" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="">Sin aula asignada</option>
              ${aulas.map(a => `<option value="${a.id_aula}">${a.nombre_aula} (${a.capacidad} personas)</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      width: '600px',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4a5259',
      preConfirm: () => {
        const nombre_curso = document.getElementById('nombre_curso').value;
        const id_idioma = document.getElementById('id_idioma').value;
        const id_nivel = document.getElementById('id_nivel').value;
        const id_profesor = document.getElementById('id_profesor').value;
        const horario = document.getElementById('horario').value;
        const cupo_maximo = document.getElementById('cupo_maximo').value;
        const id_aula = document.getElementById('id_aula').value;
        
        if (!nombre_curso) {
          Swal.showValidationMessage('El nombre del curso es obligatorio');
          return false;
        }
        if (!id_idioma) {
          Swal.showValidationMessage('Debe seleccionar un idioma');
          return false;
        }
        if (!id_profesor) {
          Swal.showValidationMessage('Debe seleccionar un profesor');
          return false;
        }
        return { nombre_curso, id_idioma, id_nivel, id_profesor, horario, cupo_maximo, id_aula };
      }
    });

    if (formValues) {
      const res = await fetch(`${API_URL}/cursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Creado!', 'Curso creado exitosamente', 'success');
        document.getElementById('btnCursos').click();
      } else {
        Swal.fire('Error', data.message || 'Error al crear curso', 'error');
      }
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
  }
}

async function editarCurso(id) {
  try {
    const [cursoRes, idiomasRes, nivelesRes, profesoresRes, aulasRes] = await Promise.all([
      fetch(`${API_URL}/cursos/${id}`),
      fetch(`${API_URL}/idiomas`),
      fetch(`${API_URL}/niveles`),
      fetch(`${API_URL}/profesores`),
      fetch(`${API_URL}/aulas`)
    ]);

    const curso = await cursoRes.json();
    const idiomas = await idiomasRes.json();
    const niveles = await nivelesRes.json();
    const profesores = await profesoresRes.json();
    const aulas = await aulasRes.json();

    const { value: formValues } = await Swal.fire({
      title: 'Editar Curso',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nombre del Curso</label>
            <input id="nombre_curso" class="swal2-input" value="${curso.nombre_curso}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Idioma</label>
            <select id="id_idioma" class="swal2-input" style="width: 100%; margin: 0;">
              ${idiomas.map(i => `<option value="${i.id_idioma}" ${curso.id_idioma == i.id_idioma ? 'selected' : ''}>${i.nombre_idioma}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Nivel</label>
            <select id="id_nivel" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="">Sin nivel</option>
              ${niveles.map(n => `<option value="${n.id_nivel}" ${curso.id_nivel == n.id_nivel ? 'selected' : ''}>${n.descripcion}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Profesor</label>
            <select id="id_profesor" class="swal2-input" style="width: 100%; margin: 0;">
              ${profesores.map(p => `<option value="${p.id_profesor}" ${curso.id_profesor == p.id_profesor ? 'selected' : ''}>${p.nombre} ${p.apellido}</option>`).join('')}
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Horario</label>
            <input id="horario" class="swal2-input" value="${curso.horario || ''}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Cupo Máximo</label>
            <input id="cupo_maximo" type="number" class="swal2-input" value="${curso.cupo_maximo}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 400; padding-bottom: 10px; text-align: left;">Aula</label>
            <select id="id_aula" class="swal2-input" style="width: 100%; margin: 0;">
              <option value="">Sin aula asignada</option>
              ${aulas.map(a => `<option value="${a.id_aula}" ${curso.id_aula == a.id_aula ? 'selected' : ''}>${a.nombre_aula} (${a.capacidad} personas)</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      width: '600px',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4a5259',
      preConfirm: () => {
        const nombre_curso = document.getElementById('nombre_curso').value;
        const id_idioma = document.getElementById('id_idioma').value;
        const id_nivel = document.getElementById('id_nivel').value;
        const id_profesor = document.getElementById('id_profesor').value;
        const horario = document.getElementById('horario').value;
        const cupo_maximo = document.getElementById('cupo_maximo').value;
        const id_aula = document.getElementById('id_aula').value;
        
        if (!nombre_curso || !id_idioma || !id_profesor) {
          Swal.showValidationMessage('Nombre del curso, idioma y profesor son obligatorios');
          return false;
        }
        return { nombre_curso, id_idioma, id_nivel, id_profesor, horario, cupo_maximo, id_aula };
      }
    });

    if (formValues) {
      const updateRes = await fetch(`${API_URL}/cursos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formValues)
      });
      
      const data = await updateRes.json();
      
      if (updateRes.ok && data.success) {
        Swal.fire('¡Actualizado!', 'Curso actualizado exitosamente', 'success');
        document.getElementById('btnCursos').click();
      } else {
        Swal.fire('Error', data.message || 'Error al actualizar curso', 'error');
      }
    }
  } catch (error) {
    console.error(error);
    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
  }
}

async function eliminarCurso(id, nombre) {
  const result = await Swal.fire({
    title: '¿Eliminar curso?',
    html: `¿Estás seguro de eliminar el curso <strong>${nombre}</strong>?<br><br>
           <span style="color: #d33; font-size: 14px;">Se eliminarán todas las calificaciones, asistencias e inscripciones asociadas.</span>`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/cursos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire('¡Eliminado!', 'Curso eliminado exitosamente', 'success');
        document.getElementById('btnCursos').click();
      } else {
        Swal.fire('Error', data.message || 'Error al eliminar curso', 'error');
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
    }
  }
}

async function asignarProfesorACurso(idCurso, nombreCurso) {
  try {
    const res = await fetch(`${API_URL}/profesores`);
    const profesores = await res.json();
    
    if (!profesores || profesores.length === 0) {
      Swal.fire('Sin profesores', 'No hay profesores disponibles para asignar', 'info');
      return;
    }

    const profesoresActivos = profesores.filter(p => p.estado === 'activo');
    
    if (profesoresActivos.length === 0) {
      Swal.fire('Sin profesores activos', 'No hay profesores activos disponibles', 'info');
      return;
    }

    const opcionesHTML = profesoresActivos.map(p => 
      `<option value="${p.id_profesor}">${p.nombre} ${p.apellido} - ${p.especialidad || 'Sin especialidad'}</option>`
    ).join('');

    const { value: idProfesor } = await Swal.fire({
      title: 'Asignar Profesor',
      html: `
        <p style="margin-bottom: 15px;">Curso: <strong>${nombreCurso}</strong></p>
        <label style="display: block; text-align: left; margin-bottom: 8px; font-weight: 500;">
          Seleccione el profesor:
        </label>
        <select id="swal-profesor-select" class="swal2-input" style="width: 100%; padding: 10px; font-size: 14px; height: 3.625em;">
          <option value="">-- Seleccione un profesor --</option>
          ${opcionesHTML}
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#4a5259',
      preConfirm: () => {
        const select = document.getElementById('swal-profesor-select');
        if (!select.value) {
          Swal.showValidationMessage('Debe seleccionar un profesor');
          return false;
        }
        return select.value;
      }
    });

    if (idProfesor) {
      const updateRes = await fetch(`${API_URL}/cursos/${idCurso}/profesor`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_profesor: idProfesor })
      });

      const data = await updateRes.json();

      if (updateRes.ok && data.success) {
        Swal.fire({
          icon: 'success',
          title: '¡Asignado!',
          text: 'Profesor asignado correctamente al curso',
          timer: 2000,
          showConfirmButton: false
        });
        document.getElementById('btnCursos').click();
      } else {
        Swal.fire('Error', data.message || 'Error al asignar profesor', 'error');
      }
    }
  } catch (error) {
    console.error('Error al asignar profesor:', error);
    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
  }
}


if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
  document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('hidden');
        } else {
          entry.target.classList.remove('visible');
          entry.target.classList.add('hidden');
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('.section-content, .about-content, .stats-grid, .faq-item');
    sections.forEach(section => {
      section.classList.add('scroll-animate');
      observer.observe(section);
    });

    const cards = document.querySelectorAll('.feature-card, .role-card, .module-card');
    cards.forEach(card => {
      observer.observe(card);
    });

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          entry.target.classList.remove('hidden');
        } else {
          entry.target.classList.remove('visible');
          entry.target.classList.add('hidden');
        }
      });
    }, { 
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    const images = document.querySelectorAll('.animate-on-scroll');
    images.forEach(img => {
      img.classList.add('scroll-animate-img');
      imageObserver.observe(img);
    });

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.pageYOffset;
          const heroImage = document.querySelector('.hero-main .hero-image');
          if (heroImage && scrolled < 800) {
            heroImage.style.transform = `translateY(${scrolled * 0.3}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    });

    const animateNumber = (element, target) => {
      const duration = 2000;
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          element.textContent = target + '+';
          clearInterval(timer);
        } else {
          element.textContent = Math.floor(current) + '+';
        }
      }, 16);
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('animated');
          setTimeout(() => {
            entry.target.classList.add('animated');
            const number = parseInt(entry.target.dataset.number);
            if (number) animateNumber(entry.target, number);
          }, 100);
        } else {
          const number = parseInt(entry.target.dataset.number);
          entry.target.textContent = '0+';
        }
      });
    }, { threshold: 0.3 });

    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
      const number = parseInt(stat.textContent);
      stat.dataset.number = number;
      stat.textContent = '0+';
      statsObserver.observe(stat);
    });
  });
}

const style = document.createElement('style');
style.textContent = `
  .scroll-animate {
    opacity: 0;
    transform: translateY(40px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .scroll-animate.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .scroll-animate.hidden {
    opacity: 0;
    transform: translateY(40px);
  }
  
  .scroll-animate-img {
    opacity: 0 !important;
    transform: scale(0.9) translateY(30px) !important;
    transition: opacity 1.8s cubic-bezier(0.4, 0, 0.2, 1), 
                transform 1.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .scroll-animate-img.visible {
    opacity: 1 !important;
    transform: scale(1) translateY(0) !important;
  }
  
  .scroll-animate-img.hidden {
    opacity: 0 !important;
    transform: scale(0.9) translateY(30px) !important;
  }
`;
document.head.appendChild(style);

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return; // Ignorar enlaces vacíos o solo #
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const diameter = Math.max(button.clientWidth, button.clientHeight);
  const radius = diameter / 2;

  ripple.style.width = ripple.style.height = `${diameter}px`;
  ripple.style.left = `${event.clientX - button.offsetLeft - radius}px`;
  ripple.style.top = `${event.clientY - button.offsetTop - radius}px`;
  ripple.classList.add('ripple-effect');

  const existingRipple = button.getElementsByClassName('ripple-effect')[0];
  if (existingRipple) {
    existingRipple.remove();
  }

  button.appendChild(ripple);
}

const buttons = document.querySelectorAll('.cta-btn, .cta-btn-secondary, .login-btn');
buttons.forEach(button => {
  button.addEventListener('click', createRipple);
});


async function loadCuotasGestion() {
  const container = document.getElementById('cuotasGestionContainer');
  if (!container) return;

  container.innerHTML = `
    <div style="max-width: 1400px; margin: 0 auto;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="margin-bottom: 32px;">
          <h2 style="margin: 0; color: #1f2937; font-size: 28px;"> Gestión de Cuotas Disponibles</h2>
          <p style="margin: 8px 0 0 0; color: #6b7280;">Controla qué cuotas pueden pagar los alumnos en cada curso</p>
        </div>

        <div id="cursosListaCuotas" style="display: grid; gap: 20px;">
          <div style="text-align: center; padding: 60px; color: #9ca3af;">
            <i data-lucide="loader" style="width: 48px; height: 48px; animation: spin 1s linear infinite;"></i>
            <p style="margin-top: 16px;">Cargando cursos...</p>
          </div>
        </div>
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined') lucide.createIcons();

  try {
    const response = await fetch(`${API_URL}/cursos`);
    const cursos = await response.json();

    const listaCursos = document.getElementById('cursosListaCuotas');
    if (cursos.length === 0) {
      listaCursos.innerHTML = `
        <div style="text-align: center; padding: 60px; color: #9ca3af;">
          <i data-lucide="inbox" style="width: 48px; height: 48px;"></i>
          <p style="margin-top: 16px;">No hay cursos disponibles</p>
        </div>
      `;
      if (typeof lucide !== 'undefined') lucide.createIcons();
      return;
    }

    listaCursos.innerHTML = cursos.map(curso => `
      <div style="background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 12px; padding: 24px; transition: all 0.3s;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
              <div style="background: #4a5259; color: white; width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                <i data-lucide="book-open" style="width: 20px; height: 20px;"></i>
              </div>
              <div>
                <h3 style="margin: 0; color: #111827; font-size: 20px;">${curso.nombre_curso}</h3>
                <p style="margin: 4px 0 0 0; color: #6b7280; font-size: 14px;">${curso.nombre_idioma} - ${curso.nivel || 'Sin nivel'}</p>
              </div>
            </div>
            <div style="display: flex; gap: 24px; margin-top: 12px; font-size: 14px; color: #6b7280;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <i data-lucide="user" style="width: 16px; height: 16px;"></i>
                <span>${curso.profesor || 'Sin profesor'}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <i data-lucide="users" style="width: 16px; height: 16px;"></i>
                <span>${curso.alumnos_inscritos || 0} alumnos</span>
              </div>
            </div>
          </div>
          <button onclick="gestionarCuotasCurso(${curso.id_curso}, '${curso.nombre_curso.replace(/'/g, "\\'")}')" class="btn-primary" style="white-space: nowrap;">
            <i data-lucide="settings"></i>
            Gestionar Cuotas
          </button>
        </div>
        <div id="cuotasPreview_${curso.id_curso}" style="padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
          Cargando...
        </div>
      </div>
    `).join('');

    if (typeof lucide !== 'undefined') lucide.createIcons();

    cursos.forEach(async (curso) => {
      try {
        const resC = await fetch(`${API_URL}/cursos/${curso.id_curso}/cuotas`);
        const dataCuotas = await resC.json();
        const preview = document.getElementById(`cuotasPreview_${curso.id_curso}`);
        
        const cuotas = dataCuotas.cuotasHabilitadas || [];
        
        if (cuotas.length === 10) {
          preview.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: #059669;">
              <i data-lucide="check-circle" style="width: 16px; height: 16px;"></i>
              <span><strong>Todas las cuotas habilitadas</strong> (sin restricciones)</span>
            </div>
          `;
        } else if (cuotas.length === 0) {
          preview.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; color: #dc2626;">
              <i data-lucide="x-circle" style="width: 16px; height: 16px;"></i>
              <span><strong>Ninguna cuota habilitada</strong></span>
            </div>
          `;
        } else {
          preview.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
              <i data-lucide="lock" style="width: 16px; height: 16px;"></i>
              <span><strong>${cuotas.length} cuotas habilitadas:</strong> ${cuotas.join(', ')}</span>
            </div>
          `;
        }
        
        if (typeof lucide !== 'undefined') lucide.createIcons();
      } catch (error) {
        console.error('Error al cargar preview de cuotas:', error);
      }
    });

  } catch (error) {
    console.error('Error al cargar cursos:', error);
    listaCursos.innerHTML = `
      <div style="text-align: center; padding: 60px; color: #ef4444;">
        <i data-lucide="alert-circle" style="width: 48px; height: 48px;"></i>
        <p style="margin-top: 16px;">Error al cargar los cursos</p>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

async function gestionarCuotasCurso(idCurso, nombreCurso) {
  try {
    const passwordResponse = await fetch(`${API_URL}/config/cobranzas-password`);
    const passwordData = await passwordResponse.json();
    const claveCorrecta = passwordData.password || 'tesoreria';

    const { value: claveIngresada } = await Swal.fire({
      title: 'COBRANZAS',
      html: `
        <style>
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
            20%, 40%, 60%, 80% { transform: translateX(10px); }
          }
          @keyframes unlock {
            0% { transform: rotate(0deg); }
            50% { transform: rotate(-15deg); }
            100% { transform: rotate(0deg); }
          }
          .lock-icon {
            font-size: 64px;
            margin-bottom: 20px;
            transition: all 0.3s ease;
          }
          .shake { animation: shake 0.5s; }
          .unlock-animation { animation: unlock 0.6s ease; }
        </style>
        <div style="text-align: center; padding: 20px;">
          <div id="lock-icon" class="lock-icon"></div>
          <p style="margin-bottom: 24px; color: #6b7280; font-size: 15px;">
            Ingrese la clave asignada para ingresar
          </p>
          <input id="swal-password" type="password" class="swal2-input" placeholder="••••••••" style="width: 100%; margin: 0; text-align: center; font-size: 18px; letter-spacing: 2px;" autocomplete="off">
        </div>
      `,
      width: '450px',
      showCancelButton: true,
      confirmButtonText: '<i class="lucide-unlock" style="width: 16px; height: 16px;"></i> Acceder',
      cancelButtonText: '<i class="lucide-x" style="width: 16px; height: 16px;"></i> Cancelar',
      confirmButtonColor: '#4a5259',
      cancelButtonColor: '#6b7280',
      focusConfirm: false,
      didOpen: () => {
        if (typeof lucide !== 'undefined') {
          lucide.createIcons();
        }
        document.getElementById('swal-password').focus();
      },
      preConfirm: () => {
        const password = document.getElementById('swal-password').value;
        const lockIcon = document.getElementById('lock-icon');
        
        if (!password) {
          lockIcon.classList.add('shake');
          lockIcon.style.filter = 'brightness(0.8)';
          setTimeout(() => {
            lockIcon.classList.remove('shake');
            lockIcon.style.filter = 'none';
          }, 500);
          Swal.showValidationMessage('Debe ingresar la clave');
          return false;
        }
        
        if (password !== claveCorrecta) {
          lockIcon.textContent = '';
          lockIcon.classList.add('shake');
          lockIcon.style.color = '#ef4444';
          setTimeout(() => {
            lockIcon.classList.remove('shake');
            lockIcon.style.color = '';
          }, 500);
          Swal.showValidationMessage(' Clave incorrecta');
          return false;
        }
        
        return new Promise((resolve) => {
          setTimeout(() => {
            lockIcon.textContent = '';
            lockIcon.classList.add('unlock-animation');
            lockIcon.style.color = '#10b981';
            
            setTimeout(() => {
              resolve(password);
            }, 700);
          }, 200);
        });
      }
    });

    if (!claveIngresada) {
      return;
    }

    const response = await fetch(`${API_URL}/cursos/${idCurso}/cuotas`);
    const data = await response.json();

    const todasLasCuotas = ['Matricula', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'];
    const cuotasActuales = data.cuotasHabilitadas || [];

    const result = await Swal.fire({
      title: ` Gestionar Cuotas`,
      html: `
        <div style="text-align: left;">
          <p style="margin-bottom: 20px; color: #6b7280;">
            <strong style="color: #111827;">${nombreCurso}</strong><br>
            Selecciona las cuotas que los alumnos PUEDEN pagar en este curso
          </p>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
            ${todasLasCuotas.map(cuota => `
              <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
                <input type="checkbox" value="${cuota}" ${cuotasActuales.includes(cuota) ? 'checked' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                <span style="font-weight: 500; color: #374151;">${cuota}</span>
              </label>
            `).join('')}
          </div>
          <div style="margin-top: 20px; padding: 16px; background: #f5f5f7; border-left: 4px solid #4a5259; border-radius: 8px;">
            <p style="margin: 0; font-size: 14px; color: #4a5259;">
               <strong>Tip:</strong> Los alumnos solo verán y podrán pagar las cuotas seleccionadas.
            </p>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      width: '600px',
      customClass: {
        confirmButton: 'swal2-confirm swal2-styled',
        cancelButton: 'swal2-cancel swal2-styled'
      },
      preConfirm: () => {
        const checkboxes = Swal.getPopup().querySelectorAll('input[type="checkbox"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
      }
    });

    if (result.isConfirmed) {
      const cuotasSeleccionadas = result.value || [];

      const saveResponse = await fetch(`${API_URL}/cursos/${idCurso}/cuotas`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuotas: cuotasSeleccionadas })
      });

      const saveData = await saveResponse.json();

      if (saveData.success) {
        await Swal.fire({
          icon: 'success',
          title: ' Cuotas Actualizadas',
          text: `Las cuotas han sido actualizadas para ${nombreCurso}`,
          timer: 2000,
          showConfirmButton: false
        });

        loadCuotasGestion();
      } else {
        throw new Error(saveData.message || 'Error al guardar');
      }
    }

  } catch (error) {
    console.error('Error al gestionar cuotas:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudieron actualizar las cuotas del curso'
    });
  }
}

async function liberarCuotasTodasLosCursos() {
  const todasLasCuotas = ['Matricula', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre'];

  const result = await Swal.fire({
    title: ' Liberar Cuotas para TODOS los Cursos',
    html: `
      <div style="text-align: left;">
        <p style="margin-bottom: 20px; color: #6b7280;">
          Selecciona las cuotas que estarán disponibles para <strong style="color: #111827;">TODOS los cursos</strong>
        </p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
          ${todasLasCuotas.map(cuota => `
            <label style="display: flex; align-items: center; gap: 10px; padding: 12px; background: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; cursor: pointer; transition: all 0.2s;">
              <input type="checkbox" value="${cuota}" style="width: 18px; height: 18px; cursor: pointer;">
              <span style="font-weight: 500; color: #374151;">${cuota}</span>
            </label>
          `).join('')}
        </div>
        <div style="margin-top: 20px; padding: 16px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #92400e;">
            ️ <strong>Atención:</strong> Esto sobrescribirá la configuración de TODOS los cursos.
          </p>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Aplicar a Todos',
    cancelButtonText: 'Cancelar',
    width: '600px',
    confirmButtonColor: '#dc2626',
    preConfirm: () => {
      const checkboxes = Swal.getPopup().querySelectorAll('input[type="checkbox"]:checked');
      return Array.from(checkboxes).map(cb => cb.value);
    }
  });

  if (result.isConfirmed) {
    const cuotasSeleccionadas = result.value;

    if (cuotasSeleccionadas.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Atención',
        text: 'Debes seleccionar al menos una cuota'
      });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/cursos/cuotas/todos`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cuotas: cuotasSeleccionadas })
      });

      const data = await response.json();

      if (data.success) {
        await Swal.fire({
          icon: 'success',
          title: ' Cuotas Actualizadas',
          text: `Las cuotas han sido actualizadas para ${data.cursos_actualizados} cursos`,
          timer: 2500,
          showConfirmButton: false
        });

        loadCuotasGestion();
      } else {
        throw new Error(data.message || 'Error al guardar');
      }

    } catch (error) {
      console.error('Error al liberar cuotas:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron actualizar las cuotas'
      });
    }
  }
}

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  button {
    position: relative;
    overflow: hidden;
  }
  
  .ripple-effect {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  }
  
  @keyframes ripple-animation {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
`;
document.head.appendChild(rippleStyle);


async function descargarPDFAlumnos() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); // Landscape para más espacio
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Colores Harvard Style
    const COLORS = {
      charcoal: [30, 30, 30],
      wroughtIron: [74, 74, 74],
      graphite: [101, 111, 119],
      silver: [160, 160, 160],
      lightGray: [248, 249, 250],
      white: [255, 255, 255],
      text: [45, 45, 45],
      accent: [45, 50, 124],
      success: [16, 185, 129],
      warning: [245, 158, 11],
      error: [239, 68, 68]
    };
    
    const responseAlumnos = await fetch(`${API_URL}/alumnos`);
    const alumnos = await responseAlumnos.json();
    
    const responseInscripciones = await fetch(`${API_URL}/inscripciones`);
    const inscripciones = await responseInscripciones.json();
    
    const inscripcionesPorAlumno = {};
    inscripciones.forEach(insc => {
      if (!inscripcionesPorAlumno[insc.id_alumno]) {
        inscripcionesPorAlumno[insc.id_alumno] = [];
      }
      if (insc.estado === 'activo') {
        inscripcionesPorAlumno[insc.id_alumno].push(insc.nombre_curso);
      }
    });
    
    // ===== HEADER MODERNO =====
    // Barra superior oscura
    doc.setFillColor(...COLORS.charcoal);
    doc.rect(0, 0, pageWidth, 28, 'F');
    
    // Línea decorativa
    doc.setFillColor(...COLORS.wroughtIron);
    doc.rect(0, 28, pageWidth, 2, 'F');
    doc.setFillColor(...COLORS.graphite);
    doc.rect(0, 30, pageWidth, 0.5, 'F');
    
    // Logo con círculo blanco
    const img = new Image();
    img.src = '/images/logo.png';
    await new Promise((resolve) => {
      img.onload = () => {
        doc.setFillColor(...COLORS.white);
        doc.circle(20, 14, 9, 'F');
        doc.addImage(img, 'PNG', 11, 5, 18, 18);
        resolve();
      };
      img.onerror = resolve;
    });
    
    // Título CEMI
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text('CEMI', 35, 12);
    
    // Subtítulo
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.silver);
    doc.text('Centro de Enseñanza Multilingüe Integral', 35, 18);
    
    // Línea decorativa bajo el subtítulo
    doc.setDrawColor(...COLORS.graphite);
    doc.setLineWidth(0.3);
    doc.line(35, 21, 90, 21);
    
    // Título del documento (derecha)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text('Listado de Alumnos', pageWidth - 15, 14, { align: 'right' });
    
    // Fecha de generación
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.silver);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth - 15, 20, { align: 'right' });
    
    // ===== RESUMEN ESTADÍSTICO =====
    const totalAlumnos = alumnos.length;
    const alumnosActivos = alumnos.filter(a => a.estado === 'activo').length;
    const alumnosInactivos = totalAlumnos - alumnosActivos;
    
    let yPos = 38;
    
    // Caja de resumen
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(15, yPos, pageWidth - 30, 14, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(`Total de Alumnos: ${totalAlumnos}`, 25, yPos + 9);
    
    // Indicador activos (verde)
    doc.setFillColor(...COLORS.success);
    doc.circle(120, yPos + 7, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.graphite);
    doc.text(`Activos: ${alumnosActivos}`, 126, yPos + 9);
    
    // Indicador inactivos (naranja)
    doc.setFillColor(...COLORS.warning);
    doc.circle(180, yPos + 7, 3, 'F');
    doc.text(`Inactivos: ${alumnosInactivos}`, 186, yPos + 9);
    
    yPos += 20;
    
    // ===== TABLA DE DATOS =====
    const tableData = alumnos.map(alumno => {
      const nombreCompleto = `${alumno.nombre || ''} ${alumno.apellido || ''}`.trim() || '-';
      const cursos = inscripcionesPorAlumno[alumno.id_alumno]?.join(', ') || 'Sin cursos';
      
      return [
        nombreCompleto,
        alumno.mail || '-',
        alumno.telefono || '-',
        alumno.dni || '-',
        cursos,
        alumno.estado || '-'
      ];
    });
    
    doc.autoTable({
      startY: yPos,
      head: [['Nombre Completo', 'Email', 'Teléfono', 'DNI', 'Cursos Inscriptos', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.accent,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: COLORS.text
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 55, textColor: COLORS.accent },
        2: { cellWidth: 30 },
        3: { cellWidth: 25 },
        4: { cellWidth: 70 },
        5: { cellWidth: 22, halign: 'center' }
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        // Colorear el estado
        if (data.section === 'body' && data.column.index === 5) {
          const estado = data.cell.raw?.toLowerCase();
          if (estado === 'activo') {
            data.cell.styles.textColor = COLORS.success;
            data.cell.styles.fontStyle = 'bold';
          } else if (estado === 'inactivo') {
            data.cell.styles.textColor = COLORS.warning;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    
    // ===== FOOTER EN TODAS LAS PÁGINAS =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Línea separadora del footer
      doc.setDrawColor(...COLORS.graphite);
      doc.setLineWidth(0.3);
      doc.line(15, pageHeight - 18, pageWidth - 15, pageHeight - 18);
      
      // Texto izquierda
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.graphite);
      doc.text('CEMI - Centro de Enseñanza Multilingüe Integral', 15, pageHeight - 12);
      
      // Fecha y hora
      const fechaHora = new Date().toLocaleString('es-ES', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      doc.text(`Documento generado: ${fechaHora}`, 15, pageHeight - 8);
      
      // Número de página (derecha)
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 15,
        pageHeight - 10,
        { align: 'right' }
      );
    }
    
    doc.save(`CEMI_Alumnos_${new Date().toISOString().split('T')[0]}.pdf`);
    
    showToast('PDF descargado exitosamente', 'success');
  } catch (error) {
    console.error('Error al generar PDF de alumnos:', error);
    showToast('Error al generar el PDF', 'error');
  }
}

async function descargarPDFProfesores() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('landscape'); // Landscape para más espacio
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Colores Harvard Style
    const COLORS = {
      charcoal: [30, 30, 30],
      wroughtIron: [74, 74, 74],
      graphite: [101, 111, 119],
      silver: [160, 160, 160],
      lightGray: [248, 249, 250],
      white: [255, 255, 255],
      text: [45, 45, 45],
      accent: [45, 50, 124],
      success: [16, 185, 129],
      warning: [245, 158, 11],
      error: [239, 68, 68]
    };
    
    const responseProfesores = await fetch(`${API_URL}/profesores`);
    const profesores = await responseProfesores.json();
    
    const responseCursos = await fetch(`${API_URL}/cursos`);
    const cursos = await responseCursos.json();
    
    const cursosPorProfesor = {};
    cursos.forEach(curso => {
      if (!cursosPorProfesor[curso.id_profesor]) {
        cursosPorProfesor[curso.id_profesor] = [];
      }
      cursosPorProfesor[curso.id_profesor].push(curso.nombre_curso);
    });
    
    // ===== HEADER MODERNO =====
    // Barra superior oscura
    doc.setFillColor(...COLORS.charcoal);
    doc.rect(0, 0, pageWidth, 28, 'F');
    
    // Línea decorativa
    doc.setFillColor(...COLORS.wroughtIron);
    doc.rect(0, 28, pageWidth, 2, 'F');
    doc.setFillColor(...COLORS.graphite);
    doc.rect(0, 30, pageWidth, 0.5, 'F');
    
    // Logo con círculo blanco
    const img = new Image();
    img.src = '/images/logo.png';
    await new Promise((resolve) => {
      img.onload = () => {
        doc.setFillColor(...COLORS.white);
        doc.circle(20, 14, 9, 'F');
        doc.addImage(img, 'PNG', 11, 5, 18, 18);
        resolve();
      };
      img.onerror = resolve;
    });
    
    // Título CEMI
    doc.setFontSize(16);
    doc.setFont('times', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text('CEMI', 35, 12);
    
    // Subtítulo
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.silver);
    doc.text('Centro de Enseñanza Multilingüe Integral', 35, 18);
    
    // Línea decorativa bajo el subtítulo
    doc.setDrawColor(...COLORS.graphite);
    doc.setLineWidth(0.3);
    doc.line(35, 21, 90, 21);
    
    // Título del documento (derecha)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.white);
    doc.text('Listado de Profesores', pageWidth - 15, 14, { align: 'right' });
    
    // Fecha de generación
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.silver);
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}`, pageWidth - 15, 20, { align: 'right' });
    
    // ===== RESUMEN ESTADÍSTICO =====
    const totalProfesores = profesores.length;
    const profesoresActivos = profesores.filter(p => p.estado === 'activo').length;
    const profesoresInactivos = totalProfesores - profesoresActivos;
    
    let yPos = 38;
    
    // Caja de resumen
    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(15, yPos, pageWidth - 30, 14, 3, 3, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.text);
    doc.text(`Total de Profesores: ${totalProfesores}`, 25, yPos + 9);
    
    // Indicador activos (verde)
    doc.setFillColor(...COLORS.success);
    doc.circle(130, yPos + 7, 3, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...COLORS.graphite);
    doc.text(`Activos: ${profesoresActivos}`, 136, yPos + 9);
    
    // Indicador inactivos (naranja)
    doc.setFillColor(...COLORS.warning);
    doc.circle(190, yPos + 7, 3, 'F');
    doc.text(`Inactivos: ${profesoresInactivos}`, 196, yPos + 9);
    
    yPos += 20;
    
    // ===== TABLA DE DATOS =====
    const tableData = profesores.map(profesor => {
      const nombreCompleto = `${profesor.nombre || ''} ${profesor.apellido || ''}`.trim() || '-';
      const cursos = cursosPorProfesor[profesor.id_profesor]?.join(', ') || 'Sin cursos asignados';
      
      return [
        nombreCompleto,
        profesor.mail || '-',
        profesor.telefono || '-',
        profesor.especialidad || '-',
        cursos,
        profesor.estado || '-'
      ];
    });
    
    doc.autoTable({
      startY: yPos,
      head: [['Nombre Completo', 'Email', 'Teléfono', 'Especialidad', 'Cursos que Dicta', 'Estado']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.accent,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 4,
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: COLORS.text
      },
      alternateRowStyles: {
        fillColor: COLORS.lightGray
      },
      columnStyles: {
        0: { cellWidth: 45, fontStyle: 'bold' },
        1: { cellWidth: 55, textColor: COLORS.accent },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
        4: { cellWidth: 60 },
        5: { cellWidth: 22, halign: 'center' }
      },
      margin: { left: 15, right: 15 },
      didParseCell: function(data) {
        // Colorear el estado
        if (data.section === 'body' && data.column.index === 5) {
          const estado = data.cell.raw?.toLowerCase();
          if (estado === 'activo') {
            data.cell.styles.textColor = COLORS.success;
            data.cell.styles.fontStyle = 'bold';
          } else if (estado === 'inactivo') {
            data.cell.styles.textColor = COLORS.warning;
            data.cell.styles.fontStyle = 'bold';
          }
        }
      }
    });
    
    // ===== FOOTER EN TODAS LAS PÁGINAS =====
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Línea separadora del footer
      doc.setDrawColor(...COLORS.graphite);
      doc.setLineWidth(0.3);
      doc.line(15, pageHeight - 18, pageWidth - 15, pageHeight - 18);
      
      // Texto izquierda
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.graphite);
      doc.text('CEMI - Centro de Enseñanza Multilingüe Integral', 15, pageHeight - 12);
      
      // Fecha y hora
      const fechaHora = new Date().toLocaleString('es-ES', { 
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
      doc.text(`Documento generado: ${fechaHora}`, 15, pageHeight - 8);
      
      // Número de página (derecha)
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Página ${i} de ${pageCount}`,
        pageWidth - 15,
        pageHeight - 10,
        { align: 'right' }
      );
    }
    
    doc.save(`CEMI_Profesores_${new Date().toISOString().split('T')[0]}.pdf`);
    
    showToast('PDF descargado exitosamente', 'success');
  } catch (error) {
    console.error('Error al generar PDF de profesores:', error);
    showToast('Error al generar el PDF', 'error');
  }
}


async function generarComprobantePago(idPago) {
  try {
    const { jsPDF } = window.jspdf;
    
    const response = await fetch(`${API_URL}/pagos/${idPago}`);
    const pago = await response.json();
    
    if (!pago || !pago.id_pago) {
      throw new Error('No se encontro el pago');
    }
    
    const HARVARD = {
      charcoal: [30, 30, 30],
      wroughtIron: [74, 74, 74],
      graphite: [101, 111, 119],
      silver: [160, 160, 160],
      lightGray: [245, 245, 245],
      success: [16, 185, 129],
      white: [255, 255, 255]
    };
    
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [80, 200]
    });
    
    const centerX = 40;
    let yPos = 0;
    
    doc.setFillColor(...HARVARD.charcoal);
    doc.rect(0, 0, 80, 32, 'F');
    
    const img = new Image();
    img.src = '/images/logo.png';
    await new Promise((resolve) => {
      img.onload = () => {
        doc.setFillColor(...HARVARD.white);
        doc.roundedRect(24, 4, 32, 24, 2, 2, 'F');
        doc.addImage(img, 'PNG', 26, 6, 28, 20);
        resolve();
      };
      img.onerror = resolve;
    });
    
    yPos = 38;
    
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...HARVARD.charcoal);
    doc.text('COMPROBANTE DE PAGO', centerX, yPos, { align: 'center' });
    yPos += 5;
    
    doc.setDrawColor(...HARVARD.charcoal);
    doc.setLineWidth(1);
    doc.line(15, yPos, 65, yPos);
    doc.setDrawColor(...HARVARD.graphite);
    doc.setLineWidth(0.3);
    doc.line(15, yPos + 1.5, 65, yPos + 1.5);
    yPos += 8;
    
    doc.setFillColor(...HARVARD.lightGray);
    doc.roundedRect(10, yPos, 60, 14, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...HARVARD.graphite);
    doc.text('N. Comprobante', centerX, yPos + 5, { align: 'center' });
    doc.setFontSize(13);
    doc.setTextColor(...HARVARD.charcoal);
    doc.text(`#${String(pago.id_pago).padStart(6, '0')}`, centerX, yPos + 11, { align: 'center' });
    yPos += 18;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...HARVARD.graphite);
    doc.text(`Fecha: ${new Date(pago.fecha_pago).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`, centerX, yPos, { align: 'center' });
    yPos += 7;
    
    doc.setDrawColor(...HARVARD.silver);
    doc.setLineWidth(0.2);
    doc.line(10, yPos, 70, yPos);
    yPos += 6;
    
    doc.setFillColor(...HARVARD.charcoal);
    doc.rect(10, yPos, 60, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...HARVARD.white);
    doc.text('DATOS DEL ALUMNO', centerX, yPos + 3.5, { align: 'center' });
    yPos += 8;
    
    doc.setTextColor(...HARVARD.charcoal);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Alumno:', 12, yPos);
    doc.setFont('helvetica', 'bold');
    const nombreLines = doc.splitTextToSize(pago.alumno || '-', 42);
    doc.text(nombreLines, 68, yPos, { align: 'right' });
    yPos += nombreLines.length * 3.5 + 1;
    
    doc.setFont('helvetica', 'normal');
    doc.text('Legajo:', 12, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(pago.legajo || '-', 68, yPos, { align: 'right' });
    yPos += 4;
    
    doc.setFont('helvetica', 'normal');
    doc.text('DNI:', 12, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(String(pago.dni) || '-', 68, yPos, { align: 'right' });
    yPos += 6;
    
    doc.setDrawColor(...HARVARD.silver);
    doc.line(10, yPos, 70, yPos);
    yPos += 4;
    
    doc.setFillColor(...HARVARD.charcoal);
    doc.rect(10, yPos, 60, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...HARVARD.white);
    doc.text('DETALLES DEL PAGO', centerX, yPos + 3.5, { align: 'center' });
    yPos += 8;
    
    doc.setTextColor(...HARVARD.charcoal);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Concepto:', 12, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(pago.concepto || '-', 68, yPos, { align: 'right' });
    yPos += 4;
    
    if (pago.mes_cuota) {
      doc.setFont('helvetica', 'normal');
      doc.text('Cuota:', 12, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(pago.mes_cuota, 68, yPos, { align: 'right' });
      yPos += 4;
    }
    
    if (pago.periodo) {
      doc.setFont('helvetica', 'normal');
      doc.text('Periodo:', 12, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(pago.periodo, 68, yPos, { align: 'right' });
      yPos += 4;
    }
    
    doc.setFont('helvetica', 'normal');
    doc.text('Medio de Pago:', 12, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(pago.medio_pago || '-', 68, yPos, { align: 'right' });
    yPos += 7;
    
    doc.setFillColor(...HARVARD.charcoal);
    doc.roundedRect(10, yPos, 60, 12, 2, 2, 'F');
    doc.setTextColor(...HARVARD.white);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL PAGADO', 15, yPos + 5);
    doc.setFontSize(13);
    doc.text(`$${parseFloat(pago.monto).toLocaleString('es-AR', {minimumFractionDigits: 2})}`, 65, yPos + 8, { align: 'right' });
    yPos += 17;
    
    doc.setFillColor(...HARVARD.success);
    doc.roundedRect(20, yPos, 40, 7, 2, 2, 'F');
    doc.setTextColor(...HARVARD.white);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAGO CONFIRMADO', centerX, yPos + 5, { align: 'center' });
    yPos += 12;
    
    doc.setDrawColor(...HARVARD.silver);
    doc.setLineWidth(0.2);
    doc.line(10, yPos, 70, yPos);
    yPos += 5;
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...HARVARD.graphite);
    doc.text('CEMI - Centro de Ensenanza de Idiomas', centerX, yPos, { align: 'center' });
    yPos += 4;
    doc.text(`Generado el ${new Date().toLocaleDateString('es-ES')}`, centerX, yPos, { align: 'center' });
    yPos += 3;
    doc.setFontSize(6);
    doc.text('Comprobante valido de pago', centerX, yPos, { align: 'center' });
    
    const nombreArchivo = `Comprobante_${String(pago.id_pago).padStart(6, '0')}_${pago.alumno.replace(/\s+/g, '_')}.pdf`;
    doc.save(nombreArchivo);
    
    showToast('Comprobante generado exitosamente', 'success');
  } catch (error) {
    console.error('Error al generar comprobante:', error);
    showToast('Error al generar el comprobante', 'error');
  }
}


async function renderInvestigacionSection() {
  try {
    const token = localStorage.getItem('token');
    const [statsRes, encuestasRes] = await Promise.all([
      fetch(`${API_URL}/investigacion/estadisticas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_URL}/investigacion/encuestas`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ]);
    
    const stats = await statsRes.json();
    const encuestas = await encuestasRes.json();
    
    return `
      <div class="investigacion-container">
        <div class="investigacion-header">
          <div class="investigacion-title">
            <i data-lucide="flask-conical" style="color: #4a5259;"></i>
            <div>
              <h2 style="color: #4a5259;">Investigación CEMI</h2>
              <p>Centro de recopilación de datos de experiencia de usuario</p>
            </div>
          </div>
          <a href="formulario-encuesta.html" target="_blank" class="btn-primary" style="display: inline-flex; align-items: center; gap: 8px; background: #1e1e1e; color: white;">
            <i data-lucide="external-link"></i>
            Ver Landing de Encuesta
          </a>
        </div>

        <!-- Estadísticas -->
        <div class="investigacion-stats">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(74, 82, 89, 0.1);">
              <i data-lucide="file-text"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">${stats.estadisticas?.total || 0}</span>
              <span class="stat-label">Total Encuestas</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(74, 82, 89, 0.1);">
              <i data-lucide="star"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">${stats.estadisticas?.promedioSatisfaccion || '0.0'}</span>
              <span class="stat-label">Satisfacción Promedio</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4a5259, #6b7280);">
              <i data-lucide="smile"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">${stats.estadisticas?.distribucionSatisfaccion?.[10] || 0}</span>
              <span class="stat-label">Muy Satisfechos</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(74, 82, 89, 0.1);">
              <i data-lucide="calendar"></i>
            </div>
            <div class="stat-info">
              <span class="stat-number">${stats.estadisticas?.ultimaEncuesta ? new Date(stats.estadisticas.ultimaEncuesta).toLocaleDateString('es-AR', {day: '2-digit', month: 'short'}) : 'N/A'}</span>
              <span class="stat-label">Última Encuesta</span>
            </div>
          </div>
        </div>

        <!-- Lista de Encuestas -->
        <div class="investigacion-list-container">
          <div class="list-header">
            <h3><i data-lucide="list"></i> Encuestas Recibidas</h3>
            <div class="list-actions">
              <input type="text" id="searchEncuestas" placeholder="Buscar por nombre o email..." class="search-input">
            </div>
          </div>
          
          <div class="encuestas-list" id="encuestasList">
            ${encuestas.encuestas?.length === 0 || !encuestas.encuestas ? `
              <div class="empty-state">
                <i data-lucide="inbox"></i>
                <h4>No hay encuestas aún</h4>
                <p>Las encuestas completadas aparecerán aquí</p>
              </div>
            ` : encuestas.encuestas.map(enc => {
              const nombreCompleto = `${enc.firstName || ''} ${enc.lastName || ''}`.trim() || 'Sin nombre';
              const iniciales = nombreCompleto.split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase() || 'NA';
              return `
              <div class="encuesta-item" data-id="${enc.id}">
                <div class="encuesta-avatar" style="background: rgba(74, 82, 89, 0.1);">
                  <span>${iniciales}</span>
                </div>
                <div class="encuesta-info">
                  <div class="encuesta-name">${nombreCompleto}</div>
                  <div class="encuesta-meta">
                    <span><i data-lucide="mail"></i> ${enc.email}</span>
                    <span class="satisfaction-badge satisfaction-${enc.satisfaction || 'na'}">
                      <i data-lucide="star"></i> ${enc.satisfaction || 'N/A'}/10
                    </span>
                  </div>
                </div>
                <div class="encuesta-date">
                  <i data-lucide="calendar"></i>
                  ${new Date(enc.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
                <div class="encuesta-actions">
                  <button class="btn-icon btn-view" onclick="verEncuestaPDF('${enc.pdfUrl}')" title="Ver PDF">
                    <i data-lucide="eye"></i>
                  </button>
                  <button class="btn-icon btn-download" onclick="descargarEncuestaPDF('${enc.pdfUrl}', '${nombreCompleto}')" title="Descargar">
                    <i data-lucide="download"></i>
                  </button>
                  <button class="btn-icon btn-delete" onclick="eliminarEncuesta('${enc.id}')" title="Eliminar">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </div>
            `}).join('')}
          </div>
        </div>

        <!-- Modal para PDF Viewer -->
        <div class="pdf-viewer-modal" id="pdfViewerModal">
          <div class="pdf-viewer-content">
            <div class="pdf-viewer-header">
              <h3><i data-lucide="file-text"></i> Visualizador de Encuesta</h3>
              <button class="btn-close-modal" onclick="cerrarPDFViewer()">
                <i data-lucide="x"></i>
              </button>
            </div>
            <div class="pdf-viewer-body">
              <iframe id="pdfViewerFrame" src="" frameborder="0"></iframe>
            </div>
          </div>
        </div>
      </div>

      <style>
        .investigacion-container {
          padding: 20px;
        }
        
        .investigacion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 16px;
        }
        
        .investigacion-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .investigacion-title > i {
          width: 48px;
          height: 48px;
          color: #4a5259;
        }
        
        .investigacion-title h2 {
          margin: 0;
          color: #2c3e50;
        }
        
        .investigacion-title p {
          margin: 4px 0 0;
          color: #666;
          font-size: 14px;
        }
        
        .investigacion-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        
        .stat-icon i {
          width: 28px;
          height: 28px;
        }
        
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        
        .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #2c3e50;
        }
        
        .stat-label {
          font-size: 13px;
          color: #666;
        }
        
        .investigacion-list-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.08);
          overflow: hidden;
        }
        
        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #eee;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .list-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2c3e50;
        }
        
        .list-header h3 i {
          width: 20px;
          height: 20px;
          color: #4a5259;
        }
        
        .search-input {
          padding: 10px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 14px;
          min-width: 250px;
          transition: border-color 0.2s;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #4a5259;
        }
        
        .encuestas-list {
          max-height: 500px;
          overflow-y: auto;
        }
        
        .encuesta-item {
          display: flex;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #f0f0f0;
          gap: 16px;
          transition: background-color 0.2s;
        }
        
        .encuesta-item:hover {
          background-color: #f5f5f7;
        }
        
        .encuesta-avatar {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #4a5259, #3d444a);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 16px;
          flex-shrink: 0;
        }
        
        .encuesta-info {
          flex: 1;
          min-width: 0;
        }
        
        .encuesta-name {
          font-weight: 600;
          color: #2c3e50;
          margin-bottom: 4px;
        }
        
        .encuesta-meta {
          display: flex;
          gap: 16px;
          font-size: 13px;
          color: #666;
          flex-wrap: wrap;
        }
        
        .encuesta-meta span {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .encuesta-meta i {
          width: 14px;
          height: 14px;
        }
        
        .satisfaction-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          background: #e5e7eb;
          color: #4a5259;
        }
        
        .satisfaction-badge i {
          width: 12px;
          height: 12px;
        }
        
        .satisfaction-10, .satisfaction-9, .satisfaction-8 {
          background: #4a5259;
          color: white;
        }
        
        .satisfaction-7, .satisfaction-6 {
          background: #4a5259;
          color: white;
        }
        
        .satisfaction-5, .satisfaction-4 {
          background: #6b7280;
          color: white;
        }
        
        .satisfaction-3, .satisfaction-2, .satisfaction-1 {
          background: #9ca3af;
          color: #4a5259;
        }
        
        .satisfaction-na {
          background: #e5e7eb;
          color: #6b7280;
        }
        
        .encuesta-date {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #888;
          white-space: nowrap;
        }
        
        .encuesta-date i {
          width: 14px;
          height: 14px;
        }
        
        .encuesta-actions {
          display: flex;
          gap: 8px;
        }
        
        .btn-icon {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .btn-icon i {
          width: 18px;
          height: 18px;
        }
        
        .btn-view {
          background: #e5e7eb;
          color: #4a5259;
        }
        
        .btn-view:hover {
          background: #4a5259;
          color: white;
        }
        
        .btn-download {
          background: #e5e7eb;
          color: #4a5259;
        }
        
        .btn-download:hover {
          background: #4a5259;
          color: white;
        }
        
        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }
        
        .btn-delete:hover {
          background: #dc2626;
          color: white;
        }
        
        .empty-state {
          padding: 60px 20px;
          text-align: center;
          color: #999;
        }
        
        .empty-state i {
          width: 64px;
          height: 64px;
          margin-bottom: 16px;
          opacity: 0.5;
        }
        
        .empty-state h4 {
          margin: 0 0 8px;
          color: #666;
        }
        
        .empty-state p {
          margin: 0;
          font-size: 14px;
        }
        
        .pdf-viewer-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.7);
          z-index: 9999;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .pdf-viewer-modal.active {
          display: flex;
        }
        
        .pdf-viewer-content {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 900px;
          height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        .pdf-viewer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }
        
        .pdf-viewer-header h3 {
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          color: #2c3e50;
        }
        
        .pdf-viewer-header h3 i {
          width: 22px;
          height: 22px;
          color: #4a5259;
        }
        
        .btn-close-modal {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: none;
          background: #eee;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        
        .btn-close-modal:hover {
          background: #f44336;
          color: white;
        }
        
        .pdf-viewer-body {
          flex: 1;
          padding: 0;
          overflow: hidden;
        }
        
        .pdf-viewer-body iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
        
        @media (max-width: 768px) {
          .encuesta-item {
            flex-wrap: wrap;
          }
          
          .encuesta-date {
            width: 100%;
            margin-top: 8px;
          }
          
          .encuesta-actions {
            width: 100%;
            justify-content: flex-end;
            margin-top: 8px;
          }
        }
      </style>
    `;
  } catch (error) {
    console.error('Error al cargar investigación:', error);
    return `
      <div class="investigacion-container">
        <div class="error-state">
          <i data-lucide="alert-circle"></i>
          <h3>Error al cargar datos</h3>
          <p>No se pudo conectar con el servidor de investigación.</p>
          <button onclick="document.getElementById('btnInvestigacion').click()" class="btn-primary">Reintentar</button>
        </div>
      </div>
    `;
  }
}

function initInvestigacionInteractivity() {
  const searchInput = document.getElementById('searchEncuestas');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const items = document.querySelectorAll('.encuesta-item');
      
      items.forEach(item => {
        const name = item.querySelector('.encuesta-name').textContent.toLowerCase();
        const email = item.querySelector('.encuesta-meta').textContent.toLowerCase();
        
        if (name.includes(query) || email.includes(query)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }
}

function verEncuestaPDF(pdfUrl) {
  window.open(pdfUrl, '_blank');
  showToast('Abriendo PDF en nueva ventana...', 'info');
}

function cerrarPDFViewer() {
  const modal = document.getElementById('pdfViewerModal');
  const iframe = document.getElementById('pdfViewerFrame');
  
  if (modal) {
    modal.classList.remove('active');
  }
  if (iframe) {
    iframe.src = '';
  }
}

function descargarEncuestaPDF(pdfUrl, nombre) {
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = `Encuesta_${nombre.replace(/\s+/g, '_')}.pdf`;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function eliminarEncuesta(id) {
  const result = await Swal.fire({
    title: '¿Eliminar encuesta?',
    text: 'Esta acción no se puede deshacer. El PDF será eliminado permanentemente.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#f44336',
    cancelButtonColor: '#666',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });
  
  if (result.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/investigacion/encuesta/${id}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        Swal.fire({
          title: 'Eliminada',
          text: 'La encuesta ha sido eliminada correctamente.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        
        document.getElementById('btnInvestigacion').click();
      } else {
        throw new Error(data.error || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar la encuesta.',
        icon: 'error'
      });
    }
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    cerrarPDFViewer();
  }
});

