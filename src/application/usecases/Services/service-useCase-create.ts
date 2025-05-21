import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { Service } from '../../../domain/entities/service.entity';
import { UseCase } from '../useCase';
import { CreateServiceInputDto } from '../../dtos/Services/service.dto';

export type CreateServiceInput = {
  name: string;
  description?: string;
  duration: number;
  price: number;
};

export interface CreateServiceUseCaseInputDto {
  schema: string;
  data: CreateServiceInputDto;
}

@Injectable()
export class CreateServiceUseCase
  implements UseCase<CreateServiceUseCaseInputDto, Service>
{
  constructor(
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: CreateServiceUseCaseInputDto): Promise<Service> {
    const { schema, data } = input;
    if (!data.name || !data.duration || !data.price) {
      throw new BadRequestException('Nome, duração e preço são obrigatórios');
    }
    const service = Service.create(
      data.name,
      data.duration,
      data.price,
      data.description,
    );
    await this.serviceRepository.save(schema, service);
    return service;
  }
}
