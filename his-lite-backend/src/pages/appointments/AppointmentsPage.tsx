import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { appointmentSchema, type AppointmentFormData } from '@/lib/schemas'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Calendar, Plus, Clock, User, ChevronLeft, ChevronRight, Video, Phone, MapPin } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

export const AppointmentsPage = () => {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
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

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', user?.clinic_id, format(selectedDate, 'yyyy-MM-dd'), patientProfile?.id],
    queryFn: async () => {
      if (!user?.clinic_id) return []
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      let query = supabase
        .from('appointments')
        .select('*, patient:patients(first_name, last_name), doctor:profiles(first_name, last_name)')
        .eq('clinic_id', user.clinic_id)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())

      if (isPatient) {
        if (!patientProfile?.id) return []
        query = query.eq('patient_id', patientProfile.id)
      }

      const { data } = await query.order('appointment_date', { ascending: true })
      return data || []
    },
    enabled: !!user?.clinic_id && (!isPatient || !!patientProfile?.id),
  })

  const { data: patients } = useQuery({
    queryKey: ['patients-mini', user?.clinic_id],
    queryFn: async () => {
      const { data } = await supabase.from('patients').select('id, first_name, last_name').eq('clinic_id', user?.clinic_id).eq('is_active', true)
      return data || []
    },
    enabled: !!user?.clinic_id && !isPatient,
  })

  const createAppointment = useMutation({
    mutationFn: async (data: AppointmentFormData & { clinic_id: string }) => {
      const { data: appointment, error } = await supabase.from('appointments').insert(data).select().single()
      if (error) throw error
      return appointment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast({ title: 'Cita creada exitosamente' })
      setIsOpen(false)
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' })
    },
  })

  const checkAvailability = async (doctorId: string, appointmentDate: string): Promise<boolean> => {
    console.log('🚩 [DEBUG] Verificando disponibilidad para doctor:', doctorId, 'fecha:', appointmentDate);
    
    try {
      const { data, error } = await supabase.rpc('check_doctor_availability', {
        p_doctor_id: doctorId,
        p_appointment_date: appointmentDate,
        p_duration_minutes: 30
      });
      
      if (error) {
        console.error('🚩 [DEBUG] Error verificando disponibilidad:', error);
        return false;
      }
      
      console.log('🚩 [DEBUG] Disponibilidad result:', data);
      return data === true;
    } catch (err) {
      console.error('🚩 [DEBUG] Error en checkAvailability:', err);
      return false;
    }
  };

  const handleSubmit = async (data: AppointmentFormData) => {
    const doctorId = user?.role === 'doctor' ? user.id : data.doctor_id;
    const appointmentDate = data.appointment_date;
    
    if (!doctorId || !appointmentDate) {
      toast({ 
        title: 'Error', 
        description: 'Debe seleccionar un médico y una fecha/hora', 
        variant: 'destructive' 
      });
      return;
    }
    
    // Validar disponibilidad antes de crear cita
    const isAvailable = await checkAvailability(doctorId, appointmentDate);
    
    if (!isAvailable) {
      toast({ 
        title: 'Horario no disponible', 
        description: 'El médico no está disponible en este horario. Por favor seleccione otro horario.', 
        variant: 'destructive' 
      });
      return;
    }
    
    createAppointment.mutate({
      ...data,
      clinic_id: user?.clinic_id || '',
      doctor_id: doctorId,
      patient_id: isPatient && patientProfile?.id ? patientProfile.id : data.patient_id,
    })
  }

  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date()), i))

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
      confirmed: 'bg-green-100 text-green-800 border-green-200',
      in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      completed: 'bg-gray-100 text-gray-800 border-gray-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      no_show: 'bg-orange-100 text-orange-800 border-orange-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <Clock className="h-3 w-3" />
      case 'completed': return <User className="h-3 w-3" />
      case 'cancelled': return <ChevronLeft className="h-3 w-3" />
      default: return <Calendar className="h-3 w-3" />
    }
  }

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case 'teleconsulta': return <Video className="h-4 w-4 text-blue-600" />
      case 'consulta_telefonica': return <Phone className="h-4 w-4 text-green-600" />
      case 'domicilio': return <MapPin className="h-4 w-4 text-red-600" />
      default: return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isPatient ? 'Mis Citas' : 'Agenda Médica'}
          </h1>
          <p className="text-muted-foreground">
            {isPatient ? 'Consulta tus próximas citas y horarios' : 'Gestiona las citas médicas'}
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {isPatient ? 'Agendar Cita' : 'Nueva Cita'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isPatient ? 'Agendar mi Cita' : 'Nueva Cita'}</DialogTitle>
              </DialogHeader>
              <AppointmentForm 
                patients={isPatient ? [{ id: patientProfile?.id || '', first_name: 'Mi', last_name: 'Cita' }] : (patients || [])} 
                onSubmit={handleSubmit} 
                isPatient={isPatient}
              />
            </DialogContent>
          </Dialog>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-gray-800">
              {format(selectedDate, 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, -7))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setSelectedDate(addDays(selectedDate, 7))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-7 gap-3">
            {dates.map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`p-3 rounded-xl text-center transition-all transform hover:scale-105 ${
                  isSameDay(date, selectedDate)
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                    : isSameDay(date, new Date())
                    ? 'bg-blue-50 border-2 border-blue-200 text-blue-700'
                    : 'bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                <div className="text-xs font-medium mb-1">
                  {format(date, 'EEE', { locale: es })}
                </div>
                <div className="text-xl font-bold">
                  {format(date, 'd')}
                </div>
                {appointments?.filter(apt => 
                  isSameDay(new Date(apt.appointment_date), date)
                ).length > 0 && (
                  <div className="mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mx-auto"></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="text-xl text-gray-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            Citas del {format(selectedDate, 'd \'de\' MMMM', { locale: es })}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                {!isPatient && <TableHead>Paciente</TableHead>}
                <TableHead>Doctor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isPatient ? 4 : 5} className="text-center py-8">Cargando...</TableCell>
                </TableRow>
              ) : appointments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isPatient ? 4 : 5} className="text-center py-8 text-muted-foreground">
                    No hay citas para este día
                  </TableCell>
                </TableRow>
              ) : (
                appointments?.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">
                      {format(new Date(apt.appointment_date), 'HH:mm')}
                    </TableCell>
                    {!isPatient && (
                      <TableCell>{apt.patient?.first_name} {apt.patient?.last_name}</TableCell>
                    )}
                    <TableCell>{apt.doctor ? `Dr. ${apt.doctor.first_name}` : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getAppointmentTypeIcon(apt.appointment_type)}
                        <span className="capitalize">
                          {apt.appointment_type === 'teleconsulta' && 'Teleconsulta'}
                          {apt.appointment_type === 'consulta_telefonica' && 'Consulta telefónica'}
                          {apt.appointment_type === 'domicilio' && 'A domicilio'}
                          {apt.appointment_type === 'procedimiento' && 'Procedimiento'}
                          {apt.appointment_type === 'seguimiento' && 'Seguimiento'}
                          {!apt.appointment_type && 'Consulta'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(apt.status)} flex items-center gap-1 px-3 py-1.5`
                      }
                      >
                        {getStatusIcon(apt.status)}
                        {apt.status === 'scheduled' && 'Programada'}
                        {apt.status === 'confirmed' && 'Confirmada'}
                        {apt.status === 'in_progress' && 'En curso'}
                        {apt.status === 'completed' && 'Completada'}
                        {apt.status === 'cancelled' && 'Cancelada'}
                        {apt.status === 'no_show' && 'No asistió'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

const AppointmentForm = ({ patients, onSubmit, isPatient }: { patients: any[], onSubmit: (data: AppointmentFormData) => void, isPatient?: boolean }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { duration_minutes: 30 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {!isPatient && (
        <div className="space-y-2">
          <Label>Paciente</Label>
          <Select onValueChange={(value) => register('patient_id').onChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar paciente" />
            </SelectTrigger>
            <SelectContent>
              {patients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.first_name} {p.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.patient_id && <p className="text-sm text-destructive">{errors.patient_id.message}</p>}
        </div>
      )}
      
      {!isPatient && (
        <div className="space-y-2">
          <Label>Doctor</Label>
          <Select onValueChange={(value) => register('doctor_id').onChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={user?.id || ''}>
                Dr. {user?.first_name} {user?.last_name} (Yo)
              </SelectItem>
            </SelectContent>
          </Select>
          {errors.doctor_id && <p className="text-sm text-destructive">{errors.doctor_id.message}</p>}
        </div>
      )}
      <div className="space-y-2">
        <Label>Fecha y Hora</Label>
        <Input 
          type="datetime-local" 
          {...register('appointment_date')} 
          min={new Date().toISOString().slice(0, 16)}
        />
        {errors.appointment_date && <p className="text-sm text-destructive">{errors.appointment_date.message}</p>}
        <p className="text-xs text-muted-foreground">
          Se verificará la disponibilidad del médico antes de confirmar la cita
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duración (min)</Label>
          <Input type="number" {...register('duration_minutes', { valueAsNumber: true })} />
          {errors.duration_minutes && <p className="text-sm text-destructive">{errors.duration_minutes.message}</p>}
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <Select onValueChange={(value) => register('appointment_type').onChange(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="consulta">Consulta</SelectItem>
              <SelectItem value="seguimiento">Seguimiento</SelectItem>
              <SelectItem value="procedimiento">Procedimiento</SelectItem>
              <SelectItem value="teleconsulta">Teleconsulta</SelectItem>
              <SelectItem value="consulta_telefonica">Consulta telefónica</SelectItem>
              <SelectItem value="domicilio">A domicilio</SelectItem>
            </SelectContent>
          </Select>
          {errors.appointment_type && <p className="text-sm text-destructive">{errors.appointment_type.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label>Motivo</Label>
        <Textarea placeholder="Describe el motivo de la cita..." rows={3} {...register('reason')} />
        {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
      </div>
      <Button type="submit" className="w-full">Crear Cita</Button>
    </form>
  )
}