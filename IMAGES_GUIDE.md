# 📸 Guía de Imágenes - Brikio

## 📁 Estructura de Directorios

```
frontend/public/
├── images/
│   ├── heroes/           # Imágenes principales/hero sections
│   ├── features/         # Imágenes de características
│   ├── testimonials/     # Fotos de testimonios
│   ├── backgrounds/      # Fondos y texturas
│   ├── icons/           # Íconos adicionales
│   └── illustrations/   # Ilustraciones personalizadas
├── logos/
│   ├── brikio-logo.svg       # Logo naranja
│   └── brikio-logo-light.svg # Logo crema
├── favicon.svg
└── manifest.json
```

---

## 📍 Ubicación de las Imágenes

### Ruta en el Servidor
```
/Users/jorgemurcia/Projects/budgetapp/frontend/public/images/
```

### Organización Recomendada

#### 1. **Heroes** (`/images/heroes/`)
Imágenes grandes para secciones hero:
- `hero-landing.jpg` - Landing page principal
- `hero-dashboard.jpg` - Dashboard background
- `hero-auth.jpg` - Login/Register background

**Tamaño recomendado:** 1920x1080px o 1920x600px
**Formato:** JPG (optimizado), WebP

#### 2. **Features** (`/images/features/`)
Imágenes para mostrar características:
- `feature-calculator.png` - Calculadora de materiales
- `feature-ai.png` - Asistente IA
- `feature-pdf.png` - Exportación PDF
- `feature-templates.png` - Plantillas

**Tamaño recomendado:** 800x600px o 400x300px
**Formato:** PNG con transparencia, SVG

#### 3. **Testimonials** (`/images/testimonials/`)
Fotos de clientes/constructores:
- `client-1.jpg`
- `client-2.jpg`
- `client-3.jpg`

**Tamaño recomendado:** 200x200px (circular)
**Formato:** JPG

#### 4. **Backgrounds** (`/images/backgrounds/`)
Texturas y fondos:
- `construction-texture.jpg`
- `blueprint-pattern.svg`
- `concrete-texture.jpg`

**Tamaño recomendado:** Variable según uso
**Formato:** JPG (optimizado), SVG para patrones

#### 5. **Icons** (`/images/icons/`)
Íconos adicionales del tema construcción:
- `hammer.svg`
- `helmet.svg`
- `blueprint.svg`
- `calculator.svg`

**Formato:** SVG preferiblemente

#### 6. **Illustrations** (`/images/illustrations/`)
Ilustraciones personalizadas:
- `builder-working.svg`
- `project-completed.svg`
- `team-collaboration.svg`

**Formato:** SVG

---

## 🖼️ Cómo Usar las Imágenes

### 1. En Componentes React

#### Importación Estática
```tsx
// Para imágenes que necesitas procesar con Vite
import heroImage from '/images/heroes/hero-landing.jpg';

function Hero() {
  return (
    <img src={heroImage} alt="Construction site" />
  );
}
```

#### Ruta Pública (Recomendado)
```tsx
function Hero() {
  return (
    <img src="/images/heroes/hero-landing.jpg" alt="Construction site" />
  );
}
```

### 2. En CSS/Tailwind

#### Background Images
```tsx
<div 
  className="bg-cover bg-center h-96"
  style={{ backgroundImage: "url('/images/backgrounds/construction-texture.jpg')" }}
>
  {/* Content */}
</div>
```

#### Con Tailwind (agregando a config)
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('/images/backgrounds/blueprint-pattern.svg')",
      }
    }
  }
}

// Uso:
<div className="bg-hero-pattern">
```

### 3. Responsive Images

```tsx
<picture>
  <source 
    srcSet="/images/heroes/hero-landing-mobile.jpg" 
    media="(max-width: 768px)"
  />
  <source 
    srcSet="/images/heroes/hero-landing-tablet.jpg" 
    media="(max-width: 1024px)"
  />
  <img 
    src="/images/heroes/hero-landing.jpg" 
    alt="Construction site"
    className="w-full h-auto"
  />
</picture>
```

### 4. Con Lazy Loading

```tsx
<img 
  src="/images/features/feature-calculator.png"
  alt="Calculator feature"
  loading="lazy"
  className="w-full h-auto"
/>
```

---

## 🎨 Ejemplos de Uso en Brikio

### Landing Page Hero

```tsx
export function LandingPage() {
  return (
    <section className="relative h-screen">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: "url('/images/backgrounds/construction-texture.jpg')" }}
      />
      
      {/* Content */}
      <div className="relative z-10 container mx-auto">
        <h1>Brikio - Smart Estimates</h1>
        <img 
          src="/images/illustrations/builder-working.svg" 
          alt="Builder illustration"
          className="w-96 h-auto"
        />
      </div>
    </section>
  );
}
```

### Features Grid

```tsx
const features = [
  {
    title: 'Automatic Calculation',
    image: '/images/features/feature-calculator.png',
    description: 'Calculate materials instantly'
  },
  {
    title: 'AI Assistant',
    image: '/images/features/feature-ai.png',
    description: 'Powered by GPT'
  },
  // ...
];

export function FeaturesGrid() {
  return (
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <Card key={feature.title}>
          <img 
            src={feature.image} 
            alt={feature.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
          <h3>{feature.title}</h3>
          <p>{feature.description}</p>
        </Card>
      ))}
    </div>
  );
}
```

### Testimonials

```tsx
const testimonials = [
  {
    name: 'Juan Pérez',
    role: 'Constructor',
    avatar: '/images/testimonials/client-1.jpg',
    quote: 'Brikio me ahorra 5 horas por semana'
  },
  // ...
];

