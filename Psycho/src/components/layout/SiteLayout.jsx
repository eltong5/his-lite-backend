import { Navbar } from './Navbar'
import { Footer } from './Footer'

export function SiteLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
