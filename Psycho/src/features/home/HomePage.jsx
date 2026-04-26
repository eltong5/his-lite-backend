import { ArrowRight, CalendarClock, HeartPulse, Leaf, MessageCircle, BookOpenText } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { buildWhatsAppLink } from '../../lib/utils'
import { serviceHighlights, roadmapSteps } from '../../data/siteContent'
import { BlogSection } from '../blog/BlogSection'
import { ContactForm } from '../contact/ContactForm'

export function HomePage() {
  const whatsappLink = buildWhatsAppLink(
    import.meta.env.VITE_WHATSAPP_NUMBER,
    import.meta.env.VITE_WHATSAPP_MESSAGE,
  )

  return (
    <>
      <section id="home" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm text-muted">
              <HeartPulse className="h-4 w-4 text-primary" />
              Psicologa Cognitivo-Conductual en Barranquilla
            </div>

            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-text sm:text-5xl">
                Un sitio sereno, claro y listo para convertir visitas en citas.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                Esta base MVP combina una landing enfocada en WhatsApp, un blog alimentado por
                Supabase y un formulario de contacto validado para empezar rapido sin construir un
                panel enorme.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <a href={whatsappLink} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Agendar por WhatsApp
                </a>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#servicios">
                  Ver servicios
                  <ArrowRight className="h-4 w-4" />
                </a>
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                'Meta clara: primeras citas',
                'SEO local para Barranquilla',
                'Base lista para blog y leads',
              ].map((item) => (
                <Card key={item}>
                  <CardContent className="p-4 text-sm text-muted">{item}</CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-[28px] bg-primary/10 blur-3xl" />
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/70 bg-secondary/60">
                <CardTitle>Vista MVP</CardTitle>
                <CardDescription>Una composicion simple para validar el consultorio.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-lg border border-dashed border-border bg-white p-5">
                  <p className="text-sm font-semibold text-text">CTA principal</p>
                  <p className="mt-2 text-sm text-muted">
                    Boton visible, sin ruido, con un camino directo a WhatsApp.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg bg-background p-4">
                    <Leaf className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium text-text">Calma visual</p>
                    <p className="mt-1 text-sm text-muted">Oliva, beige y aire.</p>
                  </div>
                  <div className="rounded-lg bg-background p-4">
                    <BookOpenText className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium text-text">Blog listo</p>
                    <p className="mt-1 text-sm text-muted">Contenido desde Supabase.</p>
                  </div>
                  <div className="rounded-lg bg-background p-4">
                    <CalendarClock className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium text-text">Fase escalable</p>
                    <p className="mt-1 text-sm text-muted">Reserva o agenda futura.</p>
                  </div>
                  <div className="rounded-lg bg-background p-4">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    <p className="mt-3 text-sm font-medium text-text">Contacto rapido</p>
                    <p className="mt-1 text-sm text-muted">Leads directos a la tabla.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="servicios" className="border-y border-border/70 bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Servicios</p>
            <h2 className="mt-2 text-3xl font-semibold text-text">Una estructura pensada para crecer por fases</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {serviceHighlights.map((service) => (
              <Card key={service.title}>
                <CardHeader>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Estrategia MVP</p>
            <h2 className="mt-2 text-3xl font-semibold text-text">Tres semanas para salir con algo util</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {roadmapSteps.map((step) => (
              <Card key={step.title}>
                <CardHeader>
                  <CardTitle>{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted">{step.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <BlogSection />
      <ContactForm />
    </>
  )
}
