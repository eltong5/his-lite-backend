import { MapPin, Phone } from 'lucide-react'

export function Footer() {
  const mapsUrl = import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL

  return (
    <footer className="border-t border-border/70 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <p className="text-lg font-semibold text-text">Psicologa Cognitivo-Conductual en Barranquilla</p>
          <p className="max-w-xl text-sm leading-6 text-muted">
            Un sitio MVP pensado para convertir visitas en conversaciones reales, con blog, WhatsApp y
            una base preparada para crecer sin complicar la operacion.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Atencion por WhatsApp
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Barranquilla, Colombia
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-white shadow-soft">
          {mapsUrl ? (
            <iframe
              title="Mapa de ubicacion"
              src={mapsUrl}
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-64 items-center justify-center px-6 text-center text-sm text-muted">
              Agrega `VITE_GOOGLE_MAPS_EMBED_URL` para mostrar el mapa del consultorio.
            </div>
          )}
        </div>
      </div>
    </footer>
  )
}
