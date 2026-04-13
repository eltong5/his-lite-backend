import { LeadRow } from "@/lib/crm-data";

export type ClientRecord = {
  id: string;
  name: string;
  policy: string;
  renewal: string;
  status: "Al dia" | "Pendiente" | "Seguimiento";
  owner: LeadRow["advisor"];
  sourceLeadId: string;
};

const buildRenewalDate = (createdAt?: string) => {
  const baseDate = createdAt ? new Date(createdAt) : new Date();
  const renewalDate = new Date(baseDate);
  renewalDate.setMonth(renewalDate.getMonth() + 1);

  return renewalDate.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const buildClientsFromLeads = (leads: LeadRow[]): ClientRecord[] =>
  leads
    .filter((lead) => lead.stage === "Postventa")
    .map((lead) => ({
      id: `client-${lead.id}`,
      name: lead.name,
      policy: lead.product,
      renewal: buildRenewalDate(lead.createdAt),
      status: lead.nextStep ? "Seguimiento" : "Al dia",
      owner: lead.advisor,
      sourceLeadId: lead.id,
    }));

export const buildClientHealth = (clients: ClientRecord[]) => {
  const activeClients = clients.filter((client) => client.status === "Al dia").length;
  const followUpClients = clients.filter((client) => client.status === "Seguimiento").length;

  return {
    activePercentage: clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0,
    criticalRenewals: followUpClients,
  };
};
