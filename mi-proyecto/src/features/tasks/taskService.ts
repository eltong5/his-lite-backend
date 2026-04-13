import { LeadRow } from "@/lib/crm-data";

export type CrmTask = {
  id: string;
  title: string;
  when: string;
  urgent: boolean;
  leadName: string;
  stage: LeadRow["stage"];
  advisor: LeadRow["advisor"];
  channel: "WhatsApp" | "Email" | "Llamada" | "CRM";
};

const getTaskChannel = (lead: LeadRow): CrmTask["channel"] => {
  if (lead.source === "WhatsApp" || lead.phone) {
    return "WhatsApp";
  }

  if (lead.email) {
    return "Email";
  }

  if (lead.source === "Llamada") {
    return "Llamada";
  }

  return "CRM";
};

export const buildLeadTasks = (leads: LeadRow[]): CrmTask[] =>
  [...leads]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 6)
    .map((lead, index) => ({
      id: `task-${lead.id}`,
      title: lead.nextStep,
      when: `${9 + index}:00`,
      urgent: lead.stage === "Cierre" || lead.stage === "Negociacion",
      leadName: lead.name,
      stage: lead.stage,
      advisor: lead.advisor,
      channel: getTaskChannel(lead),
    }));
