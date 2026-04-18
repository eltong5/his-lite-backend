import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const DashboardPage = () => {
  const { user } = useAuth()

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', user?.clinic_id],
    queryFn: async () => {
      if (!user?.clinic_id) return null

      const [patientsCount, appointmentsToday, pendingInvoices, completedToday] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }).eq('clinic_id', user.clinic_id).eq('is_active', true),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('clinic_id', user.clinic_id).gte('appointment_date', new Date().toISOString()).lt('appointment_date', new Date(Date.now() + 86400000).toISOString()),
        supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('clinic_id', user.clinic_id).eq('status', 'pending'),
        supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('clinic_id', user.clinic_id).eq('status', 'completed').gte('appointment_date', new Date().toISOString()).lt('appointment_date', new Date(Date.now() + 86400000).toISOString()),
      ])

      return {
        patients: patientsCount.count || 0,
        todayAppointments: appointmentsToday.count || 0,
        pendingInvoices: pendingInvoices.count || 0,
        completedToday: completedToday.count || 0,
      }
    },
    enabled: !!user?.clinic_id,
  })

  const { data: todayAppointments } = useQuery({
    queryKey: ['today-appointments', user?.clinic_id],
    queryFn: async () => {
      if (!user?.clinic_id) return []

      const { data } = await supabase
        .from('appointments')
        .select('*, patient:patients(first_name, last_name), doctor:profiles(first_name, last_name)')
        .eq('clinic_id', user.clinic_id)
        .gte('appointment_date', new Date().toISOString())
        .lt('appointment_date', new Date(Date.now() + 86400000).toISOString())
        .order('appointment_date', { ascending: true })
        .limit(10)

      return data || []
    },
    enabled: !!user?.clinic_id,
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido, {user?.first_name}. Aquí está el resumen de hoy.
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pacientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.patients || 0}</div>
              <p className="text-xs text-muted-foreground">Pacientes activos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citas Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.todayAppointments || 0}</div>
              <p className="text-xs text-muted-foreground">{stats?.completedToday || 0} completadas</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingInvoices || 0}</div>
              <p className="text-xs text-muted-foreground">Por cobrar</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Completación</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.todayAppointments ? Math.round((stats.completedToday / stats.todayAppointments) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Citas completadas hoy</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Citas de Hoy
            </CardTitle>
            <CardDescription>Lista de citas programadas para el día de hoy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todayAppointments?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay citas programadas para hoy
                </div>
              ) : (
                todayAppointments?.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      {getStatusIcon(appointment.status)}
                      <div>
                        <p className="font-medium">
                          {appointment.patient?.first_name} {appointment.patient?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.doctor ? `Dr. ${appointment.doctor.first_name} ${appointment.doctor.last_name}` : 'Sin asignar'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {format(new Date(appointment.appointment_date), 'HH:mm')}
                      </p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {appointment.appointment_type || appointment.status}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {user?.role === 'admin' && (
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-auto py-4" asChild>
              <a href="/patients?new=true">
                <Users className="mr-2 h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold">Nuevo Paciente</p>
                  <p className="text-xs opacity-80">Registrar paciente</p>
                </div>
              </a>
            </Button>
            <Button className="h-auto py-4" asChild>
              <a href="/appointments?new=true">
                <Calendar className="mr-2 h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold">Nueva Cita</p>
                  <p className="text-xs opacity-80">Programar cita</p>
                </div>
              </a>
            </Button>
            <Button className="h-auto py-4" asChild>
              <a href="/billing?new=true">
                <DollarSign className="mr-2 h-5 w-5" />
                <div className="text-left">
                  <p className="font-semibold">Nueva Factura</p>
                  <p className="text-xs opacity-80">Crear invoice</p>
                </div>
              </a>
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}