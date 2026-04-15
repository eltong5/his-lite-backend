import { Client } from "@/features/clients/clientModel";
import { CrmTaskRecord, TaskChannel } from "@/features/tasks/taskModel";
import { LocalCrmTaskStore } from "@/features/tasks/taskStore";
import { LeadRow } from "@/lib/crm-data";

const getTaskChannel = (lead: LeadRow): TaskChannel => {
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

export const listStoredTasks = (store: LocalCrmTaskStore): CrmTaskRecord[] => store.list();

export const buildLeadTasks = (leads: LeadRow[]): CrmTaskRecord[] =>
  [...leads]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 6)
    .map((lead, index) => ({
      id: `task-${lead.id}`,
      title: lead.nextStep,
      dueAt: new Date(new Date().setHours(9 + index, 0, 0, 0)).toISOString(),
      urgent: lead.stage === "Cierre" || lead.stage === "Negociacion",
      subjectName: lead.name,
      stage: lead.stage,
      advisor: lead.advisor,
      channel: getTaskChannel(lead),
      status: "Pendiente",
      entityType: "lead",
      leadId: lead.id,
      createdAt: lead.createdAt ?? new Date().toISOString(),
    }));

export const ensurePostSaleTask = (store: LocalCrmTaskStore, client: Client): CrmTaskRecord[] => {
  const existingTask = store.getByClientId(client.id).find((task) => task.title === "Programar bienvenida de postventa");

  if (existingTask) {
    return store.list();
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 1);
  dueAt.setHours(9, 0, 0, 0);

  return store.create({
    id: `task-${client.id}-welcome`,
    title: "Programar bienvenida de postventa",
    dueAt: dueAt.toISOString(),
    urgent: true,
    subjectName: client.fullName,
    stage: "Postventa",
    advisor: client.advisor,
    channel: client.phone ? "WhatsApp" : client.email ? "Email" : "CRM",
    status: "Pendiente",
    entityType: "client",
    clientId: client.id,
    leadId: client.sourceLeadId,
    createdAt: new Date().toISOString(),
    notes: "Contactar al cliente, validar onboarding y dejar seguimiento de renovacion.",
  });
};
