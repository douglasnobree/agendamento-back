import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';
import { Client, ClientProps } from '../../../../domain/entities/client.entity';
import { ClientRepository } from '../../../../domain/repositoriesInterface/client.repository-interface';
import { PaginatedResult, PaginationMeta } from '../../../../application/dtos/pagination.dto';

@Injectable()
export class ClientRepositoryPostgres implements ClientRepository {
  constructor(private readonly postgres: PostgresService) {}

  async findByEmail(schema: string, email: string): Promise<Client | null> {
    const result = await this.postgres.query<ClientProps>(
      `SELECT * FROM "${schema}"."Client" WHERE email = $1`,
      [email],
    );
    if (!result.rows[0]) return null;
    return Client.fromPersistence(result.rows[0]);
  }

  async findById(schema: string, id: string): Promise<Client | null> {
    const result = await this.postgres.query<ClientProps>(
      `SELECT * FROM "${schema}"."Client" WHERE id = $1`,
      [id],
    );
    if (!result.rows[0]) return null;
    return Client.fromPersistence(result.rows[0]);
  }

  async findAll(schema: string, page = 1, limit = 10): Promise<PaginatedResult<Client>> {
    const offset = (page - 1) * limit;
    const [dataResult, countResult] = await Promise.all([
      this.postgres.query<ClientProps>(
        `SELECT * FROM "${schema}"."Client" ORDER BY "createdAt" DESC OFFSET $1 LIMIT $2`,
        [offset, limit],
      ),
      this.postgres.query<{ count: number }>(
        `SELECT COUNT(*)::int as count FROM "${schema}"."Client"`,
      ),
    ]);
    const items = dataResult.rows.map(Client.fromPersistence);
    const totalItems = countResult.rows[0]?.count || 0;
    const meta: PaginationMeta = {
      totalItems,
      itemCount: items.length,
      itemsPerPage: limit,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: page,
    };
    return { items, meta };
  }

  async save(schema: string, client: Client): Promise<void> {
    const props = client.toPersistence();
    await this.postgres.query(
      `INSERT INTO "${schema}"."Client" (id, email, name, phone, "createdAt") VALUES ($1, $2, $3, $4, $5)`,
      [props.id, props.email, props.name, props.phone, props.createdAt],
    );
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.postgres.query(
      `DELETE FROM "${schema}"."Client" WHERE id = $1`,
      [id],
    );
  }

  async update(schema: string, client: Client): Promise<void> {
    const props = client.toPersistence();
    await this.postgres.query(
      `UPDATE "${schema}"."Client" SET email = $1, name = $2, phone = $3 WHERE id = $4`,
      [props.email, props.name, props.phone, props.id],
    );
  }
}
