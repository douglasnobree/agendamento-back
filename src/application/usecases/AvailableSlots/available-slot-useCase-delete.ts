import { Injectable, NotFoundException } from '@nestjs/common';
import { AvailableSlotRepository } from '../../../domain/repositoriesInterface/available-slot.repository-interface';
import { UseCase } from '../useCase';

export interface DeleteAvailableSlotUseCaseInputDto {
  schema: string;
  id: string;
}

@Injectable()
export class DeleteAvailableSlotUseCase
  implements UseCase<DeleteAvailableSlotUseCaseInputDto, void>
{
  constructor(
    private readonly availableSlotRepository: AvailableSlotRepository,
  ) {}

  async execute(input: DeleteAvailableSlotUseCaseInputDto): Promise<void> {
    // Verificar se o slot existe antes de tentar excluir
    const slot = await this.availableSlotRepository.findById(
      input.schema,
      input.id,
    );

    if (!slot) {
      throw new NotFoundException('Horário disponível não encontrado');
    }

    // Se existir, excluir o slot
    await this.availableSlotRepository.remove(input.schema, input.id);
  }
}
