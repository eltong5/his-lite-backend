# SaaS CRM Roadmap

## Vision Del Producto

- Producto: SaaS CRM para agentes y agencias de seguros
- Cliente objetivo: agentes independientes, brokers y agencias comerciales
- Mision: centralizar leads, seguimiento comercial, clientes y renovaciones en una sola plataforma
- Propuesta de valor: ayudar a los equipos comerciales a organizar sus ventas sin depender de hojas de calculo, chats dispersos o CRMs genericos

## Principio Central

El sistema no vende seguros.

El sistema organiza la operacion comercial de quienes venden seguros.

Por eso el flujo base del producto es:

1. entra un lead
2. se asigna a un asesor
3. se hace seguimiento
4. avanza por pipeline
5. se convierte en cliente o se pierde
6. si se gana, entra a postventa y renovaciones

## Definicion Del Negocio

Un `lead` es un prospecto.

Un `cliente` es un lead que ya cerro negocio o ya paso a postventa.

Una `agencia` es la cuenta principal que usa el sistema.

Un `asesor` es un usuario interno de la agencia.

## MVP Real Del SaaS

El MVP debe enfocarse en resolver el problema principal de una agencia de seguros:

- capturar leads
- asignarlos rapido
- dar seguimiento
- mover oportunidades por pipeline
- convertir leads en clientes
- controlar tareas y renovaciones

## Modulos Del MVP

### 1. Leads

Debe permitir:

- crear lead manualmente
- recibir lead desde formulario o integracion futura
- guardar datos de contacto
- registrar fuente del lead
- asignar asesor
- editar y consultar detalle

Campos minimos recomendados:

- nombre
- telefono
- email
- producto de interes
- canal de origen
- ciudad
- pais
- edad
- asesor asignado
- estado comercial
- fecha de creacion
- notas

Campos futuros recomendados:

- campaignName
- adName
- externalLeadId
- utmSource
- utmCampaign

### 2. Pipeline Comercial

Estados recomendados del MVP:

- Nuevo
- Asignado
- Contactado
- Cotizacion
- Negociacion
- Ganado
- Perdido
- Postventa

Debe permitir:

- mover leads entre estados
- ver cantidad por etapa
- identificar prioridad comercial
- ver quien es el asesor responsable

### 3. Clientes

Debe permitir:

- convertir un lead ganado en cliente
- guardar cartera activa
- registrar producto o poliza
- mostrar fecha estimada de renovacion
- mostrar estado del seguimiento

### 4. Tareas

Debe permitir:

- crear tareas manuales
- crear tareas automaticas basadas en lead o cliente
- asignar responsable
- marcar prioridad
- marcar cumplimiento

### 5. Dashboard

Debe mostrar:

- leads activos
- oportunidades por etapa
- cierres
- tareas urgentes
- clientes en postventa
- renovaciones proximas

### 6. Renovaciones

Debe permitir:

- listar clientes por fecha de renovacion
- generar seguimiento preventivo
- marcar estado de renovacion

## Lo Que No Entra En El MVP Inicial

Estas piezas son importantes, pero no deben bloquear la salida del producto:

- facturacion del SaaS
- white-label completo
- integracion con todas las redes al mismo tiempo
- motor avanzado de automatizacion
- sistema complejo de tickets
- analitica avanzada por campaña
- multi-tenant completo con permisos finos

## Arquitectura Del Producto

El producto debe crecer en capas.

### Presentacion

- paginas
- componentes
- formularios
- tablas
- dashboard

### Aplicacion

- casos de uso
- reglas de flujo
- conversion lead a cliente
- asignacion de asesor
- generacion de tareas

### Dominio

- Lead
- Client
- Task
- Renewal
- Agency
- User

### Infraestructura

- localStorage para MVP tecnico actual
- API propia en una fase posterior
- base de datos real cuando entremos a backend

## Entidades Principales

### Lead

- id
- fullName
- phone
- email
- country
- city
- age
- product
- source
- assignedAdvisorId
- status
- notes
- createdAt
- externalLeadId

### Client

- id
- leadId
- fullName
- product
- policyNumber
- advisorId
- renewalDate
- status
- createdAt

### Task

- id
- leadId o clientId
- title
- description
- dueAt
- priority
- status
- advisorId
- createdAt

### Renewal

- id
- clientId
- renewalDate
- status
- notes

## Roadmap Por Fases

### Fase 1. Base Comercial Operativa

Objetivo:

- dejar el CRM listo para operar leads de forma consistente

Entregables:

- leads funcionales
- detalle de lead
- edicion de lead
- pipeline conectado
- dashboard con datos reales

Estado actual estimado:

- 75%
- Avance real:
  - leads manuales funcionando
  - edicion y detalle de lead funcionando
  - pipeline moviendo etapas reales
  - dashboard conectado a datos reales

### Fase 2. Conversion A Cliente

Objetivo:

- convertir el flujo comercial en flujo real de negocio

Entregables:

- accion para convertir lead a cliente
- modulo de clientes real
- relacion entre lead y cliente
- primeras renovaciones visibles

Estado actual estimado:

- 20%
- Avance real:
  - entidad `Client` definida
  - modulo de clientes conectado a repositorio local
  - creacion manual de clientes habilitada
  - conversion automatica de lead a cliente al entrar a `Postventa`

### Fase 3. Tareas Y Seguimiento Operativo

Objetivo:

- volver util el dia a dia del asesor

Entregables:

- tareas reales persistidas
- tareas ligadas a lead o cliente
- seguimiento manual y automatico
- actividad reciente basada en eventos reales

