import { Injectable, Inject } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { Client } from '../../../domain/entities/client.entity';
import { UseCase } from '../useCase';
import { SchemaDto } from '../../dtos/common.dto';

@Injectable()
export class ListClientsUseCase implements UseCase<SchemaDto, Client[]> {
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: SchemaDto): Promise<Client[]> {
    return this.clientRepository.findAll(input.schema);
  }
}
