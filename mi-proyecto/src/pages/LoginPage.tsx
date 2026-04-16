import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { Shield, ChevronLeft, ChevronRight } from 'lucide-react'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agencyName, setAgencyName] = useState('')
  const [city, setCity] = useState('Bogotá')
  const [country, setCountry] = useState('Colombia')
  const [phone, setPhone] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sidebarExpanded, setSidebarExpanded] = useState(true)

  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()

  if (user) {
    return <Navigate to="/crm" replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, password, agencyName, city, country, phone)
        navigate('/crm')
      } else {
        await signIn(email, password)
        navigate('/crm')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ocurrio un error inesperado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ocean-deep flex">
      <div 
        className={`fixed left-0 top-0 h-full bg-ocean-dark border-r border-ocean-light/20 transition-all duration-300 ease-in-out flex flex-col ${
          sidebarExpanded ? 'w-64' : 'w-16'
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-ocean-light/20">
          {sidebarExpanded && <span className="text-ocean-light font-bold">InsureTech</span>}
          <button
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-2 rounded-lg hover:bg-ocean-light/20 text-ocean-light"
          >
            {sidebarExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>
        {sidebarExpanded && (
          <div className="p-4 text-ocean-light/70 text-sm">
            <p>Gestión de seguros</p>
            <p className="mt-2">para agencias</p>
          </div>
        )}
      </div>

      <div className={`flex-1 flex items-center justify-center p-4 transition-all duration-300 ${
        sidebarExpanded ? 'ml-64' : 'ml-16'
      }`}>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-ocean-light" />
            </div>
            <CardTitle className="text-2xl">InsureTech CRM</CardTitle>
            <CardDescription>
              {isSignUp ? 'Crea tu cuenta de agencia' : 'Ingresa a tu cuenta'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="agency">Nombre de la Agencia</Label>
                    <Input
                      id="agency"
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      required
                      placeholder="Mi Agencia de Seguros"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Bogotá"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Colombia"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono (Opcional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 000 0000"
                    />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@agencia.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <div className="text-sm text-destructive text-center">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Cargando...' : isSignUp ? 'Crear Cuenta' : 'Ingresar'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-ocean-light hover:underline"
              >
                {isSignUp ? '¿Ya tienes cuenta? Ingresa' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage