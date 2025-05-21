import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { Client } from '../../../domain/entities/client.entity';
import { UseCase } from '../useCase';
import { UpdateClientInputDto } from 'src/application/dtos/Clients/update-client.dto'; 

export interface UpdateClientUseCaseInputDto {
  schema: string;
  data: UpdateClientInputDto;
}

@Injectable()
export class UpdateClientUseCase
  implements UseCase<UpdateClientUseCaseInputDto, Client>
{
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: UpdateClientUseCaseInputDto): Promise<Client> {
    const { schema, data } = input;
    const existing = await this.clientRepository.findById(schema, data.id);
    if (!existing) throw new NotFoundException('Cliente não encontrado');
    const updated = Client.fromPersistence({
      ...existing.toPersistence(),
      ...data,
    });
    await this.clientRepository.update(schema, updated);
    return updated;
  }
}
