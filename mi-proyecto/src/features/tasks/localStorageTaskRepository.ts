import { CrmTask } from "./taskService";
import { TaskRepository } from "./taskRepository";

const STORAGE_KEY = "crm-tasks";

const defaultTasks: CrmTask[] = [
  {
    id: "task-1",
    title: "Llamada de seguimiento con cliente nuevo",
    when: "2024-03-15T10:00:00",
    urgent: true,
    leadName: "Carlos Mendoza",
    stage: "Contacto Inicial",
    advisor: "Ana Garcia",
    channel: "Llamada",
  },
  {
    id: "task-2",
    title: "Enviar cotización seguro auto",
    when: "2024-03-15T14:00:00",
    urgent: false,
    leadName: "Maria Lopez",
    stage: "Cotizacion",
    advisor: "Pedro Sanchez",
    channel: "Email",
  },
];

export class LocalStorageTaskRepository implements TaskRepository {
  private readTasks(): CrmTask[] {
    if (typeof window === "undefined") {
      return defaultTasks;
    }

    const storedTasks = window.localStorage.getItem(STORAGE_KEY);
    if (!storedTasks) {
      return defaultTasks;
    }

    try {
      const parsedTasks = JSON.parse(storedTasks) as CrmTask[];
      return parsedTasks.length > 0 ? parsedTasks : defaultTasks;
    } catch {
      return defaultTasks;
    }
  }

  private writeTasks(tasks: CrmTask[]): void {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  async list(): Promise<CrmTask[]> {
    return this.readTasks();
  }

  async getById(taskId: string): Promise<CrmTask | undefined> {
    return this.readTasks().find((task) => task.id === taskId);
  }

  async create(task: CrmTask): Promise<CrmTask[]> {
    const nextTasks = [task, ...this.readTasks()];
    this.writeTasks(nextTasks);
    return nextTasks;
  }

  async update(taskId: string, nextTask: CrmTask): Promise<CrmTask[]> {
    const nextTasks = this.readTasks().map((task) => (task.id === taskId ? nextTask : task));
    this.writeTasks(nextTasks);
    return nextTasks;
  }

  async delete(taskId: string): Promise<CrmTask[]> {
    const nextTasks = this.readTasks().filter((task) => task.id !== taskId);
    this.writeTasks(nextTasks);
    return nextTasks;
  }

  async complete(taskId: string): Promise<CrmTask[]> {
    const nextTasks = this.readTasks().filter((task) => task.id !== taskId);
    this.writeTasks(nextTasks);
    return nextTasks;
  }
}