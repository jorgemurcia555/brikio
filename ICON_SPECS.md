# Especificaciones de Iconos para Brikio

## Dimensiones Requeridas

Para crear iconos PNG con fondo naranja y padding, usa estas dimensiones:

### Iconos PWA (Progressive Web App)
- **192x192px** - Android home screen
- **512x512px** - PWA estándar, splash screen
- **180x180px** - iOS home screen (Apple Touch Icon)

### Favicons Tradicionales
- **16x16px** - Favicon pequeño
- **32x32px** - Favicon estándar
- **48x48px** - Favicon grande

## Especificaciones de Diseño

### Fondo
- **Color**: `#F15A24` (naranja principal de Brikio)
- **Forma**: Rectángulo con esquinas redondeadas
  - Radio de borde: ~12-15% del tamaño total (ej: 24px para 192px, 64px para 512px)

### Padding
- **Padding recomendado**: ~20% del tamaño total
  - Para 192px: ~40px de padding
  - Para 512px: ~80px de padding
  - Para 180px: ~30px de padding

### Logo
- El logo del constructor (casco) debe estar centrado
- Color del logo: Blanco (`#FFFFFF`)
- El logo debe ocupar aproximadamente el 60-70% del área disponible (después del padding)

## Archivos Actuales

Los iconos SVG ya están creados en:
- `/frontend/public/icons/icon-192.svg` (192x192)
- `/frontend/public/icons/icon-512.svg` (512x512)
- `/frontend/public/favicon-app.svg` (180x180)

## Conversión a PNG

Si necesitas crear versiones PNG desde los SVGs, puedes usar herramientas como:
- **Online**: CloudConvert, Convertio
- **Local**: Inkscape, ImageMagick
- **Comando ImageMagick**:
  ```bash
  convert icon-192.svg -resize 192x192 icon-192.png
  convert icon-512.svg -resize 512x512 icon-512.png
  convert favicon-app.svg -resize 180x180 favicon-app.png
  ```

## Actualización del Manifest

El `manifest.json` ya está configurado para usar los iconos SVG. Si prefieres PNG, actualiza las rutas en:
- `/frontend/public/manifest.json`
- `/frontend/index.html`

