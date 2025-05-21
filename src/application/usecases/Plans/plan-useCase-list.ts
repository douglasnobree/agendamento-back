import { UseCase } from '../useCase';
import { Plan } from '../../../domain/entities/plan.entity';
import { PlanRepository } from '../../../domain/repositoriesInterface/plan.repository-interface';

export class ListPlansUseCase implements UseCase<void, Plan[]> {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(): Promise<Plan[]> {
    return await this.planRepository.findAll();
  }
}
