# Project Roadmap

## Estado General

- Proyecto: CRM de seguros conectado a landing page
- Fase actual: Leads funcionales sobre base visual del CRM MVP
- Avance general estimado: 30%
- Objetivo actual: consolidar el modulo de leads y preparar una arquitectura limpia para crecer sin acoplarse a una tecnologia especifica de base de datos

## Como medir el avance

Usaremos esta escala en cada fase:

- 0%: no iniciada
- 25%: estructura definida
- 50%: interfaz creada
- 75%: logica funcionando
- 100%: validada y lista para usar

## Fases Del Proyecto

### Fase 1. Diseno del CRM MVP

- Estado: En progreso
- Avance: 70%
- Objetivo: tener la estructura visual y navegable del sistema

Incluye:

- Dashboard principal
- Modulo de leads
- Pipeline de ventas
- Modulo de clientes
- Modulo de tareas y seguimiento

Ya hecho:

- Layout base del CRM
- Rutas internas del CRM
- Pantallas iniciales del MVP
- Datos de ejemplo para simular flujo comercial

Falta:

- Ajustes visuales finos
- Formulario real para crear leads
- Mejorar navegacion entre modulos

### Fase 2. Leads funcionales

- Estado: En progreso
- Avance: 35%
- Objetivo: capturar y gestionar leads de forma real

Incluye:

- Formulario de nuevo lead
- Validaciones
- Guardado de datos
- Lista y detalle de leads

Ya hecho:

- Formulario funcional para crear leads
- Validaciones iniciales
- Guardado local en navegador
- Lista dinamica con busqueda y filtro por etapa

Falta:

- Editar lead
- Ver detalle del lead
- Centralizar el manejo de datos en una capa reutilizable
- Preparar integracion futura con backend

### Fase 3. Pipeline funcional

- Estado: Pendiente
- Avance: 0%
- Objetivo: mover oportunidades entre etapas reales del negocio

Incluye:

- Estados del pipeline
- Cambio de etapa
- Vista tipo tablero
- Resumen por etapa

### Fase 4. Clientes y postventa

- Estado: Pendiente
- Avance: 0%
- Objetivo: dar seguimiento a clientes activos y renovaciones

Incluye:

- Ficha del cliente
- Polizas activas
- Renovaciones
- Seguimiento postventa

### Fase 5. Conexion con landing page

- Estado: Pendiente
- Avance: 0%
- Objetivo: convertir visitas en leads dentro del CRM

Incluye:

- CTA conectados al CRM
- Formularios web
- Envio automatico al modulo de leads
- Asignacion inicial al asesor

### Fase 6. Automatizacion

- Estado: Pendiente
- Avance: 0%
- Objetivo: reducir trabajo manual del equipo comercial

Incluye:

- Recordatorios automaticos
- Seguimiento por correo o WhatsApp
- Reglas por tiempo sin respuesta
- Alertas internas

### Fase 7. SaaS y escalabilidad

- Estado: Pendiente
- Avance: 0%
- Objetivo: preparar el producto para venderlo a multiples clientes

Incluye:

- Roles y permisos
- Multiempresa o subcuentas
- White-label
- Configuracion por cliente

## Estado Actual Del Codigo

Ya existe en la aplicacion:

- Landing page publica
- CRM base en rutas `/crm`
- Modulos:
  - Dashboard
  - Leads
  - Pipeline
  - Clientes
  - Tareas

Ya existe funcionalmente:

- Creacion de leads desde el CRM
- Persistencia local para pruebas del flujo
- Lista de leads con filtros basicos

## Arquitectura Recomendada Por Capas

La vision tecnica del proyecto debe ser desacoplada. La logica del negocio no debe depender directamente de `localStorage`, `MySQL`, `PostgreSQL` u otra tecnologia concreta.

Capas recomendadas:

### 1. Presentacion

Responsabilidad:

- Pantallas
- Formularios
- Tablas
- Navegacion
- Interaccion del usuario

Ejemplos actuales:

- `src/pages`
- `src/components`

Regla:

- Esta capa no debe contener reglas de negocio complejas ni acceso directo a infraestructura futura.

### 2. Aplicacion

Responsabilidad:

- Casos de uso del sistema
- Coordinacion de flujos
- Validaciones de negocio

Ejemplos futuros:

- `createLead`
- `updateLeadStage`
- `listLeads`
- `assignAdvisor`

Regla:

- Esta capa orquesta el comportamiento del CRM, pero no sabe si los datos viven en memoria, API o base de datos.

### 3. Dominio

Responsabilidad:

- Entidades del negocio
- Tipos principales
- Reglas del CRM

Ejemplos:

- `Lead`
- `PipelineStage`
- `Client`
- `Task`

Regla:

- Aqui vive la definicion del negocio. Debe ser estable y reutilizable.

### 4. Infraestructura

Responsabilidad:

- Persistencia
- Integracion con backend
- Conexion con servicios externos

Ejemplos futuros:

- repositorio en `localStorage`
- repositorio via API
- backend con PostgreSQL

Regla:

