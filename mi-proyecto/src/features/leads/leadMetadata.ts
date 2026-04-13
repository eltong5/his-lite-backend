import { LeadStage } from "@/lib/crm-data";

export const leadStageOptions: LeadStage[] = ["Nuevo lead", "Cotizacion", "Negociacion", "Cierre", "Postventa"];

export const leadStageIds: Record<LeadStage, string> = {
  "Nuevo lead": "nuevo",
  Cotizacion: "cotizacion",
  Negociacion: "negociacion",
  Cierre: "cierre",
  Postventa: "postventa",
};

export const leadStageLabelsById: Record<string, LeadStage> = {
  nuevo: "Nuevo lead",
  cotizacion: "Cotizacion",
  negociacion: "Negociacion",
  cierre: "Cierre",
  postventa: "Postventa",
};
