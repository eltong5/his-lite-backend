import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, UserCheck } from "lucide-react";
import { CrmShell } from "@/components/crm/CrmShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { loadClients } from "@/features/clients/clientService";
import { LocalCrmTaskStore } from "@/features/tasks/taskStore";
import { ensureClientAndPostSaleWelcomeAsync } from "@/features/workflows/postSaleFlow";
import { LocalStorageClientRepository } from "@/features/clients/localStorageClientRepository";
import { Client } from "@/features/clients/clientModel";
import { LeadRow, pipelineStages } from "@/lib/crm-data";
import { leadStageIds, leadStageLabelsById } from "@/features/leads/leadMetadata";
import { LocalStorageLeadRepository } from "@/features/leads/localStorageLeadRepository";
import { loadLeads, moveLeadToStageAsync } from "@/features/leads/leadService";

const leadRepository = new LocalStorageLeadRepository();
const clientRepository = new LocalStorageClientRepository();
const taskStore = new LocalCrmTaskStore();

const PipelinePage = () => {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDataAsync = async () => {
      setIsLoadingLeads(true);
      try {
        const [syncedLeads, syncedClients] = await Promise.all([
          loadLeads(leadRepository),
          loadClients(clientRepository),
        ]);
        if (active) {
          setLeads(syncedLeads);
          setClients(syncedClients);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (active) {
          setIsLoadingLeads(false);
        }
      }
    };

    void loadDataAsync();

    return () => {
      active = false;
    };
  }, []);

  const leadsByStage = useMemo(() => {
    return pipelineStages.reduce<Record<string, LeadRow[]>>((accumulator, stage) => {
      accumulator[stage.id] = leads.filter((lead) => leadStageIds[lead.stage] === stage.id);
      return accumulator;
    }, {});
  }, [leads]);

  const moveLead = async (lead: LeadRow, direction: "backward" | "forward") => {
    const currentStageIndex = pipelineStages.findIndex((stage) => stage.id === leadStageIds[lead.stage]);
    const nextStageIndex = direction === "forward" ? currentStageIndex + 1 : currentStageIndex - 1;
    const nextStage = pipelineStages[nextStageIndex];

    if (!nextStage) {
      return;
    }

    const nextStageLabel = leadStageLabelsById[nextStage.id];
    const nextLeads = await moveLeadToStageAsync(leadRepository, lead.id, nextStageLabel);
    const updatedLead = nextLeads.find((item) => item.id === lead.id);

    setLeads(nextLeads);

    if (updatedLead?.stage === "Postventa") {
      await ensureClientAndPostSaleWelcomeAsync(clientRepository, taskStore, updatedLead);
      setClients(await loadClients(clientRepository));
    }
  };

  const convertLeadToClient = async (lead: LeadRow) => {
    await ensureClientAndPostSaleWelcomeAsync(clientRepository, taskStore, lead);
    setClients(await loadClients(clientRepository));
  };

  return (
    <CrmShell
      title="Pipeline de ventas"
      description="El pipeline del CRM ya queda separado por etapas reales del negocio de seguros. Luego conectamos aqui automatizaciones y cambios de estado."
      actionLabel="Leads conectados"
      flowLabel="Movimiento real entre etapas"
      channelsLabel="Leads sincronizados con CRM"
      statusLabel="Pipeline funcional"
    >
      {isLoadingLeads ? (
        <div className="rounded-2xl border border-dashed border-border bg-background px-6 py-10 text-center">
          <p className="font-semibold text-foreground">Cargando pipeline...</p>
        </div>
      ) : (
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
                  const hasClient = clients.some(client => client.sourceLeadId === lead.id);

                  return (
                    <div key={lead.id} className="rounded-2xl border border-border/80 bg-background p-4">
                      <p className="font-medium text-foreground">{lead.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{lead.product}</p>
                      <p className="mt-3 text-xs uppercase tracking-[0.15em] text-muted-foreground">Proximo paso</p>
                      <p className="mt-1 text-sm text-foreground">{lead.nextStep}</p>
                      {stage.id === "post-sale" && !hasClient && (
                        <div className="mt-2">
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => void convertLeadToClient(lead)}
                          >
                            <UserCheck className="h-4 w-4 mr-2" />
                            Convertir a cliente
                          </Button>
                        </div>
                      )}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={!canMoveBack}
                          onClick={() => void moveLead(lead, "backward")}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Retroceder
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={!canMoveForward}
                          onClick={() => void moveLead(lead, "forward")}
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
      )}
    </CrmShell>
  );
};

export default PipelinePage;