- Esta capa implementa contratos. Puede cambiar sin obligar a reescribir el negocio.

## Principios Tecnicos A Seguir

- Aplicar bajo acoplamiento desde ahora.
- La UI no debe depender de una base de datos concreta.
- El negocio debe depender de contratos, no de implementaciones.
- Empezar simple y evolucionar sin sobrearquitectura.
- Priorizar `PostgreSQL` cuando llegue el backend real.
- Evitar decisiones pesadas como `Oracle` en etapa MVP salvo necesidad real de negocio.

## Contratos Que Conviene Preparar

Cuando entremos a la siguiente etapa tecnica, la meta sera trabajar con interfaces o contratos como estos:

- `LeadRepository`
- `ClientRepository`
- `TaskRepository`
- `PipelineRepository`

Ejemplo conceptual:

- `createLead`
- `getLeads`
- `getLeadById`
- `updateLead`
- `moveLeadToStage`

Esto permitira que la aplicacion use una implementacion local hoy y una implementacion con backend despues, sin romper el flujo principal.

## Plan De 3 Sprints

### Sprint 1. Leads Operativos

Objetivo:

- cerrar el modulo de leads como base funcional del CRM

Entregables:

- crear lead
- editar lead
- ver detalle del lead
- mejorar validaciones
- centralizar estado y acceso a datos

Resultado esperado:

- el equipo ya puede operar leads de forma consistente dentro del CRM

### Sprint 2. Pipeline Funcional

Objetivo:

- convertir los leads en oportunidades movibles dentro del flujo comercial

Entregables:

- conectar leads con pipeline
- cambiar etapa del lead
- tablero por columnas o estados
- contadores por etapa
- sincronizacion entre pipeline y leads

Resultado esperado:

- el CRM ya refleja el avance comercial real

### Sprint 3. Dashboard Integrado

Objetivo:

- usar datos reales del CRM en la vista ejecutiva del sistema

Entregables:

- metricas dinamicas
- actividad reciente real
- resumen real del pipeline
- tareas relacionadas con leads y clientes

Resultado esperado:

- el producto deja de sentirse como demo y empieza a comportarse como un MVP operativo

## Proximo Paso Recomendado

Terminar la Fase 2: Leads funcionales y preparar la capa de aplicacion

Primer entregable recomendado:

- Editar lead
- Ver detalle del lead
- Separar datos mock de la logica de gestion
- Definir contrato inicial para manejar leads sin acoplar el proyecto a una tecnologia de persistencia

## Regla De Trabajo

Siempre trabajar asi:

1. Disenar
2. Volver funcional
3. Probar
4. Conectar con la landing
5. Automatizar

Regla adicional de arquitectura:

1. UI primero simple y clara
2. Luego caso de uso o servicio
3. Luego contrato o repositorio
4. Luego infraestructura concreta
5. Nunca acoplar la pantalla directamente a la tecnologia final

## Guion De Desarrollo Para Los Proximos Dias

Dia o bloque 1:

- cerrar el modulo de leads
- permitir edicion
- permitir detalle
- revisar campos minimos del formulario

Dia o bloque 2:

- extraer el manejo de leads a una capa reutilizable
- separar datos mock de comportamiento
- preparar estructura para repositorio o servicio

Dia o bloque 3:

- conectar la vista de pipeline con los leads reales
- reflejar cambios de etapa
- revisar contadores por estado

Dia o bloque 4:

- conectar dashboard a datos reales del CRM
- reemplazar indicadores mock principales
- revisar consistencia entre modulos

## Plan De Hoy

Fecha:

- 2026-04-13

Meta del dia:

- dejar el modulo de leads listo para operar mejor y dejar preparada la base tecnica para crecer

Paso a paso de hoy:

1. Revisar el formulario actual de leads
2. Confirmar los campos minimos obligatorios
3. Implementar edicion de lead
4. Implementar vista de detalle del lead
5. Mover la logica de gestion de leads a una capa reutilizable
6. Dejar definido un contrato inicial para repositorio de leads
7. Probar flujo completo: crear, editar, listar y ver detalle

Resultado esperado al cerrar hoy:

- modulo de leads mas completo
- menos logica mezclada en la UI
- base lista para conectar backend despues sin rehacer pantallas

Checklist de cierre:

- [x] formulario revisado
- [x] campos minimos definidos
- [x] edicion funcionando
- [x] detalle funcionando
- [x] capa reutilizable creada
- [x] contrato inicial definido
- [x] flujo validado manualmente

## Bitacora Rapida

- 2026-04-10: Se definio el roadmap del proyecto.
- 2026-04-10: Se construyo la base visual del CRM MVP.
- 2026-04-12: Se implemento el formulario funcional de leads con guardado local y filtros.
- 2026-04-12: Se definio una vision de arquitectura por capas para evitar acoplar el proyecto a una base de datos especifica.
- 2026-04-13: Se completo el flujo de leads con edicion, detalle, validacion y persistencia local.
- 2026-04-13: Se extrajo la logica de leads a una capa reutilizable con contrato inicial de repositorio.
