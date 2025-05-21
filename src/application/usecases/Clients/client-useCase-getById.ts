import { Injectable, Inject } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { Client } from '../../../domain/entities/client.entity';
import { UseCase } from '../useCase';
import { SchemaIdDto } from '../../dtos/common.dto';

@Injectable()
export class GetClientByIdUseCase
  implements UseCase<SchemaIdDto, Client | null>
{
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: SchemaIdDto): Promise<Client | null> {
    const { schema, id } = input;
    return this.clientRepository.findById(schema, id);
  }
}
