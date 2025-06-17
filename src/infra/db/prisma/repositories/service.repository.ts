import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Service } from '../../../../domain/entities/service.entity';
import { ServiceRepository } from '../../../../domain/repositoriesInterface/service.repository-interface';

@Injectable()
export class ServiceRepositoryPrisma implements ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  private async setSchema(schema: string) {
    await this.prisma.$executeRawUnsafe(`SET search_path TO "${schema}"`);
  }

  async findById(schema: string, id: string): Promise<Service | null> {
    await this.setSchema(schema);
    const data = await this.prisma.service.findUnique({ where: { id } });
    if (!data) return null;
    return Service.fromPersistence(data);
  }

  async findAll(schema: string): Promise<Service[]> {
    console.log(`Using prisma service repository with schema: ${schema}`);
    await this.setSchema(schema);
    const data = await this.prisma.service.findMany();
    return data.map(Service.fromPersistence);
  }

  async save(schema: string, service: Service): Promise<void> {
    await this.setSchema(schema);
    const props = service.toPersistence();
    await this.prisma.service.create({ data: props });
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.setSchema(schema);
    await this.prisma.service.delete({ where: { id } });
  }

  async update(schema: string, service: Service): Promise<void> {
    await this.setSchema(schema);
    const props = service.toPersistence();
    await this.prisma.service.update({ where: { id: props.id }, data: props });
  }
}
