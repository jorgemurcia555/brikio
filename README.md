# 🏗️ Brikio - Construction Estimate Software for Builders

![BudgetApp](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**BudgetApp** es una herramienta SaaS moderna para constructores y contratistas que automatiza la creación de presupuestos de construcción. Calcula materiales, cantidades y costos en minutos, con opción de optimización con IA para usuarios Pro.

---

## 📋 Tabla de Contenidos

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Instalación y Configuración](#instalación-y-configuración)
- [Uso](#uso)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Modelo de Datos](#modelo-de-datos)
- [Planes y Pricing](#planes-y-pricing)
- [Desarrollo](#desarrollo)
- [Deployment](#deployment)
- [Contribución](#contribución)

---

## ✨ Características

### Core Features
- 🎯 **Prueba SIN registrarte** - Usa toda la app antes de decidir
- ✅ **Cálculo automático de materiales** basado en medidas y plantillas
- ✅ **Gestión de proyectos** con múltiples áreas y presupuestos versionados
- ✅ **Catálogo de materiales** personalizable con precios y rendimientos
- ✅ **Plantillas reutilizables** para partidas comunes (muros, pisos, techos, etc.)
- ✅ **Exportación a PDF** profesional con logo y desglose completo
- ✅ **Compartir presupuestos** vía link público seguro
- ✅ **Gestión de clientes** y historial de proyectos
- ✅ **Dashboard con métricas** (proyectos, tasa de aprobación, ingresos)
- 🌍 **Multiidioma** - Inglés y Español con react-i18next

### Planes - Modelo "Try-Before-Buy"

#### 🎯 **Try First** (Gratis, Sin Registro)
- ✨ **Acceso completo a la aplicación SIN registrarte**
- Crea presupuestos ilimitados
- Accede a todas las plantillas
- Cálculos automáticos de materiales
- Previsualiza todo
- ⚠️ Registro requerido solo para descargar PDFs

#### 💼 **Basic Plan** ($7/mes)
- 🎁 **7 días de prueba gratis** (sin tarjeta de crédito)
- ✨ Todo lo de "Try First" +
- ✨ **Descargas ilimitadas de PDFs**
- ✨ Plantillas personalizadas
- ✨ Soporte por email
- 💳 Después de 7 días → $7/mes (cancelable en cualquier momento)

#### 👑 **Premium Plan** ($18/mes) - CON IA
- 🎁 **7 días de prueba gratis** (sin tarjeta de crédito)
- ✨ Todo lo de "Basic" +
- ✨ **Módulo IA integrado** (powered by GPT):
  - Asistente de configuración por lenguaje natural
  - Revisión de coherencia automática
  - Optimización de costos con alternativas de materiales
  - Sugerencias inteligentes de materiales
  - Generación de descripciones comerciales
- ✨ Importación CSV de materiales
- ✨ Reportes avanzados con IA
- ✨ Soporte prioritario 24/7
- 💳 Después de 7 días → $18/mes (cancelable en cualquier momento)

### Diseño y UX
- 🎨 **UI atractiva y moderna** con paleta cálida (beiges, terracotas, cafés)
- 🔄 **Micro-interacciones** y transiciones suaves con Framer Motion
- 📱 **PWA Ready** - Funciona como app móvil
- ♿ **Accesible** con navegación por teclado y buen contraste
- 🌙 **Modo oscuro** (opcional)

---

## 🛠 Stack Tecnológico

### Backend
- **Framework:** NestJS (TypeScript)
- **Base de Datos:** PostgreSQL
- **ORM:** TypeORM
- **Autenticación:** JWT + Refresh Tokens
- **Pagos:** Stripe (Subscriptions)
- **IA:** OpenAI / Anthropic (Pro only)
- **PDF:** Puppeteer + Handlebars

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **State Management:** Zustand
- **Data Fetching:** React Query (TanStack Query)
- **Routing:** React Router v6
- **UI/Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod
- **Icons:** Lucide React
- **Charts:** Recharts

### DevOps
- **Containerization:** Docker + Docker Compose
- **Database:** PostgreSQL 16
- **CI/CD:** Scripts preparados para GitHub Actions
- **Logging:** Winston (backend)

---

## 🏗 Arquitectura

### Backend (Modular Monolith)

```
backend/
├── src/
│   ├── common/              # Guards, Decorators, Filters, Interceptors
│   ├── config/              # Configuration modules
│   ├── database/
│   │   ├── entities/        # TypeORM entities
│   │   ├── migrations/      # Database migrations
│   │   └── seeds/           # Seed data
│   ├── modules/
│   │   ├── auth/            # Authentication & JWT
│   │   ├── users/           # User management
│   │   ├── billing/         # Stripe integration & Plans
│   │   ├── materials/       # Materials catalog
│   │   ├── templates/       # Template items
│   │   ├── projects/        # Projects & Areas
│   │   ├── estimates/       # Estimates & Items
│   │   ├── clients/         # Client management
│   │   ├── ai/              # AI features (Pro only)
│   │   ├── analytics/       # Metrics & KPIs
│   │   └── pdf/             # PDF generation
│   └── main.ts
```

### Frontend (Feature-Based)

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # Reusable UI components (Button, Card, Input, Modal)
│   │   ├── layout/          # Layout components (Sidebar, Header, MainLayout)
│   │   └── shared/          # Shared components
│   ├── features/
│   │   ├── auth/            # Login, Register
│   │   ├── dashboard/       # Dashboard with metrics
│   │   ├── projects/        # Project management
│   │   ├── estimates/       # Estimate wizard
│   │   ├── materials/       # Materials catalog
│   │   ├── templates/       # Templates
│   │   ├── clients/         # Client management
│   │   ├── billing/         # Subscription & plans
│   │   ├── ai/              # AI assistant (Pro)
│   │   └── landing/         # Marketing landing page
│   ├── services/            # API clients
│   ├── stores/              # Zustand stores
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Utilities
│   └── styles/              # Global styles
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 16 (si no usas Docker)
- Cuenta de Stripe (para pagos)
- API Key de OpenAI o Anthropic (para IA Pro)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/budgetapp.git
cd budgetapp
```

### 2. Configurar variables de entorno

#### Backend

Crea `backend/.env` basado en `backend/.env.example`:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=budgetapp
DB_PASSWORD=budgetapp_secret
DB_DATABASE=budgetapp

JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PLAN_PRICE_ID=price_...

FRONTEND_URL=http://localhost:5173

AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

#### Frontend

Crea `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

### 3. Instalar dependencias

Usando el Makefile:

```bash
make install
```

O manualmente:

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 4. Iniciar la base de datos

```bash
docker-compose up postgres -d
```

### 5. Ejecutar migraciones y seeds

```bash
make migrate
make seed
```

### 6. Iniciar la aplicación

#### Opción A: Con Docker Compose (recomendado)

```bash
make start
```

#### Opción B: Desarrollo local

```bash
make dev
```

O en terminales separadas:

```bash
# Terminal 1 - Backend
cd backend
npm run start:dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

La aplicación estará disponible en:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api/v1

---

## 📖 Uso

### 1. Registro e Inicio de Sesión

1. Visita http://localhost:5173
2. Haz clic en "Regístrate gratis"
3. Completa el formulario con tu email y contraseña
4. Accede al dashboard

### 2. Completar Onboarding

En tu primer acceso, configura:
- Moneda (USD, MXN, etc.)
- Tasa de impuestos (%)
- Unidad de medida principal
- Idioma

### 3. Crear un Proyecto

1. Ve a **Proyectos** → **Nuevo Proyecto**
2. Completa:
   - Nombre del proyecto
   - Cliente (opcional)
   - Ubicación
   - Tipo de construcción
   - Área total
3. Agrega **áreas** (habitaciones/zonas):
   - Nombre (ej. "Sala", "Baño principal")
   - Dimensiones (m², perímetro, altura)

### 4. Generar Presupuesto

1. Desde un proyecto, haz clic en **Nuevo Presupuesto**
2. Sigue el **wizard de 3 pasos:**
   - **Paso 1:** Configuración (margen de utilidad, mano de obra)
   - **Paso 2:** Selecciona plantillas y materiales para cada área
   - **Paso 3:** Revisa y confirma
3. El sistema calcula automáticamente cantidades y costos

### 5. Compartir Presupuesto

- Exporta a **PDF** con tu logo
- Genera **link público** para compartir con el cliente
- El cliente puede aprobar/rechazar directamente

### 6. Upgrade a Pro (opcional)

1. Ve a **Facturación**
2. Selecciona el **Plan Pro**
3. Completa el pago con Stripe
4. Accede al **módulo IA** y funciones avanzadas

---

## 📂 Estructura del Proyecto

```
budgetapp/
├── backend/                 # NestJS API
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/                # React + Vite
│   ├── src/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml       # Orchestration
├── Makefile                 # Helper commands
├── .dockerignore
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

### Auth

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout

### Users

- `GET /users/me` - Perfil actual
- `PUT /users/me` - Actualizar perfil
- `PATCH /users/onboarding` - Completar onboarding

### Billing

- `GET /billing/plans` - Listar planes
- `GET /billing/subscription` - Suscripción actual
- `POST /billing/checkout` - Crear sesión de Stripe
- `POST /billing/cancel` - Cancelar suscripción
- `POST /billing/webhook` - Webhook de Stripe

### Projects

- `GET /projects` - Listar proyectos
- `GET /projects/:id` - Obtener proyecto
- `POST /projects` - Crear proyecto
- `PUT /projects/:id` - Actualizar proyecto
- `DELETE /projects/:id` - Eliminar proyecto
- `POST /projects/:id/areas` - Agregar área
- `PUT /projects/areas/:areaId` - Actualizar área
- `DELETE /projects/areas/:areaId` - Eliminar área

### Estimates

- `GET /estimates` - Listar presupuestos
- `GET /estimates/project/:projectId` - Por proyecto
- `GET /estimates/:id` - Obtener presupuesto
- `GET /estimates/public/:token` - Presupuesto público
- `POST /estimates` - Crear presupuesto
- `PUT /estimates/:id` - Actualizar presupuesto
- `PATCH /estimates/:id/status` - Cambiar estado
- `DELETE /estimates/:id` - Eliminar presupuesto

### Materials

- `GET /materials` - Listar materiales
- `GET /materials/:id` - Obtener material
- `POST /materials` - Crear material custom
- `PUT /materials/:id` - Actualizar material
- `DELETE /materials/:id` - Eliminar material
- `GET /materials/categories` - Categorías
- `GET /materials/units` - Unidades

### AI (Pro Only)

- `POST /ai/analyze-project` - Analizar descripción
- `POST /ai/check-coherence` - Revisar coherencia
- `POST /ai/optimize-costs` - Optimizar costos
- `POST /ai/generate-description` - Generar texto

### PDF

- `GET /pdf/estimate/:id` - Descargar PDF

---

## 💾 Modelo de Datos

### Principales Entidades

- **User:** Usuarios del sistema (admin, constructor, client)
- **Plan:** Planes de suscripción (free, pro)
- **Subscription:** Suscripciones activas
- **Material:** Catálogo de materiales
- **MaterialCategory:** Categorías jerárquicas
- **Unit:** Unidades de medida (m2, ml, kg, etc.)
- **TemplateItem:** Plantillas de partidas
- **TemplateItemMaterial:** Materiales de una plantilla (con fórmulas)
- **Client:** Clientes del constructor
- **Project:** Proyectos de construcción
- **Area:** Áreas/habitaciones de un proyecto
- **Estimate:** Presupuestos (versionados)
- **EstimateItem:** Items del presupuesto

Relaciones clave:
- User 1:1 Subscription
- Subscription N:1 Plan
- Project N:1 User, N:1 Client
- Project 1:N Area
- Project 1:N Estimate
- Estimate 1:N EstimateItem
- TemplateItem N:N Material (via TemplateItemMaterial)

---

## 💰 Planes y Pricing

| Feature | Free | Pro |
|---------|------|-----|
| Presupuestos/mes | 3 | Ilimitados |
| Materiales custom | ✅ | ✅ |
| Plantillas predefinidas | ✅ | ✅ |
| Plantillas custom | ❌ | ✅ |
| Exportar PDF | ✅ | ✅ |
| IA Asistente | ❌ | ✅ |
| Importar CSV | ❌ | ✅ |
| Reportes avanzados | ❌ | ✅ |
| Soporte | Email | Prioritario |

**Precio Pro:** $29.99 USD/mes (configurable en Stripe)

---

## 🧪 Desarrollo

### Comandos disponibles (Makefile)

```bash
make help           # Ver todos los comandos
make install        # Instalar dependencias
make dev            # Desarrollo local
make build          # Build Docker images
make start          # Iniciar con Docker
make stop           # Detener servicios
make restart        # Reiniciar
make logs           # Ver logs
make clean          # Limpiar todo
make seed           # Seed database
make migrate        # Run migrations
make test-backend   # Tests backend
make test-frontend  # Tests frontend
make lint           # Linter
```

### Testing

```bash
# Backend
cd backend
npm test
npm run test:cov

# Frontend
cd frontend
npm test
```

### Linting

```bash
make lint
```

---

## 🚢 Deployment

### Opción 1: Docker Compose (VPS)

1. Configura tu servidor con Docker y Docker Compose
2. Clona el repo
3. Configura variables de entorno en producción
4. Ejecuta:

```bash
docker-compose up -d
```

### Opción 2: Servicios Separados

- **Backend:** Railway, Render, Fly.io, AWS ECS
- **Frontend:** Vercel, Netlify, Cloudflare Pages
- **Database:** Supabase, Neon, Railway

### Variables de Entorno en Producción

⚠️ **IMPORTANTE:** Cambia todos los secrets en producción:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `STRIPE_SECRET_KEY`
- `OPENAI_API_KEY`

---

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

---

## 👨‍💻 Autor

Desarrollado por **Tu Nombre** como proyecto de arquitectura full-stack enterprise-grade.

---

## 🙏 Agradecimientos

- Inspiración en herramientas de construcción modernas
- Comunidad de NestJS y React
- Stripe por su excelente documentación

---

## 📞 Soporte

Para soporte, envía un email a support@budgetapp.com o abre un issue en GitHub.

---

**¡Construye presupuestos profesionales en minutos con BudgetApp!** 🚀

