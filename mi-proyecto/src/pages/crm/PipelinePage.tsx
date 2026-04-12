import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pipelineStages } from "@/lib/crm-data";

const dealsByStage = {
  nuevo: ["Ana Martinez", "Nicolas Herrera", "Grupo Atenea"],
  cotizacion: ["Maria Lopez", "Seguros Delta", "Casa Viva"],
  negociacion: ["Carlos Ruiz", "Jardin Infantil Sol", "Transportes Q"],
  cierre: ["Constructora Delta", "Mariana Soto"],
  postventa: ["Pedro Gomez", "Claudia Perez", "Lina Botero"],
};

const PipelinePage = () => {
  return (
    <CrmShell
      title="Pipeline de ventas"
      description="El pipeline del CRM ya queda separado por etapas reales del negocio de seguros. Luego conectamos aqui automatizaciones y cambios de estado."
      actionLabel="Mover oportunidad"
    >
      <section className="grid gap-4 xl:grid-cols-5">
        {pipelineStages.map((stage) => (
          <Card key={stage.id} className="border-0 shadow-card">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{stage.count} activos</p>
                  <CardTitle className="mt-1 text-lg">{stage.title}</CardTitle>
                </div>
                <Badge variant="outline">{stage.amount}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {dealsByStage[stage.id as keyof typeof dealsByStage].map((deal) => (
                <div key={deal} className="rounded-2xl border border-border/80 bg-background p-4">
                  <p className="font-medium text-foreground">{deal}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Checklist comercial pendiente</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </CrmShell>
  );
};

export default PipelinePage;
