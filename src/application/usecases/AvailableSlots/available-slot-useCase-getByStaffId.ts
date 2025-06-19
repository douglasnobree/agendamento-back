import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AvailableSlotRepository } from '../../../domain/repositoriesInterface/available-slot.repository-interface';
import { AvailableSlot } from '../../../domain/entities/available-slot.entity';
import { UseCase } from '../useCase';

export interface GetAvailableSlotByStaffIdUseCaseInput {
  schema: string;
  staffId: string;
}

@Injectable()
export class GetAvailableSlotByStaffIdUseCase
  implements UseCase<GetAvailableSlotByStaffIdUseCaseInput, AvailableSlot[]>
{
  constructor(
    @Inject('AvailableSlotRepository')
    private readonly availableSlotRepository: AvailableSlotRepository,
  ) {}

  async execute(
    input: GetAvailableSlotByStaffIdUseCaseInput,
  ): Promise<AvailableSlot[]> {
    const { schema, staffId } = input;

    return await this.availableSlotRepository.findByStaffId(schema, staffId);
  }
}
