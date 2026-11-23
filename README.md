# DORVAL MASTER SERVICES GROUP

Sitio corporativo bilingüe servido como Cloudflare Worker con archivos estáticos. La web no guarda los datos en una hoja de cálculo ni en una base de datos: el formulario prepara el mensaje y abre WhatsApp con la información para que la persona revise y pulse **Enviar**.

## Despliegue en Cloudflare Workers

El repositorio está preparado para Workers Builds y el comando `npx wrangler deploy`. `wrangler.jsonc` publica los archivos de `public/` y el Worker sirve esos archivos usando el binding `ASSETS`.

En **Workers & Pages → landing-page-dorval-master → Settings → Build**, usa la rama `main`, deja vacío el comando de compilación y configura `npx wrangler deploy` como comando de despliegue. La raíz del repositorio es la raíz del proyecto.

## Envío del formulario por WhatsApp

Al completar el formulario, la web abre un chat con el número de DORVAL y un mensaje que incluye nombre, WhatsApp, correo, tipo de propiedad, objetivo, zona, presupuesto y plazo. La persona debe revisar el texto y pulsar **Enviar** en WhatsApp; la página no puede enviar mensajes en nombre de la persona.

El destino configurado es `1809-265-0215`. Para cambiarlo, actualiza `whatsappNumber` en `public/script.js` y los enlaces de contacto en `public/index.html`.

No se conecta Google Sheets, Excel, Power Automate ni otro almacenamiento. Si el navegador bloquea la ventana emergente, el formulario muestra un enlace para abrir WhatsApp manualmente.

## Contacto

- WhatsApp: `1809-265-0215`
- Correo: `Ventasdorvalmaster@gmail.com`

El formulario requiere nombre, WhatsApp y consentimiento. El correo electrónico es opcional.

## Personalización

Los archivos públicos están en `public/` y el Worker en `src/index.js`. El logo proporcionado está incluido. Antes de publicar, sustituye las imágenes de muestra por recursos autorizados y actualiza servicios, proyectos, políticas y redes sociales con datos confirmados.
