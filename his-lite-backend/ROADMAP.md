# MediApp HIS - Roadmap

## Descripción
Sistema de Información Hospitalaria (HIS) modular y escalable para clínicas y proveedores de salud.

## Tech Stack
- **Frontend**: Vite + React + TypeScript
- **UI**: Tailwind CSS + Shadcn/UI
- **Icons**: Lucide React
- **State**: TanStack Query
- **Validation**: Zod + React Hook Form
- **Backend**: Supabase (Auth, DB, Storage)

---

## Fases de Desarrollo

### ✅ Phase 1 - Foundation (Completado)
- [x] Autenticación con roles (Admin, Doctor, Patient)
- [x] Dashboard con estadísticas
- [x] Módulo Pacientes (CRUD)
- [x] Agenda médica (citas)
- [x] Expedientes médicos
- [x] Facturación UI
- [x] Route protection con RBAC

### 🔄 Phase 2 - Backend Integration (En Progreso)
- [x] Configuración Vite
- [x] Estado global con TanStack Query
- [x] Integración Supabase
- [ ] Validación avanzada de formularios
- [ ] Facturación con PDF, impuestos
- [ ] Mejoras de UI/UX

### 📋 Phase 3 - Módulos Avanzados
- [ ] Farmacia e Inventario
- [ ] Módulo Laboratorio
- [ ] Portal del Paciente (self-service)
- [ ] Notificaciones push
- [ ] Citas online

### 🚨 Phase 4 - Enterprise
- [ ] Audit logs (HIPAA compliance)
- [ ] Analytics y reportes
- [ ] Seguridad avanzada (JWT, encriptación)
- [ ] Testing
- [ ] Multi-tenant (multi-clínica)

---

## Estructura de Carpetas

```
src/
├── components/
│   ├── auth/           # ProtectedRoute
│   ├── layout/         # DashboardLayout
│   └── ui/             # shadcn/ui components
├── contexts/           # AuthContext
├── hooks/              # Custom hooks (usePatients, useToast)
├── lib/
│   ├── schemas.ts      # Zod validations
│   ├── supabase.ts     # Supabase client
│   └── utils.ts
├── pages/
│   ├── auth/           # Login
│   ├── dashboard/      # Dashboard
│   ├── patients/       # Patients CRUD
│   ├── appointments/  # Appointments
│   ├── medical-records/
│   ├── billing/
│   ├── inventory/
│   ├── audit/
│   └── settings/
└── types/              # TypeScript interfaces
```

---

## Base de Datos (Supabase)

### Tablas Principales
- `clinics` - Multi-tenant
- `profiles` - Usuarios extendidos
- `patients` - Pacientes
- `appointments` - Citas
- `medical_records` - Expedientes
- `invoices` - Facturas
- `invoice_items` - Items de factura
- `medications` - Catálogo medicamentos
- `inventory` - Stock
- `prescriptions` - Recetas
- `audit_logs` - Auditoría

### Seguridad
- RLS (Row Level Security) en todas las tablas
- Políticas por clínica
- Auditoría automática

---

## Rutas y Permisos

| Ruta | Admin | Doctor | Patient |
|------|-------|--------|---------|
| /dashboard | ✓ | ✓ | ✓ |
| /patients | ✓ | ✓ | ✗ |
| /appointments | ✓ | ✓ | ✓ |
| /medical-records | ✓ | ✓ | ✗ |
| /billing | ✓ | ✓ | ✗ |
| /inventory | ✓ | ✗ | ✗ |
| /audit-logs | ✓ | ✗ | ✗ |
| /settings | ✓ | ✗ | ✗ |

---

## Componentes Reutilizables

### UI Base (shadcn/ui)
- Button, Input, Label
- Card, Table, Dialog
- Toast, Toaster

### Features
- PatientForm (con Zod validation)
- AppointmentForm
- MedicalRecordForm
- InvoiceForm
- Dashboard widgets
- Data tables con búsqueda

---

## API Patterns

```typescript
// Query hooks
usePatients({ clinicId, page, search })
usePatient(id)

// Mutations
useCreatePatient()
useUpdatePatient()
useDeletePatient()

// Auditoría automática
//Todas las mutaciones crean logs en audit_logs
```

---

## Tareas Pendientes

### Alta Prioridad
1. Validación Zod en todos los formularios
2. Generación PDF para facturas
3. Cálculo de impuestos (IGV 18%)
4. Tests unitarios

### Media Prioridad
1. Portal del paciente
2. Citas online
3. Notificaciones email

### Baja Prioridad
1. Reportes avanzados
2. Dashboard analytics
3. Multi-tenant

---

## Notas

- El sistema usa **Supabase Auth** para autenticación
- Los **roles** se almacenan en la tabla `profiles`
- **RLS** asegura que cada clínica solo vea sus datos
- **Audit logs** registran todas las acciones para HIPAA compliance
- **Multi-tenant** listo: cada clínica tiene su propio `clinic_id`

---

*Última actualización: 2026-04-17*