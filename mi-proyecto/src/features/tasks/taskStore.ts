import { CrmTaskRecord } from "@/features/tasks/taskModel";
import { getCurrentAgency } from "@/features/agencies/agencyService";
import { LocalStorageAgencyStore } from "@/features/agencies/localStorageAgencyStore";
import { SupabaseTaskRepository } from "@/features/tasks/supabaseTaskRepository";
import { isSupabaseConfigured } from "@/integrations/supabase/client";

const STORAGE_KEY = "crm-tasks-v2";
const agencyStore = new LocalStorageAgencyStore();
const supabaseTaskRepository = new SupabaseTaskRepository();

const defaultTasks: CrmTaskRecord[] = [
  {
    id: "task-client-welcome",
    agencyId: "agency-demo-001",
    title: "Programar bienvenida de postventa",
    dueAt: "2026-04-15T10:00:00.000Z",
    urgent: true,
    subjectName: "Carlos Ruiz",
    stage: "Postventa",
    advisor: "David P",
    channel: "Llamada",
    status: "Pendiente",
    entityType: "client",
    clientId: "client-1",
    createdAt: "2026-04-15T08:00:00.000Z",
    notes: "Confirmar bienvenida y documentacion inicial.",
  },
  {
    id: "task-client-renewal-north",
    agencyId: "agency-demo-002",
    title: "Llamar para renovacion empresarial",
    dueAt: "2026-04-16T09:00:00.000Z",
    urgent: true,
    subjectName: "Grupo Montana",
    stage: "Postventa",
    advisor: "Sin asignar",
    channel: "CRM",
    status: "Pendiente",
    entityType: "client",
    clientId: "client-3",
    leadId: "lead-grupo-montana",
    createdAt: "2026-04-15T17:00:00.000Z",
    notes: "Renovacion prioritaria de la cartera de Broker Norte.",
  },
];

export class LocalCrmTaskStore {
  private getCurrentAgencyId() {
    return getCurrentAgency(agencyStore).id;
  }

  private read(): CrmTaskRecord[] {
    const currentAgencyId = this.getCurrentAgencyId();

    if (typeof window === "undefined") {
      return defaultTasks.filter((task) => task.agencyId === currentAgencyId);
    }

    const storedTasks = window.localStorage.getItem(STORAGE_KEY);
    if (!storedTasks) {
      return defaultTasks.filter((task) => task.agencyId === currentAgencyId);
    }

    try {
      const parsedTasks = JSON.parse(storedTasks) as CrmTaskRecord[];
      const agencyTasks = parsedTasks.filter((task) => task.agencyId === currentAgencyId);
      return agencyTasks.length > 0 ? agencyTasks : defaultTasks.filter((task) => task.agencyId === currentAgencyId);
    } catch {
      return defaultTasks.filter((task) => task.agencyId === currentAgencyId);
    }
  }

  private write(tasks: CrmTaskRecord[]): void {
    if (typeof window === "undefined") {
      return;
    }

    const storedTasks = window.localStorage.getItem(STORAGE_KEY);
    const allTasks = storedTasks ? (JSON.parse(storedTasks) as CrmTaskRecord[]) : [];
    const currentAgencyId = this.getCurrentAgencyId();
    const otherAgencyTasks = allTasks.filter((task) => task.agencyId !== currentAgencyId);

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherAgencyTasks, ...tasks]));
  }

  list(): CrmTaskRecord[] {
    return this.read();
  }

  getByClientId(clientId: string): CrmTaskRecord[] {
    return this.read().filter((task) => task.clientId === clientId);
  }

  create(task: CrmTaskRecord): CrmTaskRecord[] {
    const nextTasks = [task, ...this.read()];
    this.write(nextTasks);
    return nextTasks;
  }

  saveAll(tasks: CrmTaskRecord[]): CrmTaskRecord[] {
    this.write(tasks);
    return tasks;
  }

  complete(taskId: string): CrmTaskRecord[] {
    const nextTasks = this.read().map((task) =>
      task.id === taskId ? { ...task, status: "Completada", urgent: false } : task,
    );
    this.write(nextTasks);
    return nextTasks;
  }

  async syncFromSupabase(): Promise<CrmTaskRecord[]> {
    if (!isSupabaseConfigured) {
      return this.list();
    }

    try {
      const agencyId = this.getCurrentAgencyId();
      const tasks = await supabaseTaskRepository.listByAgency(agencyId);
      if (tasks.length === 0) {
        return this.list();
      }

      this.saveAll(tasks);
      return tasks;
    } catch {
      return this.list();
    }
  }

  async createAsync(task: CrmTaskRecord): Promise<CrmTaskRecord[]> {
    const persistLocally = (nextTask: CrmTaskRecord) => this.create(nextTask);

    if (!isSupabaseConfigured) {
      return persistLocally(task);
    }

    try {
      const savedTask = await supabaseTaskRepository.save(task);
      return persistLocally(savedTask);
    } catch {
      return persistLocally(task);
    }
  }

  async completeAsync(taskId: string): Promise<CrmTaskRecord[]> {
    const currentTask = this.read().find((task) => task.id === taskId);

    if (!currentTask) {
      return this.read();
    }

    const nextTask = { ...currentTask, status: "Completada" as const, urgent: false };
    const persistLocally = (task: CrmTaskRecord) => {
      const nextTasks = this.read().map((item) => (item.id === taskId ? task : item));
      this.write(nextTasks);
      return nextTasks;
    };

    if (!isSupabaseConfigured) {
      return persistLocally(nextTask);
    }

    try {
      const savedTask = await supabaseTaskRepository.save(nextTask);
      return persistLocally(savedTask);
    } catch {
      return persistLocally(nextTask);
    }
  }
}