Estado actual estimado:

- 20%
- Avance real:
  - tareas de postventa creadas automaticamente al convertir cliente
  - modulo de tareas mostrando seguimiento para leads y clientes
  - renovaciones proximas visibles desde clientes

### Fase 4. Ingreso Automatico De Leads

Objetivo:

- permitir que formularios externos alimenten el CRM

Entregables:

- estructura de lead preparada para integraciones
- endpoint o contrato de entrada
- soporte para source y externalLeadId
- flujo formulario -> lead -> asesor -> tarea

Estado actual estimado:

- 5%
- Avance real:
  - entidad `Lead` ampliada con `city`, `country`, `age`, `campaignName` y `externalLeadId`
  - formulario de leads listo para capturar datos de marketing e integraciones futuras

### Fase 5. SaaS Multiagencia

Objetivo:

- vender el producto a multiples agencias

Entregables:

- entidad Agency
- usuarios por agencia
- aislamiento de datos
- roles basicos

Estado actual estimado:

- 0%
- Avance real:
  - entidad `Agency` preparada a nivel base
  - shell del CRM mostrando agencia actual, plan y tamano del equipo
  - aislamiento basico de datos por `agencyId` en leads, clientes, tareas y asesores

## Orden Recomendado De Construccion

No construir todo a la vez.

El orden recomendado es:

1. cerrar flujo lead -> pipeline
2. crear conversion lead -> cliente
3. persistir clientes reales
4. persistir tareas reales
5. agregar renovaciones
6. preparar integracion automatica de leads
7. preparar cuentas por agencia

## Siguiente Paso Inmediato

El siguiente paso de producto y codigo debe ser:

- dejar de derivar clientes solo desde leads en memoria
- crear una conversion explicita de lead a cliente
- guardar clientes en una capa propia
- relacionar tareas con leads y clientes

## Bitacora De Avance

### Hecho

- 2026-04-15: Se reemplazo el roadmap original por la vision del producto como SaaS CRM para agentes y agencias de seguros.
- 2026-04-15: Se definio una entidad `Client` mas completa con datos de negocio y contacto.
- 2026-04-15: Se conecto el modulo de clientes con creacion manual y persistencia local.
- 2026-04-15: Se implemento la conversion automatica de lead a cliente al mover el pipeline a `Postventa`.
- 2026-04-15: Se conecto el seguimiento de postventa con tareas automaticas para clientes nuevos.
- 2026-04-15: Se agrego un bloque operativo de renovaciones proximas en el modulo de clientes.
- 2026-04-15: Se amplio la entidad `Lead` para soportar datos de captacion como ciudad, pais, edad, campana e identificador externo.
- 2026-04-15: Se construyo una capa de ingesta automatica para leads con control de duplicados por `externalLeadId`.
- 2026-04-15: Se agrego una base inicial de `Agency` para empezar a preparar el modo multiagencia del SaaS.
- 2026-04-15: Se agregaron asesores reales por agencia y formularios conectados a esa fuente dinamica.
- 2026-04-15: Se agrego aislamiento basico por agencia para preparar el CRM hacia modo SaaS multiagencia real.
- 2026-04-15: Se conecto la infraestructura base con Supabase.
- 2026-04-15: Se creo el esquema inicial en Supabase con tablas base del CRM.
- 2026-04-15: El modulo de agencias comenzo a leer y guardar contra la base real con respaldo local temporal.
- 2026-04-16: Completado modulo de `advisors` con Supabase y respaldo local. Ahora guarda y carga asesores correctamente.
- 2026-04-15: Migracion del modulo de `leads` hacia Supabase, incluyendo carga, creacion, edicion, movimiento de pipeline e ingesta automatica.
- 2026-04-15: Migracion del flujo `Postventa -> clients -> tasks` hacia Supabase con respaldo local temporal.
- 2026-04-16: Se implemento autenticacion multi-agencia con registro/login de agencias.
- 2026-04-16: Se creo API endpoint con Supabase Edge Function para ingreso automatico de leads desde Facebook/TikTok Ads.
- 2026-04-16: Se configuro despliegue en Vercel con configuracion de Supabase.
- 2026-04-16: Se preparo integracion completa con Facebook Lead Ads via webhooks.
- 2026-04-16: SaaS listo para lanzamiento comercial con leads automaticos y CRM completo.

### Siguiente Paso

- Terminar de validar `advisors` en Supabase para que el equipo de cada agencia ya no dependa de `localStorage`.
- Terminar de validar `leads` en Supabase, incluyendo carga, creacion, edicion e ingesta automatica.
- Terminar de validar `clients`, `tasks` y conversion de `Postventa` para cerrar el flujo comercial principal en base real.
- Mantener fallback local solo mientras validamos cada modulo en base real.

## Regla De Producto

Siempre tomar decisiones con esta prioridad:

1. utilidad real para agentes y agencias
2. simplicidad operativa
3. claridad del flujo comercial
4. base tecnica escalable
5. automatizacion despues de tener el flujo claro

## Regla Tecnica

Siempre trabajar asi:

1. definir bien la entidad
2. definir el flujo
3. crear la UI minima
4. mover logica a servicios
5. usar contratos o repositorios
6. luego conectar infraestructura real

## Proxima Meta Del Proyecto

Dejar el producto listo para demostrar esta historia completa:

- un lead entra
- un asesor lo recibe
- el lead avanza por pipeline
- se convierte en cliente
- se genera seguimiento
- se visualiza la renovacion futura
