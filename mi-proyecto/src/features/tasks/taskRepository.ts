import { CrmTask } from "./taskService";

export interface TaskRepository {
  list(): CrmTask[];
  getById(taskId: string): CrmTask | undefined;
  create(task: CrmTask): CrmTask[];
  update(taskId: string, task: CrmTask): CrmTask[];
  delete(taskId: string): CrmTask[];
  complete(taskId: string): CrmTask[];
}