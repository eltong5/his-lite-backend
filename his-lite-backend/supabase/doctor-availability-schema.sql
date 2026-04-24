-- =============================================
-- DOCTOR AVAILABILITY SYSTEM
-- Sincronización de disponibilidad médica
-- =============================================

-- Tabla de disponibilidad de médicos
CREATE TABLE IF NOT EXISTS doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    max_patients_per_slot INTEGER DEFAULT 1,
    break_start_time TIME,
    break_end_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, clinic_id, day_of_week, start_time)
);

-- Tabla de excepciones (vacaciones, días no laborables)
CREATE TABLE IF NOT EXISTS doctor_availability_exceptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    exception_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT false, -- false = no disponible, true = disponible especial
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(doctor_id, clinic_id, exception_date)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor ON doctor_availability(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_clinic ON doctor_availability(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_day ON doctor_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_doctor ON doctor_availability_exceptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_availability_exceptions_date ON doctor_availability_exceptions(exception_date);

-- RLS Policies
ALTER TABLE doctor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_availability_exceptions ENABLE ROW LEVEL SECURITY;

-- Políticas para doctor_availability
CREATE POLICY IF NOT EXISTS "Doctor Availability: read own and within clinic" ON doctor_availability
    FOR SELECT
    USING (
        doctor_id = auth.uid() 
        OR 
        clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY IF NOT EXISTS "Doctor Availability: insert own availability" ON doctor_availability
    FOR INSERT
    WITH CHECK (doctor_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Doctor Availability: update own availability" ON doctor_availability
    FOR UPDATE
    WITH CHECK (doctor_id = auth.uid());

-- Políticas para availability_exceptions
CREATE POLICY IF NOT EXISTS "Availability Exceptions: read own and within clinic" ON doctor_availability_exceptions
    FOR SELECT
    USING (
        doctor_id = auth.uid() 
        OR 
        clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY IF NOT EXISTS "Availability Exceptions: insert own exceptions" ON doctor_availability_exceptions
    FOR INSERT
    WITH CHECK (doctor_id = auth.uid());

CREATE POLICY IF NOT EXISTS "Availability Exceptions: update own exceptions" ON doctor_availability_exceptions
    FOR UPDATE
    WITH CHECK (doctor_id = auth.uid());

-- Función para verificar disponibilidad
CREATE OR REPLACE FUNCTION check_doctor_availability(
    p_doctor_id UUID,
    p_appointment_date TIMESTAMP WITH TIME ZONE,
    p_duration_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
    day_of_week INTEGER;
    appointment_time TIME;
    availability_count INTEGER;
    conflicting_appointments INTEGER;
    exception_available BOOLEAN;
BEGIN
    -- Extraer día de la semana y hora
    day_of_week := EXTRACT(DOW FROM p_appointment_date);
    appointment_time := p_appointment_date::TIME;
    
    -- Verificar si hay excepción para esa fecha
    SELECT is_available INTO exception_available
    FROM doctor_availability_exceptions
    WHERE doctor_id = p_doctor_id 
      AND exception_date = p_appointment_date::DATE;
    
    -- Si hay excepción y no está disponible, retornar false
    IF exception_available = false THEN
        RETURN FALSE;
    END IF;
    
    -- Si hay excepción y está disponible, permitir
    IF exception_available = true THEN
        RETURN TRUE;
    END IF;
    
    -- Verificar disponibilidad regular
    SELECT COUNT(*) INTO availability_count
    FROM doctor_availability
    WHERE doctor_id = p_doctor_id
      AND day_of_week = day_of_week
      AND start_time <= appointment_time
      AND end_time >= (appointment_time + (p_duration_minutes || ' minutes')::INTERVAL)
      AND is_available = true
      AND (break_start_time IS NULL OR break_end_time IS NULL OR 
           NOT (appointment_time >= break_start_time AND 
                (appointment_time + (p_duration_minutes || ' minutes')::INTERVAL) <= break_end_time));
    
    -- Si no hay disponibilidad configurada, retornar false
    IF availability_count = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar citas conflictivas
    SELECT COUNT(*) INTO conflicting_appointments
    FROM appointments
    WHERE doctor_id = p_doctor_id
      AND status NOT IN ('cancelled', 'no_show')
      AND appointment_date < (p_appointment_date + (p_duration_minutes || ' minutes')::INTERVAL)
      AND (appointment_date + (duration_minutes || ' minutes')::INTERVAL) > p_appointment_date;
    
    -- Si hay citas conflictivas, retornar false
    IF conflicting_appointments > 0 THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener slots disponibles
CREATE OR REPLACE FUNCTION get_available_slots(
    p_doctor_id UUID,
    p_date DATE,
    p_slot_duration_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(slot_time TIME, is_available BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    WITH regular_availability AS (
        SELECT start_time, end_time, break_start_time, break_end_time, max_patients_per_slot
        FROM doctor_availability
        WHERE doctor_id = p_doctor_id
          AND day_of_week = EXTRACT(DOW FROM p_date)
          AND is_available = true
    ),
        exception_check AS (
        SELECT COALESCE(is_available, true) as is_available
        FROM doctor_availability_exceptions
        WHERE doctor_id = p_doctor_id
          AND exception_date = p_date
    )
    SELECT 
        generate_series(
            ra.start_time, 
            ra.end_time - (p_slot_duration_minutes || ' minutes')::INTERVAL, 
            (p_slot_duration_minutes || ' minutes')::INTERVAL
        ) as slot_time,
        CASE 
            WHEN ec.is_available = false THEN false
            WHEN ra.break_start_time IS NOT NULL AND ra.break_end_time IS NOT NULL AND
                 generate_series(ra.start_time, ra.end_time - (p_slot_duration_minutes || ' minutes')::INTERVAL, (p_slot_duration_minutes || ' minutes')::INTERVAL) >= ra.break_start_time AND
                 generate_series(ra.start_time, ra.end_time - (p_slot_duration_minutes || ' minutes')::INTERVAL, (p_slot_duration_minutes || ' minutes')::INTERVAL) < ra.break_end_time THEN false
            ELSE check_doctor_availability(p_doctor_id, p_date + generate_series(ra.start_time, ra.end_time - (p_slot_duration_minutes || ' minutes')::INTERVAL, (p_slot_duration_minutes || ' minutes')::INTERVAL), p_slot_duration_minutes)
        END as is_available
    FROM regular_availability ra
    CROSS JOIN exception_check ec;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insertar disponibilidad por defecto para médicos de ejemplo
INSERT INTO doctor_availability (doctor_id, clinic_id, day_of_week, start_time, end_time) VALUES
-- Lunes a Viernes 8am - 5pm (ejemplo)
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 1, '08:00:00', '17:00:00'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 2, '08:00:00', '17:00:00'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 3, '08:00:00', '17:00:00'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 4, '08:00:00', '17:00:00'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 5, '08:00:00', '17:00:00')
ON CONFLICT (doctor_id, clinic_id, day_of_week, start_time) DO NOTHING;
