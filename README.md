# Laboratorios LIT - Tienda Premium de Bienestar

Laboratorios LIT es una plataforma de e-commerce premium diseñada para la venta de suplementos de alta calidad. Enfocada en el bienestar y el performance, ofrece una experiencia de usuario fluida con integración de pedidos vía WhatsApp.

## Características Principales

- **Catálogo de Productos**: Gestión dinámica de productos con categorías y detalles técnicos.
- **Carrito de Compras**: Sistema de carrito persistente y optimizado.
- **Checkout vía WhatsApp**: Flujo de pedido que genera un comprobante detallado y abre una conversación directa con un asesor.
- **Panel de Administración**: Gestión de pedidos, leads, productos y promociones.
- **Real-time Updates**: Actualizaciones en tiempo real para el panel de administración mediante WebSockets.
- **Lead Tracking**: Captura automática de leads durante el proceso de checkout.

## Tecnologías Utilizadas

- **Frontend**: React, Vite, Tailwind CSS, Lucide React, Motion.
- **Backend**: Node.js, Express, Socket.io.
- **Base de Datos**: SQLite (Desarrollo) / PostgreSQL (Producción).
- **Almacenamiento**: Cloudinary (Imágenes).

## Instalación Local

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno:
   Copia el archivo `.env.example` a `.env` y completa los valores necesarios.
4. Iniciar en modo desarrollo:
   ```bash
   npm run dev
   ```

## Variables de Entorno Requeridas

| Variable | Descripción |
|----------|-------------|
| `WHATSAPP_SALES` | Número de WhatsApp para recibir pedidos. |
| `CURRENCY` | Moneda de la tienda (ej: USD). |
| `SHIPPING_FLAT` | Tarifa plana de envío. |
| `ADMIN_USER` | Email del administrador inicial. |
| `ADMIN_PASS` | Contraseña del administrador inicial. |
| `POSTGRES_URL` | URL de conexión a PostgreSQL (requerido en producción). |
| `CLOUDINARY_URL` | URL de configuración de Cloudinary para subida de imágenes. |

## Despliegue en Vercel

Este proyecto está configurado para ser desplegado en Vercel como una aplicación Full-Stack.

1. Conecta tu repositorio de GitHub a Vercel.
2. Configura las variables de entorno en el panel de Vercel.
3. Asegúrate de configurar una base de datos PostgreSQL (Vercel Storage) para persistencia en producción.

## Integración con Supabase (Opcional)

El proyecto está preparado para migrar a Supabase. Se han incluido las variables necesarias en `.env.example`. Para activar la integración, se debe actualizar el wrapper de base de datos en `server.ts`.

## Flujo de Checkout

1. El usuario completa sus datos en el carrito.
2. Al confirmar, el sistema:
   - Guarda el pedido en la base de datos local.
   - Genera un ID de pedido único (LIT-YYYYMMDD-XXXX).
   - Abre WhatsApp con un mensaje pre-formateado tipo "Ticket".
   - Muestra una pantalla de confirmación con opción de copiar el resumen.
