import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { medicalRecordSchema, type MedicalRecordFormData } from '@/lib/schemas'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { FileText, Plus, Stethoscope, Activity, Pill } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const MedicalRecordsPage = () => {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const queryClient = useQueryClient()

  const isPatient = user?.role === 'patient'

  // Si el usuario es paciente, obtenemos su ID de la tabla patients
  const { data: patientProfile } = useQuery({
    queryKey: ['patient-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user?.id)
        .single()
      return data
    },
    enabled: !!user?.id && isPatient,
  })

  const { data: records, isLoading } = useQuery({
    queryKey: ['medical-records', user?.clinic_id, patientProfile?.id],
    queryFn: async () => {
      let query = supabase
        .from('medical_records')
        .select('*, patient:patients(first_name, last_name), doctor:profiles(first_name, last_name)')
        .eq('clinic_id', user?.clinic_id)

      if (isPatient) {
        if (!patientProfile?.id) return []
        query = query.eq('patient_id', patientProfile.id)
      }

      const { data } = await query
        .order('record_date', { ascending: false })
        .limit(50)
      return data || []
    },
    enabled: !!user?.clinic_id && (!isPatient || !!patientProfile?.id),
  })

  const { data: patients } = useQuery({
    queryKey: ['patients-list', user?.clinic_id],
    queryFn: async () => {
      const { data } = await supabase.from('patients').select('id, first_name, last_name').eq('clinic_id', user?.clinic_id).eq('is_active', true)
      return data || []
    },
    enabled: !!user?.clinic_id && !isPatient,
  })

  const createRecord = useMutation({
    mutationFn: async (data: MedicalRecordFormData & { clinic_id: string }) => {
      const { data: record, error } = await supabase.from('medical_records').insert(data).select().single()
      if (error) throw error
      return record
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical-records'] })
      toast({ title: 'Expediente creado' })
      setIsOpen(false)
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const handleSubmit = (data: MedicalRecordFormData) => {
    createRecord.mutate({
      ...data,
      clinic_id: user?.clinic_id || '',
      doctor_id: user?.id,
    })
  }

  const handleViewDetail = (record: any) => {
    setSelectedRecord(record)
    setIsDetailOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPatient ? 'Mis Expedientes Médicos' : 'Expedientes Médicos'}
          </h1>
          <p className="text-muted-foreground">
            {isPatient 
              ? 'Consulta tu historial clínico y planes de tratamiento' 
              : 'Gestiona los registros médicos de los pacientes'}
          </p>
        </div>
        
        {!isPatient && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Nuevo Expediente</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nuevo Expediente Médico</DialogTitle>
              </DialogHeader>
              <MedicalRecordForm patients={patients || []} onSubmit={handleSubmit} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {isPatient ? 'Mis Atenciones' : 'Total Expedientes'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{records?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              {isPatient ? 'Últimos 30 días' : 'Esta Semana'}
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records?.filter(r => new Date(r.record_date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Diagnósticos Activos</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records?.filter(r => r.diagnosis_description).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                {!isPatient && <TableHead>Paciente</TableHead>}
                <TableHead>Doctor</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isPatient ? 5 : 6} className="text-center py-8">Cargando...</TableCell>
                </TableRow>
              ) : records?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isPatient ? 5 : 6} className="text-center py-8 text-muted-foreground">
                    No se encontraron registros médicos
                  </TableCell>
                </TableRow>
              ) : (
                records?.map((record) => (
                  <TableRow key={record.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetail(record)}>
                    <TableCell>{format(new Date(record.record_date), 'dd/MM/yyyy', { locale: es })}</TableCell>
                    {!isPatient && (
                      <TableCell>{record.patient?.first_name} {record.patient?.last_name}</TableCell>
                    )}
                    <TableCell>{record.doctor ? `Dr. ${record.doctor.first_name}` : '-'}</TableCell>
                    <TableCell>{record.chief_complaint || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{record.diagnosis_description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetail(record);
                      }}>
                        Ver Detalle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Detalle */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Expediente Médico</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <p className="font-medium">{format(new Date(selectedRecord.record_date), 'PPP', { locale: es })}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Doctor</Label>
                  <p className="font-medium">
                    {selectedRecord.doctor ? `Dr. ${selectedRecord.doctor.first_name} ${selectedRecord.doctor.last_name}` : 'No asignado'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-primary flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Signos Vitales
                </Label>
                <div className="grid grid-cols-3 gap-4 bg-muted/30 p-3 rounded-lg text-sm">
                  <div>
                    <span className="text-muted-foreground">Presión:</span> {selectedRecord.vital_signs?.blood_pressure || '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">FC:</span> {selectedRecord.vital_signs?.heart_rate ? `${selectedRecord.vital_signs.heart_rate} lpm` : '-'}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Temp:</span> {selectedRecord.vital_signs?.temperature ? `${selectedRecord.vital_signs.temperature} °C` : '-'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-primary">Motivo de Consulta</Label>
                <p className="text-sm bg-muted/20 p-3 rounded-lg">{selectedRecord.chief_complaint || 'No registrado'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-primary">Diagnóstico</Label>
                  <div className="text-sm bg-muted/20 p-3 rounded-lg">
                    <span className="font-bold">{selectedRecord.diagnosis_code || ''}</span>
                    <p>{selectedRecord.diagnosis_description || 'No registrado'}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-primary">Plan de Tratamiento</Label>
                  <p className="text-sm bg-muted/20 p-3 rounded-lg whitespace-pre-wrap">{selectedRecord.treatment_plan || 'No registrado'}</p>
                </div>
              </div>

              {selectedRecord.notes && (
                <div className="space-y-2">
                  <Label className="text-primary">Notas Adicionales</Label>
                  <p className="text-sm bg-muted/20 p-3 rounded-lg italic">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const MedicalRecordForm = ({ patients, onSubmit }: { patients: any[], onSubmit: (data: MedicalRecordFormData) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<MedicalRecordFormData>({
    resolver: zodResolver(medicalRecordSchema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Paciente</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2" {...register('patient_id')}>
          <option value="">Seleccionar paciente</option>
          {patients.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
        </select>
        {errors.patient_id && <p className="text-sm text-destructive">{errors.patient_id.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Motivo de Consulta</Label>
        <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2" rows={2} {...register('chief_complaint')} />
        {errors.chief_complaint && <p className="text-sm text-destructive">{errors.chief_complaint.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Presión Arterial</Label>
          <Input placeholder="120/80" {...register('vital_signs.blood_pressure')} />
          {errors.vital_signs?.blood_pressure && <p className="text-sm text-destructive">{errors.vital_signs.blood_pressure.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>FC (lpm)</Label>
          <Input type="number" placeholder="72" {...register('vital_signs.heart_rate', { valueAsNumber: true })} />
          {errors.vital_signs?.heart_rate && <p className="text-sm text-destructive">{errors.vital_signs.heart_rate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Temp. (°C)</Label>
          <Input type="number" step="0.1" placeholder="36.5" {...register('vital_signs.temperature', { valueAsNumber: true })} />
          {errors.vital_signs?.temperature && <p className="text-sm text-destructive">{errors.vital_signs.temperature.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Diagnóstico (CIE-10)</Label>
          <Input {...register('diagnosis_code')} placeholder="Código" />
          {errors.diagnosis_code && <p className="text-sm text-destructive">{errors.diagnosis_code.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Descripción</Label>
          <Input {...register('diagnosis_description')} placeholder="Descripción del diagnóstico" />
          {errors.diagnosis_description && <p className="text-sm text-destructive">{errors.diagnosis_description.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Plan de Tratamiento</Label>
        <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2" rows={3} {...register('treatment_plan')} />
        {errors.treatment_plan && <p className="text-sm text-destructive">{errors.treatment_plan.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Notas</Label>
        <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2" rows={2} {...register('notes')} />
        {errors.notes && <p className="text-sm text-destructive">{errors.notes.message}</p>}
      </div>

      <Button type="submit" className="w-full">Guardar Expediente</Button>
    </form>
  )
}