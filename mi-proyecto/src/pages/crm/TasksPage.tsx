import { CheckCircle2, Clock3, Mail, MessageSquareMore } from "lucide-react";

import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { todayTasks } from "@/lib/crm-data";

const automationRules = [
  "Si entra lead desde landing, asignar asesor en menos de 5 minutos.",
  "Si pasan 2 dias sin respuesta, crear tarea de seguimiento.",
  "Si se cierra una venta, mover a postventa y programar bienvenida.",
];

const TasksPage = () => {
  return (
    <CrmShell
      title="Tareas y automatizacion"
      description="Aqui dejamos la base del seguimiento operativo. Esta pantalla conecta perfecto con Zapier o cualquier motor de automatizacion cuando demos el siguiente paso."
      actionLabel="Nueva tarea"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Agenda del equipo</p>
            <CardTitle className="mt-1 text-xl">Tareas abiertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todayTasks.map((task) => (
              <div key={task.title} className="flex items-start gap-4 rounded-2xl border border-border/80 bg-background p-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  {task.urgent ? <Clock3 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{task.title}</p>
                    {task.urgent ? <Badge variant="destructive">Urgente</Badge> : <Badge variant="outline">Programada</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Hora objetivo: {task.when}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <p className="text-sm text-muted-foreground">Reglas futuras</p>
              <CardTitle className="mt-1 text-xl">Automatizaciones base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {automationRules.map((rule, index) => (
                <div key={rule} className="rounded-2xl border border-border/80 bg-background p-4">
                  <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Regla {index + 1}</p>
                  <p className="mt-2 text-sm text-foreground">{rule}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <p className="text-sm text-muted-foreground">Canales preparados</p>
              <CardTitle className="mt-1 text-xl">Puntos de integracion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground">
              <div className="flex items-center gap-3 rounded-2xl bg-background p-4">
                <Mail className="h-4 w-4 text-primary" />
                Email de seguimiento y cotizacion
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-background p-4">
                <MessageSquareMore className="h-4 w-4 text-accent" />
                WhatsApp para recordatorios y contacto rapido
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CrmShell>
  );
};

export default TasksPage;
