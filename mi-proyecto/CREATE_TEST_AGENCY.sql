-- Crear agencia de prueba directamente en la base de datos
-- Ejecuta estos comandos en el SQL Editor de Supabase

-- 1. Crear la agencia
INSERT INTO public.agencies (id, name, slug, city, country, plan, team_size)
VALUES (
  'agency-test-001',
  'Agencia de Prueba',
  'agencia-prueba',
  'Bogotá',
  'Colombia',
  'Starter',
  1
);

-- 2. Crear asesor administrador
INSERT INTO public.advisors (agency_id, full_name, email, role, active)
VALUES (
  'agency-test-001',
  'Administrador',
  'admin@prueba.com',
  'Admin',
  true
);

-- 3. Crear algunos leads de ejemplo
INSERT INTO public.leads (agency_id, name, product, source, stage, advisor_name, next_step, email, phone, city, country)
VALUES
  ('agency-test-001', 'Juan Pérez', 'Seguro Auto', 'Landing Page', 'Nuevo lead', 'Administrador', 'Llamar para cotizar', 'juan@email.com', '+573001112233', 'Bogotá', 'Colombia'),
  ('agency-test-001', 'María García', 'Seguro Vida', 'WhatsApp', 'Cotizacion', 'Administrador', 'Enviar propuesta', 'maria@email.com', '+573002223344', 'Medellín', 'Colombia'),
  ('agency-test-001', 'Carlos Rodríguez', 'Seguro Hogar', 'Formulario', 'Negociacion', 'Administrador', 'Cerrar venta', 'carlos@email.com', '+573003334455', 'Cali', 'Colombia');

-- 4. Crear tareas de ejemplo
INSERT INTO public.tasks (agency_id, title, due_at, urgent, subject_name, stage, advisor_name, channel, status, entity_type, lead_id)
VALUES
  ('agency-test-001', 'Llamar a Juan Pérez', '2026-04-17T10:00:00Z', true, 'Juan Pérez', 'Nuevo lead', 'Administrador', 'Llamada', 'Pendiente', 'lead', (SELECT id FROM public.leads WHERE name = 'Juan Pérez' LIMIT 1)),
  ('agency-test-001', 'Enviar cotización a María', '2026-04-16T15:00:00Z', false, 'María García', 'Cotizacion', 'Administrador', 'Email', 'Pendiente', 'lead', (SELECT id FROM public.leads WHERE name = 'María García' LIMIT 1));

-- Verificar que se creó correctamente
SELECT 'Agencia creada:' as info, name, city, country FROM public.agencies WHERE id = 'agency-test-001';
SELECT 'Asesores:' as info, full_name, email, role FROM public.advisors WHERE agency_id = 'agency-test-001';
SELECT 'Leads:' as info, name, product, stage FROM public.leads WHERE agency_id = 'agency-test-001';
SELECT 'Tareas:' as info, title, subject_name, status FROM public.tasks WHERE agency_id = 'agency-test-001';