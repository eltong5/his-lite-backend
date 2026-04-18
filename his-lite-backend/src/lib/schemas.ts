import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
  role: z.enum(['admin', 'doctor', 'patient']),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type RegisterFormData = z.infer<typeof registerSchema>

export const patientSchema = z.object({
  document_type: z.string().min(1, 'Tipo de documento requerido'),
  document_number: z.string().min(5, 'Número de documento inválido'),
  first_name: z.string().min(2, 'Nombre requerido'),
  last_name: z.string().min(2, 'Apellido requerido'),
  birth_date: z.string().min(1, 'Fecha de nacimiento requerida'),
  gender: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  blood_type: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  medical_conditions: z.array(z.string()).optional(),
  insurance_provider: z.string().optional(),
  insurance_policy_number: z.string().optional(),
})

export type PatientFormData = z.infer<typeof patientSchema>

export const appointmentSchema = z.object({
  patient_id: z.string().uuid('Paciente requerido'),
  doctor_id: z.string().uuid('Doctor requerido').optional(),
  appointment_date: z.string().min(1, 'Fecha y hora requeridos'),
  duration_minutes: z.number().min(15).max(120).default(30),
  appointment_type: z.string().min(1, 'Tipo de cita requerido'),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

export type AppointmentFormData = z.infer<typeof appointmentSchema>

export const medicalRecordSchema = z.object({
  patient_id: z.string().uuid('Paciente requerido'),
  doctor_id: z.string().uuid('Doctor requerido').optional(),
  appointment_id: z.string().uuid().optional(),
  chief_complaint: z.string().optional(),
  vital_signs: z.object({
    blood_pressure: z.string().optional(),
    heart_rate: z.number().optional(),
    temperature: z.number().optional(),
    weight: z.number().optional(),
    height: z.number().optional(),
    oxygen_saturation: z.number().optional(),
  }).optional(),
  diagnosis_code: z.string().optional(),
  diagnosis_description: z.string().optional(),
  treatment_plan: z.string().optional(),
  follow_up_date: z.string().optional(),
  notes: z.string().optional(),
  is_confidential: z.boolean().default(false),
})

export type MedicalRecordFormData = z.infer<typeof medicalRecordSchema>

export const invoiceSchema = z.object({
  patient_id: z.string().uuid('Paciente requerido'),
  due_date: z.string().min(1, 'Fecha de vencimiento requerida'),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Descripción requerida'),
    quantity: z.number().min(1, 'Cantidad mínima 1'),
    unit_price: z.number().min(0, 'Precio debe ser positivo'),
  })).min(1, 'Al menos un item requerido'),
})

export type InvoiceFormData = z.infer<typeof invoiceSchema>

export const inventorySchema = z.object({
  medication_id: z.string().uuid('Medicamento requerido'),
  quantity: z.number().min(0, 'Cantidad no puede ser negativa'),
  batch_number: z.string().optional(),
  unit_cost: z.number().min(0).optional(),
  expiration_date: z.string().optional(),
  supplier: z.string().optional(),
})

export type InventoryFormData = z.infer<typeof inventorySchema>

export const medicationSchema = z.object({
  name: z.string().min(1, 'Nombre requerido'),
  generic_name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  unit: z.string().min(1, 'Unidad requerida'),
  min_stock_level: z.number().min(0).default(10),
})

export type MedicationFormData = z.infer<typeof medicationSchema>