# 🚀 Guía de Deployment en Railway

## 📋 Pre-requisitos
- Cuenta de Railway (railway.app)
- Repositorio GitHub: https://github.com/seeyouanotherday/sistema-gestor.git
- Base de datos MySQL

---

## 🔧 Paso 1: Configurar Base de Datos MySQL en Railway

1. **Crear nuevo proyecto en Railway**
   - Ve a [railway.app](https://railway.app)
   - Click en "New Project"
   - Selecciona "Deploy MySQL"

2. **Obtener credenciales**
   - Una vez creada la base de datos, ve a la pestaña "Variables"
   - Railway genera automáticamente estas variables:
     - `MYSQLHOST`
     - `MYSQLUSER`
     - `MYSQLPASSWORD`
     - `MYSQLDATABASE`
     - `MYSQLPORT`

3. **Importar tu base de datos**
   - Descarga Railway CLI o usa MySQL Workbench
   - Conecta con las credenciales proporcionadas
   - Importa tu archivo `BDPRODUCTION.sql`

---

## 🌐 Paso 2: Desplegar la Aplicación

1. **Agregar servicio desde GitHub**
   - En el mismo proyecto, click en "New Service"
   - Selecciona "GitHub Repo"
   - Autoriza Railway a acceder a tu cuenta
   - Selecciona el repositorio: `seeyouanotherday/sistema-gestor`

2. **Railway detectará automáticamente:**
   - Node.js application
   - Leerá `railway.json` para configuración
   - Instalará dependencias del `package.json`

---

## 🔐 Paso 3: Configurar Variables de Entorno

En la pestaña "Variables" de tu servicio de aplicación, agrega:

### Variables de Base de Datos (Railway las proporciona automáticamente)
```
MYSQLHOST=${{MySQL.MYSQLHOST}}
MYSQLUSER=${{MySQL.MYSQLUSER}}
MYSQLPASSWORD=${{MySQL.MYSQLPASSWORD}}
MYSQLDATABASE=${{MySQL.MYSQLDATABASE}}
MYSQLPORT=${{MySQL.MYSQLPORT}}
```

### Variables de Aplicación (agregar manualmente)
```
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_clave_jwt_super_segura_minimo_32_caracteres
JWT_EXPIRES_IN=24h
FRONTEND_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### Variables Opcionales (si usas servicios externos)
```
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
SENDGRID_API_KEY=tu_sendgrid_key
EMAIL_USER=tu_email
```

---

## 🌍 Paso 4: Generar Dominio Público

1. En tu servicio de aplicación, ve a "Settings"
2. Scroll hasta "Networking"
3. Click en "Generate Domain"
4. Railway te dará una URL como: `https://tu-app-production.up.railway.app`

---

## ✅ Paso 5: Verificar Deployment

1. **Health Check**
   - Visita: `https://tu-app-production.up.railway.app/api/health`
   - Deberías ver: `{"status":"ok","message":"CEMI API is running"}`

2. **Verificar conexión a base de datos**
   - Revisa los logs en Railway
   - Busca: "✓ Conexión con MySQL establecida correctamente"

3. **Probar el frontend**
   - Visita: `https://tu-app-production.up.railway.app/`
   - Deberías ver tu página de inicio

---

## 📝 Paso 6: Actualizar CORS en Producción (si es necesario)

Si tu frontend está en un dominio diferente, actualiza `server.js`:

```javascript
const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:3000',
  'https://tu-dominio-frontend.com',
  process.env.RAILWAY_PUBLIC_DOMAIN,
  // ... otros dominios
];
```

---

## 🔄 Redeploy Automático

Railway detecta automáticamente cambios en tu repo de GitHub:
- Cada push a la rama principal → Railway redespliega automáticamente
- Puedes ver el progreso en la pestaña "Deployments"

---

## 🐛 Troubleshooting

### Error: "Cannot connect to MySQL"
- Verifica que las variables `MYSQL*` estén configuradas
- Verifica que el servicio MySQL esté "activo" (verde)

### Error: "Application failed to respond"
- Revisa los logs del deployment
- Verifica que `PORT=3000` esté configurado
- Asegúrate de que el healthcheck path `/api/health` responda

### WebSocket/Chat no funciona
- Verifica que Railway permita conexiones WebSocket (lo hace por defecto)
- Actualiza la URL del socket en el frontend al nuevo dominio

---

## 💡 Comandos Útiles

### Ver logs en tiempo real
```bash
railway logs
```

### Conectar a MySQL vía CLI
```bash
railway run mysql -u $MYSQLUSER -p$MYSQLPASSWORD -h $MYSQLHOST $MYSQLDATABASE
```

### Ejecutar comandos en el servidor
```bash
railway run node --version
```

---

## 📊 Monitoreo

Railway proporciona:
- **Metrics**: CPU, Memoria, Network
- **Logs**: Logs de aplicación en tiempo real
- **Deployments**: Historial de deployments

---

## ⚙️ Configuración de Nixpacks

Tu archivo `railway.json` ya está configurado:
- Builder: Nixpacks (auto-detecta Node.js)
- Start Command: `node server.js`
- Health Check: `/api/health`
- Restart Policy: Reinicia automáticamente en caso de fallo

---

## 🎯 Checklist Final

- [ ] Base de datos MySQL creada en Railway
- [ ] Base de datos importada con `BDPRODUCTION.sql`
- [ ] Servicio de aplicación conectado al repo GitHub
- [ ] Variables de entorno configuradas
- [ ] Dominio público generado
- [ ] Health check responde correctamente
- [ ] Frontend carga correctamente
- [ ] API endpoints funcionan
- [ ] Chat/WebSocket funciona
- [ ] Login y autenticación funcionan

---

## 🆘 Soporte

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- GitHub Issues: https://github.com/seeyouanotherday/sistema-gestor/issues
