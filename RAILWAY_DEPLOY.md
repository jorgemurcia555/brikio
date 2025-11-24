# 🚂 Railway Deployment Guide - Brikio

Guía paso a paso para desplegar Brikio en Railway.

## 🎯 Paso a Paso (15 minutos)

### 1. Crear Cuenta en Railway (2 min)

1. Ve a https://railway.app
2. Click "Login" → "Login with GitHub"
3. Autoriza Railway con tu cuenta de GitHub

---

### 2. Crear Nuevo Proyecto (3 min)

1. **Dashboard de Railway** → Click "New Project"

2. **Selecciona:** "Deploy from GitHub repo"

3. **Selecciona tu repo:** `jorgemurcia555/brikio`

4. **Railway detectará automáticamente:**
   - ✅ `backend/` → Servicio Backend (NestJS)
   - ✅ `frontend/` → Servicio Frontend (React)

5. Click "Deploy Now"

---

### 3. Agregar Base de Datos PostgreSQL (2 min)

1. En tu proyecto → Click **"+ New"**

2. Selecciona **"Database"** → **"Add PostgreSQL"**

3. Railway creará automáticamente:
   - Base de datos PostgreSQL
   - Variable `DATABASE_URL` (se conecta automáticamente al backend)

---

### 4. Configurar Variables de Entorno (5 min)

#### Backend Service

1. Click en el servicio **"backend"**
2. Tab **"Variables"**
3. Click **"+ New Variable"**
4. Agrega estas variables:

```env
NODE_ENV=production

# JWT Secrets (Genera con: openssl rand -base64 64)
JWT_SECRET=tu_jwt_secret_aqui_64_caracteres_minimo
JWT_REFRESH_SECRET=otro_jwt_secret_diferente_64_caracteres

# Frontend URL (Railway lo proporciona automáticamente)
FRONTEND_URL=${{frontend.RAILWAY_PUBLIC_DOMAIN}}

# Stripe (Opcional - puedes agregarlo después)
STRIPE_SECRET_KEY=sk_test_tu_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
STRIPE_BASIC_PLAN_PRICE_ID=price_tu_basic_plan_id
STRIPE_PREMIUM_PLAN_PRICE_ID=price_tu_premium_plan_id

# OpenAI (Opcional - para funciones AI)
OPENAI_API_KEY=sk-tu_openai_key
AI_PROVIDER=openai

# API Prefix
API_PREFIX=api/v1
```

**Generar JWT Secrets:**
```bash
openssl rand -base64 64
```

#### Frontend Service

1. Click en el servicio **"frontend"**
2. Tab **"Variables"**
3. Click **"+ New Variable"**
4. Agrega:

```env
VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}/api/v1
```

---

### 5. Configurar Dominios (2 min)

#### Backend

1. Click servicio **"backend"**
2. Tab **"Settings"**
3. Sección **"Networking"**
4. Click **"Generate Domain"**
5. Copia el dominio: `backend-production-xxxx.up.railway.app`

#### Frontend

1. Click servicio **"frontend"**
2. Tab **"Settings"**
3. Sección **"Networking"**
4. Click **"Generate Domain"**
5. Copia el dominio: `frontend-production-xxxx.up.railway.app`

---

### 6. Actualizar Variable VITE_API_URL (1 min)

1. Ve al servicio **"frontend"** → **"Variables"**
2. Edita `VITE_API_URL`
3. Reemplaza con: `https://backend-production-xxxx.up.railway.app/api/v1`
   (Usa el dominio real del backend que copiaste)
4. Click **"Save"**
5. Railway hará redeploy automáticamente

---

### 7. ¡Verificar Deployment! ✅

#### Check Backend

1. Abre: `https://backend-production-xxxx.up.railway.app/api/v1`
2. Deberías ver un mensaje de la API

#### Check Frontend

1. Abre: `https://frontend-production-xxxx.up.railway.app`
2. ¡Deberías ver tu aplicación Brikio! 🎉

---

## 🎛️ Configuración Post-Deployment

### Ejecutar Seeds (Primera vez)

1. Click en servicio **"backend"**
2. Tab **"Deployments"**
3. Click en el deployment actual
4. En **"Logs"** verás si hay errores

