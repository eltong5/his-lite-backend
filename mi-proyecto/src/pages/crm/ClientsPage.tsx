import { FileText, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadRow } from "@/lib/crm-data";
import { LocalStorageLeadRepository } from "@/features/leads/localStorageLeadRepository";
import { listLeads } from "@/features/leads/leadService";
import { buildClientHealth, buildClientsFromLeads } from "@/features/clients/clientService";

const leadRepository = new LocalStorageLeadRepository();

const ClientsPage = () => {
  const [leads] = useState<LeadRow[]>(() => listLeads(leadRepository));
  const clients = useMemo(() => buildClientsFromLeads(leads), [leads]);
  const clientHealth = useMemo(() => buildClientHealth(clients), [clients]);

  return (
    <CrmShell
      title="Clientes y polizas"
      description="Esta vista organiza la postventa del MVP: clientes activos, renovaciones y responsables. Es la base para soporte y seguimiento posterior."
      actionLabel="Nuevo cliente"
      flowLabel="Conversion de lead a cliente"
      channelsLabel="Postventa y renovaciones"
      statusLabel="Clientes conectados"
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Base activa</p>
            <CardTitle className="mt-1 text-xl">Cartera de clientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clients.length ? (
              clients.map((client) => (
                <div key={client.id} className="grid gap-3 rounded-2xl border border-border/80 bg-background p-4 md:grid-cols-[1fr_1fr_0.8fr_0.8fr] md:items-center">
                  <div>
                    <p className="font-semibold text-foreground">{client.name}</p>
                    <p className="text-sm text-muted-foreground">{client.policy}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Renovacion</p>
                    <p className="mt-1 text-sm text-foreground">{client.renewal}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Estado</p>
                    <Badge className="mt-1" variant={client.status === "Pendiente" ? "destructive" : "secondary"}>
                      {client.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground">Asesor</p>
                    <p className="mt-1 text-sm text-foreground">{client.owner}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 bg-background p-6 text-sm text-muted-foreground">
                Aun no hay clientes reales. Cuando un lead pase a `Postventa`, aparecera aqui como base inicial de clientes.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-0 shadow-card">
            <CardHeader>
              <p className="text-sm text-muted-foreground">Indicadores</p>
              <CardTitle className="mt-1 text-xl">Salud de la cartera</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl bg-background p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  <div>
                    <p className="font-medium text-foreground">{clientHealth.activePercentage}% clientes activos</p>
                    <p className="text-sm text-muted-foreground">Base calculada desde clientes en postventa</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-background p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{clientHealth.criticalRenewals} renovaciones en seguimiento</p>
                    <p className="text-sm text-muted-foreground">Clientes con proximo paso pendiente</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CrmShell>
  );
};

export default ClientsPage;
