import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { Service } from '../../../domain/entities/service.entity';

export type CreateServiceInput = {
  name: string;
  description?: string;
  duration: number;
  price: number;
};

@Injectable()
export class CreateServiceUseCase {
  constructor(
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(schema: string, input: CreateServiceInput): Promise<Service> {
    if (!input.name || !input.duration || !input.price) {
      throw new BadRequestException('Nome, duração e preço são obrigatórios');
    }
    const service = Service.create(
      input.name,
      input.duration,
      input.price,
      input.description,
    );
    await this.serviceRepository.save(schema, service);
    return service;
  }
}
