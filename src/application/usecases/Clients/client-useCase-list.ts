import { Injectable, Inject } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { Client } from '../../../domain/entities/client.entity';

@Injectable()
export class ListClientsUseCase {
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(schema: string): Promise<Client[]> {
    return this.clientRepository.findAll(schema);
  }
}
