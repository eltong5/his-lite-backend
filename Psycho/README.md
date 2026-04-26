# Psycho

Base inicial para un sitio MVP de psicologia en Barranquilla con Vite, React, Tailwind, Shadcn-style UI y Supabase.

## Run

```bash
npm install
npm run dev
```

## What is included

- Layout principal con Navbar y Footer
- Landing page con hero, CTA a WhatsApp, bloques de servicio y fases
- Blog consumido desde Supabase con fallback local
- Formulario de contacto con React Hook Form + Zod
- `schema.sql` para tablas y policies base

## Next step

Copy `.env.example` to `.env.local` and fill in the Supabase and WhatsApp values.

## Bitacora

- Se creo la estructura inicial del proyecto `Psycho` con Vite, React, Tailwind y una base tipo Shadcn UI.
- Se agrego una landing page MVP con enfoque en conversion, WhatsApp y SEO local para Barranquilla.
- Se preparo la integracion inicial con Supabase para blog y leads.
- Se definio `schema.sql` con las tablas base para perfiles, articulos y leads de citas.
- Se configuro el proyecto para despliegue en Vercel y Netlify.
