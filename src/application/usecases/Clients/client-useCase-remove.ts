import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../../../domain/repositoriesInterface/client.repository-interface';

@Injectable()
export class RemoveClientUseCase {
  constructor(
    @Inject('ClientRepository')
    private readonly clientRepository: ClientRepository,
  ) {}

  async execute(schema: string, id: string): Promise<void> {
    const existing = await this.clientRepository.findById(schema, id);
    if (!existing) throw new NotFoundException('Cliente não encontrado');
    await this.clientRepository.remove(schema, id);
  }
}
