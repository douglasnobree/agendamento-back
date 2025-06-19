import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { AvailableSlotRepository } from '../../../domain/repositoriesInterface/available-slot.repository-interface';
import { AvailableSlot } from '../../../domain/entities/available-slot.entity';
import { UseCase } from '../useCase';
import { CreateAvailableSlotInputDto } from '../../dtos/AvailableSlots/available-slot.dto';

export interface CreateAvailableSlotUseCaseInputDto {
  schema: string;
  data: CreateAvailableSlotInputDto;
}

@Injectable()
export class CreateAvailableSlotUseCase
  implements UseCase<CreateAvailableSlotUseCaseInputDto, AvailableSlot>
{
  constructor(
    @Inject('AvailableSlotRepository')
    private readonly availableSlotRepository: AvailableSlotRepository,
  ) {}

  async execute(
    input: CreateAvailableSlotUseCaseInputDto,
  ): Promise<AvailableSlot> {
    const { schema, data } = input;

    const availableSlot = AvailableSlot.create(
      data.staffId,
      data.dayOfWeek,
      data.startTime,
      data.endTime,
      data.isRecurring,
      data.specificDate,
    );

    await this.availableSlotRepository.save(schema, availableSlot);
    return availableSlot;
  }
}
