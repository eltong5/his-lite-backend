import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadRow, pipelineStages } from "@/lib/crm-data";
import { leadStageIds, leadStageLabelsById } from "@/features/leads/leadMetadata";
import { LocalStorageLeadRepository } from "@/features/leads/localStorageLeadRepository";
import { listLeads, moveLeadToStage } from "@/features/leads/leadService";

const leadRepository = new LocalStorageLeadRepository();

const PipelinePage = () => {
  const [leads, setLeads] = useState<LeadRow[]>(() => listLeads(leadRepository));

  const leadsByStage = useMemo(() => {
    return pipelineStages.reduce<Record<string, LeadRow[]>>((accumulator, stage) => {
      accumulator[stage.id] = leads.filter((lead) => leadStageIds[lead.stage] === stage.id);
      return accumulator;
    }, {});
  }, [leads]);

  const moveLead = (lead: LeadRow, direction: "backward" | "forward") => {
    const currentStageIndex = pipelineStages.findIndex((stage) => stage.id === leadStageIds[lead.stage]);
    const nextStageIndex = direction === "forward" ? currentStageIndex + 1 : currentStageIndex - 1;
    const nextStage = pipelineStages[nextStageIndex];

    if (!nextStage) {
      return;
    }

    const nextStageLabel = leadStageLabelsById[nextStage.id];
    setLeads(moveLeadToStage(leadRepository, lead.id, nextStageLabel));
  };

  return (
    <CrmShell
      title="Pipeline de ventas"
      description="El pipeline del CRM ya queda separado por etapas reales del negocio de seguros. Luego conectamos aqui automatizaciones y cambios de estado."
      actionLabel="Leads conectados"
    >
      <section className="grid gap-4 xl:grid-cols-5">
        {pipelineStages.map((stage) => (
          <Card key={stage.id} className="border-0 shadow-card">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">{leadsByStage[stage.id]?.length ?? 0} activos</p>
                  <CardTitle className="mt-1 text-lg">{stage.title}</CardTitle>
                </div>
                <Badge variant="outline">{leadsByStage[stage.id]?.length ?? 0}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {leadsByStage[stage.id]?.length ? (
                leadsByStage[stage.id].map((lead) => {
                  const currentStageIndex = pipelineStages.findIndex((item) => item.id === stage.id);
                  const canMoveBack = currentStageIndex > 0;
                  const canMoveForward = currentStageIndex < pipelineStages.length - 1;

                  return (
                    <div key={lead.id} className="rounded-2xl border border-border/80 bg-background p-4">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{lead.product}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">Proximo paso</p>
                      <p className="mt-1 text-sm text-foreground">{lead.nextStep}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!canMoveBack}
                          onClick={() => moveLead(lead, "backward")}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Retroceder
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!canMoveForward}
                          onClick={() => moveLead(lead, "forward")}
                        >
                          Avanzar
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-2xl border border-dashed border-border/80 bg-background p-4 text-sm text-muted-foreground">
                  No hay leads en esta etapa todavia.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </CrmShell>
  );
};

export default PipelinePage;
