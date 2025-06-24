import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AvailableSlotRepository } from '../../../domain/repositoriesInterface/available-slot.repository-interface';
import { AvailableSlot } from '../../../domain/entities/available-slot.entity';
import { UseCase } from '../useCase';
import { UpdateAvailableSlotInputDto } from '../../dtos/AvailableSlots/available-slot.dto';

export interface UpdateAvailableSlotUseCaseInputDto {
  schema: string;
  id: string;
  data: UpdateAvailableSlotInputDto;
}

@Injectable()
export class UpdateAvailableSlotUseCase
  implements UseCase<UpdateAvailableSlotUseCaseInputDto, AvailableSlot>
{
  constructor(
    private readonly availableSlotRepository: AvailableSlotRepository,
  ) {}

  async execute(
    input: UpdateAvailableSlotUseCaseInputDto,
  ): Promise<AvailableSlot> {
    // Buscar o slot existente para verificar se existe
    const existingSlot = await this.availableSlotRepository.findById(
      input.schema,
      input.id,
    );

    if (!existingSlot) {
      throw new NotFoundException('Horário disponível não encontrado');
    }

    // Validações básicas
    if (
      input.data.startTime &&
      input.data.endTime &&
      input.data.startTime >= input.data.endTime
    ) {
      throw new BadRequestException(
        'Horário de início deve ser anterior ao horário de fim',
      );
    }

    // Se não for recorrente, verificar se tem data específica
    if (
      input.data.isRecurring === false &&
      !input.data.specificDate &&
      !existingSlot.specificDate
    ) {
      throw new BadRequestException(
        'Data específica é obrigatória para horários não recorrentes',
      );
    }

    // Criar um novo objeto com as propriedades atualizadas
    const updatedProps = {
      id: existingSlot.id,
      staffId: existingSlot.staffId,
      dayOfWeek:
        input.data.dayOfWeek !== undefined
          ? input.data.dayOfWeek
          : existingSlot.dayOfWeek,
      startTime: input.data.startTime || existingSlot.startTime,
      endTime: input.data.endTime || existingSlot.endTime,
      isRecurring:
        input.data.isRecurring !== undefined
          ? input.data.isRecurring
          : existingSlot.isRecurring,
      specificDate: input.data.specificDate || existingSlot.specificDate,
      createdAt: existingSlot.createdAt,
    };

    // Criar um novo objeto AvailableSlot
    const updatedSlot = AvailableSlot.fromPersistence(updatedProps);

    // Atualizar no repositório
    await this.availableSlotRepository.update(input.schema, updatedSlot);

    return updatedSlot;
  }
}
