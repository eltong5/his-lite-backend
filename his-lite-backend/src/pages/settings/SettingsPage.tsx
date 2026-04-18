import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Building, Users, Bell, Shield, Palette } from 'lucide-react'

export const SettingsPage = () => {
  const { user: authUser } = useAuth()
  
  const user = authUser || { id: 'mock-id', clinic_id: 'demo-clinic', role: 'admin' }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">Administra la configuración del sistema</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Building className="h-5 w-5" />
            <div>
              <CardTitle>Clínica</CardTitle>
              <CardDescription>Información de la clínica</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nombre de la Clínica</Label>
                <Input defaultValue="MediApp Clínica" />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input defaultValue="+51 123 456 789" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue="contacto@mediapp.com" />
              </div>
              <Button>Guardar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="h-5 w-5" />
            <div>
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>Gestión de usuarios</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total usuarios</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Doctores</span>
                <span className="font-medium">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Admin</span>
                <span className="font-medium">2</span>
              </div>
              <Button variant="outline" className="w-full">Ver Usuarios</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Notificaciones</CardTitle>
              <CardDescription>Configuración de alertas</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email automático</span>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Recordatorios de citas</span>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Stock bajo</span>
                <input type="checkbox" defaultChecked className="h-4 w-4" />
              </div>
              <Button variant="outline" className="w-full">Configurar</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Shield className="h-5 w-5" />
            <div>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Políticas de acceso</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">2FA obligatorio</span>
                <input type="checkbox" className="h-4 w-4" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Sesión (min)</span>
                <Input type="number" defaultValue="30" className="w-20" />
              </div>
              <Button variant="outline" className="w-full">Ver Políticas</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Palette className="h-5 w-5" />
            <div>
              <CardTitle>Apariencia</CardTitle>
              <CardDescription>Tema e idioma</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Idioma</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                  <option>Español</option>
                  <option>English</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Zona Horaria</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2">
                  <option>America/Lima</option>
                  <option>America/Bogota</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}