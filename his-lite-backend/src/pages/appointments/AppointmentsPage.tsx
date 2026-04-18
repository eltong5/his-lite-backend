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
import { Calendar, Plus, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, startOfWeek, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'

export const AppointmentsPage = () => {
  const { user: authUser } = useAuth()

  // Mock user para previsualización sin auth
  const user = authUser || { id: 'mock-id', clinic_id: 'demo-clinic', role: 'admin' }

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: appointments } = useQuery({
    queryKey: ['appointments', user?.clinic_id, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      if (!user?.clinic_id) return []
      const startOfDay = new Date(selectedDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(selectedDate)
      endOfDay.setHours(23, 59, 59, 999)

      const { data } = await supabase
        .from('appointments')
        .select('*, patient:patients(first_name, last_name), doctor:profiles(first_name, last_name)')
        .eq('clinic_id', user.clinic_id)
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .order('appointment_date', { ascending: true })

      return data || []
    },
    enabled: !!user?.clinic_id,
  })

  const { data: patients } = useQuery({
    queryKey: ['patients-mini', user?.clinic_id],
    queryFn: async () => {
      const { data } = await supabase.from('patients').select('id, first_name, last_name').eq('clinic_id', user?.clinic_id).eq('is_active', true)
      return data || []
    },
    enabled: !!user?.clinic_id,
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

  const handleSubmit = (data: AppointmentFormData) => {
    createAppointment.mutate({
      ...data,
      clinic_id: user?.clinic_id || '',
      doctor_id: user?.role === 'doctor' ? user.id : undefined,
    })
  }

  const dates = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date()), i))

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda Médica</h1>
          <p className="text-muted-foreground">Gestiona las citas médicas</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Nueva Cita</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva Cita</DialogTitle>
            </DialogHeader>
            <AppointmentForm patients={patients || []} onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{format(selectedDate, 'MMMM yyyy', { locale: es })}</CardTitle>
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
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {dates.map((date) => (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`p-2 rounded-lg text-center transition-colors ${
                  isSameDay(date, selectedDate)
                    ? 'bg-primary text-primary-foreground'
                    : isSameDay(date, new Date())
                    ? 'bg-primary/10'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="text-xs text-muted-foreground">{format(date, 'EEE', { locale: es })}</div>
                <div className="text-lg font-bold">{format(date, 'd')}</div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Citas del {format(selectedDate, 'd MMMM', { locale: es })}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay citas para este día
                  </TableCell>
                </TableRow>
              ) : (
                appointments?.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">
                      {format(new Date(apt.appointment_date), 'HH:mm')}
                    </TableCell>
                    <TableCell>{apt.patient?.first_name} {apt.patient?.last_name}</TableCell>
                    <TableCell>{apt.doctor ? `Dr. ${apt.doctor.first_name}` : '-'}</TableCell>
                    <TableCell>{apt.appointment_type || 'Consulta'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
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

const AppointmentForm = ({ patients, onSubmit }: { patients: any[], onSubmit: (data: AppointmentFormData) => void }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: { duration_minutes: 30 },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Paciente</Label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2" {...register('patient_id')}>
          <option value="">Seleccionar paciente</option>
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
          ))}
        </select>
        {errors.patient_id && <p className="text-sm text-destructive">{errors.patient_id.message}</p>}
      </div>
      <div className="space-y-2">
        <Label>Fecha y Hora</Label>
        <Input type="datetime-local" {...register('appointment_date')} />
        {errors.appointment_date && <p className="text-sm text-destructive">{errors.appointment_date.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Duración (min)</Label>
          <Input type="number" {...register('duration_minutes', { valueAsNumber: true })} />
        </div>
        <div className="space-y-2">
          <Label>Tipo</Label>
          <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2" {...register('appointment_type')}>
            <option value="consulta">Consulta</option>
            <option value="seguimiento">Seguimiento</option>
            <option value="procedimiento">Procedimiento</option>
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Motivo</Label>
        <textarea className="flex w-full rounded-md border border-input bg-background px-3 py-2" rows={2} {...register('reason')} />
      </div>
      <Button type="submit" className="w-full">Crear Cita</Button>
    </form>
  )
}