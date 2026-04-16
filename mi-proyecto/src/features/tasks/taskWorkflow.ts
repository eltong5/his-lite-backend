import { Client } from "@/features/clients/clientModel";
import { CrmTaskRecord, TaskChannel } from "@/features/tasks/taskModel";
import { LocalCrmTaskStore } from "@/features/tasks/taskStore";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { LeadRow } from "@/lib/crm-data";

export const POST_SALE_WELCOME_TITLE = "Programar bienvenida de postventa";

export const postSaleWelcomeTaskId = (clientId: string): string => `task-${clientId}-welcome`;

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

export const listStoredTasks = async (store: LocalCrmTaskStore): Promise<CrmTaskRecord[]> => store.syncFromSupabase();

export const buildLeadTasks = (leads: LeadRow[]): CrmTaskRecord[] =>
  [...leads]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 6)
    .map((lead, index) => ({
      id: `task-${lead.id}`,
      agencyId: lead.agencyId,
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

const hasPostSaleWelcomeTask = (store: LocalCrmTaskStore, client: Client): boolean => {
  const targetId = postSaleWelcomeTaskId(client.id);
  return store
    .list()
    .some(
      (task) =>
        task.id === targetId ||
        (task.clientId === client.id && task.title === POST_SALE_WELCOME_TITLE && task.entityType === "client"),
    );
};

export const ensurePostSaleTask = (store: LocalCrmTaskStore, client: Client): CrmTaskRecord[] => {
  if (hasPostSaleWelcomeTask(store, client)) {
    return store.list();
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 1);
  dueAt.setHours(9, 0, 0, 0);

  return store.create({
    id: postSaleWelcomeTaskId(client.id),
    agencyId: client.agencyId,
    title: POST_SALE_WELCOME_TITLE,
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

export const ensurePostSaleTaskAsync = async (store: LocalCrmTaskStore, client: Client): Promise<CrmTaskRecord[]> => {
  if (isSupabaseConfigured) {
    await store.syncFromSupabase();
  }

  if (hasPostSaleWelcomeTask(store, client)) {
    return store.list();
  }

  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 1);
  dueAt.setHours(9, 0, 0, 0);

  return store.createAsync({
    id: postSaleWelcomeTaskId(client.id),
    agencyId: client.agencyId,
    title: POST_SALE_WELCOME_TITLE,
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
