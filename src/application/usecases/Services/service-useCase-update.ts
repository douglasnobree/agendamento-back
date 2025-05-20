import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { Service } from '../../../domain/entities/service.entity';

export type UpdateServiceInput = {
  id: string;
  name?: string;
  description?: string;
  duration?: number;
  price?: number;
};

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(schema: string, input: UpdateServiceInput): Promise<Service> {
    const existing = await this.serviceRepository.findById(schema, input.id);
    if (!existing) throw new NotFoundException('Serviço não encontrado');
    const updated = existing.update({
      name: input.name,
      description: input.description,
      duration: input.duration,
      price: input.price,
    });
    await this.serviceRepository.update(schema, updated);
    return updated;
  }
}
