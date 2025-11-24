# ✅ Railway Configuration Checklist - Brikio

Checklist completo de configuración en Railway.

## 🔧 1. Backend Service - Variables de Entorno

Ve a: **Backend Service** → **Variables** → Agrega:

### ✅ Críticas (Requeridas)
```env
NODE_ENV=production

# JWT Secrets (Genera con: openssl rand -base64 64)
JWT_SECRET=tu_jwt_secret_64_caracteres_minimo
JWT_REFRESH_SECRET=otro_jwt_secret_diferente_64_caracteres

# Frontend URL (Railway lo genera automáticamente)
FRONTEND_URL=${{frontend.RAILWAY_PUBLIC_DOMAIN}}

# API Prefix
API_PREFIX=api/v1
```

### ✅ Base de Datos (Automático de PostgreSQL)
```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
```
**Nota:** Railway lo agrega automáticamente cuando conectas PostgreSQL. Si no lo ves, ve a PostgreSQL → "Connect" → "Add all variables to service" → Selecciona "backend"

### ⚠️ Stripe (Opcional pero Recomendado)
```env
STRIPE_SECRET_KEY=sk_test_tu_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret
STRIPE_BASIC_PLAN_PRICE_ID=price_tu_basic_plan_id
STRIPE_PREMIUM_PLAN_PRICE_ID=price_tu_premium_plan_id
```

### ⚠️ OpenAI (Opcional - Solo si usas AI)
```env
OPENAI_API_KEY=sk-tu_openai_api_key
AI_PROVIDER=openai
```

---

## 🎨 2. Frontend Service - Variables de Entorno

Ve a: **Frontend Service** → **Variables** → Agrega:

### ✅ Crítica (Requerida)
```env
VITE_API_URL=https://${{backend.RAILWAY_PUBLIC_DOMAIN}}/api/v1
```

**Importante:** Reemplaza `${{backend.RAILWAY_PUBLIC_DOMAIN}}` con la URL real de tu backend después de que Railway genere el dominio.

Ejemplo:
```env
VITE_API_URL=https://backend-production-xxxx.up.railway.app/api/v1
```

---

## 🗄️ 3. PostgreSQL Database

### ✅ Verificar Conexión
1. Ve a **PostgreSQL** service
2. Tab **"Connect"**
3. Verifica que `DATABASE_URL` esté disponible
4. Si no está en Backend, click **"Add all variables to service"** → Selecciona **"backend"**

---

## ⚙️ 4. Service Settings

### Backend Service
```
Root Directory: backend
Builder: Nixpacks
Start Command: npm run start:prod
```

### Frontend Service
```
Root Directory: frontend
Builder: Dockerfile
Start Command: (VACÍO - usa CMD del Dockerfile)
```

---

## 🔗 5. Networking (Dominios)

### Backend
1. Backend → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copia el dominio: `backend-production-xxxx.up.railway.app`

### Frontend
1. Frontend → **Settings** → **Networking**
2. Click **"Generate Domain"**
3. Copia el dominio: `frontend-production-xxxx.up.railway.app`

### Actualizar VITE_API_URL
1. Ve a Frontend → **Variables**
2. Edita `VITE_API_URL`
3. Usa el dominio real del backend:
   ```env
   VITE_API_URL=https://backend-production-xxxx.up.railway.app/api/v1
   ```
4. Guarda (Railway hará redeploy automático)

---

## 💳 6. Stripe Configuration (Fuera de Railway)

### En Stripe Dashboard:

1. **Crear Productos y Precios**
   - https://dashboard.stripe.com/products
   - Crea "Basic Plan" ($7/mes)
   - Crea "Premium Plan" ($18/mes)
   - Copia los `price_xxxxx` IDs

2. **Configurar Webhook**
   - https://dashboard.stripe.com/webhooks
   - Click **"+ Add endpoint"**
   - **Endpoint URL**: `https://backend-production-xxxx.up.railway.app/api/v1/billing/webhook`
   - **Events to send**:
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.payment_succeeded`
     - ✅ `invoice.payment_failed`
   - Click **"Add endpoint"**
   - Copia el **"Signing secret"** (`whsec_xxxxx`)

3. **Agregar Webhook Secret a Railway**
   - Ve a Backend → **Variables**
   - Agrega: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx` (el que copiaste)

---

## 🧪 7. Testing Checklist

### Backend
- [ ] Backend URL responde: `https://backend-xxxx.up.railway.app/api/v1`
- [ ] Health check funciona
- [ ] Database conectada (ver logs)
- [ ] Variables de entorno configuradas

### Frontend
- [ ] Frontend URL carga: `https://frontend-xxxx.up.railway.app`
- [ ] Landing page se ve correctamente
- [ ] `VITE_API_URL` apunta al backend correcto
- [ ] No hay errores de CORS en consola

### Stripe (Opcional)
- [ ] API keys configuradas
- [ ] Webhook endpoint configurado en Stripe
- [ ] Webhook secret en Railway
- [ ] Test payment funciona

---

## 🚨 Troubleshooting

### Backend no conecta a DB
- Verifica `DATABASE_URL` en Backend variables
- Ve a PostgreSQL → "Connect" → "Add variables to backend"

### Frontend no conecta a Backend
- Verifica `VITE_API_URL` tiene la URL correcta del backend
- Verifica CORS en backend (debe incluir frontend URL)

### Stripe webhooks no funcionan
- Verifica webhook URL es accesible públicamente
- Verifica `STRIPE_WEBHOOK_SECRET` es correcto
- Revisa logs del backend para errores de webhook

---

## 📊 Resumen de Variables

### Backend (Mínimo)
```env
NODE_ENV=production
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=${{frontend.RAILWAY_PUBLIC_DOMAIN}}
DATABASE_URL=${{Postgres.DATABASE_URL}}
API_PREFIX=api/v1
```

### Frontend (Mínimo)
```env
VITE_API_URL=https://tu-backend-real.railway.app/api/v1
```

### Stripe (Opcional)
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PLAN_PRICE_ID=price_...
STRIPE_PREMIUM_PLAN_PRICE_ID=price_...
```

---

## ✅ Checklist Final

- [ ] Backend variables configuradas
- [ ] Frontend variables configuradas
- [ ] PostgreSQL conectado
- [ ] Dominios generados
- [ ] `VITE_API_URL` actualizado con dominio real
- [ ] Backend deployado y funcionando
- [ ] Frontend deployado y funcionando
- [ ] Stripe configurado (si usas pagos)
- [ ] Webhooks configurados en Stripe Dashboard
- [ ] Todo probado y funcionando

---

**¡Con esto deberías estar listo!** 🚀

