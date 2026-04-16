import { CheckCircle2, Clock3, Mail, MessageSquareMore, Phone, Workflow } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadRow } from "@/lib/crm-data";
import { LocalStorageLeadRepository } from "@/features/leads/localStorageLeadRepository";
import { listLeads, loadLeads } from "@/features/leads/leadService";
import { buildLeadTasks, listStoredTasks } from "@/features/tasks/taskWorkflow";
import { LocalCrmTaskStore } from "@/features/tasks/taskStore";
import { CrmTaskRecord } from "@/features/tasks/taskModel";

const automationRules = [
  "Si entra lead desde landing, asignar asesor en menos de 5 minutos.",
  "Si pasan 2 dias sin respuesta, crear tarea de seguimiento.",
  "Si se cierra una venta, mover a postventa y programar bienvenida.",
];

const leadRepository = new LocalStorageLeadRepository();
const taskStore = new LocalCrmTaskStore();

const channelIcons = {
  WhatsApp: MessageSquareMore,
  Email: Mail,
  Llamada: Phone,
  CRM: Workflow,
};

const TasksPage = () => {
  const [leads] = useState<LeadRow[]>([]);
  const [syncedLeads, setSyncedLeads] = useState<LeadRow[]>([]);
  const [storedTasks, setStoredTasks] = useState<CrmTaskRecord[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setIsLoadingTasks(true);
      try {
        const [nextLeads, nextTasks] = await Promise.all([
          loadLeads(leadRepository),
          listStoredTasks(taskStore),
        ]);
        if (active) {
          setSyncedLeads(nextLeads);
          setStoredTasks(nextTasks);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (active) {
          setIsLoadingTasks(false);
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, []);



  const derivedLeadTasks = useMemo(() => buildLeadTasks(syncedLeads), [syncedLeads]);
  const tasks = useMemo(() => {
    const taskIds = new Set(storedTasks.map((task) => task.id));
    const mergedTasks = [...storedTasks, ...derivedLeadTasks.filter((task) => !taskIds.has(task.id))];

    return mergedTasks.sort((a, b) => a.dueAt.localeCompare(b.dueAt));
  }, [derivedLeadTasks, storedTasks]);

  const markTaskAsCompleted = async (taskId: string) => {
    const nextTasks = await taskStore.completeAsync(taskId);
    setStoredTasks(nextTasks);
  };

  const formatTaskWhen = (dueAt: string) =>
    new Date(dueAt).toLocaleString("es-CO", {
      day: "2-digit",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });

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
            {isLoadingTasks ? (
              <div className="rounded-2xl border border-dashed border-border/80 bg-background p-6 text-sm text-muted-foreground">
                Cargando tareas...
              </div>
            ) : tasks.length ? (
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
                        {task.status === "Completada" ? (
                          <Badge variant="secondary">Completada</Badge>
                        ) : task.urgent ? (
                          <Badge variant="destructive">Urgente</Badge>
                        ) : (
                          <Badge variant="outline">Programada</Badge>
                        )}
                        <Badge variant="secondary">{task.stage}</Badge>
                        <Badge variant="outline">{task.entityType === "client" ? "Cliente" : "Lead"}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{task.subjectName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">Asesor: {task.advisor}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <Clock3 className="h-4 w-4" />
                          Hora objetivo: {formatTaskWhen(task.dueAt)}
                        </span>
                        <span className="flex items-center gap-2">
                          <ChannelIcon className="h-4 w-4" />
                          Canal: {task.channel}
                        </span>
                      </div>
                      {task.notes ? <p className="mt-3 text-sm text-muted-foreground">{task.notes}</p> : null}
                      {task.status !== "Completada" ? (
                        <div className="mt-4">
                          <Button type="button" size="sm" variant="outline" onClick={() => void markTaskAsCompleted(task.id)}>
                            Marcar completada
                          </Button>
                        </div>
                      ) : null}
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
