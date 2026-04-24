import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '@/hooks/usePatients'
import { useAuth } from '@/contexts/AuthContext'
import { patientSchema, type PatientFormData } from '@/lib/schemas'
import { toast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { 
  Search, Plus, Pencil, Trash2, Phone, Mail, MapPin, AlertCircle 
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const PatientsPage = () => {
  const { user: authUser } = useAuth()
  
  // Mock user para previsualización sin auth
  const user = authUser || { id: 'mock-id', clinic_id: 'demo-clinic', role: 'admin' }
  
  const [search, setSearch] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<string | null>(null)

  const { data: patientsData, isLoading } = usePatients({
    clinicId: user?.clinic_id || '',
    page: 1,
    pageSize: 50,
    search,
  })

  const createPatient = useCreatePatient()
  const updatePatient = useUpdatePatient()
  const deletePatient = useDeletePatient()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">Gestiona los pacientes registrados</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </Button>
          </DialogTrigger>
          <PatientForm 
            onSubmit={async (data) => {
              try {
                if (editingPatient) {
                  await updatePatient.mutateAsync({ id: editingPatient, ...data })
                  toast({ title: 'Paciente actualizado', variant: 'default' })
                } else {
                  await createPatient.mutateAsync({ ...data, clinic_id: user?.clinic_id || '' })
                  toast({ title: 'Paciente creado', variant: 'default' })
                }
                setIsOpen(false)
                setEditingPatient(null)
              } catch (error: any) {
                toast({ title: 'Error', description: error.message, variant: 'destructive' })
              }
            }}
            defaultValues={editingPatient ? patientsData?.data.find(p => p.id === editingPatient) : undefined}
          />
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar pacientes..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Documento</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Fecha Nac.</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Seguro</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : patientsData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No hay pacientes registrados
                  </TableCell>
                </TableRow>
              ) : (
                patientsData?.data.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <span className="font-medium">{patient.document_type}</span> {patient.document_number}
                    </TableCell>
                    <TableCell>
                      {patient.first_name} {patient.last_name}
                    </TableCell>
                    <TableCell>
                      {format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{patient.phone || '-'}</TableCell>
                    <TableCell>{patient.email || '-'}</TableCell>
                    <TableCell>{patient.insurance_provider || 'Particular'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingPatient(patient.id)
                            setIsOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={async () => {
                            if (confirm('¿Estás seguro de eliminar este paciente?')) {
                              await deletePatient.mutateAsync(patient.id)
                              toast({ title: 'Paciente eliminado' })
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

const PatientForm = ({ onSubmit, defaultValues }: { onSubmit: (data: PatientFormData) => void, defaultValues?: any }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: defaultValues || {
      document_type: 'DNI',
      allergies: [],
      medical_conditions: [],
    },
  })

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{defaultValues ? 'Editar' : 'Nuevo'} Paciente</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Tipo Documento</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2" {...register('document_type')}>
              <option value="DNI">DNI</option>
              <option value="PASSPORT">Pasaporte</option>
              <option value="CE">Carné Extranjería</option>
            </select>
            {errors.document_type && <p className="text-sm text-destructive">{errors.document_type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Número Documento</Label>
            <Input {...register('document_number')} />
            {errors.document_number && <p className="text-sm text-destructive">{errors.document_number.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input {...register('first_name')} />
            {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Apellido</Label>
            <Input {...register('last_name')} />
            {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Fecha Nacimiento</Label>
            <Input type="date" {...register('birth_date')} />
            {errors.birth_date && <p className="text-sm text-destructive">{errors.birth_date.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Género</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2" {...register('gender')}>
              <option value="">Seleccionar</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="OTHER">Otro</option>
            </select>
            {errors.gender && <p className="text-sm text-destructive">{errors.gender.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Teléfono</Label>
            <Input {...register('phone')} />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2 col-span-2">
            <Label>Dirección</Label>
            <Input {...register('address')} />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Contacto Emergencia</Label>
            <Input {...register('emergency_contact_name')} placeholder="Nombre" />
            {errors.emergency_contact_name && <p className="text-sm text-destructive">{errors.emergency_contact_name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Teléfono Emergencia</Label>
            <Input {...register('emergency_contact_phone')} />
            {errors.emergency_contact_phone && <p className="text-sm text-destructive">{errors.emergency_contact_phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Tipo Sangre</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2" {...register('blood_type')}>
              <option value="">Seleccionar</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
            {errors.blood_type && <p className="text-sm text-destructive">{errors.blood_type.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Seguro</Label>
            <Input {...register('insurance_provider')} placeholder="Nombre aseguradora" />
            {errors.insurance_provider && <p className="text-sm text-destructive">{errors.insurance_provider.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Póliza Seguro</Label>
            <Input {...register('insurance_policy_number')} />
            {errors.insurance_policy_number && <p className="text-sm text-destructive">{errors.insurance_policy_number.message}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </DialogContent>
  )
}