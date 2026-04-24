-- =============================================
-- MediApp HIS - Schema Minimal (solo lo esencial)
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

-- Crear función create_user_profile
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

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Crear políticas básicas
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
