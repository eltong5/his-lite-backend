export type UserRole = 'admin' | 'doctor' | 'patient'
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled'
export type PaymentMethod = 'cash' | 'card' | 'insurance' | 'transfer'
export type AuditAction = 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'export'

export interface Clinic {
  id: string
  name: string
  tax_id?: string
  phone?: string
  email?: string
  address?: string
  logo_url?: string
  timezone: string
  settings: Record<string, unknown>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  clinic_id: string
  role: UserRole
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  specialization?: string
  license_number?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  clinic_id: string
  user_id?: string
  document_type: string
  document_number: string
  first_name: string
  last_name: string
  birth_date: string
  gender?: string
  phone?: string
  email?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  blood_type?: string
  allergies?: string[]
  medical_conditions?: string[]
  insurance_provider?: string
  insurance_policy_number?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  doctor_id?: string
  appointment_date: string
  duration_minutes: number
  status: AppointmentStatus
  appointment_type?: string
  reason?: string
  notes?: string
  is_recurring: boolean
  recurring_parent_id?: string
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: Profile
}

export interface VitalSigns {
  blood_pressure?: string
  heart_rate?: number
  temperature?: number
  weight?: number
  height?: number
  oxygen_saturation?: number
}

export interface LabOrder {
  id: string
  test_name: string
  test_code?: string
  status: 'pending' | 'collected' | 'processing' | 'completed' | 'cancelled'
  result?: string
  notes?: string
  ordered_at: string
  completed_at?: string
}

export interface MedicalRecord {
  id: string
  clinic_id: string
  patient_id: string
  doctor_id?: string
  appointment_id?: string
  record_date: string
  chief_complaint?: string
  vital_signs?: VitalSigns
  diagnosis_code?: string
  diagnosis_description?: string
  treatment_plan?: string
  prescriptions?: Prescription[]
  lab_orders?: LabOrder[]
  follow_up_date?: string
  notes?: string
  is_confidential: boolean
  created_at: string
  updated_at: string
  patient?: Patient
  doctor?: Profile
}

export interface Invoice {
  id: string
  clinic_id: string
  patient_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  status: InvoiceStatus
  subtotal: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  paid_amount: number
  payment_method?: PaymentMethod
  payment_date?: string
  notes?: string
  created_at: string
  updated_at: string
  patient?: Patient
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total_price: number
  service_code?: string
  created_at: string
}

export interface Medication {
  id: string
  clinic_id: string
  name: string
  generic_name?: string
  description?: string
  category?: string
  unit?: string
  min_stock_level: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  clinic_id: string
  medication_id: string
  batch_number?: string
  quantity: number
  unit_cost?: number
  expiration_date?: string
  supplier?: string
  created_at: string
  updated_at: string
  medication?: Medication
}

export interface Prescription {
  id: string
  clinic_id: string
  medical_record_id: string
  patient_id: string
  doctor_id?: string
  medication_id?: string
  dosage?: string
  frequency?: string
  duration?: string
  instructions?: string
  is_dispended: boolean
  dispensed_at?: string
  created_at: string
  medication?: Medication
}

export interface AuditLog {
  id: string
  clinic_id: string
  user_id?: string
  action: AuditAction
  resource_type: string
  resource_id?: string
  details?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  session_id?: string
  created_at: string
  user?: Profile
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}