Si necesitas ejecutar seeds manualmente:
```bash
# En Railway CLI o desde el dashboard
npm run seed
```

### Variables de Entorno Importantes

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `DATABASE_URL` | URL de PostgreSQL | ✅ Auto |
| `JWT_SECRET` | Secret para tokens | ✅ Sí |
| `JWT_REFRESH_SECRET` | Secret para refresh | ✅ Sí |
| `FRONTEND_URL` | URL del frontend | ✅ Sí |
| `VITE_API_URL` | URL de la API | ✅ Sí |
| `STRIPE_SECRET_KEY` | Stripe API key | ⚠️ Opcional* |
| `OPENAI_API_KEY` | OpenAI API key | ⚠️ Opcional* |

\* Opcional para empezar, pero necesario para pagos/AI

---

## 📊 Monitoreo

### Ver Logs

**Backend:**
1. Click "backend" → Tab "Deployments"
2. Click deployment actual
3. Ver logs en tiempo real

**Frontend:**
1. Click "frontend" → Tab "Deployments"
2. Click deployment actual
3. Ver logs en tiempo real

### Métricas

- **CPU Usage**: Tab "Metrics"
- **Memory**: Tab "Metrics"
- **Network**: Tab "Metrics"

---

## 🔄 Redeploy Automático

Railway hace redeploy automáticamente cuando:
- Haces `git push` a la rama `main`
- Cambias variables de entorno
- Actualizas la configuración

**Manual Redeploy:**
1. Click servicio → Tab "Deployments"
2. Click "Redeploy"

---

## 🐛 Troubleshooting

### Error: "Build Failed"

**Solución:**
1. Ver logs del deployment
2. Verificar que `railway.json` esté en cada carpeta
3. Verificar `package.json` tiene script `start`

### Error: "Database Connection Failed"

**Solución:**
1. Verificar que PostgreSQL esté running
2. Backend debe tener acceso a `DATABASE_URL`
3. Railway lo proporciona automáticamente

### Error: "Frontend can't connect to Backend"

**Solución:**
1. Verificar `VITE_API_URL` en frontend
2. Verificar `FRONTEND_URL` en backend
3. Debe usar URLs completas con `https://`

### Error: "CORS Error"

**Solución:**
1. Backend debe tener `FRONTEND_URL` correcta
2. En `main.ts` el CORS ya está configurado

---

## 💰 Costos

Railway cobra por uso:

- **Starter Plan (Gratis)**: $5 de crédito/mes
  - Perfecto para desarrollo
  
- **Developer Plan ($5/mes)**: $5 fijos + uso
  - Recomendado para producción pequeña
  
- **Team Plan ($20/mes)**: Para equipos

**Estimado para Brikio:**
- Backend: ~$3-5/mes
- Frontend: ~$1-2/mes
- PostgreSQL: ~$2-3/mes
- **Total: ~$6-10/mes**

---

## 🔒 Seguridad

### Secrets

- ✅ Variables de entorno están encriptadas
- ✅ HTTPS automático
- ✅ Secrets no se muestran en logs

### Buenas Prácticas

1. **Nunca** pongas secrets en el código
2. Usa **variables de entorno** siempre
3. Rota secrets cada 6 meses
4. Usa Stripe test keys primero

---

## 🚀 Siguientes Pasos

### Inmediato
- [x] Deploy exitoso
- [ ] Probar registro de usuario
- [ ] Probar login
- [ ] Crear primer proyecto

### Esta Semana
- [ ] Configurar Stripe
- [ ] Probar pagos en modo test
- [ ] Configurar dominio personalizado
- [ ] SSL (Railway lo da gratis)

### Próximo Mes
- [ ] Pasar a Stripe Live
- [ ] Configurar monitoreo
- [ ] Optimizar base de datos
- [ ] Marketing y usuarios

---

## 📞 Ayuda

- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app

---

## 🎉 ¡Felicidades!

Tu aplicación Brikio está live en:
- Frontend: `https://frontend-production-xxxx.up.railway.app`
- Backend: `https://backend-production-xxxx.up.railway.app`

**Next:** Comparte el link y empieza a conseguir usuarios! 🚀

