import { UseCase } from '../useCase';
import { PlanRepository } from '../../../domain/repositoriesInterface/plan.repository-interface';

export class RemovePlanUseCase implements UseCase<string, void> {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(id: string): Promise<void> {
    await this.planRepository.remove(id);
  }
}
