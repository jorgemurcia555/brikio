# 🔧 Fix: Frontend no conecta con Backend en Railway

## Problema
Las peticiones del frontend no llegan al backend. No se ven logs en el backend.

## Causas Principales

### 1. ❌ `VITE_API_URL` no se pasa como Build Argument
**Problema:** Railway no pasa automáticamente `VITE_API_URL` como build argument al Dockerfile.

**Solución:** Configurar Build Arguments en Railway.

### 2. ❌ CORS bloqueando peticiones
**Problema:** El backend solo permite un origen específico.

**Solución:** Ya mejorado en el código para permitir múltiples orígenes.

---

## ✅ Solución Paso a Paso

### Paso 1: Configurar Build Arguments en Railway (Frontend)

1. Ve a **Frontend Service** en Railway
2. Click en **Settings** (⚙️)
3. Scroll hasta **"Build Command"** o **"Dockerfile"**
4. Busca la sección **"Build Arguments"** o **"Docker Build Args"**
5. Agrega:
   ```
   VITE_API_URL=https://tu-backend-real.railway.app/api/v1
   ```

**⚠️ IMPORTANTE:** Reemplaza `tu-backend-real.railway.app` con el dominio REAL de tu backend.

**Si no ves la opción "Build Arguments":**
- Railway puede usar variables de entorno automáticamente
- O necesitas usar un `railway.json` o `nixpacks.toml`

### Paso 2: Verificar Variables de Entorno

#### Frontend Service
```env
VITE_API_URL=https://tu-backend-real.railway.app/api/v1
```

#### Backend Service
```env
FRONTEND_URL=https://tu-frontend-real.railway.app
# O múltiples orígenes separados por coma:
FRONTEND_URL=https://tu-frontend-real.railway.app,https://www.tu-dominio.com
```

### Paso 3: Verificar que el Build usa VITE_API_URL

Después de configurar, verifica en los logs del build del frontend que veas:
```
VITE_API_URL=https://tu-backend-real.railway.app/api/v1
```

Si no lo ves, el build está usando el fallback `http://localhost:3000/api/v1`.

---

## 🔍 Debugging

### 1. Verificar URL en el Frontend (Browser Console)

Abre la consola del navegador y ejecuta:
```javascript
console.log('API URL:', import.meta.env.VITE_API_URL);
```

**Debería mostrar:** `https://tu-backend-real.railway.app/api/v1`

**Si muestra:** `http://localhost:3000/api/v1` → El build argument no se pasó correctamente.

### 2. Verificar Peticiones (Network Tab)

1. Abre DevTools → **Network**
2. Intenta registrar un usuario
3. Busca la petición a `/auth/register`
4. Verifica:
   - **Request URL:** Debe ser `https://tu-backend-real.railway.app/api/v1/auth/register`
   - **Status:** Si es `CORS error` o `Failed to fetch` → Problema de CORS
   - **Status:** Si es `404` → URL incorrecta
   - **Status:** Si es `0` o no aparece → URL incorrecta o backend no accesible

### 3. Verificar Backend Logs

En Railway → Backend → **Deployments** → Click en el último deployment → **View Logs**

Busca:
- `🚀 BudgetApp API running on...`
- `🌐 CORS configured for origins...`
- Peticiones entrantes (deberías ver logs cuando llegan requests)

**Si no ves logs de peticiones:** El frontend no está enviando a la URL correcta.

---

## 🛠️ Soluciones Alternativas

### Opción A: Usar `railway.json` para Build Args

Crea `frontend/railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile",
    "buildArgs": {
      "VITE_API_URL": "${{backend.RAILWAY_PUBLIC_DOMAIN}}/api/v1"
    }
  }
}
```

**Problema:** Railway puede no soportar `${{backend.RAILWAY_PUBLIC_DOMAIN}}` en build args.

### Opción B: Script de Build Personalizado

Modifica `frontend/Dockerfile` para usar variables de entorno en runtime:

```dockerfile
# En lugar de ARG, usa ENV y un script de inicio
ENV VITE_API_URL=${VITE_API_URL}

# Crear script que inyecte la variable en index.html
RUN echo "window.__API_URL__ = '${VITE_API_URL}';" > /usr/share/nginx/html/config.js
```

Luego en `index.html`:
```html
<script src="/config.js"></script>
<script>
  window.__API_URL__ = window.__API_URL__ || 'http://localhost:3000/api/v1';
</script>
```

Y en `api.ts`:
```typescript
const API_URL = window.__API_URL__ || import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
```

**⚠️ Esta opción es más compleja pero funciona si Railway no soporta build args.**

---

## ✅ Checklist de Verificación

- [ ] `VITE_API_URL` configurado en Railway Frontend (como variable de entorno o build arg)
- [ ] `FRONTEND_URL` configurado en Railway Backend
- [ ] Backend tiene dominio público generado
- [ ] Frontend tiene dominio público generado
- [ ] `VITE_API_URL` apunta al dominio REAL del backend (no `${{backend...}}`)
- [ ] Backend logs muestran "CORS configured for origins"
- [ ] Browser console muestra la URL correcta
- [ ] Network tab muestra peticiones a la URL correcta
- [ ] Backend logs muestran peticiones entrantes

---

## 🚨 Errores Comunes

### Error: "Failed to fetch" o "CORS policy"
**Causa:** CORS bloqueando o URL incorrecta
**Solución:** 
1. Verifica `FRONTEND_URL` en backend
2. Verifica que el origen del frontend coincida exactamente

### Error: "404 Not Found"
**Causa:** URL incorrecta o ruta no existe
**Solución:**
1. Verifica que `VITE_API_URL` termine en `/api/v1`
2. Verifica que el backend tenga el prefijo `api/v1` configurado

### Error: "Network Error" o Status 0
**Causa:** Backend no accesible o URL incorrecta
**Solución:**
1. Verifica que el backend esté corriendo
2. Verifica que el dominio del backend sea accesible públicamente
3. Prueba hacer un `curl` al backend desde tu terminal

---

## 📞 Próximos Pasos

1. Configura `VITE_API_URL` como build argument o variable de entorno
2. Verifica en browser console que la URL sea correcta
3. Revisa Network tab para ver a dónde van las peticiones
4. Revisa backend logs para ver si llegan peticiones
5. Si sigue sin funcionar, comparte:
   - URL que muestra `console.log(import.meta.env.VITE_API_URL)`
   - Request URL del Network tab
   - Logs del backend

