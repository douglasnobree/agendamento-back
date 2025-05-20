import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';
import {
  Service,
  ServiceProps,
} from '../../../../domain/entities/service.entity';
import { ServiceRepository } from '../../../../domain/repositoriesInterface/service.repository-interface';

@Injectable()
export class ServiceRepositoryPostgres implements ServiceRepository {
  constructor(private readonly postgres: PostgresService) {}

  async findById(schema: string, id: string): Promise<Service | null> {
    const result = await this.postgres.query<ServiceProps>(
      `SELECT * FROM "${schema}"."Service" WHERE id = $1`,
      [id],
    );
    if (!result.rows[0]) return null;
    return Service.fromPersistence(result.rows[0]);
  }

  async findAll(schema: string): Promise<Service[]> {
    const result = await this.postgres.query<ServiceProps>(
      `SELECT * FROM "${schema}"."Service"`,
    );
    return result.rows.map(Service.fromPersistence);
  }

  async save(schema: string, service: Service): Promise<void> {
    const props = service.toPersistence();
    await this.postgres.query(
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
    await this.postgres.query(
      `DELETE FROM "${schema}"."Service" WHERE id = $1`,
      [id],
    );
  }

  async update(schema: string, service: Service): Promise<void> {
    const props = service.toPersistence();
    await this.postgres.query(
      `UPDATE "${schema}"."Service" SET name = $1, description = $2, duration = $3, price = $4 WHERE id = $5`,
      [props.name, props.description, props.duration, props.price, props.id],
    );
  }
}
