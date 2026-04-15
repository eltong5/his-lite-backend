import { AgencyPlan } from "@/features/agencies/agencyModel";

export type AdvisorRole = "Admin" | "Asesor";

export type AdvisorRecord = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: AdvisorRole;
  agencyId: string;
  active: boolean;
};

export const defaultAdvisorPlanHint: Record<AgencyPlan, number> = {
  Starter: 4,
  Growth: 12,
  Pro: 30,
};
