# Plan de ejecucion

## Fase 1: Fundamentos y disenio

1. Configurar Tailwind con una paleta calma: oliva, beige y tonos tierra suaves.
2. Montar Layout principal con Navbar y Footer.
3. Crear Landing Page con Hero orientado a conversion y CTA a WhatsApp.

## Fase 2: Backend y datos

1. Crear `schema.sql` para `profiles`, `blog_posts` y `appointments_leads`.
2. Activar RLS basico y policies para lectura publica del blog e insercion de leads.
3. Preparar la capa de cliente Supabase en frontend.

## Fase 3: Funcionalidades core

1. Cargar articulos del blog desde Supabase.
2. Enviar leads desde un formulario validado con React Hook Form y Zod.
3. Dejar una ruta futura para `admin` si luego se necesita escritura manual.

## Fase 4: Despliegue y optimizacion

1. Definir `.env` y `.env.local` con variables de Supabase y WhatsApp.
2. Preparar despliegue en Vercel y Netlify.
3. Revisar SEO local para Barranquilla, performance y accesibilidad.
