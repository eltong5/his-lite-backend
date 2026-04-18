import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { loginSchema, type LoginFormData } from '@/lib/schemas'
import { toast } from '@/hooks/use-toast'
import { Heart, Loader2 } from 'lucide-react'

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  // Redirigir si ya está autenticado
  if (user) {
    navigate(from, { replace: true })
    return null
  }

  const onSubmit = useCallback(async (data: LoginFormData) => {
    console.log('🚩🚩🚩 onSubmit INICIADO')
    setIsLoading(true)
    try {
      const result = await signIn(data.email, data.password)
      console.log('🚩🚩 signIn completado, result:', result)
      
      if (result.error) {
        toast({
          title: 'Error de autenticación',
          description: result.error.message || 'Credenciales inválidas',
          variant: 'destructive',
        })
      }
      // Si no hay error, el useEffect de arriba redirigirá automáticamente
    } catch (err) {
      console.error('Error inesperado:', err)
      toast({
        title: 'Error',
        description: 'Ocurrió un error inesperado',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [signIn, toast])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-2 text-primary">
              <Heart className="h-8 w-8" />
              <span className="text-2xl font-bold">MediApp</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Bienvenido</CardTitle>
          <CardDescription>
            Ingresa tus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar Sesión
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Regístrate aquí
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}