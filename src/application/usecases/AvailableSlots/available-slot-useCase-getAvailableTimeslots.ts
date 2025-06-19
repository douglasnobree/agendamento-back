import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { AvailableSlotRepository } from '../../../domain/repositoriesInterface/available-slot.repository-interface';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { UseCase } from '../useCase';
import { GetAvailableTimeslotsInputDto } from '../../dtos/AvailableSlots/available-slot.dto';

export interface GetAvailableTimeslotsUseCaseInput {
  schema: string;
  data: GetAvailableTimeslotsInputDto;
}

@Injectable()
export class GetAvailableTimeslotsUseCase
  implements UseCase<GetAvailableTimeslotsUseCaseInput, Date[]>
{
  constructor(
    @Inject('AvailableSlotRepository')
    private readonly availableSlotRepository: AvailableSlotRepository,
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: GetAvailableTimeslotsUseCaseInput): Promise<Date[]> {
    const { schema, data } = input;

    // Buscar o serviço para obter sua duração
    const service = await this.serviceRepository.findById(
      schema,
      data.serviceId,
    );
    if (!service) {
      throw new NotFoundException(
        `Serviço com ID ${data.serviceId} não encontrado`,
      );
    }

    // Usar a duração do serviço para encontrar os horários disponíveis
    return await this.availableSlotRepository.getAvailableTimeslots(
      schema,
      data.staffId,
      data.startDate,
      data.endDate,
      service.duration,
    );
  }
}
