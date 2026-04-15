# Backend Plan

## Objetivo

Definir la base del backend para evolucionar el CRM actual hacia un SaaS real sin romper el frontend existente.

La idea no es construir todo de una vez.

La idea es:

- definir un nucleo estable
- crear el backend minimo
- migrar modulo por modulo
- reemplazar `localStorage` por persistencia real

## 1. Tablas Minimas

Las primeras tablas del backend deben ser:

- `agencies`
- `advisors`
- `leads`
- `clients`
- `tasks`

Y enseguida:

- `renewals`

## 2. Relaciones

La base del modelo debe ser:

- una `agency` tiene muchos `advisors`
- una `agency` tiene muchos `leads`
- una `agency` tiene muchos `clients`
- una `agency` tiene muchas `tasks`
- un `advisor` puede tener muchos `leads`
- un `lead` puede convertirse en un `client`
- un `client` puede tener muchas `tasks`
- un `client` puede tener muchas `renewals`

## 3. Backend Minimo A Construir Primero

Primera version backend:

- CRUD de agencias
- CRUD de asesores
- CRUD de leads
- mover lead de etapa
- convertir lead a cliente
- CRUD de clientes
- CRUD de tareas
- listar renovaciones

No meter al inicio:

- auth compleja
- billing
- integraciones avanzadas
- notificaciones reales
- automatizaciones sofisticadas

## 4. Endpoints Iniciales

### Agencies

- `GET /agencies/:agencyId`

### Advisors

- `GET /agencies/:agencyId/advisors`
- `POST /agencies/:agencyId/advisors`

### Leads

- `GET /agencies/:agencyId/leads`
- `POST /agencies/:agencyId/leads`
- `GET /agencies/:agencyId/leads/:leadId`
- `PATCH /agencies/:agencyId/leads/:leadId`
- `PATCH /agencies/:agencyId/leads/:leadId/stage`
- `POST /agencies/:agencyId/leads/:leadId/convert-to-client`

### Clients

- `GET /agencies/:agencyId/clients`
- `POST /agencies/:agencyId/clients`
- `PATCH /agencies/:agencyId/clients/:clientId`

### Tasks

- `GET /agencies/:agencyId/tasks`
- `POST /agencies/:agencyId/tasks`
- `PATCH /agencies/:agencyId/tasks/:taskId`
- `PATCH /agencies/:agencyId/tasks/:taskId/complete`

### Renewals

- `GET /agencies/:agencyId/renewals`

## 5. Esquema Minimo Por Entidad

### agencies

- `id`
- `name`
- `slug`
- `city`
- `country`
- `plan`
- `team_size`
- `created_at`

### advisors

- `id`
- `agency_id`
- `full_name`
- `email`
- `phone`
- `role`
- `active`
- `created_at`

### leads

- `id`
- `agency_id`
- `advisor_id` nullable
- `name`
- `phone`
- `email`
- `city`
- `country`
- `age`
- `product`
- `source`
- `campaign_name`
- `external_lead_id`
- `stage`
- `next_step`
- `notes`
- `created_at`

### clients

- `id`
- `agency_id`
- `lead_id` nullable
- `advisor_id` nullable
- `full_name`
- `product`
- `policy_number`
- `renewal_date`
- `status`
- `email`
- `phone`
- `city`
- `country`
- `notes`
- `created_at`

### tasks

- `id`
- `agency_id`
- `advisor_id` nullable
- `lead_id` nullable
- `client_id` nullable
- `title`
- `due_at`
- `urgent`
- `channel`
- `status`
- `notes`
- `created_at`

### renewals

- `id`
- `agency_id`
- `client_id`
- `renewal_date`
- `status`
- `notes`
- `created_at`

## 6. Migracion Sin Romper Frontend

La forma sana de migrar es esta:

1. mantener la estructura actual de servicios
2. cambiar solo las implementaciones de repositorio
3. dejar una implementacion local y otra API
4. migrar modulo por modulo

Ejemplo:

- hoy: `LocalStorageLeadRepository`
- despues: `ApiLeadRepository`

La UI no deberia enterarse demasiado del cambio.

## 7. Orden De Migracion Recomendado

Yo lo haria asi:

1. backend de `agencies` y `advisors`
2. backend de `leads`
3. mover pipeline a backend
4. backend de `clients`
5. backend de `tasks`
6. backend de `renewals`

## 8. Stack Recomendado

Si quieres algo practico para este proyecto:

- `Node.js`
- `Express`
- `PostgreSQL`
- `Prisma`

Auth simple despues:

- JWT o session-based

Recomendacion directa:

- `Node + Express + Prisma + PostgreSQL`

Porque permite avanzar rapido y mantener una curva de complejidad controlada.

## 9. Momento Ideal Para Arrancar

El siguiente gran hito ya puede ser:

- diseñar el esquema de base de datos
- crear el backend minimo de `agencies`, `advisors` y `leads`

## 10. Principios Para Que Sea Escalable

Para que la base de datos crezca sin volverse caotica:

- usar migraciones desde el inicio
- meter `agency_id` en todas las tablas del dominio comercial
- evitar una sola tabla gigante con demasiadas columnas
- agregar nuevas tablas por fases, no por miedo
- mantener relaciones claras entre `agency`, `advisor`, `lead`, `client` y `task`

## 11. Primer Entregable Tecnico Recomendado

El primer entregable backend deberia ser:

- proyecto backend inicial
- conexion a PostgreSQL
- esquema Prisma base
- migracion inicial
- endpoints de `agencies`, `advisors` y `leads`

## 12. Resultado Esperado

Al cerrar esta etapa, el sistema deberia quedar listo para:

- dejar de depender de `localStorage`
- compartir datos reales entre usuarios y equipos
- recibir leads desde formularios o integraciones
- preparar el SaaS para multiagencia real
