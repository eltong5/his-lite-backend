# 📋 Instrucciones Detalladas - Sistema de Disponibilidad Médica

## 🎯 Objetivo
Implementar el sistema de sincronización de disponibilidad médica para que las citas solo puedan agendarse en horarios disponibles.

---

## 📂 Archivos Necesarios

### 🗄️ **Schema SQL**
- `supabase/doctor-availability-schema.sql` - Contiene todas las tablas y funciones

### 🎨 **Frontend Actualizado**
- `src/pages/appointments/AppointmentsPage.tsx` - Ya tiene validación integrada

---

## 🔧 Paso 1: Ejecutar Schema en Supabase

### 📍 **Acceder a Supabase Dashboard**
1. Ve a: https://supabase.com/dashboard
2. Ingresa con tu cuenta
3. Selecciona tu proyecto: `zmnjurjgtdtwicdbghcu`

### 🗂️ **Navegar a SQL Editor**
1. En el menú lateral izquierdo, haz clic en **"SQL Editor"**
2. Verás una interfaz con un área de texto grande

### 📋 **Copiar y Ejecutar el Schema**
1. Abre el archivo: `supabase/doctor-availability-schema.sql`
2. **Selecciona todo el contenido** (Ctrl+A o Cmd+A)
3. **Copia** (Ctrl+C o Cmd+C)
4. **Pega** en el SQL Editor de Supabase (Ctrl+V o Cmd+V)
5. Haz clic en **"Run"** o **"Execute"**

### ✅ **Verificación de Ejecución**
Deberías ver mensajes como:
```
CREATE TABLE
CREATE INDEX
ALTER TABLE
CREATE POLICY
CREATE FUNCTION
INSERT 0 5
```

---

## 🏗️ ¿Qué se crea?

### 📊 **Tablas Nuevas**
1. **`doctor_availability`** - Horarios regulares de médicos
2. **`doctor_availability_exceptions`** - Vacaciones y días especiales

### 🔧 **Funciones SQL**
1. **`check_doctor_availability()`** - Valida disponibilidad
2. **`get_available_slots()`** - Obtiene slots disponibles

### 📈 **Datos de Ejemplo**
- Se insertan horarios de ejemplo (Lunes a Viernes 8am-5pm)
- Para el médico con ID: `00000000-0000-0000-0000-000000000001`

---

## 🎨 Paso 2: Probar el Sistema

### 🔄 **Reiniciar la Aplicación**
1. Detén el servidor actual (Ctrl+C)
2. Inicia nuevamente: `npm run dev`
3. Recarga la página del navegador (F5)

### 📱 **Probar Agendamiento**

#### **Como Paciente:**
1. Inicia sesión como paciente
2. Ve a `/appointments`
3. Haz clic en **"Agendar Cita"**
4. Selecciona fecha y hora
5. Intenta agendar → **Debería validar disponibilidad**

#### **Como Doctor:**
1. Inicia sesión como doctor
2. Ve a `/appointments`
3. Haz clic en **"Nueva Cita"**
4. Selecciona paciente y fecha/hora
5. Intenta agendar → **Debería validar disponibilidad**

---

## 🔍 Paso 3: Verificar Logs

### 📝 **Console Logs**
Abre las DevTools del navegador (F12) y busca:
```
🚩 [DEBUG] Verificando disponibilidad para doctor: [ID] fecha: [Fecha]
🚩 [DEBUG] Disponibilidad result: [true/false]
```

### ✅ **Resultados Esperados**
- **Si disponible**: `true` y cita se crea
- **Si no disponible**: `false` y mensaje de error

---

## ⚙️ Paso 4: Configurar Horarios Reales

### 📅 **Para Médicos:**
Los médicos necesitan configurar sus horarios reales. Puedes hacerlo directamente en Supabase:

```sql
-- Ejemplo: Configurar horarios para un médico
INSERT INTO doctor_availability (doctor_id, clinic_id, day_of_week, start_time, end_time) VALUES
-- Reemplaza [MEDICO_ID] con el ID real del médico
('[MEDICO_ID]', '[CLINIC_ID]', 1, '08:00:00', '12:00:00'), -- Lunes mañana
('[MEDICO_ID]', '[CLINIC_ID]', 1, '14:00:00', '18:00:00'), -- Lunes tarde
('[MEDICO_ID]', '[CLINIC_ID]', 2, '08:00:00', '12:00:00'), -- Martes mañana
('[MEDICO_ID]', '[CLINIC_ID]', 2, '14:00:00', '18:00:00'); -- Martes tarde
ON CONFLICT (doctor_id, clinic_id, day_of_week, start_time) DO NOTHING;
```

### 🏖️ **Para Vacaciones:**
```sql
-- Ejemplo: Día no disponible
INSERT INTO doctor_availability_exceptions (doctor_id, clinic_id, exception_date, is_available, reason) VALUES
('[MEDICO_ID]', '[CLINIC_ID]', '2026-04-25', false, 'Vacaciones');
ON CONFLICT (doctor_id, clinic_id, exception_date) DO NOTHING;
```

---

## 🚨 Solución de Problemas

### ❌ **Error: "function check_doctor_availability does not exist"**
**Causa:** El schema no se ejecutó completamente
**Solución:** Reejecuta el schema SQL

### ❌ **Error: "relation doctor_availability does not exist"**
**Causa:** Las tablas no se crearon
**Solución:** Verifica que el schema se ejecutó sin errores

### ❌ **Las citas se crean sin validar**
**Causa:** La función RPC no está disponible
**Solución:** Revisa que la función `check_doctor_availability` exista en Supabase

### ❌ **Todos los horarios aparecen como no disponibles**
**Causa:** No hay horarios configurados para el médico
**Solución:** Configura horarios en la tabla `doctor_availability`

---

## 🎯 Paso 5: Verificación Final

### ✅ **Checklist de Funcionalidad:**
- [ ] Schema ejecutado sin errores
- [ ] Funciones RPC disponibles en Supabase
- [ ] Validación funciona en frontend
- [ ] Mensajes de error claros
- [ ] Logs de depuración funcionan
- [ ] Citas solo se crean en horarios disponibles

### 🔄 **Flujo Completo:**
1. **Médico configura** sus horarios → ✅
2. **Paciente intenta agendar** → ✅
3. **Sistema valida disponibilidad** → ✅
4. **Si disponible** → Cita creada → ✅
5. **Si no disponible** → Error claro → ✅

---

## 📞 Soporte

Si encuentras algún problema:
1. **Revisa la consola** del navegador para logs
2. **Verifica el SQL Editor** de Supabase para errores
3. **Confirma que las tablas** existen en Supabase
4. **Reinicia la aplicación** después de cambios

---

**🎉 Una vez completados estos pasos, tu SaaS tendrá un sistema completo de sincronización de disponibilidad médica!**

*Última actualización: 23 de Abril de 2026*
