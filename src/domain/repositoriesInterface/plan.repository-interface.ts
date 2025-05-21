import { Plan } from '../entities/plan.entity';

export interface PlanRepository {
  findAll(): Promise<Plan[]>;
  findById(id: string): Promise<Plan>;
  create(plan: Partial<Plan>): Promise<Plan>;
  update(id: string, plan: Partial<Plan>): Promise<Plan>;
  remove(id: string): Promise<void>;
}
