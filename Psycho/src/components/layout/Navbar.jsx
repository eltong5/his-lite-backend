import { MessageCircle } from 'lucide-react'
import { Button } from '../ui/button'
import { siteNavigation } from '../../data/siteContent'
import { buildWhatsAppLink } from '../../lib/utils'

export function Navbar() {
  const whatsappLink = buildWhatsAppLink(
    import.meta.env.VITE_WHATSAPP_NUMBER,
    import.meta.env.VITE_WHATSAPP_MESSAGE,
  )

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center justify-between gap-4">
          <a href="#home" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              P
            </span>
            <div>
              <p className="text-sm font-semibold text-text">Psycho</p>
              <p className="text-xs text-muted">Psicologia en Barranquilla</p>
            </div>
          </a>
        </div>

        <nav className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {siteNavigation.map((item) => (
            <a key={item.href} href={item.href} className="text-sm text-muted transition hover:text-text">
              {item.label}
            </a>
          ))}
        </nav>

        <Button size="sm" asChild className="self-start md:self-auto">
          <a href={whatsappLink} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </Button>
      </div>
    </header>
  )
}
