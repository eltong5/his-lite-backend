import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Patient, PaginatedResponse, ApiResponse } from '@/types'

interface GetPatientsParams {
  clinicId: string
  page?: number
  pageSize?: number
  search?: string
  isActive?: boolean
}

interface CreatePatientData {
  clinic_id: string
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
}

interface UpdatePatientData extends Partial<CreatePatientData> {
  id: string
}

export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (params: GetPatientsParams) => [...patientKeys.lists(), params] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
}

export const usePatients = (params: GetPatientsParams) => {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: async (): Promise<PaginatedResponse<Patient>> => {
      const { page = 1, pageSize = 10, search, isActive = true } = params
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('clinic_id', params.clinicId)
        .eq('is_active', isActive)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,document_number.ilike.%${search}%`)
      }

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data || [],
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      }
    },
  })
}

export const usePatient = (id: string, clinicId: string) => {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: async (): Promise<Patient> => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .eq('clinic_id', clinicId)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!id && !!clinicId,
  })
}

export const useCreatePatient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePatientData): Promise<Patient> => {
      const { data: patient, error } = await supabase
        .from('patients')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return patient
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}

export const useUpdatePatient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdatePatientData): Promise<Patient> => {
      const { id, ...updateData } = data
      const { data: patient, error } = await supabase
        .from('patients')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return patient
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}

export const useDeletePatient = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('patients')
        .update({ is_active: false })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
    },
  })
}