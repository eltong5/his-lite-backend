import type { LeadRow } from "@/lib/crm-data";
import { ensureClientFromLeadAsync } from "@/features/clients/clientService";
import type { LocalStorageClientRepository } from "@/features/clients/localStorageClientRepository";
import { LocalCrmTaskStore } from "@/features/tasks/taskStore";
import { ensurePostSaleTaskAsync } from "@/features/tasks/taskWorkflow";

/**
 * Flujo unico MVP (roadmap): lead en Postventa -> cliente persistido + tarea de bienvenida (idempotente).
 * Llamar siempre que el lead quede en etapa Postventa (pipeline, edicion en Leads, etc.).
 */
export async function ensureClientAndPostSaleWelcomeAsync(
  clientRepository: LocalStorageClientRepository,
  taskStore: LocalCrmTaskStore,
  lead: LeadRow,
): Promise<void> {
  if (lead.stage !== "Postventa") {
    return;
  }

  const clients = await ensureClientFromLeadAsync(clientRepository, lead);
  const client = clients.find((c) => c.sourceLeadId === lead.id);
  if (!client) {
    return;
  }

  await ensurePostSaleTaskAsync(taskStore, client);
}
