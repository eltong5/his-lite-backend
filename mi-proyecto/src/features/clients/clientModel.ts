import { LeadAdvisor, LeadRow } from "@/lib/crm-data";

export type ClientStatus = "Al dia" | "Pendiente" | "Seguimiento";

export type Client = {
  id: string;
  fullName: string;
  product: string;
  policyNumber?: string;
  renewalDate: string;
  status: ClientStatus;
  advisor: LeadAdvisor;
  sourceLeadId: string;
  createdAt: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  notes?: string;
};

export const formatClientRenewalDate = (createdAt?: string) => {
  const baseDate = createdAt ? new Date(createdAt) : new Date();
  const renewalDate = new Date(baseDate);
  renewalDate.setMonth(renewalDate.getMonth() + 1);

  return renewalDate.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const buildClientFromLead = (lead: LeadRow): Client => ({
  id: `client-${lead.id}`,
  fullName: lead.name,
  product: lead.product,
  renewalDate: formatClientRenewalDate(lead.createdAt),
  status: lead.nextStep ? "Seguimiento" : "Al dia",
  advisor: lead.advisor,
  sourceLeadId: lead.id,
  createdAt: lead.createdAt ?? new Date().toISOString(),
  email: lead.email,
  phone: lead.phone,
  notes: lead.notes,
});
