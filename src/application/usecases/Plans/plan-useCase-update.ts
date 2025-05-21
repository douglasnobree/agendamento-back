import { UseCase } from '../useCase';
import { Plan } from '../../../domain/entities/plan.entity';
import { PlanRepository } from '../../../domain/repositoriesInterface/plan.repository-interface';
import { UpdatePlanDto } from '../../../interfaces/dtos/plan.dto';

export class UpdatePlanUseCase
  implements UseCase<{ id: string; plan: UpdatePlanDto }, Plan>
{
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(params: { id: string; plan: UpdatePlanDto }): Promise<Plan> {
    const { id, plan } = params;
    return await this.planRepository.update(id, plan);
  }
}
