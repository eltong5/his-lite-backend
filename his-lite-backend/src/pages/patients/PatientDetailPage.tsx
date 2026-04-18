import { useParams } from 'react-router-dom'
import { usePatient } from '@/hooks/usePatients'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Phone, Mail, MapPin, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export const PatientDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { data: patient, isLoading } = usePatient(id || '', user?.clinic_id || '')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!patient) {
    return <div>Paciente no encontrado</div>
  }

  const age = new Date().getFullYear() - new Date(patient.birth_date).getFullYear()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {patient.first_name} {patient.last_name}
          </h1>
          <p className="text-muted-foreground">
            {patient.document_type} {patient.document_number}
          </p>
        </div>
        <Button>Editar Paciente</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fecha de nacimiento</p>
                <p className="font-medium">{format(new Date(patient.birth_date), 'dd/MM/yyyy', { locale: es })} ({age} años)</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Género</p>
                <p className="font-medium capitalize">{patient.gender?.toLowerCase() || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tipo sangre</p>
                <p className="font-medium">{patient.blood_type || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seguro</p>
                <p className="font-medium">{patient.insurance_provider || 'Particular'}</p>
              </div>
            </div>
            <div className="flex gap-4 pt-4">
              {patient.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {patient.phone}
                </div>
              )}
              {patient.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {patient.email}
                </div>
              )}
            </div>
            {patient.address && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                {patient.address}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Medical Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alergias y Condiciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Alergias</p>
              <div className="flex flex-wrap gap-2">
                {patient.allergies && patient.allergies.length > 0 ? (
                  patient.allergies.map((allergy, i) => (
                    <span key={i} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                      {allergy}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin alergias registradas</p>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Condiciones médicas</p>
              <div className="flex flex-wrap gap-2">
                {patient.medical_conditions && patient.medical_conditions.length > 0 ? (
                  patient.medical_conditions.map((condition, i) => (
                    <span key={i} className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">
                      {condition}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Sin condiciones registradas</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto de Emergencia</CardTitle>
          </CardHeader>
          <CardContent>
            {patient.emergency_contact_name ? (
              <div className="space-y-2">
                <p className="font-medium">{patient.emergency_contact_name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {patient.emergency_contact_phone}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Sin contacto de emergencia</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}