# DORVAL MASTER SERVICES GROUP

Sitio corporativo bilingüe en HTML, CSS y JavaScript. Mantiene el tema claro tanto si el dispositivo usa modo claro como modo oscuro. Usa Inter para el texto y Manrope para títulos, con alternativas de sistema.

## Despliegue en Cloudflare Pages

1. Conecta el repositorio a Cloudflare Pages.
2. Configura **Root directory (advanced)** como `outputs/dorval-website`.
3. Usa `exit 0` como comando de compilación y `.` como directorio de salida. La carpeta `functions/` debe quedar en la raíz del proyecto de Pages junto al `index.html`.
4. Guarda y despliega. Cloudflare reconocerá `functions/api/leads.js` y lo publicará como la ruta `/api/leads`.
5. Para pruebas locales puedes servir el proyecto con Wrangler; abrir `index.html` directamente solo muestra el formulario, no activa el endpoint.

Cloudflare Pages usa una carpeta `functions` en la raíz del proyecto para generar rutas de Pages Functions. [Documentación de enrutamiento](https://developers.cloudflare.com/pages/functions/routing/) y [configuración de compilación](https://developers.cloudflare.com/pages/configuration/build-configuration/).

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

3. Añade la acción **Excel Online (Business) → Add a row into a table**. Elige el archivo y `LeadsTable`. Mapea: `submittedAt` → Fecha y hora (UTC), `name` → Nombre, `phone` → WhatsApp, `email` → Correo electrónico, `propertyType` → Tipo de propiedad, `goal` → Objetivo, `zone` → Zona / ciudad, `budget` → Presupuesto aproximado, `timing` → Plazo, `consent` → Consentimiento, `language` → Idioma y `source` → Origen. Para Estado comercial pon `Nuevo`; deja Notas internas vacío. [El conector Excel Online (Business) trabaja con libros almacenados en OneDrive para la Empresa y SharePoint](https://learn.microsoft.com/en-us/connectors/excelonlinebusiness/).
4. Guarda el flujo y copia la URL HTTPS que genera el disparador.
5. En Cloudflare, abre el proyecto Pages → **Settings → Variables and Secrets**. Crea `POWER_AUTOMATE_URL` como **Secret** en los entornos Production y Preview que uses. No publiques esa URL en el HTML ni en `script.js`. [Cloudflare permite acceder a variables y secretos desde `env` en Pages Functions](https://developers.cloudflare.com/pages/functions/bindings/).
6. Vuelve a desplegar el sitio. El formulario enviará los datos a `/api/leads`; la función valida el consentimiento y reenvía los datos a Power Automate. Si el guardado falla, la página ofrece WhatsApp como alternativa.

El formulario y el endpoint están preparados, pero la sincronización no queda activa hasta crear el flujo y cargar su URL secreta en Cloudflare.

## Contacto configurado

- WhatsApp: `1809-265-0215`
- Correo: `Ventasdorvalmaster@gmail.com`

El formulario requiere nombre, WhatsApp y consentimiento. El correo electrónico es opcional.

## Personalización

El logo proporcionado está incluido como `logo-dorval-azul.png`. Antes de publicar, sustituye las imágenes de muestra por recursos autorizados y añade enlaces reales a redes sociales, política de privacidad y términos. Actualiza servicios y proyectos con datos confirmados.
