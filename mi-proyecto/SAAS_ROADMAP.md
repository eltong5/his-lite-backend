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
