# DORVAL MASTER SERVICES GROUP

Sitio corporativo bilingüe servido como **Cloudflare Worker con Static Assets**. La interfaz conserva el tema claro con cualquier ajuste de apariencia del dispositivo. Usa Inter para el texto y Manrope para títulos, con alternativas del sistema.

## Despliegue desde GitHub con Workers Builds

Este repositorio está preparado para el comando de despliegue del registro de Cloudflare (`npx wrangler deploy`). `wrangler.jsonc` define el Worker y sirve los archivos de `public/`; el Worker procesa el formulario en `/api/leads`.

En **Workers & Pages → tu Worker → Settings → Build**, usa la rama `main`, deja vacío el comando de compilación y configura `npx wrangler deploy` como comando de despliegue. El directorio raíz del repositorio es la raíz del proyecto. Workers Builds instala Wrangler temporalmente si no se declara como dependencia.

El Worker se llama `landing-page-dorval-master`, igual que el nombre asignado por Cloudflare Workers Builds. Si ya elegiste otro nombre de Worker en Cloudflare, cambia `name` en `wrangler.jsonc` para que coincida con el proyecto que Cloudflare despliega.

## Sincronizar solicitudes con Excel

La plantilla `leads-template.xlsx` contiene la tabla `LeadsTable`. Para activar el registro automático:

1. Sube la plantilla a OneDrive para la Empresa o SharePoint.
2. En Power Automate, crea un flujo con el disparador **When an HTTP request is received** y pega este esquema:

```json
{
  "type": "object",
  "properties": {
    "submittedAt": { "type": "string" },
    "name": { "type": "string" },
    "phone": { "type": "string" },
    "email": { "type": "string" },
    "propertyType": { "type": "string" },
    "goal": { "type": "string" },
    "zone": { "type": "string" },
    "budget": { "type": "string" },
    "timing": { "type": "string" },
    "consent": { "type": "boolean" },
    "language": { "type": "string" },
    "source": { "type": "string" }
  },
  "required": ["submittedAt", "name", "phone", "propertyType", "goal", "zone", "timing", "consent"]
}
```

3. Añade **Excel Online (Business) → Add a row into a table**. Elige el archivo y `LeadsTable`. Mapea `submittedAt` → Fecha y hora (UTC), `name` → Nombre, `phone` → WhatsApp, `email` → Correo electrónico, `propertyType` → Tipo de propiedad, `goal` → Objetivo, `zone` → Zona / ciudad, `budget` → Presupuesto aproximado, `timing` → Plazo, `consent` → Consentimiento, `language` → Idioma y `source` → Origen. Para Estado comercial pon `Nuevo`; deja Notas internas vacío.
4. Guarda el flujo y copia la URL HTTPS generada por el disparador.
5. En Cloudflare, abre el Worker → **Settings → Variables and Secrets**. Añade `POWER_AUTOMATE_URL` como **Secret** en el entorno Production (y Preview si se usa). No incluyas esa URL en el código del sitio.
6. Vuelve a desplegar. Si el flujo está configurado, el formulario enviará los leads a Excel; si falla el guardado, ofrece WhatsApp como alternativa.

La conexión con Excel no se activa hasta crear el flujo y configurar el secreto en Cloudflare.

## Contacto

- WhatsApp: `1809-265-0215`
- Correo: `Ventasdorvalmaster@gmail.com`

El formulario requiere nombre, WhatsApp y consentimiento. El correo electrónico es opcional.

## Personalización

Los archivos públicos del sitio están en `public/`; el código del Worker está en `src/index.js`. El logo proporcionado está incluido. Antes de publicar, sustituye las imágenes de muestra por recursos autorizados y añade enlaces reales a redes sociales, política de privacidad y términos. Actualiza servicios y proyectos con datos confirmados.

