import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';
import {
  PlatformAdmin,
  PlatformAdminProps,
} from '../../../../domain/entities/platform-admin.entity';
import { PlatformAdminRepository } from '../../../../domain/repositoriesInterface/platform-admin.repository-interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PlatformAdminRepositoryPostgres
  implements PlatformAdminRepository
{
  constructor(private readonly postgres: PostgresService) {}

  async findByEmail(email: string): Promise<PlatformAdmin | null> {
    const result = await this.postgres.query<PlatformAdminProps>(
      'SELECT * FROM public."PlatformAdmin" WHERE email = $1',
      [email],
    );
    if (!result.rows[0]) return null;

    return PlatformAdmin.fromPersistence(result.rows[0]);
  }

  async findById(id: string): Promise<PlatformAdmin | null> {
    const result = await this.postgres.query<PlatformAdminProps>(
      'SELECT * FROM public."PlatformAdmin" WHERE id = $1',
      [id],
    );
    if (!result.rows[0]) return null;
    return PlatformAdmin.fromPersistence(result.rows[0]);
  }

  async list(): Promise<PlatformAdmin[]> {
    const result = await this.postgres.query<PlatformAdminProps>(
      'SELECT * FROM public."PlatformAdmin"',
    );
    return result.rows.map(PlatformAdmin.fromPersistence);
  }

  async save(admin: PlatformAdmin): Promise<void> {
    const props = admin.toPersistence();
    await this.postgres.query(
      'INSERT INTO public."PlatformAdmin" (id, email, name, password, "createdAt") VALUES ($1, $2, $3, $4, $5)',
      [props.id, props.email, props.name, props.password, props.createdAt],
    );
  }

  async remove(id: string): Promise<void> {
    await this.postgres.query(
      'DELETE FROM public."PlatformAdmin" WHERE id = $1',
      [id],
    );
  }

  async update(admin: PlatformAdmin): Promise<void> {
    const props = admin.toPersistence();
    await this.postgres.query(
      'UPDATE public."PlatformAdmin" SET email = $1, name = $2, password = $3 WHERE id = $4',
      [props.email, props.name, props.password, props.id],
    );
  }

  async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
