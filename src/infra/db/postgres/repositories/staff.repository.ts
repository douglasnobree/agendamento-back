import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';
import { Staff, StaffProps } from '../../../../domain/entities/staff.entity';
import { StaffRepository } from '../../../../domain/repositoriesInterface/staff.repository-interface';

@Injectable()
export class StaffRepositoryPostgres implements StaffRepository {
  constructor(private readonly postgres: PostgresService) {}

  async findById(schema: string, id: string): Promise<Staff | null> {
    const result = await this.postgres.query<StaffProps>(
      `SELECT * FROM "${schema}"."Staff" WHERE id = $1`,
      [id],
    );
    if (!result.rows[0]) return null;
    return Staff.fromPersistence(result.rows[0]);
  }

  async findAll(schema: string): Promise<Staff[]> {
    const result = await this.postgres.query<StaffProps>(
      `SELECT * FROM "${schema}"."Staff"`,
    );
    return result.rows.map(Staff.fromPersistence);
  }

  async save(schema: string, staff: Staff): Promise<void> {
    const props = staff.toPersistence();
    await this.postgres.query(
      `INSERT INTO "${schema}"."Staff" (id, name, role, email, "createdAt", password) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        props.id,
        props.name,
        props.role,
        props.email,
        props.createdAt,
        props.password,
      ],
    );
  }

  async remove(schema: string, id: string): Promise<void> {
    await this.postgres.query(`DELETE FROM "${schema}"."Staff" WHERE id = $1`, [
      id,
    ]);
  }

  async update(schema: string, staff: Staff): Promise<void> {
    const props = staff.toPersistence();
    await this.postgres.query(
      `UPDATE "${schema}"."Staff" SET name = $1, role = $2, email = $3, password = $4 WHERE id = $5`,
      [props.name, props.role, props.email, props.password, props.id],
    );
  }
}