export function Testimonials() {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.name}>
          <img 
            src={testimonial.avatar}
            alt={testimonial.name}
            className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
          />
          <p className="italic">"{testimonial.quote}"</p>
          <p className="font-bold mt-4">{testimonial.name}</p>
          <p className="text-sm text-gray-600">{testimonial.role}</p>
        </Card>
      ))}
    </div>
  );
}
```

---

## 🚀 Optimización de Imágenes

### Antes de Subir

1. **Comprimir JPG/PNG:**
   - Usa: https://tinypng.com
   - O: `npm install -g imageoptim-cli`
   - Comando: `imageoptim images/**/*.{jpg,png}`

2. **Convertir a WebP:**
   ```bash
   # Instalar herramienta
   brew install webp
   
   # Convertir
   cwebp input.jpg -q 80 -o output.webp
   ```

3. **Tamaños Recomendados:**
   - Heroes: máx 200KB
   - Features: máx 100KB
   - Testimonials: máx 50KB
   - Icons/SVG: ya optimizados

### Responsive Images

Crea versiones para diferentes dispositivos:
```bash
# Desktop (1920px)
hero-landing.jpg

# Tablet (1024px)
hero-landing-tablet.jpg

# Mobile (768px)
hero-landing-mobile.jpg
```

---

## 📦 Componente de Imagen Reutilizable

Crea un componente optimizado:

```tsx
// /components/ui/OptimizedImage.tsx
import { useState } from 'react';
import { clsx } from 'clsx';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  lazy?: boolean;
}

export function OptimizedImage({ 
  src, 
  alt, 
  className,
  lazy = true 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div className={clsx('relative overflow-hidden', className)}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={() => setIsLoaded(true)}
        className={clsx(
          'transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
}
```

**Uso:**
```tsx
<OptimizedImage 
  src="/images/features/feature-calculator.png"
  alt="Calculator"
  className="w-full h-64 object-cover"
/>
```

---

## 🎯 Quick Start: Agregar Imágenes Ahora

### 1. Agregar Imagen al Proyecto

```bash
# Copiar imagen al directorio correcto
cp ~/Downloads/mi-imagen.jpg frontend/public/images/heroes/

# O crear desde URL
curl -o frontend/public/images/heroes/hero.jpg https://example.com/image.jpg
```

### 2. Usar en Landing Page

```tsx
// En LandingPage.tsx
<img 
  src="/images/heroes/hero.jpg" 
  alt="Construction hero"
  className="w-full h-auto"
/>
```

### 3. Verificar en Browser

```
http://localhost:5173/images/heroes/hero.jpg
```

---

## 📋 Checklist de Imágenes

### Para Landing Page:
- [ ] Hero section image (1920x1080px)
- [ ] 4-6 feature images (800x600px)
- [ ] 3-5 testimonial avatars (200x200px)
- [ ] Background texture (pattern SVG)
- [ ] Constructor illustration (SVG)

### Para Dashboard:
- [ ] Empty state illustrations
- [ ] Project placeholder images
- [ ] Success/Error icons

### Para Marketing:
- [ ] Social media og:image (1200x630px)
- [ ] App screenshots para PWA
- [ ] Email header images

---

## 🎨 Recursos de Imágenes Gratuitas

### Fotos de Construcción:
- **Unsplash**: https://unsplash.com/s/photos/construction
- **Pexels**: https://www.pexels.com/search/construction/
- **Pixabay**: https://pixabay.com/images/search/construction/

### Ilustraciones:
- **unDraw**: https://undraw.co (customizable color)
- **DrawKit**: https://drawkit.com
- **Humaaans**: https://www.humaaans.com

### Íconos:
- **Lucide Icons**: Ya incluidos en el proyecto
- **Heroicons**: https://heroicons.com
- **Flaticon**: https://www.flaticon.com

### Texturas/Patrones:
- **Subtle Patterns**: https://www.toptal.com/designers/subtlepatterns/
- **Hero Patterns**: https://heropatterns.com

---

## 🔍 Verificación

### Ver Estructura Actual:
```bash
cd /Users/jorgemurcia/Projects/budgetapp/frontend/public/images
ls -R
```

### Ver Imágenes en Browser:
```
http://localhost:5173/images/heroes/[nombre-imagen]
http://localhost:5173/images/features/[nombre-imagen]
```

### Tamaño de Imágenes:
```bash
du -sh images/**/*
```

---

## 💡 Tips

1. **Nombres descriptivos:** `hero-construction-site.jpg` mejor que `img1.jpg`
2. **Lowercase y guiones:** `feature-calculator.png` no `Feature Calculator.PNG`
3. **Formatos correctos:**
   - Fotos: JPG (comprimido)
   - Transparencias: PNG
   - Vectores: SVG
   - Web moderna: WebP
4. **Alt text siempre:** Importante para SEO y accesibilidad
5. **Lazy loading:** Para imágenes below the fold
6. **Responsive:** Diferentes tamaños para mobile/tablet/desktop

---

**Directorio Principal:** 
`/Users/jorgemurcia/Projects/budgetapp/frontend/public/images/`

**Acceso Web:** 
`http://localhost:5173/images/[carpeta]/[archivo]`

¡Listo para agregar tus imágenes! 🎨

