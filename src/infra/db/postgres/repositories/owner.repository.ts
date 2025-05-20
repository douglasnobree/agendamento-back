import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';
import { Owner, OwnerProps } from '../../../../domain/entities/owner.entity';
import { OwnerRepository } from '../../../../domain/repositoriesInterface/owner.repository-interface';

@Injectable()
export class OwnerRepositoryPostgres implements OwnerRepository {
  constructor(private readonly postgres: PostgresService) {}

  async findByEmail(schema: string, email: string): Promise<Owner | null> {
    const result = await this.postgres.query<OwnerProps>(
      `SELECT * FROM "${schema}"."Owner" WHERE email = $1`,
      [email],
    );
    if (!result.rows[0]) return null;
    return Owner.fromPersistence(result.rows[0]);
  }

  async findById(schema: string, id: string): Promise<Owner | null> {
    const result = await this.postgres.query<OwnerProps>(
      `SELECT * FROM "${schema}"."Owner" WHERE id = $1`,
      [id],
    );
    if (!result.rows[0]) return null;
    return Owner.fromPersistence(result.rows[0]);
  }

  async findAll(schema: string): Promise<Owner[]> {
    const result = await this.postgres.query<OwnerProps>(
      `SELECT * FROM "${schema}"."Owner"`,
    );
    return result.rows.map(Owner.fromPersistence);
  }

  async save(schema: string, owner: Owner): Promise<void> {
    const props = owner.toPersistence();
    await this.postgres.query(
      `INSERT INTO "${schema}"."Owner" (id, email, name, password, "createdAt") VALUES ($1, $2, $3, $4, $5)`,
      [props.id, props.email, props.name, props.password, props.createdAt],
    );
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.postgres.query(`DELETE FROM "${schema}"."Owner" WHERE id = $1`, [
      id,
    ]);
  }

  async update(schema: string, owner: Owner): Promise<void> {
    const props = owner.toPersistence();
    await this.postgres.query(
      `UPDATE "${schema}"."Owner" SET email = $1, name = $2, password = $3 WHERE id = $4`,
      [props.email, props.name, props.password, props.id],
    );
  }
}
