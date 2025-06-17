import { Injectable, Inject } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { Client } from '../../../domain/entities/client.entity';
import { UseCase } from '../useCase';
import { SchemaDto } from '../../dtos/common.dto';
import { PaginatedResult } from '../../dtos/pagination.dto';

export interface ListClientsInputDto extends SchemaDto {
  page?: number;
  limit?: number;
}

@Injectable()
export class ListClientsUseCase implements UseCase<ListClientsInputDto, PaginatedResult<Client>> {
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(input: ListClientsInputDto): Promise<PaginatedResult<Client>> {
    return this.clientRepository.findAll(input.schema, input.page, input.limit);
  }
}
