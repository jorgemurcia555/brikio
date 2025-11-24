# 🚨 QUICK FIX: Frontend no conecta con Backend

## El Problema
Las peticiones del frontend no llegan al backend. No se ven logs en el backend.

## ✅ Solución Rápida (5 minutos)

### Paso 1: Obtener URLs de Railway

1. Ve a **Backend Service** → **Settings** → **Networking**
2. Copia el dominio: `https://backend-production-xxxx.up.railway.app`
3. Ve a **Frontend Service** → **Settings** → **Networking**  
4. Copia el dominio: `https://frontend-production-xxxx.up.railway.app`

### Paso 2: Configurar Variables de Entorno

#### En Frontend Service:
1. Ve a **Frontend** → **Variables**
2. Agrega o edita:
   ```
   VITE_API_URL=https://backend-production-xxxx.up.railway.app/api/v1
   ```
   ⚠️ **Reemplaza `xxxx` con tu dominio REAL**

#### En Backend Service:
1. Ve a **Backend** → **Variables**
2. Agrega o edita:
   ```
   FRONTEND_URL=https://frontend-production-xxxx.up.railway.app
   ```
   ⚠️ **Reemplaza `xxxx` con tu dominio REAL del frontend**

### Paso 3: Configurar Build Argument (CRÍTICO)

**Railway NO pasa automáticamente variables de entorno como build arguments.**

Tienes 2 opciones:

#### Opción A: Usar Railway CLI (Recomendado)

1. Instala Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login:
   ```bash
   railway login
   ```

3. Link al proyecto:
   ```bash
   railway link
   ```

4. Set build variable:
   ```bash
   railway variables set VITE_API_URL=https://backend-production-xxxx.up.railway.app/api/v1 --service frontend
   ```

#### Opción B: Configurar en Railway Dashboard

1. Ve a **Frontend Service** → **Settings**
2. Busca **"Build Command"** o **"Docker Build Args"**
3. Si no existe, Railway puede usar variables de entorno automáticamente
4. **PERO** necesitas hacer un **redeploy** después de agregar la variable

### Paso 4: Redeploy Frontend

**IMPORTANTE:** Después de agregar `VITE_API_URL`, debes hacer un **redeploy** del frontend:

1. Ve a **Frontend Service** → **Deployments**
2. Click en **"..."** (tres puntos) del último deployment
3. Click **"Redeploy"**

O simplemente haz un push a GitHub (si tienes CI/CD configurado).

### Paso 5: Verificar

1. Abre el frontend en el navegador
2. Abre **DevTools** → **Console**
3. Deberías ver: `🔗 API URL configured: https://backend-production-xxxx.up.railway.app/api/v1`
4. Si ves `localhost`, el build argument no se pasó correctamente

---

## 🔍 Debugging

### Verificar URL en el Browser

Abre la consola y ejecuta:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

**✅ Correcto:** `https://backend-production-xxxx.up.railway.app/api/v1`  
**❌ Incorrecto:** `undefined` o `http://localhost:3000/api/v1`

### Verificar Peticiones

1. DevTools → **Network** tab
2. Intenta registrar un usuario
3. Busca la petición a `/auth/register`
4. Verifica la **Request URL**

**✅ Correcto:** `https://backend-production-xxxx.up.railway.app/api/v1/auth/register`  
**❌ Incorrecto:** `http://localhost:3000/api/v1/auth/register`

### Verificar Backend Logs

1. Railway → **Backend** → **Deployments** → Último deployment → **View Logs**
2. Busca:
   - `🚀 BudgetApp API running on...`
   - `🌐 CORS configured for origins...`
   - Peticiones cuando intentas registrar

**Si no ves peticiones:** El frontend está enviando a la URL incorrecta.

---

## ⚠️ Errores Comunes

### "Failed to fetch" o CORS error
**Solución:** Verifica que `FRONTEND_URL` en backend coincida EXACTAMENTE con el dominio del frontend (incluyendo `https://`)

### API URL sigue siendo localhost
**Solución:** 
1. Verifica que `VITE_API_URL` esté en variables de entorno del frontend
2. Haz un **redeploy** del frontend (Railway no recompila automáticamente)
3. Verifica en los logs del build que `VITE_API_URL` esté disponible

### Backend no recibe peticiones
**Solución:**
1. Verifica que el backend esté corriendo (revisa logs)
2. Verifica que el dominio del backend sea accesible: `curl https://backend-xxxx.up.railway.app/api/v1`
3. Verifica CORS en los logs del backend

---

## ✅ Checklist Final

- [ ] `VITE_API_URL` configurado en Frontend variables (con URL REAL del backend)
- [ ] `FRONTEND_URL` configurado en Backend variables (con URL REAL del frontend)
- [ ] Frontend **redeployado** después de agregar `VITE_API_URL`
- [ ] Browser console muestra la URL correcta
- [ ] Network tab muestra peticiones a la URL correcta
- [ ] Backend logs muestran peticiones entrantes
- [ ] CORS configurado correctamente

---

## 🆘 Si Nada Funciona

1. **Verifica que ambos servicios estén corriendo:**
   - Backend: Debe mostrar `🚀 BudgetApp API running on...`
   - Frontend: Debe servir la aplicación sin errores

2. **Prueba el backend directamente:**
   ```bash
   curl https://backend-xxxx.up.railway.app/api/v1
   ```
   Debería responder (aunque sea un 404, significa que está accesible)

3. **Verifica que no haya errores de build:**
   - Revisa los logs del último deployment
   - Busca errores de compilación

4. **Comparte esta información:**
   - URL que muestra `console.log(import.meta.env.VITE_API_URL)`
   - Request URL del Network tab
   - Logs del backend (últimas 50 líneas)
   - Logs del build del frontend

