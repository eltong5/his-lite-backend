import { CheckCircle2, Clock3, Mail, MessageSquareMore, Phone, Workflow } from "lucide-react";
import { useMemo, useState } from "react";

import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadRow } from "@/lib/crm-data";
import { LocalStorageLeadRepository } from "@/features/leads/localStorageLeadRepository";
import { listLeads } from "@/features/leads/leadService";
import { buildLeadTasks } from "@/features/tasks/taskService";

const automationRules = [
  "Si entra lead desde landing, asignar asesor en menos de 5 minutos.",
  "Si pasan 2 dias sin respuesta, crear tarea de seguimiento.",
  "Si se cierra una venta, mover a postventa y programar bienvenida.",
];

const leadRepository = new LocalStorageLeadRepository();

const channelIcons = {
  WhatsApp: MessageSquareMore,
  Email: Mail,
  Llamada: Phone,
  CRM: Workflow,
};

const TasksPage = () => {
  const [leads] = useState<LeadRow[]>(() => listLeads(leadRepository));
  const tasks = useMemo(() => buildLeadTasks(leads), [leads]);

  return (
    <CrmShell
      title="Tareas y automatizacion"
      description="Aqui dejamos la base del seguimiento operativo. Esta pantalla conecta perfecto con Zapier o cualquier motor de automatizacion cuando demos el siguiente paso."
      actionLabel="Nueva tarea"
      flowLabel="Seguimiento desde el lead"
      channelsLabel="WhatsApp, email y CRM"
      statusLabel="Tareas conectadas"
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Agenda del equipo</p>
            <CardTitle className="mt-1 text-xl">Tareas abiertas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tasks.length ? (
              tasks.map((task) => {
                const ChannelIcon = channelIcons[task.channel];

                return (
                  <div key={task.id} className="flex items-start gap-4 rounded-2xl border border-border/80 bg-background p-4">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      {task.urgent ? <Clock3 className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{task.title}</p>
                        {task.urgent ? <Badge variant="destructive">Urgente</Badge> : <Badge variant="outline">Programada</Badge>}
                        <Badge variant="secondary">{task.stage}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{task.leadName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Asesor: {task.advisor}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4" />
                          Hora objetivo: {task.when}
                        </span>
                        <span className="flex items-center gap-2">
                          <ChannelIcon className="h-4 w-4" />
                          Canal: {task.channel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-background p-6 text-sm text-muted-foreground">
                Todavia no hay tareas derivadas de leads. Crea o edita un lead con un proximo paso para verlo aqui.
              </div>
            )}
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
