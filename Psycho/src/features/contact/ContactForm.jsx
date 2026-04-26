import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MessageCircle, Send } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { buildWhatsAppLink } from '../../lib/utils'
import { submitLead } from './leadService'

const contactSchema = z.object({
  fullName: z.string().min(2, 'Escribe tu nombre completo'),
  phone: z.string().min(7, 'Escribe un telefono valido'),
  consultationReason: z.string().min(10, 'Cuentanos un poco mas'),
})

export function ContactForm() {
  const [status, setStatus] = useState('idle')

  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      consultationReason: '',
    },
  })

  async function onSubmit(values) {
    setStatus('loading')

    const result = await submitLead({
      full_name: values.fullName,
      phone: values.phone,
      consultation_reason: values.consultationReason,
      preferred_contact: 'whatsapp',
      source: 'website',
      status: 'new',
    })

    if (result.error) {
      setStatus('error')
      return
    }

    form.reset()
    setStatus('success')
  }

  return (
    <section id="contacto" className="border-t border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Card className="mx-auto max-w-3xl">
          <CardHeader>
            <CardTitle>Contacta desde el MVP</CardTitle>
            <CardDescription>
              Este formulario ya queda listo para almacenar leads en Supabase con validacion y
              una experiencia simple para pacientes nuevos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-2">
                <Input placeholder="Nombre completo" {...form.register('fullName')} />
                {form.formState.errors.fullName ? (
                  <p className="text-sm text-red-700">{form.formState.errors.fullName.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Input placeholder="Telefono o WhatsApp" {...form.register('phone')} />
                {form.formState.errors.phone ? (
                  <p className="text-sm text-red-700">{form.formState.errors.phone.message}</p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <Textarea
                  placeholder="Motivo de consulta"
                  {...form.register('consultationReason')}
                />
                {form.formState.errors.consultationReason ? (
                  <p className="text-sm text-red-700">
                    {form.formState.errors.consultationReason.message}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button type="submit" disabled={status === 'loading'}>
                  <Send className="h-4 w-4" />
                  {status === 'loading' ? 'Enviando...' : 'Enviar lead'}
                </Button>
                <Button variant="secondary" asChild>
                  <a
                    href={buildWhatsAppLink(import.meta.env.VITE_WHATSAPP_NUMBER)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Ir a WhatsApp
                  </a>
                </Button>
              </div>

              {status === 'success' ? (
                <p className="text-sm text-primary">Lead enviado correctamente.</p>
              ) : null}
              {status === 'error' ? (
                <p className="text-sm text-red-700">No se pudo guardar el lead. Revisa Supabase.</p>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
