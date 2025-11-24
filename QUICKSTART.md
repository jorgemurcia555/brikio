# 🚀 Guía de Inicio Rápido - BudgetApp

Esta guía te ayudará a poner en marcha BudgetApp en menos de 10 minutos.

---

## ⚡ Inicio Rápido con Docker (Recomendado)

### 1. Requisitos Previos

Asegúrate de tener instalado:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### 2. Clonar y Configurar

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/budgetapp.git
cd budgetapp

# Copiar variables de entorno
cp backend/.env.example backend/.env
```

### 3. Configurar Stripe (opcional para testing)

Edita `backend/.env` y agrega tus keys de Stripe de prueba:

```env
STRIPE_SECRET_KEY=sk_test_tu_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
STRIPE_PRO_PLAN_PRICE_ID=price_tu_plan_id_aqui
```

> 💡 Si no tienes Stripe configurado, la app funcionará pero sin pagos.

### 4. Levantar Todo con un Comando

```bash
make start
```

Esto iniciará:
- PostgreSQL en `localhost:5432`
- Backend API en `http://localhost:3000`
- Frontend en `http://localhost:5173`

### 5. Seed de Datos Iniciales

En otra terminal:

```bash
make seed
```

Esto crea:
- ✅ Planes Free y Pro
- ✅ Categorías de materiales
- ✅ Unidades de medida
- ✅ Materiales básicos de ejemplo
- ✅ Plantillas predefinidas

### 6. ¡Listo!

Abre tu navegador en **http://localhost:5173** y:

1. **Regístrate** con un email de prueba
2. **Completa el onboarding** (moneda, impuestos, etc.)
3. **Crea tu primer proyecto**
4. **Genera un presupuesto**

---

## 🖥️ Inicio Rápido - Desarrollo Local (Sin Docker)

### 1. Requisitos Previos

- Node.js 20+
- PostgreSQL 16
- npm o yarn

### 2. Instalar PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql-16
sudo systemctl start postgresql
```

**Windows:**
Descarga desde [postgresql.org](https://www.postgresql.org/download/windows/)

### 3. Crear Base de Datos

```bash
psql postgres
CREATE DATABASE budgetapp;
CREATE USER budgetapp WITH PASSWORD 'budgetapp_secret';
GRANT ALL PRIVILEGES ON DATABASE budgetapp TO budgetapp;
\q
```

### 4. Configurar el Proyecto

```bash
# Instalar dependencias
make install

# O manualmente:
cd backend && npm install
cd ../frontend && npm install
```

### 5. Configurar Variables de Entorno

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
echo "VITE_API_URL=http://localhost:3000/api/v1" > frontend/.env
```

### 6. Ejecutar Migraciones y Seeds

```bash
cd backend
npm run migration:run
npm run seed
```

### 7. Iniciar en Modo Desarrollo

**Opción A: Con Make**
```bash
make dev
```

**Opción B: Manualmente**

Terminal 1 (Backend):
```bash
cd backend
npm run start:dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 8. Acceder a la App

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api/v1

---

## 🧪 Probar Funcionalidades

### Crear Usuario de Prueba

```bash
# Regístrate en la UI o usa estos datos de prueba:
Email: demo@budgetapp.com
Password: Demo123456
```

### Probar Plan Pro (Sin Stripe)

Si quieres probar funciones Pro sin configurar Stripe:

1. Conéctate a la base de datos:
```bash
psql budgetapp -U budgetapp
```

2. Actualiza manualmente la suscripción:
```sql
-- Encuentra tu usuario
SELECT id, email FROM users;

-- Crea una suscripción Pro
INSERT INTO subscriptions (user_id, plan_id, status, usage_count)
SELECT 
    'TU_USER_ID_AQUI', 
    (SELECT id FROM plans WHERE name = 'pro'), 
    'active', 
    0;
```

### Probar Módulo IA

El módulo IA requiere OpenAI o Anthropic configurado. Agrega en `backend/.env`:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-tu-api-key-aqui
```

Luego podrás usar:
- Asistente de proyectos
- Optimización de costos
- Generación de descripciones

---

## 🐛 Solución de Problemas

### Error: "Port 5432 already in use"

PostgreSQL ya está corriendo. Usa el existente o detén el proceso:

```bash
# macOS
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

### Error: "Cannot connect to database"

Verifica que PostgreSQL esté corriendo:

```bash
# Docker
docker-compose up postgres -d

# Local
brew services start postgresql  # macOS
sudo systemctl start postgresql # Linux
```

### Error: "Module not found"

Reinstala dependencias:

```bash
make clean
make install
```

### Frontend no carga

Verifica que el backend esté corriendo y la URL en `frontend/.env` sea correcta:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 📖 Comandos Útiles

```bash
make help           # Ver todos los comandos disponibles
make logs           # Ver logs de todos los servicios
make logs-backend   # Ver logs del backend
make logs-frontend  # Ver logs del frontend
make restart        # Reiniciar todos los servicios
make stop           # Detener todo
make clean          # Limpiar y resetear
```

---

## 🎯 Próximos Pasos

1. **Explora el Dashboard** - Métricas y KPIs
2. **Crea tu primer proyecto** - Con áreas y medidas
3. **Genera un presupuesto** - Usa el wizard guiado
4. **Personaliza materiales** - Agrega tus propios materiales y precios
5. **Exporta a PDF** - Comparte presupuestos profesionales

---

## 💬 ¿Necesitas Ayuda?

- 📖 Lee el [README completo](./README.md)
- 🐛 Reporta issues en GitHub
- 💬 Únete a nuestro Discord (próximamente)

---

**¡Feliz presupuestado! 🚀**

