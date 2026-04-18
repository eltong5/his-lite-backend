import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, DollarSign, TrendingUp, Activity, Clock, CheckCircle, XCircle, Heart, Menu, LogOut } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'

const mockStats = { patients: 1248, todayAppointments: 12, pendingInvoices: 5, completedToday: 8 }

const mockAppointments = [
  { id: '1', patient: { first_name: 'María', last_name: 'González' }, doctor: { first_name: 'Carlos', last_name: 'Pérez' }, appointment_date: new Date().toISOString(), status: 'completed', appointment_type: 'Consulta' },
  { id: '2', patient: { first_name: 'Juan', last_name: 'Rodríguez' }, doctor: { first_name: 'Ana', last_name: 'Martínez' }, appointment_date: new Date(Date.now() + 3600000).toISOString(), status: 'scheduled', appointment_type: 'Seguimiento' },
  { id: '3', patient: { first_name: 'Laura', last_name: 'Sánchez' }, doctor: { first_name: 'Carlos', last_name: 'Pérez' }, appointment_date: new Date(Date.now() + 7200000).toISOString(), status: 'confirmed', appointment_type: 'Especialidad' },
]

export const CRMDemoPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">MediApp</span>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {['Dashboard', 'Pacientes', 'Citas', 'Expedientes', 'Facturación', 'Inventario'].map((item) => (
              <Link key={item} to="/crm" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
                {item}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-8">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">DEMO</span>
          <div className="flex-1" />
          <Link to="/login">
            <Button variant="outline" size="sm"><LogOut className="mr-2 h-4 w-4" /> Login</Button>
          </Link>
        </header>

        {/* Content */}
        <main className="p-4 lg:p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard - Demo CRM</h1>
              <p className="text-muted-foreground">Vista de demostración - Datos mockeados</p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Pacientes</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{mockStats.patients}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Citas Hoy</CardTitle><Calendar className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{mockStats.todayAppointments}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle><DollarSign className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{mockStats.pendingInvoices}</div></CardContent></Card>
              <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Tasa Completación</CardTitle><TrendingUp className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{Math.round((mockStats.completedToday / mockStats.todayAppointments) * 100)}%</div></CardContent></Card>
            </div>

            {/* Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Citas de Hoy</CardTitle>
                <CardDescription>{format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAppointments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(a.status)}
                        <div><p className="font-medium">{a.patient.first_name} {a.patient.last_name}</p><p className="text-sm text-muted-foreground">{a.doctor ? `Dr. ${a.doctor.first_name} ${a.doctor.last_name}` : 'Sin asignar'}</p></div>
                      </div>
                      <div className="text-right"><p className="font-medium">{format(new Date(a.appointment_date), 'HH:mm')}</p><p className="text-sm text-muted-foreground">{a.appointment_type}</p></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-3">
              <Button className="h-auto py-4" variant="outline"><Users className="mr-2 h-5 w-5" /><div className="text-left"><p className="font-semibold">Nuevo Paciente</p></div></Button>
              <Button className="h-auto py-4" variant="outline"><Calendar className="mr-2 h-5 w-5" /><div className="text-left"><p className="font-semibold">Nueva Cita</p></div></Button>
              <Button className="h-auto py-4" variant="outline"><DollarSign className="mr-2 h-5 w-5" /><div className="text-left"><p className="font-semibold">Nueva Factura</p></div></Button>
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-4">
                <p className="text-sm text-blue-800"><strong>Nota:</strong> Esta es una demo en /crm. Datos ficticios. Haz clic en "Login" para el sistema real.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}