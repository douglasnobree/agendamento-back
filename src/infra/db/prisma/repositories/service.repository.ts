import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Service } from '../../../../domain/entities/service.entity';
import { ServiceRepository } from '../../../../domain/repositoriesInterface/service.repository-interface';

@Injectable()
export class ServiceRepositoryPrisma implements ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(schema: string, id: string): Promise<Service | null> {
    const result = await this.prisma.executeRaw<any[]>(
      `SELECT * FROM "${schema}"."Service" WHERE id = $1`,
      [id],
    );

    if (!result || result.length === 0) return null;
    return Service.fromPersistence(result[0]);
  }

  async findAll(schema: string): Promise<Service[]> {
    console.log(`Using prisma service repository with schema: ${schema}`);

    const result = await this.prisma.executeRaw<any[]>(
      `SELECT * FROM "${schema}"."Service"`,
    );

    if (!result || result.length === 0) return [];
    return result.map(Service.fromPersistence);
  }

  async save(schema: string, service: Service): Promise<void> {
    const props = service.toPersistence();
    await this.prisma.executeRaw(
      `INSERT INTO "${schema}"."Service" (id, name, description, duration, price, "createdAt") VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        props.id,
        props.name,
        props.description,
        props.duration,
        props.price,
        props.createdAt,
      ],
    );
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.prisma.executeRaw(
      `DELETE FROM "${schema}"."Service" WHERE id = $1`,
      [id],
    );
  }

  async update(schema: string, service: Service): Promise<void> {
    const props = service.toPersistence();
    await this.prisma.executeRaw(
      `UPDATE "${schema}"."Service" SET name = $1, description = $2, duration = $3, price = $4 WHERE id = $5`,
      [props.name, props.description, props.duration, props.price, props.id],
    );
  }
}
