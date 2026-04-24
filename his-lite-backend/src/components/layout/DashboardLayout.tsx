import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Package,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Heart,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'doctor', 'patient'] },
  { name: 'Pacientes', href: '/patients', icon: Users, roles: ['admin', 'doctor'] },
  { name: 'Citas', href: '/appointments', icon: Calendar, roles: ['admin', 'doctor', 'patient'] },
  { name: 'Expedientes', href: '/medical-records', icon: FileText, roles: ['admin', 'doctor', 'patient'] },
  { name: 'Facturación', href: '/billing', icon: CreditCard, roles: ['admin', 'doctor', 'patient'] },
  { name: 'Inventario', href: '/inventory', icon: Package, roles: ['admin'] },
  { name: 'Auditoría', href: '/audit-logs', icon: Shield, roles: ['admin'] },
  { name: 'Configuración', href: '/settings', icon: Settings, roles: ['admin'] },
]

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)} />
        )}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform lg:hidden",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarContent 
            navigation={filteredNavigation} 
            user={user} 
            onSignOut={signOut}
            onClose={() => setSidebarOpen(false)}
          />
        </aside>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent 
          navigation={filteredNavigation} 
          user={user} 
          onSignOut={signOut}
        />
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-8">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-medium">{user?.first_name} {user?.last_name}</span>
              <span className="ml-2 text-muted-foreground capitalize">({user?.role})</span>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

const SideboardContent = ({ navigation, user, onSignOut, onClose }: any) => {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Heart className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">MediApp</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item: any) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={onClose}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}

// Fix typo
const SidebarContent = ({ navigation, user, onSignOut, onClose }: any) => {
  const location = useLocation()

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Heart className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold">MediApp</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item: any) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-gray-700 hover:bg-gray-100"
              )}
              onClick={onClose}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}