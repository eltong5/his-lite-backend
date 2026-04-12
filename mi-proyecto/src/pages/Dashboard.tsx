import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Shield, Bell, Calendar, ChevronRight, Users, TrendingUp,
  FileText, Phone, BarChart3, Search, Menu, LogOut, Home,
  Target, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const pipelineData = [
  { stage: "Lead Entrante", count: 12, color: "bg-ocean-light" },
  { stage: "Cotización Enviada", count: 8, color: "bg-ocean-bright" },
  { stage: "Underwriting", count: 5, color: "bg-primary" },
  { stage: "Cierre / Emisión", count: 3, color: "bg-accent" },
  { stage: "Renovación", count: 7, color: "bg-secondary" },
];

const todayTasks = [
  { id: 1, text: "Llamar a María López - Renovación Auto", type: "call", urgent: true },
  { id: 2, text: "Enviar cotización a Carlos Ruiz - Vida", type: "doc", urgent: false },
  { id: 3, text: "Seguimiento WhatsApp - Pedro Gómez", type: "msg", urgent: false },
  { id: 4, text: "Cita 3:00 PM - Ana Martínez (Salud)", type: "cal", urgent: true },
  { id: 5, text: "Validar documentación - Empresa XYZ", type: "doc", urgent: false },
];

const recentActivity = [
  { text: "Póliza #4521 emitida - Auto Premium", time: "Hace 2h", icon: CheckCircle2 },
  { text: "Nuevo lead asignado - Facebook Ads", time: "Hace 3h", icon: Users },
  { text: "Renovación pendiente - Póliza #3892", time: "Hace 5h", icon: AlertCircle },
];

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const totalLeads = pipelineData.reduce((a, b) => a + b.count, 0);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-16 flex items-center gap-2 px-6 border-b border-sidebar-border">
          <Shield className="w-6 h-6 text-sidebar-primary" />
          <span className="font-heading font-bold text-sidebar-foreground text-lg">InsureTech</span>
        </div>
        <nav className="p-4 space-y-1">
          {[
            { icon: Home, label: "Dashboard", active: true },
            { icon: Users, label: "Contactos" },
            { icon: TrendingUp, label: "Pipeline" },
            { icon: Calendar, label: "Calendario" },
            { icon: FileText, label: "Pólizas" },
            { icon: Phone, label: "Llamadas" },
            { icon: BarChart3, label: "Reportes" },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                item.active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/50">
              <LogOut className="w-4 h-4 mr-2" />
              Salir
            </Button>
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Buscar contacto, póliza..."
                className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">JD</span>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Welcome */}
          <div>
            <h1 className="font-heading text-2xl font-bold text-foreground">Buenos días, Juan 👋</h1>
            <p className="text-muted-foreground">Tienes {todayTasks.length} tareas pendientes hoy</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Leads activos", value: totalLeads, icon: Users, change: "+12%" },
              { label: "Pólizas del mes", value: 18, icon: FileText, change: "+8%" },
              { label: "Prima total", value: "$45,200", icon: TrendingUp, change: "+15%" },
              { label: "Renovaciones", value: 7, icon: Target, change: "Pendientes" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-accent">{stat.change}</span>
                </div>
                <p className="font-heading text-2xl font-bold text-card-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Today's Tasks */}
            <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-lg font-bold text-card-foreground flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Tareas de hoy
                </h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Ver todas <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="space-y-3">
                {todayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.urgent ? "bg-destructive" : "bg-accent"}`} />
                    <span className="text-sm text-card-foreground flex-1">{task.text}</span>
                    {task.urgent && (
                      <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">Urgente</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pipeline Summary + Activity */}
            <div className="space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-heading text-lg font-bold text-card-foreground mb-4">Pipeline</h2>
                <div className="space-y-3">
                  {pipelineData.map((item) => (
                    <div key={item.stage} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-muted-foreground flex-1">{item.stage}</span>
                      <span className="text-sm font-semibold text-card-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-heading text-lg font-bold text-card-foreground mb-4">Actividad reciente</h2>
                <div className="space-y-4">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <a.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-card-foreground">{a.text}</p>
                        <p className="text-xs text-muted-foreground">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
