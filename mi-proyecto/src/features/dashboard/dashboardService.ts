import { LeadRow, LeadStage } from "@/lib/crm-data";
import { leadStageOptions } from "@/features/leads/leadMetadata";

const stageDescriptions: Record<LeadStage, string> = {
  "Nuevo lead": "Pendientes por calificar",
  Cotizacion: "Con propuesta en curso",
  Negociacion: "Oportunidades activas",
  Cierre: "Listos para decision",
  Postventa: "Seguimiento y renovacion",
};

const formatLeadCount = (count: number) => `${count} lead${count === 1 ? "" : "s"}`;

export const buildDashboardStats = (leads: LeadRow[]) => {
  const quoteCount = leads.filter((lead) => lead.stage === "Cotizacion").length;
  const closingCount = leads.filter((lead) => lead.stage === "Cierre").length;
  const postSaleCount = leads.filter((lead) => lead.stage === "Postventa").length;

  return [
    { label: "Leads activos", value: String(leads.length), detail: "Base comercial actual" },
    { label: "Cotizaciones", value: String(quoteCount), detail: "Leads en propuesta" },
    { label: "Por cerrar", value: String(closingCount), detail: "Oportunidades en cierre" },
    { label: "Postventa", value: String(postSaleCount), detail: "Clientes en seguimiento" },
  ];
};

export const buildPipelineSummary = (leads: LeadRow[]) =>
  leadStageOptions.map((stage) => {
    const count = leads.filter((lead) => lead.stage === stage).length;

    return {
      title: stage,
      count,
      detail: stageDescriptions[stage],
      progress: leads.length > 0 ? Math.max((count / leads.length) * 100, count > 0 ? 18 : 8) : 8,
    };
  });

export const buildRecentActivity = (leads: LeadRow[]) =>
  [...leads]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 4)
    .map((lead) => ({
      title: `${lead.name} entro al CRM`,
      detail: `${lead.product} · ${lead.stage}`,
    }));

export const buildTodayTasks = (leads: LeadRow[]) =>
  leads.slice(0, 4).map((lead, index) => ({
    title: `${lead.nextStep} - ${lead.name}`,
    when: `${10 + index}:00`,
    urgent: lead.stage === "Cierre" || lead.stage === "Negociacion",
  }));

export const buildPipelineHeadline = (leads: LeadRow[]) =>
  leads.length > 0 ? `Pipeline activo con ${formatLeadCount(leads.length)}` : "Aun no hay leads en el pipeline";
