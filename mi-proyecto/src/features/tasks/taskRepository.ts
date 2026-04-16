import { CrmTask } from "./taskService";

export interface TaskRepository {
  list(): Promise<CrmTask[]>;
  getById(taskId: string): Promise<CrmTask | undefined>;
  create(task: CrmTask): Promise<CrmTask[]>;
  update(taskId: string, task: CrmTask): Promise<CrmTask[]>;
  delete(taskId: string): Promise<CrmTask[]>;
  complete(taskId: string): Promise<CrmTask[]>;
}