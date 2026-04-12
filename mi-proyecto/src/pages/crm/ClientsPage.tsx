import { FileText, ShieldCheck } from "lucide-react";

import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clientRows } from "@/lib/crm-data";

const ClientsPage = () => {
  return (
    <CrmShell
      title="Clientes y polizas"
      description="Esta vista organiza la postventa del MVP: clientes activos, renovaciones y responsables. Es la base para soporte y seguimiento posterior."
      actionLabel="Nuevo cliente"
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <p className="text-sm text-muted-foreground">Base activa</p>
            <CardTitle className="mt-1 text-xl">Cartera de clientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {clientRows.map((client) => (
              <div key={client.name} className="grid gap-3 rounded-2xl border border-border/80 bg-background p-4 md:grid-cols-[1fr_1fr_0.8fr_0.8fr] md:items-center">
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
            ))}
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
                    <p className="font-medium text-foreground">82% clientes activos</p>
                    <p className="text-sm text-muted-foreground">Sin incidencias en el mes</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-background p-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">6 renovaciones criticas</p>
                    <p className="text-sm text-muted-foreground">Requieren contacto en 7 dias</p>
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
