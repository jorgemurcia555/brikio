# 🔐 Configuración de Google OAuth

Esta guía te ayudará a configurar correctamente Google OAuth para que funcione en producción.

## 📋 Pasos para Configurar Google OAuth

### 1. Crear Credenciales en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth client ID**
5. Si es la primera vez, configura la pantalla de consentimiento de OAuth
6. Selecciona **Web application** como tipo de aplicación
7. Configura lo siguiente:

#### Authorized JavaScript origins:
```
https://tu-dominio-backend.com
http://localhost:3000  (solo para desarrollo)
```

#### Authorized redirect URIs:
```
https://tu-dominio-backend.com/api/v1/auth/google/callback
http://localhost:3000/api/v1/auth/google/callback  (solo para desarrollo)
```

**⚠️ IMPORTANTE:** La URL debe coincidir EXACTAMENTE, incluyendo:
- El protocolo (https://)
- El dominio completo
- La ruta completa (`/api/v1/auth/google/callback`)
- Sin trailing slash al final

### 2. Obtener las Credenciales

Después de crear el OAuth client, obtendrás:
- **Client ID**: algo como `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret**: algo como `GOCSPX-abcdefghijklmnopqrstuvwxyz`

### 3. Configurar Variables de Entorno en Railway

En Railway, agrega las siguientes variables de entorno en tu servicio de backend:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id-aqui
GOOGLE_CLIENT_SECRET=tu-client-secret-aqui

# URL del backend (IMPORTANTE: debe ser la URL pública de tu backend en Railway)
BACKEND_URL=https://tu-backend.railway.app

# O alternativamente, puedes usar GOOGLE_CALLBACK_URL directamente:
# GOOGLE_CALLBACK_URL=https://tu-backend.railway.app/api/v1/auth/google/callback
```

### 4. Verificar la URL del Callback

El callback URL se construye automáticamente como:
```
{BACKEND_URL}/{API_PREFIX}/auth/google/callback
```

Por ejemplo, si tu `BACKEND_URL` es `https://api.budgetapp.com` y `API_PREFIX` es `api/v1`, el callback será:
```
https://api.budgetapp.com/api/v1/auth/google/callback
```

**Esta URL debe estar registrada EXACTAMENTE igual en Google Cloud Console.**

### 5. Verificar en los Logs

Cuando el backend se inicie, verás en los logs:
```
🔐 Google OAuth Callback URL: https://tu-backend.railway.app/api/v1/auth/google/callback
🔐 Make sure this exact URL is registered in Google Cloud Console
```

Copia esta URL y asegúrate de que esté registrada en Google Cloud Console.

## 🔍 Solución de Problemas

### Error: "redirect_uri_mismatch"

Este error significa que la URL de callback no coincide con la registrada en Google Cloud Console.

**Solución:**
1. Verifica los logs del backend para ver qué URL se está usando
2. Ve a Google Cloud Console > Credentials > Tu OAuth Client
3. Asegúrate de que la URL en "Authorized redirect URIs" coincida EXACTAMENTE
4. Verifica que no haya trailing slashes, espacios, o diferencias en mayúsculas/minúsculas

### Error: "BACKEND_URL must be set in production"

Este error significa que la variable `BACKEND_URL` no está configurada.

**Solución:**
1. En Railway, agrega la variable de entorno `BACKEND_URL`
2. El valor debe ser la URL pública de tu backend (ej: `https://tu-backend.railway.app`)
3. No incluyas el path `/api/v1` en `BACKEND_URL`, solo el dominio base

### La URL cambia después de cada deploy

Si usas Railway con URLs dinámicas, considera:
1. Usar un dominio personalizado para tu backend
2. O configurar `GOOGLE_CALLBACK_URL` directamente con la URL completa

## 📝 Ejemplo de Configuración Completa

### Variables de Entorno en Railway:

```env
# Backend
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1
BACKEND_URL=https://budgetapp-api.railway.app

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Frontend (para el redirect después del login)
FRONTEND_URL=https://budgetapp.com
```

### URLs Registradas en Google Cloud Console:

**Authorized JavaScript origins:**
```
https://budgetapp-api.railway.app
```

**Authorized redirect URIs:**
```
https://budgetapp-api.railway.app/api/v1/auth/google/callback
```

## ✅ Verificación

1. Inicia tu backend y verifica los logs
2. Copia la URL del callback que aparece en los logs
3. Verifica que esta URL esté en Google Cloud Console
4. Intenta hacer login con Google
5. Si aún hay errores, verifica que las credenciales (Client ID y Secret) sean correctas

