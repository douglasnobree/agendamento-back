import { UseCase } from '../useCase';
import { Plan } from '../../../domain/entities/plan.entity';
import { PlanRepository } from '../../../domain/repositoriesInterface/plan.repository-interface';
import { CreatePlanDto } from '../../../interfaces/dtos/plan.dto';

export class CreatePlanUseCase implements UseCase<CreatePlanDto, Plan> {
  constructor(private readonly planRepository: PlanRepository) {}

  async execute(planDto: CreatePlanDto): Promise<Plan> {
    return await this.planRepository.create(planDto);
  }
}
