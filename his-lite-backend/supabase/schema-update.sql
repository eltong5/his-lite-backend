-- =============================================
-- MediApp HIS - Schema Update Script
-- Solo crea elementos que no existen
-- =============================================

-- Crear clínica por defecto si no existe
INSERT INTO clinics (id, name, timezone, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Clínica Principal', 'America/Lima', true)
ON CONFLICT (id) DO NOTHING;

-- Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    specialization VARCHAR(100),
    license_number VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id, clinic_id)
);

-- Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_clinic ON profiles(clinic_id);

-- Crear tabla patients si no existe
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    document_type VARCHAR(20) NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(20),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    emergency_contact_name VARCHAR(200),
    emergency_contact_phone VARCHAR(20),
    blood_type VARCHAR(5),
    allergies TEXT[],
    medical_conditions TEXT[],
    insurance_provider VARCHAR(100),
    insurance_policy_number VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id, document_number)
);

-- Crear tabla appointments si no existe
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    appointment_type VARCHAR(100),
    reason TEXT,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_parent_id UUID REFERENCES appointments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla medical_records si no existe
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    chief_complaint TEXT,
    vital_signs JSONB,
    diagnosis_code VARCHAR(20),
    diagnosis_description TEXT,
    treatment_plan TEXT,
    prescriptions JSONB,
    lab_orders JSONB,
    follow_up_date DATE,
    notes TEXT,
    is_confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla invoices si no existe
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status DEFAULT 'draft',
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_amount DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    payment_method payment_method,
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinic_id, invoice_number)
);

-- Crear tabla invoice_items si no existe
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    service_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla audit_logs si no existe
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    action audit_action NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS (eliminar si existen primero)
DROP POLICY IF EXISTS "Profiles: read own and within clinic" ON profiles;
CREATE POLICY "Profiles: read own and within clinic" ON profiles
    FOR SELECT
    USING (
        id = auth.uid() 
        OR 
        clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS "Profiles: insert own profile" ON profiles;
CREATE POLICY "Profiles: insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Patients: read within clinic" ON patients;
CREATE POLICY "Patients: read within clinic" ON patients
    USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Appointments: read within clinic" ON appointments;
CREATE POLICY "Appointments: read within clinic" ON appointments
    USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Medical Records: read within clinic" ON medical_records;
CREATE POLICY "Medical Records: read within clinic" ON medical_records
    USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Invoices: read within clinic" ON invoices;
CREATE POLICY "Invoices: read within clinic" ON invoices
    USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Audit Logs: admin only" ON audit_logs;
CREATE POLICY "Audit Logs: admin only" ON audit_logs
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND clinic_id = audit_logs.clinic_id
        )
    );

-- Crear función create_user_profile si no existe
CREATE OR REPLACE FUNCTION public.create_user_profile(
    user_id UUID,
    user_first_name VARCHAR(100),
    user_last_name VARCHAR(100),
    user_role user_role,
    user_clinic_id UUID
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO profiles (id, first_name, last_name, role, clinic_id)
    VALUES (user_id, user_first_name, user_last_name, user_role, user_clinic_id)
    ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear función update_updated_at si no existe
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers si no existen
CREATE TRIGGER IF NOT EXISTS update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER IF NOT EXISTS update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
