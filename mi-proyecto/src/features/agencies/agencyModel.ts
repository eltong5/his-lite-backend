export type AgencyPlan = "Starter" | "Growth" | "Pro";

export type AgencyRecord = {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  plan: AgencyPlan;
  teamSize: number;
};
