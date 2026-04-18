-- =============================================
-- MediApp HIS - Database Schema
-- Multi-tenant ready PostgreSQL database
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE user_role AS ENUM ('admin', 'doctor', 'patient');

CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');

CREATE TYPE invoice_status AS ENUM ('draft', 'pending', 'paid', 'overdue', 'cancelled');

CREATE TYPE payment_method AS ENUM ('cash', 'card', 'insurance', 'transfer');

CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'export');

-- =============================================
-- TENANT / CLINIC MANAGEMENT
-- =============================================

CREATE TABLE clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    logo_url TEXT,
    timezone VARCHAR(50) DEFAULT 'America/Lima',
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO clinics (id, name, timezone, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'Clínica Principal', 'America/Lima', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- USERS (extends Supabase Auth)
-- =============================================

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    role user_role NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    specialization VARCHAR(100), -- For doctors
    license_number VARCHAR(50), -- For doctors
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(id, clinic_id)
);

-- Index for role-based queries
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_clinic ON profiles(clinic_id);

-- =============================================
-- PATIENTS
-- =============================================

CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id), -- Link to auth user for patient portal
    document_type VARCHAR(20) NOT NULL, -- DNI, Passport, etc.
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

CREATE INDEX idx_patients_clinic ON patients(clinic_id);
CREATE INDEX idx_patients_document ON patients(document_number);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);

-- =============================================
-- APPOINTMENTS
-- =============================================

CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    status appointment_status DEFAULT 'scheduled',
    appointment_type VARCHAR(100), -- Consultation, Follow-up, Procedure
    reason TEXT,
    notes TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_parent_id UUID REFERENCES appointments(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);

-- =============================================
-- MEDICAL RECORDS
-- =============================================

CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    record_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    chief_complaint TEXT,
    vital_signs JSONB, -- { blood_pressure, heart_rate, temperature, weight, height }
    diagnosis ICD10_CODE VARCHAR(20),
    diagnosis_description TEXT,
    treatment_plan TEXT,
    prescriptions JSONB, -- Array of prescriptions
    lab_orders JSONB,
    follow_up_date DATE,
    notes TEXT,
    is_confidential BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_medical_records_patient ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);

-- =============================================
-- BILLING & INVOICING
-- =============================================

CREATE TABLE invoices (
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

CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    service_code VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(issue_date);

-- =============================================
-- INVENTORY / PHARMACY
-- =============================================

CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    generic_name VARCHAR(255),
    description TEXT,
    category VARCHAR(100),
    unit VARCHAR(50), -- pills, ml, etc.
    min_stock_level INTEGER DEFAULT 10,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
    batch_number VARCHAR(100),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(10, 2),
    expiration_date DATE,
    supplier VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    medical_record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    duration VARCHAR(100),
    instructions TEXT,
    is_dispended BOOLEAN DEFAULT false,
    dispensed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inventory_medication ON inventory(medication_id);
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id);

-- =============================================
-- AUDIT LOGS (HIPAA Compliance)
-- =============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id),
    action audit_action NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- patient, medical_record, invoice, etc.
    resource_id UUID,
    details JSONB, -- { field: "email", old_value: "...", new_value: "..." }
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =============================================
-- CONFIGURATION & SETTINGS
-- =============================================

CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
    general JSONB DEFAULT '{}',
    billing JSONB DEFAULT '{}',
    medical JSONB DEFAULT '{}',
    notifications JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- RLS POLICIES (Row Level Security)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Clinics: Users can only see their clinic
CREATE POLICY "Clinics: users see own clinic" ON clinics
    USING (id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- Profiles: Users can read all profiles in their clinic
CREATE POLICY "Profiles: read within clinic" ON profiles
    USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- Profiles: Users can insert their own profile during registration
CREATE POLICY "Profiles: insert own profile" ON profiles
    FOR INSERT
    WITH CHECK (id = auth.uid());

-- Patients: Only within same clinic
CREATE POLICY "Patients: read within clinic" ON patients
    USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- Appointments: Within clinic
CREATE POLICY "Appointments: read within clinic" ON appointments
    USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- Medical Records: Within clinic
CREATE POLICY "Medical Records: read within clinic" ON medical_records
    USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- Invoices: Within clinic
CREATE POLICY "Invoices: read within clinic" ON invoices
    USING (clinic_id = (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- Audit Logs: Only admins can read
CREATE POLICY "Audit Logs: admin only" ON audit_logs
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND role = 'admin' 
            AND clinic_id = audit_logs.clinic_id
        )
    );

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for all tables with updated_at
CREATE TRIGGER update_clinic_updated_at
    BEFORE UPDATE ON clinics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create audit log function
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    current_clinic_id UUID;
BEGIN
    SELECT clinic_id INTO current_clinic_id 
    FROM profiles 
    WHERE id = auth.uid() 
    LIMIT 1;
    
    INSERT INTO audit_logs (clinic_id, user_id, action, resource_type, resource_id, details)
    VALUES (
        current_clinic_id,
        auth.uid(),
        TG_OP::audit_action,
        TG_TABLE_NAME,
        NEW.id,
        to_json(NEW)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create profile during registration (bypasses RLS for new users)
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