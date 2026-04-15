import { CrmTaskRecord } from "@/features/tasks/taskModel";

const STORAGE_KEY = "crm-tasks-v2";

const defaultTasks: CrmTaskRecord[] = [
  {
    id: "task-client-welcome",
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
];

export class LocalCrmTaskStore {
  private read(): CrmTaskRecord[] {
    if (typeof window === "undefined") {
      return defaultTasks;
    }

    const storedTasks = window.localStorage.getItem(STORAGE_KEY);
    if (!storedTasks) {
      return defaultTasks;
    }

    try {
      const parsedTasks = JSON.parse(storedTasks) as CrmTaskRecord[];
      return parsedTasks.length > 0 ? parsedTasks : defaultTasks;
    } catch {
      return defaultTasks;
    }
  }

  private write(tasks: CrmTaskRecord[]): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
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

  complete(taskId: string): CrmTaskRecord[] {
    const nextTasks = this.read().map((task) =>
      task.id === taskId ? { ...task, status: "Completada", urgent: false } : task,
    );
    this.write(nextTasks);
    return nextTasks;
  }
}
