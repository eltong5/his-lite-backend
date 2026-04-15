import { LeadAdvisor, LeadStage } from "@/lib/crm-data";

export type TaskChannel = "WhatsApp" | "Email" | "Llamada" | "CRM";
export type TaskStatus = "Pendiente" | "Completada";
export type TaskEntityType = "lead" | "client";

export type CrmTaskRecord = {
  id: string;
  title: string;
  dueAt: string;
  urgent: boolean;
  subjectName: string;
  stage: LeadStage;
  advisor: LeadAdvisor;
  channel: TaskChannel;
  status: TaskStatus;
  entityType: TaskEntityType;
  leadId?: string;
  clientId?: string;
  createdAt: string;
  notes?: string;
};
