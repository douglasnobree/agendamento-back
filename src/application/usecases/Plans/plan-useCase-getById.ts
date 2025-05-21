import { UseCase } from '../useCase';
import { Plan } from '../../../domain/entities/plan.entity';
import { PlanRepository } from '../../../domain/repositoriesInterface/plan.repository-interface';

export class GetPlanByIdUseCase implements UseCase<string, Plan> {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(id: string): Promise<Plan> {
    return await this.planRepository.findById(id);
  }
}
