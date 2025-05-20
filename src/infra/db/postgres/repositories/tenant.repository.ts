import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';
import { Tenant, TenantProps } from '../../../../domain/entities/tenant.entity';
import { TenantRepository } from '../../../../domain/repositoriesInterface/tenant.repository-interface';

@Injectable()
export class TenantRepositoryPostgres implements TenantRepository {
  constructor(private readonly postgres: PostgresService) {}

  async findById(id: string): Promise<Tenant | null> {
    const result = await this.postgres.query<TenantProps>(
      'SELECT * FROM public."Tenant" WHERE id = $1',
      [id],
    );
    if (!result.rows[0]) return null;
    return Tenant.fromPersistence(result.rows[0]);
  }

  async findBySchema(schema: string): Promise<Tenant | null> {
    const result = await this.postgres.query<TenantProps>(
      'SELECT * FROM public."Tenant" WHERE schema = $1',
      [schema],
    );
    if (!result.rows[0]) return null;
    return Tenant.fromPersistence(result.rows[0]);
  }

  async list(): Promise<Tenant[]> {
    const result = await this.postgres.query<TenantProps>(
      'SELECT * FROM public."Tenant"',
    );
    return result.rows.map(Tenant.fromPersistence);
  }

  async save(tenant: Tenant): Promise<void> {
    const props = tenant.toPersistence();
    await this.postgres.query(
      'INSERT INTO public."Tenant" ("id", name, "ownerEmail", "planId", schema, "createdAt") VALUES ($1, $2, $3, $4, $5, $6)',
      [
        props.id,
        props.name,
        props.ownerEmail,
        props.planId,
        props.schema,
        props.createdAt,
      ],
    );
  }

  async remove(id: string): Promise<void> {
    await this.postgres.query('DELETE FROM public."Tenant" WHERE id = $1', [
      id,
    ]);
  }

  async update(tenant: Tenant): Promise<void> {
    const props = tenant.toPersistence();
    await this.postgres.query(
      'UPDATE public."Tenant" SET name = $1, "ownerEmail" = $2, "planId" = $3, schema = $4 WHERE id = $5',
      [props.name, props.ownerEmail, props.planId, props.schema, props.id],
    );
  }
}
