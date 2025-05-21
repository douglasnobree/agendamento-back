import { Injectable } from '@nestjs/common';
import { PlanRepository } from 'src/domain/repositoriesInterface/plan.repository-interface';
import { Plan } from 'src/domain/entities/plan.entity';
import { PostgresService } from '../postgres.service';

@Injectable()
export class PlanRepositoryPostgres implements PlanRepository {
  constructor(private readonly postgres: PostgresService) {}

  async findAll(): Promise<Plan[]> {
    const result = await this.postgres.query('SELECT * FROM public."Plan"');
    return result.rows.map(
      (row) =>
        new Plan(row.id, row.name, row.description, row.price, row.features),
    );
  }

  async findById(id: string): Promise<Plan> {
    const result = await this.postgres.query(
      'SELECT * FROM public."Plan" WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Plan(row.id, row.name, row.description, row.price, row.features);
  }

  async create(plan: Partial<Plan>): Promise<Plan> {
    const result = await this.postgres.query(
      'INSERT INTO public."Plan" (id, name, description, price, features) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *',
      [plan.name, plan.description, plan.price, plan.features],
    );
    const row = result.rows[0];
    return new Plan(row.id, row.name, row.description, row.price, row.features);
  }

  async update(id: string, plan: Partial<Plan>): Promise<Plan> {
    const result = await this.postgres.query(
      'UPDATE public."Plan" SET name = $1, description = $2, price = $3, features = $4 WHERE id = $5 RETURNING *',
      [plan.name, plan.description, plan.price, plan.features, id],
    );
    if (result.rows.length === 0) {
      return null;
    }
    const row = result.rows[0];
    return new Plan(row.id, row.name, row.description, row.price, row.features);
  }

  async remove(id: string): Promise<void> {
    await this.postgres.query('DELETE FROM public."Plan" WHERE id = $1', [id]);
  }
}
