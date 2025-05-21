import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { Client } from '../../../domain/entities/client.entity';
import { UseCase } from '../useCase';
import { CreateClientInputDto } from '../../dtos/Clients/create-client.dto';

export interface CreateClientUseCaseInputDto {
  schema: string;
  data: CreateClientInputDto;
}

@Injectable()
export class CreateClientUseCase
  implements UseCase<CreateClientUseCaseInputDto, Client>
{
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: CreateClientUseCaseInputDto): Promise<Client> {
    const { schema, data } = input;
    if (!data.email || !data.name) {
      throw new BadRequestException('Nome e email são obrigatórios');
    }
    const client = Client.create(data.email, data.name, data.phone);
    await this.clientRepository.save(schema, client);
    return client;
  }
}
