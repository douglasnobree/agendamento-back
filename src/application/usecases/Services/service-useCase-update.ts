import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { ServiceRepository } from '../../../domain/repositoriesInterface/service.repository-interface';
import { Service } from '../../../domain/entities/service.entity';
import { UseCase } from '../useCase';
import { UpdateServiceInputDto } from 'src/application/dtos/Services/update-service.dto'; 

export interface UpdateServiceUseCaseInputDto {
  schema: string;
  data: UpdateServiceInputDto;
}

@Injectable()
export class UpdateServiceUseCase
  implements UseCase<UpdateServiceUseCaseInputDto, Service>
{
  constructor(
    @Inject('ServiceRepository')
    private readonly serviceRepository: ServiceRepository,
  ) {}

  async execute(input: UpdateServiceUseCaseInputDto): Promise<Service> {
    const { schema, data } = input;
    const existing = await this.serviceRepository.findById(schema, data.id);
    if (!existing) throw new NotFoundException('Serviço não encontrado');
    const updated = existing.update({
      name: data.name,
      description: data.description,
      duration: data.duration,
      price: data.price,
    });
    await this.serviceRepository.update(schema, updated);
    return updated;
  }
}
