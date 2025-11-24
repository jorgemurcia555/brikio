# 🔧 Fix: Base de Datos sin Tablas en Railway

## Problema
```
QueryFailedError: relation "users" does not exist
```

La base de datos no tiene las tablas creadas porque `synchronize` está deshabilitado en producción.

## ✅ Solución Automática (Ya Implementada)

El código ahora inicializa la base de datos automáticamente al iniciar el backend. Las tablas se crearán automáticamente.

## 🔄 Si Necesitas Ejecutar Seeds

Los seeds (planes, categorías, materiales) se pueden ejecutar manualmente:

### Opción 1: Via Railway CLI

```bash
railway run --service backend npm run seed
```

### Opción 2: Via Railway Dashboard

1. Ve a **Backend Service** → **Deployments**
2. Click en **"..."** → **"View Logs"**
3. O usa **"Shell"** si está disponible

### Opción 3: Habilitar Seeds Automáticos

Agrega esta variable de entorno en Railway (Backend):
```env
RUN_SEEDS=true
```

**Nota:** Los seeds se ejecutarán automáticamente al iniciar (si está habilitado).

---

## ⚙️ Configuración de Variables

### Backend Service - Variables de Entorno

**Mínimo requerido:**
```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
FRONTEND_URL=https://tu-frontend-real.railway.app
```

**Para habilitar sincronización automática (solo primera vez):**
```env
ENABLE_SYNC=true
```

**Para ejecutar seeds automáticamente:**
```env
RUN_SEEDS=true
```

---

## 🔍 Verificar que Funciona

1. **Revisa los logs del backend** al iniciar:
   ```
   🗄️  Initializing database (creating tables if needed)...
   ✅ Database tables verified/created successfully
   ```

2. **Intenta registrar un usuario** - debería funcionar sin el error `relation "users" does not exist`

3. **Verifica en los logs** que no aparezca el error de tabla faltante

---

## ⚠️ Notas Importantes

- **`synchronize: true`** es seguro porque solo crea tablas que no existen
- **No modifica tablas existentes** - solo crea las que faltan
- **En producción**, considera usar migraciones después de la primera inicialización
- **Los seeds** solo necesitan ejecutarse una vez (o cuando se necesiten datos iniciales)

---

## 🚨 Si Sigue Sin Funcionar

1. Verifica que `DATABASE_URL` esté configurado correctamente
2. Verifica que el servicio PostgreSQL esté corriendo
3. Revisa los logs del backend para ver errores de conexión
4. Intenta hacer un redeploy del backend

