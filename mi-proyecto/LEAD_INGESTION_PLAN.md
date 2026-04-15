# Lead Ingestion Plan

## Objetivo

Definir como debe entrar un lead al SaaS sin confundir el formulario publico con el CRM interno.

La regla principal es:

- el prospecto llena pocos datos
- el sistema completa el resto
- el asesor trabaja el lead ya organizado dentro del CRM

## Principio De UX

El formulario publico no debe parecer tecnico ni pesado.

El usuario final no es un operador del CRM.

Es una persona interesada en un seguro, muchas veces desde Facebook, Instagram, TikTok, WhatsApp o una landing page.

Por eso el formulario debe ser:

- corto
- claro
- amigable
- sin terminos tecnicos
- optimizado para conversion

## Formulario Publico Recomendado

Estos son los campos que si debe ver el prospecto:

- nombre
- telefono
- ciudad
- tipo de seguro que le interesa
- mensaje opcional

Campo opcional adicional:

- email

## Campos Que No Debe Ver El Prospecto

Estos campos son internos del sistema y no deben mostrarse en el formulario publico:

- stage
- advisor
- source interno editable
- campaignName manual
- externalLeadId visible
- estado comercial
- numero de poliza
- terminos tecnicos del CRM

## Texto Recomendado Para El Formulario

Titulo sugerido:

- Te ayudamos a encontrar el seguro ideal para ti

Descripcion sugerida:

- Dejanos tus datos y uno de nuestros asesores te contactara pronto

Boton sugerido:

- Quiero que me contacten

## Campos Internos Del Lead En El CRM

Aunque el usuario no los vea, el sistema si debe trabajar con una estructura mas completa:

- id
- name
- phone
- email
- city
- country
- age
- product
- source
- campaignName
- externalLeadId
- advisor
- stage
- nextStep
- notes
- createdAt

## Regla De Enriquecimiento

El sistema debe transformar un formulario simple en un lead comercial util.

Ejemplo:

- el usuario llena `nombre`, `telefono`, `ciudad`, `producto`
- el sistema agrega `source`, `campaignName`, `externalLeadId`, `stage`, `createdAt`
- el asesor recibe el lead listo para trabajar

## Payload Publico Esperado

Ejemplo de payload simple enviado desde formulario o integracion:

```json
{
  "name": "Pepito Perez",
  "phone": "+573001112233",
  "email": "pepito@email.com",
  "city": "Bogota",
  "product": "Seguro de vida",
  "message": "Quiero informacion para mi familia"
}
```

## Lead Interno Transformado

Ejemplo de como el sistema debe guardar ese lead dentro del CRM:

```json
{
  "id": "lead-123",
  "name": "Pepito Perez",
  "phone": "+573001112233",
  "email": "pepito@email.com",
  "city": "Bogota",
  "country": "Colombia",
  "product": "Seguro de vida",
  "notes": "Quiero informacion para mi familia",
  "source": "Facebook Ads",
  "campaignName": "Vida Abril",
  "externalLeadId": "fb-99821",
  "advisor": "Sin asignar",
  "stage": "Nuevo lead",
  "nextStep": "Contactar y calificar",
  "createdAt": "2026-04-15T12:00:00.000Z"
}
```

## Reglas De Negocio Para La Ingesta

Cuando llegue un lead automaticamente:

1. validar nombre y telefono como minimo
2. mapear producto de interes
3. asignar `stage = Nuevo lead`
4. asignar `advisor = Sin asignar` o regla automatica
5. generar `nextStep = Contactar y calificar`
6. guardar `source`
7. guardar `campaignName` si existe
8. guardar `externalLeadId` si existe
9. evitar duplicados por `externalLeadId`

## Fuentes De Entrada Futuras

El sistema debe quedar listo para recibir leads desde:

- landing page propia
- formularios web
- Meta Ads
- TikTok Ads
- Instagram
- WhatsApp
- webhooks
- integraciones futuras

## Siguiente Paso Tecnico

El siguiente desarrollo recomendado es crear una capa `ingestLead` que:

- reciba un payload externo
- haga validacion basica
- transforme el payload al modelo interno `Lead`
- evite duplicados por `externalLeadId`
- cree el lead en el repositorio local

## Criterio De Producto

Siempre recordar esto:

- el formulario publico debe maximizar conversion
- el CRM interno debe maximizar organizacion comercial
- no mezclar experiencia de usuario final con estructura interna del sistema
