# DORVAL MASTER SERVICES GROUP

Sitio corporativo bilingüe servido como **Cloudflare Worker con Static Assets**. La interfaz mantiene el tema claro y usa Inter y Manrope con alternativas del sistema.

## Despliegue en Cloudflare Workers

El repositorio está preparado para Workers Builds y el comando `npx wrangler deploy`. La configuración de `wrangler.jsonc` publica los archivos de `public/` y ejecuta el Worker de `src/index.js` para la API del formulario.

En **Workers & Pages → landing-page-dorval-master → Settings → Build**, usa la rama `main`, deja vacío el comando de compilación y configura `npx wrangler deploy` como comando de despliegue. La raíz del repositorio es la raíz del proyecto.

## Guardar leads en Google Sheets

La hoja y el Apps Script deben pertenecer a la cuenta de Google Workspace del cliente. De este modo, los datos y la automatización quedan bajo el control del cliente. El Worker de Cloudflare actúa como puente: valida la solicitud y envía los datos al Apps Script usando secretos que no se exponen en el navegador.

### 1. Crear la hoja

Desde la cuenta empresarial del cliente, crea un Google Sheet para los leads. Copia el ID de la hoja, que aparece entre `/d/` y `/edit` en su dirección. El script creará la pestaña `Leads` y sus encabezados al ejecutar la configuración inicial.

### 2. Crear y configurar Apps Script

1. Ve a [script.google.com](https://script.google.com/) con la cuenta del cliente y crea un proyecto.
2. Copia el contenido de `google-apps-script/Code.gs` al editor.
3. En **Project Settings → Script properties**, añade:
   - `SPREADSHEET_ID`: el ID de la hoja de Google.
   - `WEBHOOK_TOKEN`: un secreto aleatorio largo (al menos 32 caracteres). Créalo con un gestor de contraseñas y no lo guardes en Git ni lo compartas por el chat.
4. Ejecuta `setup` una vez desde el editor y concede el acceso solicitado. Esto crea la pestaña `Leads` con columnas para fecha, contacto, búsqueda, consentimiento, idioma, estado y notas.
5. Selecciona **Deploy → New deployment → Web app**. Configura **Execute as: Me** y **Who has access: Anyone**, y despliega. Copia la URL que termina en `/exec`.

El endpoint web debe aceptar solicitudes anónimas porque el Worker de Cloudflare no inicia sesión en Google. El script valida un token secreto guardado en las propiedades del proyecto. Si la política de Google Workspace del cliente no permite el acceso `Anyone`, no continúes con este método: hará falta que el administrador habilite el acceso o usar una integración con autenticación de Google. El endpoint es públicamente accesible, pero el script exige el token secreto en cada solicitud.

### 3. Guardar los secretos en Cloudflare

En Cloudflare abre el Worker `landing-page-dorval-master` → **Settings → Variables and Secrets**. Añade estos dos secretos en Production. Si existe una variable antigua `POWER_AUTOMATE_URL`, elimínala: la web ya no la utiliza.

- `GOOGLE_SHEETS_WEB_APP_URL`: URL `/exec` de la aplicación web de Apps Script.
- `GOOGLE_SHEETS_WEBHOOK_TOKEN`: el mismo valor que guardaste como `WEBHOOK_TOKEN` en Apps Script.

No pongas estos valores en `public/script.js`, HTML ni en el repositorio. Vuelve a desplegar el Worker después de añadirlos. Cuando la integración esté activa, el formulario mostrará confirmación y cada solicitud se añadirá a `Leads`.

## Contacto configurado

- WhatsApp: `1809-265-0215`
- Correo: `Ventasdorvalmaster@gmail.com`

El formulario requiere nombre, WhatsApp y consentimiento. El correo electrónico es opcional. Si el guardado falla, ofrece enviar la solicitud por WhatsApp.

## Personalización

Los archivos del sitio están en `public/` y el Worker en `src/index.js`. El código para Apps Script está en `google-apps-script/Code.gs`. Sustituye las imágenes de muestra por recursos autorizados y actualiza servicios, proyectos, políticas y redes sociales con datos confirmados.
