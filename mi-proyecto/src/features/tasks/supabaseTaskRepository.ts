import { CrmTaskRecord, TaskChannel, TaskEntityType, TaskStatus } from "@/features/tasks/taskModel";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";

type TaskRow = {
  id: string;
  agency_id: string;
  advisor_id: string | null;
  lead_id: string | null;
  client_id: string | null;
  title: string;
  due_at: string;
  urgent: boolean;
  subject_name: string;
  stage: CrmTaskRecord["stage"];
  advisor_name: string;
  channel: TaskChannel;
  status: TaskStatus;
  entity_type: TaskEntityType;
  notes: string | null;
  created_at: string;
};

const mapTaskRow = (row: TaskRow): CrmTaskRecord => ({
  id: row.id,
  agencyId: row.agency_id,
  title: row.title,
  dueAt: row.due_at,
  urgent: row.urgent,
  subjectName: row.subject_name,
  stage: row.stage,
  advisor: row.advisor_name,
  channel: row.channel,
  status: row.status,
  entityType: row.entity_type,
  leadId: row.lead_id ?? undefined,
  clientId: row.client_id ?? undefined,
  notes: row.notes ?? undefined,
  createdAt: row.created_at,
});

const mapTaskRecord = (task: CrmTaskRecord) => ({
  id: task.id,
  agency_id: task.agencyId,
  advisor_id: null,
  lead_id: task.leadId ?? null,
  client_id: task.clientId ?? null,
  title: task.title,
  due_at: task.dueAt,
  urgent: task.urgent,
  subject_name: task.subjectName,
  stage: task.stage,
  advisor_name: task.advisor,
  channel: task.channel,
  status: task.status,
  entity_type: task.entityType,
  notes: task.notes ?? null,
  created_at: task.createdAt,
});

export class SupabaseTaskRepository {
  async listByAgency(agencyId: string): Promise<CrmTaskRecord[]> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("tasks")
      .select(
        "id, agency_id, advisor_id, lead_id, client_id, title, due_at, urgent, subject_name, stage, advisor_name, channel, status, entity_type, notes, created_at",
      )
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => mapTaskRow(row as TaskRow));
  }

  async save(task: CrmTaskRecord): Promise<CrmTaskRecord> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("tasks")
      .upsert(mapTaskRecord(task), { onConflict: "id" })
      .select(
        "id, agency_id, advisor_id, lead_id, client_id, title, due_at, urgent, subject_name, stage, advisor_name, channel, status, entity_type, notes, created_at",
      )
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapTaskRow(data as TaskRow);
  }

  async list(): Promise<CrmTaskRecord[]> {
    const agencyStore = new LocalStorageAgencyStore();
    const agencyId = getCurrentAgency(agencyStore).id;
    return this.listByAgency(agencyId);
  }

  async getById(taskId: string): Promise<CrmTaskRecord | undefined> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { data, error } = await supabase
      .from("tasks")
      .select(
        "id, agency_id, advisor_id, lead_id, client_id, title, due_at, urgent, subject_name, stage, advisor_name, channel, status, entity_type, notes, created_at",
      )
      .eq("id", taskId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? mapTaskRow(data as TaskRow) : undefined;
  }

  async create(task: CrmTaskRecord): Promise<CrmTaskRecord[]> {
    const savedTask = await this.save(task);
    const allTasks = await this.list();
    return allTasks.map(t => t.id === savedTask.id ? savedTask : t);
  }

  async update(taskId: string, task: CrmTaskRecord): Promise<CrmTaskRecord[]> {
    const savedTask = await this.save(task);
    const allTasks = await this.list();
    return allTasks.map(t => t.id === savedTask.id ? savedTask : t);
  }

  async delete(taskId: string): Promise<CrmTaskRecord[]> {
    if (!supabase) {
      throw new Error("Supabase no esta configurado en el frontend.");
    }

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      throw new Error(error.message);
    }

    return this.list();
  }

  async complete(taskId: string): Promise<CrmTaskRecord[]> {
    const task = await this.getById(taskId);
    if (!task) {
      return this.list();
    }

    const updatedTask = { ...task, status: "Completada" as const };
    return this.update(taskId, updatedTask);
  }
}
