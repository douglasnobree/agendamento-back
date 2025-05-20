import { Injectable, Inject } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';
import { Client } from '../../../domain/entities/client.entity';

@Injectable()
export class GetClientByIdUseCase {
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(schema: string, id: string): Promise<Client | null> {
    return this.clientRepository.findById(schema, id);
  }
}
