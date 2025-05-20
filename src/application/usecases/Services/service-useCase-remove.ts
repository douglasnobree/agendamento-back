import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';

@Injectable()
export class RemoveServiceUseCase {
  constructor(
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(schema: string, id: string): Promise<void> {
    const existing = await this.serviceRepository.findById(schema, id);
    if (!existing) throw new NotFoundException('Serviço não encontrado');
    await this.serviceRepository.remove(schema, id);
  }
}
