import { Bell, Building2, LayoutGrid, ListTodo, Menu, Target, Users, X } from "lucide-react";
import { ReactNode, useState } from "react";
import { Link, NavLink } from "react-router-dom";

import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CrmShellProps = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  flowLabel?: string;
  channelsLabel?: string;
  statusLabel?: string;
  children: ReactNode;
};

const navItems = [
  { to: "/crm", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/crm/leads", label: "Leads", icon: Users },
  { to: "/crm/pipeline", label: "Pipeline", icon: Target },
  { to: "/crm/clientes", label: "Clientes", icon: Users },
  { to: "/crm/tareas", label: "Tareas", icon: ListTodo },
  { to: "/crm/agencia", label: "Agencia", icon: Building2 },
];
const agencyStore = new LocalStorageAgencyStore();

export function CrmShell({
  title,
  description,
  actionLabel = "Nuevo registro",
  onAction,
  flowLabel = "Operacion comercial conectada",
  channelsLabel = "CRM, landing y seguimiento",
  statusLabel = "Demo funcional",
  children,
}: CrmShellProps) {
  const [open, setOpen] = useState(false);
  const currentAgency = getCurrentAgency(agencyStore);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_hsl(var(--ocean-surface)),_hsl(var(--background))_45%)]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-72 border-r border-sidebar-border bg-sidebar px-5 py-6 text-sidebar-foreground transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sidebar-foreground/50">{currentAgency.slug}</p>
            <h1 className="mt-2 font-heading text-2xl font-bold">{currentAgency.name}</h1>
          </div>
          <button className="rounded-full p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent lg:hidden" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-medium">Agencia actual</p>
          <p className="mt-2 text-sm text-sidebar-foreground/70">
            {currentAgency.city}, {currentAgency.country}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className="bg-accent text-accent-foreground">Plan {currentAgency.plan}</Badge>
            <Badge variant="outline" className="border-white/15 text-sidebar-foreground">
              {currentAgency.teamSize} asesores
            </Badge>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/65 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-10 rounded-2xl bg-gradient-to-br from-primary/25 to-accent/20 p-4">
          <p className="text-sm font-semibold">Siguiente hito</p>
          <p className="mt-2 text-sm text-sidebar-foreground/75">Consolidar ingreso automatico de leads y preparar cuentas por agencia.</p>
          <Button asChild variant="secondary" className="mt-4 w-full">
            <Link to="/">Ver landing</Link>
          </Button>
        </div>
      </aside>

      {open ? <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setOpen(false)} /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-border/80 bg-background/85 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-border bg-card p-2 lg:hidden" onClick={() => setOpen(true)}>
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm text-muted-foreground">CRM de seguros</p>
                <h2 className="font-heading text-xl font-bold text-foreground">{title}</h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="relative rounded-xl border border-border bg-card p-2.5 shadow-card">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent" />
              </button>
              <Button onClick={onAction}>{actionLabel}</Button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6">
          <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-border bg-card/80 p-6 shadow-card md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.2em] text-primary">Base del producto</p>
              <h3 className="mt-2 font-heading text-3xl font-bold text-foreground">{title}</h3>
              <p className="mt-2 text-muted-foreground">{description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-muted/70 p-4">
                <p className="text-muted-foreground">Flujo</p>
                <p className="mt-1 font-semibold">{flowLabel}</p>
              </div>
              <div className="rounded-2xl bg-muted/70 p-4">
                <p className="text-muted-foreground">Canales</p>
                <p className="mt-1 font-semibold">{channelsLabel}</p>
              </div>
              <div className="rounded-2xl bg-muted/70 p-4 col-span-2 sm:col-span-1">
                <p className="text-muted-foreground">Estado</p>
                <p className="mt-1 font-semibold">{statusLabel}</p>
              </div>
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
