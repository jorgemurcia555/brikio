# 📸 Directorio de Imágenes

Este directorio contiene todas las imágenes públicas de Brikio.

## 📁 Estructura

- **heroes/** - Imágenes hero/banner (1920x1080px)
- **features/** - Imágenes de características (800x600px)
- **testimonials/** - Fotos de clientes (200x200px círculo)
- **backgrounds/** - Texturas y fondos
- **icons/** - Íconos adicionales (SVG)
- **illustrations/** - Ilustraciones personalizadas (SVG)

## 🚀 Cómo Agregar Imágenes

1. Copia tu imagen aquí:
   ```bash
   cp ~/Downloads/mi-imagen.jpg heroes/
   ```

2. Úsala en React:
   ```tsx
   <img src="/images/heroes/mi-imagen.jpg" alt="Description" />
   ```

3. Verifica en: http://localhost:5173/images/heroes/mi-imagen.jpg

## 📝 Convenciones

- Nombres en lowercase con guiones: `hero-construction.jpg`
- JPG para fotos, PNG para transparencias, SVG para vectores
- Comprime antes de subir (max 200KB para heroes)
- Siempre incluye `alt` text

Ver guía completa en: `/IMAGES_GUIDE.md`
