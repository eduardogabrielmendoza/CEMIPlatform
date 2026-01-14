const projectData = {
    phases: [
        {
            id: 0,
            name: 'Fase 0: Inicio y Validación',
            icon: 'fa-flag-checkered',
            color: '#1e3c72',
            hours: 10,
            tasks: [
                { name: 'Reunión Inicial con CEMI', icon: 'fa-handshake', start: '23 Sep', end: '23 Sep', week: 1, hours: 2 },
                { name: 'Recolección de Información', icon: 'fa-clipboard-list', start: '24 Sep', end: '4 Oct', weeks: [1, 2], hours: 3 },
                { name: 'Análisis de Requerimientos', icon: 'fa-search', start: '4 Oct', end: '9 Oct', weeks: [2, 3], hours: 3 },
                { name: 'Historias de Usuario', icon: 'fa-users', start: '9 Oct', end: '12 Oct', week: 3, hours: 2 },
                { name: 'Validación Requerimientos', icon: 'fa-check-circle', start: '13 Oct', end: '13 Oct', week: 3, hours: 0, milestone: true }
            ]
        },
        {
            id: 1,
            name: 'Fase 1: Arquitectura y Base de Datos',
            icon: 'fa-database',
            color: '#2a5298',
            hours: 17,
            tasks: [
                { name: 'Diseño DER Base de Datos', icon: 'fa-project-diagram', start: '14 Oct', end: '16 Oct', week: 4, hours: 7 },
                { name: 'Desarrollo BD MySQL', icon: 'fa-table', start: '17 Oct', end: '18 Oct', week: 4, hours: 4 },
                { name: 'Config. Backend Node.js', icon: 'fa-server', start: '19 Oct', end: '20 Oct', week: 4, hours: 3 },
                { name: 'Seguridad (bcrypt)', icon: 'fa-shield-alt', start: '21 Oct', end: '21 Oct', week: 5, hours: 2 },
                { name: 'Config. Git/GitHub', icon: 'fa-code-branch', start: '22 Oct', end: '22 Oct', week: 5, hours: 1 },
                { name: 'HITO: Arquitectura Lista', icon: 'fa-flag', start: '22 Oct', end: '22 Oct', week: 5, hours: 0, milestone: true }
            ]
        },
        {
            id: 2,
            name: 'Fase 2: Autenticación y Roles',
            icon: 'fa-lock',
            color: '#3498db',
            hours: 9,
            tasks: [
                { name: 'Diseño UI Login/Registro', icon: 'fa-paint-brush', start: '23 Oct', end: '24 Oct', week: 5, hours: 2.5 },
                { name: 'Sistema Auth Backend', icon: 'fa-key', start: '25 Oct', end: '26 Oct', week: 5, hours: 4.5 },
                { name: 'Perfiles y Roles', icon: 'fa-user-tag', start: '27 Oct', end: '28 Oct', week: 5, hours: 2 },
                { name: 'HITO: Auth Funcional', icon: 'fa-check-double', start: '28 Oct', end: '28 Oct', week: 6, hours: 0, milestone: true }
            ]
        },
        {
            id: 3,
            name: 'Fase 3: Dashboard Admin',
            icon: 'fa-tachometer-alt',
            color: '#2ecc71',
            hours: 9,
            tasks: [
                { name: 'Diseño Navegación', icon: 'fa-sitemap', start: '29 Oct', end: '30 Oct', week: 6, hours: 3 },
                { name: 'Diseño Vistas y Tablas', icon: 'fa-th-large', start: '31 Oct', end: '1 Nov', week: 6, hours: 2 },
                { name: 'Lógica Roles en UI', icon: 'fa-user-shield', start: '2 Nov', end: '2 Nov', week: 6, hours: 2 },
                { name: 'Visualización Datos', icon: 'fa-eye', start: '3 Nov', end: '4 Nov', week: 6, hours: 2 }
            ]
        },
        {
            id: 4,
            name: 'Fase 4: CRUD y Reglas de Negocio',
            icon: 'fa-cogs',
            color: '#27ae60',
            hours: 22,
            tasks: [
                { name: 'Endpoints CRUD', icon: 'fa-code', start: '5 Nov', end: '7 Nov', week: 7, hours: 4 },
                { name: 'Regla: Horarios', icon: 'fa-clock', start: '8 Nov', end: '9 Nov', week: 7, hours: 3 },
                { name: 'Regla: Capacidad Aulas', icon: 'fa-door-open', start: '10 Nov', end: '10 Nov', week: 7, hours: 2 },
                { name: 'Modales CRUD', icon: 'fa-window-restore', start: '11 Nov', end: '13 Nov', week: 8, hours: 9 },
                { name: 'Integración Front-Back', icon: 'fa-plug', start: '14 Nov', end: '14 Nov', week: 8, hours: 4 }
            ]
        },
        {
            id: 5,
            name: 'Fase 5: Pagos y Classroom',
            icon: 'fa-credit-card',
            color: '#1abc9c',
            hours: 18,
            tasks: [
                { name: 'Módulo de Pagos', icon: 'fa-money-bill-wave', start: '15 Nov', end: '16 Nov', week: 8, hours: 5 },
                { name: 'Estado de Pagos', icon: 'fa-receipt', start: '17 Nov', end: '17 Nov', week: 8, hours: 2 },
                { name: 'Classroom Tareas/Anuncios', icon: 'fa-chalkboard-teacher', start: '17 Nov', end: '18 Nov', week: 8, hours: 6 },
                { name: 'Chat Tiempo Real', icon: 'fa-comments', start: '18 Nov', end: '19 Nov', week: 9, hours: 5 }
            ]
        },
        {
            id: 6,
            name: 'Fase 6: Despliegue y Entrega',
            icon: 'fa-rocket',
            color: '#f1c40f',
            hours: 10,
            tasks: [
                { name: 'Config. Variables Entorno', icon: 'fa-cog', start: '19 Nov', end: '19 Nov', week: 9, hours: 1 },
                { name: 'Despliegue Railway', icon: 'fa-cloud-upload-alt', start: '19 Nov', end: '19 Nov', week: 9, hours: 2 },
                { name: 'Pruebas QA', icon: 'fa-bug', start: '20 Nov', end: '20 Nov', week: 9, hours: 4 },
                { name: 'Documentación', icon: 'fa-book', start: '20 Nov', end: '20 Nov', week: 9, hours: 3 },
                { name: 'ENTREGA FINAL', icon: 'fa-trophy', start: '20 Nov', end: '20 Nov', week: 9, hours: 0, milestone: true, final: true }
            ]
        }
    ]
};
