# 👨‍⚕️ Crear Usuario Médico - Guía Rápida

## 🎯 Objetivo
Crear un usuario con rol "doctor" para acceder a todos los módulos médicos que no ves como paciente.

---

## 📋 ¿Qué módulos faltan para médicos?

Según el roadmap, los médicos deberían tener acceso a:

### ✅ **Módulos Actuales (ya visibles)**
- `/dashboard` - Dashboard con estadísticas
- `/appointments` - Agenda médica (vista limitada como paciente)

### 🔄 **Módulos Específicos para Médicos**
- `/patients` - Gestión de pacientes (CRUD completo)
- `/medical-records` - Expedientes médicos
- `/billing` - Facturación médica
- **Gestión de disponibilidad** - Configurar horarios
- **Configuración de perfil médico**

---

## 👤 Crear Usuario Médico

### 📧 **Opción 1: Registro Normal**
1. Ve a la página de login
2. Haz clic en "Registrarse"
3. Completa el formulario con estos datos:
   - **Email**: `doctor@demo.com`
   - **Password**: `Doctor123!`
   - **Nombre**: `Juan`
   - **Apellido**: `Pérez`
   - **Rol**: `doctor`

### 🔧 **Opción 2: Creación Directa en Supabase**
Si el registro no funciona, créalo directamente:

```sql
-- Crear usuario médico en Supabase Auth
INSERT INTO auth.users (email, email_confirmed_at, phone, phone_confirmed_at, role)
VALUES ('doctor@demo.com', NOW(), NULL, NULL, 'authenticated');

-- Crear perfil médico
INSERT INTO profiles (
    id, 
    user_id, 
    clinic_id, 
    first_name, 
    last_name, 
    role, 
    email,
    created_at
) VALUES (
    uuid_generate_v4(),
    (SELECT id FROM auth.users WHERE email = 'doctor@demo.com'),
    '00000000-0000-0000-0000-000000000001',
    'Juan',
    'Pérez', 
    'doctor',
    'doctor@demo.com',
    NOW()
);
```

---

## 🔍 Verificar Acceso Médico

### 📱 **Después de crear el usuario:**
1. **Cierra sesión** del usuario paciente actual
2. **Inicia sesión** como `doctor@demo.com`
3. **Verifica que puedas acceder a:**
   - Dashboard médico
   - Gestión de pacientes
   - Expedientes médicos
   - Configuración de horarios

### 🎯 **Diferencias clave:**
- **Como Paciente**: Solo ve "Mis Citas"
- **Como Médico**: Ve "Agenda Médica" + pacientes + expedientes

---

## ⚙️ Configurar Horarios Médicos

Una vez como médico, puedes configurar tu disponibilidad:

```sql
-- Configurar horarios para el nuevo médico
INSERT INTO doctor_availability (doctor_id, clinic_id, day_of_week, start_time, end_time) VALUES
-- Reemplaza [MEDICO_ID] con el ID real del médico creado
('[MEDICO_ID]', '00000000-0000-0000-0000-000000000001', 1, '08:00:00', '12:00:00'), -- Lunes mañana
('[MEDICO_ID]', '00000000-0000-0000-0000-000000000001', 1, '14:00:00', '18:00:00'), -- Lunes tarde
('[MEDICO_ID]', '00000000-0000-0000-0000-000000000001', 2, '08:00:00', '12:00:00'), -- Martes mañana
('[MEDICO_ID]', '00000000-0000-0000-0000-000000000001', 2, '14:00:00', '18:00:00'), -- Martes tarde
('[MEDICO_ID]', '00000000-0000-0000-0000-000000000001', 3, '08:00:00', '12:00:00'), -- Miércoles mañana
('[MEDICO_ID]', '00000000-0000-0000-0000-000000000001', 3, '14:00:00', '18:00:00'), -- Miércoles tarde
('[MEDICO_ID]', '00000000-0000-0000-0000-000000000001', 4, '08:00:00', '12:00:00'), -- Jueves mañana
('[MEDICO_ID]', '00000000-0000-0000-0000-000000000001', 4, '14:00:00', '18:00:00'), -- Jueves tarde
('[MEDICO_ID]', '00000000-0000-0000-0000-000000000001', 5, '08:00:00', '12:00:00'), -- Viernes mañana
('[MEDICO_ID]', '00000000-0000-0000-0000-000000000001', 5, '14:00:00', '18:00:00')  -- Viernes tarde
ON CONFLICT (doctor_id, clinic_id, day_of_week, start_time) DO NOTHING;
```

---

## 🚀 Módulos que Verás como Médico

### 📊 **Dashboard Médico**
- Estadísticas de pacientes
- Citas del día
- Ingresos generados

### 👥 **Gestión de Pacientes**
- Crear nuevos pacientes
- Editar información
- Ver historial completo

### 📋 **Expedientes Médicos**
- Historial clínico
- Diagnósticos
- Tratamientos

### 📅 **Agenda Médica**
- Vista completa de todas las citas
- Configurar disponibilidad
- Gestionar horarios

### 💰 **Facturación**
- Crear facturas
- Ver pagos
- Reportes financieros

---

## 🔧 Solución de Problemas

### ❌ **Error: "No puedo registrar usuario médico"**
**Solución**: Usa la opción 2 (SQL directo en Supabase)

### ❌ **Error: "No veo los módulos médicos"**
**Solución**: Verifica que el rol sea 'doctor' en la tabla profiles

### ❌ **Error: "No puedo configurar horarios"**
**Solución**: Ejecuta primero el schema de disponibilidad médica

---

## 🎯 Checklist Final

- [ ] Crear usuario médico (`doctor@demo.com`)
- [ ] Verificar rol 'doctor' en profiles
- [ ] Iniciar sesión como médico
- [ ] Acceder a todos los módulos médicos
- [ ] Configurar horarios de disponibilidad
- [ ] Probar agendamiento con validación

---

**🎉 Una vez creado el usuario médico, tendrás acceso completo a todas las funcionalidades del sistema HIS!**

*Última actualización: 23 de Abril de 2026*
