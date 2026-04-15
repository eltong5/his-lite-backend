# Supabase Plan

## Objetivo

Usar Supabase como primer backend real del SaaS para reemplazar progresivamente `localStorage` sin romper la arquitectura actual del frontend.

La idea es:

- mantener la app React actual
- conservar la estructura de servicios y repositorios
- cambiar las implementaciones locales por implementaciones conectadas a Supabase
- avanzar modulo por modulo

## Por Que Supabase Si Encaja

Supabase encaja bien en este proyecto porque ya tienes:

- entidades definidas
- capas por feature
- repositorios locales
- flujo de negocio bastante claro

Eso permite migrar asi:

- hoy: `LocalStorageLeadRepository`
- despues: `SupabaseLeadRepository`

La UI no deberia cambiar demasiado.

## Que Va A Resolver Supabase

Supabase puede cubrir:

- PostgreSQL real
- autenticacion
- API de datos
- Row Level Security
- storage futuro si se necesita

Para este CRM, lo usaremos primero como:

- base de datos central
- capa de persistencia compartida
- base para multiagencia real

## Tablas Iniciales En Supabase

Primera fase:

- `agencies`
- `advisors`
- `leads`

Segunda fase:

- `clients`
- `tasks`
- `renewals`

## Esquema Recomendado

### agencies

- `id uuid primary key`
- `name text not null`
- `slug text unique not null`
- `city text`
- `country text`
- `plan text not null`
- `team_size integer not null default 1`
- `created_at timestamptz not null default now()`

### advisors

- `id uuid primary key`
- `agency_id uuid not null references agencies(id)`
- `full_name text not null`
- `email text not null`
- `phone text`
- `role text not null`
- `active boolean not null default true`
- `created_at timestamptz not null default now()`

### leads

- `id uuid primary key`
- `agency_id uuid not null references agencies(id)`
- `advisor_id uuid references advisors(id)`
- `name text not null`
- `phone text not null`
- `email text`
- `city text`
- `country text`
- `age integer`
- `product text not null`
- `source text not null`
- `campaign_name text`
- `external_lead_id text`
- `stage text not null`
- `next_step text not null`
- `notes text`
- `created_at timestamptz not null default now()`

### clients

- `id uuid primary key`
- `agency_id uuid not null references agencies(id)`
- `lead_id uuid references leads(id)`
- `advisor_id uuid references advisors(id)`
- `full_name text not null`
- `product text not null`
- `policy_number text`
- `renewal_date date`
- `status text not null`
- `email text`
- `phone text`
- `city text`
- `country text`
- `notes text`
- `created_at timestamptz not null default now()`

### tasks

- `id uuid primary key`
- `agency_id uuid not null references agencies(id)`
- `advisor_id uuid references advisors(id)`
- `lead_id uuid references leads(id)`
- `client_id uuid references clients(id)`
- `title text not null`
- `due_at timestamptz`
- `urgent boolean not null default false`
- `channel text not null`
- `status text not null`
- `notes text`
- `created_at timestamptz not null default now()`

### renewals

- `id uuid primary key`
- `agency_id uuid not null references agencies(id)`
- `client_id uuid not null references clients(id)`
- `renewal_date date not null`
- `status text not null`
- `notes text`
- `created_at timestamptz not null default now()`

## Relaciones Clave

- una `agency` tiene muchos `advisors`
- una `agency` tiene muchos `leads`
- una `agency` tiene muchos `clients`
- una `agency` tiene muchos `tasks`
- una `agency` tiene muchos `renewals`
- un `advisor` puede tener muchos `leads`
- un `lead` puede convertirse en un `client`
- un `client` puede tener muchas `tasks`
- un `client` puede tener muchas `renewals`

## RLS Desde El Inicio

Si usas Supabase, vale la pena pensar temprano en seguridad por agencia.

Meta:

- cada usuario solo debe leer datos de su propia agencia
- nunca mezclar datos entre agencias

Primera aproximacion:

- todas las tablas del dominio deben tener `agency_id`
- luego se agregan politicas RLS basadas en pertenencia del usuario a una agencia

No hace falta montar toda la seguridad hoy, pero el diseño debe asumir eso desde el inicio.

## Orden De Migracion Recomendado

### Fase 1

- crear proyecto Supabase
- crear tablas `agencies`, `advisors`, `leads`
- insertar datos demo
- crear `SupabaseAdvisorRepository`
- crear `SupabaseLeadRepository`

### Fase 2

- migrar ingreso de leads
- migrar listado de leads
- migrar pipeline

### Fase 3

- crear tablas `clients`, `tasks`, `renewals`
- crear repositorios Supabase de esos modulos
- migrar conversion lead -> cliente
- migrar tareas y renovaciones

## Repositorios A Crear

La estructura sugerida seria:

```text
src/features/leads
├── leadRepository.ts
├── localStorageLeadRepository.ts
├── supabaseLeadRepository.ts
├── leadService.ts
├── leadIngestionService.ts
```

Y equivalente para:

- `advisors`
- `clients`
- `tasks`
- `agencies`

## Endpoints O Acceso

Con Supabase puedes elegir dos rutas:

### Ruta 1. Acceso directo desde frontend

Usar `@supabase/supabase-js` desde React para leer y escribir tablas.

Ventaja:

- rapido para arrancar

Riesgo:

- si metes demasiada logica de negocio en frontend, luego cuesta ordenar

### Ruta 2. Logica mixta

- lecturas simples desde Supabase
- logica importante en funciones o backend despues

Mi recomendacion inicial:

- empezar con acceso directo para `agencies`, `advisors` y `leads`
- dejar la logica mas sensible encapsulada en servicios del frontend

## Funciones De Negocio Que Deben Mantenerse En Servicios

Aunque uses Supabase, estas reglas no deberian dispersarse:

- deduplicacion por `externalLeadId`
- asignacion inicial de asesor
- `nextStep` por defecto
- conversion de lead a cliente
- creacion automatica de tarea al entrar a `Postventa`

Eso debe seguir viviendo en servicios o casos de uso.

## Variables De Entorno Esperadas

En frontend necesitarias algo como:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Primer Entregable Real Con Supabase

El primer entregable deberia ser:

- proyecto Supabase creado
- tablas `agencies`, `advisors`, `leads`
- datos demo cargados
- cliente Supabase configurado en el frontend
- `SupabaseLeadRepository`
- `SupabaseAdvisorRepository`
- modulo de leads leyendo desde Supabase

## Que No Haria En La Primera Semana

- auth compleja
- billing
- automatizaciones avanzadas
- edge functions innecesarias
- integraciones externas completas
- todo el backend por fuera de Supabase

## Resultado Esperado

Al cerrar esta etapa, deberias tener:

- datos reales persistidos fuera del navegador
- aislamiento por agencia mucho mas serio
- base lista para login despues
- app preparada para dejar atras `localStorage`
