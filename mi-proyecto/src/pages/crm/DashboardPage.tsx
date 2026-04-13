import { ArrowRight, CircleAlert, Clock3, FileText, TrendingUp, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadRow } from "@/lib/crm-data";
import { LocalStorageLeadRepository } from "@/features/leads/localStorageLeadRepository";
import { listLeads } from "@/features/leads/leadService";
import {
  buildDashboardStats,
  buildPipelineHeadline,
  buildPipelineSummary,
  buildRecentActivity,
  buildTodayTasks,
} from "@/features/dashboard/dashboardService";

const statIcons = [Users, FileText, TrendingUp, CircleAlert];
const leadRepository = new LocalStorageLeadRepository();

const DashboardPage = () => {
  const [leads] = useState<LeadRow[]>(() => listLeads(leadRepository));
  const stats = useMemo(() => buildDashboardStats(leads), [leads]);
  const pipelineSummary = useMemo(() => buildPipelineSummary(leads), [leads]);
  const activityFeed = useMemo(() => buildRecentActivity(leads), [leads]);
  const todayTasks = useMemo(() => buildTodayTasks(leads), [leads]);
  const pipelineHeadline = useMemo(() => buildPipelineHeadline(leads), [leads]);

  return (
    <CrmShell
      title="Dashboard comercial"
      description="Este es el centro del CRM. Desde aqui se entiende la operacion diaria, el estado del pipeline y las tareas mas urgentes del equipo."
      actionLabel="Nuevo lead"
      flowLabel="Vision ejecutiva del embudo"
      channelsLabel="Resumen del CRM en tiempo real"
      statusLabel="Dashboard conectado"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = statIcons[index];

          return (
            <Card key={stat.label} className="border-0 bg-card shadow-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <CardTitle className="mt-2 text-3xl">{stat.value}</CardTitle>
                </div>
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{stat.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="border-0 shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Resumen del pipeline</p>
              <CardTitle className="mt-1 text-xl">{pipelineHeadline}</CardTitle>
            </div>
            <Button variant="outline">Ver tablero</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {pipelineSummary.map((stage, index) => (
              <div key={stage.title} className="rounded-2xl border border-border/80 bg-background p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{stage.title}</p>
                    <p className="text-sm text-muted-foreground">{stage.detail}</p>
                  </div>
                  <Badge variant={index >= 3 ? "secondary" : "default"}>{stage.count}</Badge>
                </div>
                <div className="mt-4 h-2 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${stage.progress}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <p className="text-sm text-muted-foreground">Tareas de hoy</p>
              <CardTitle className="text-xl">Seguimiento inmediato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayTasks.map((task) => (
                <div key={task.title} className="rounded-2xl border border-border/80 bg-background p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{task.title}</p>
                      <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock3 className="h-4 w-4" />
                        {task.when}
                      </p>
                    </div>
                    {task.urgent ? <Badge variant="destructive">Urgente</Badge> : <Badge variant="outline">Normal</Badge>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-card">
            <CardHeader>
              <p className="text-sm text-muted-foreground">Actividad reciente</p>
              <CardTitle className="text-xl">Lo ultimo que paso</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {activityFeed.map((item) => (
                <div key={item.title} className="flex items-start justify-between gap-3 border-b border-border/70 pb-4 last:border-none last:pb-0">
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </CrmShell>
  );
};

export default DashboardPage;
