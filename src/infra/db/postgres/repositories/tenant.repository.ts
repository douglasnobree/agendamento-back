import { Injectable } from '@nestjs/common';
import { PostgresService } from '../postgres.service';
import { Tenant, TenantProps } from '../../../../domain/entities/tenant.entity';
import { TenantRepository } from '../../../../domain/repositoriesInterface/tenant.repository-interface';
import * as bcrypt from 'bcrypt';

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

  async createTenantWithSchema(input: {
    name: string;
    ownerEmail: string;
    planId: string;
  }): Promise<Tenant> {
    const schema = `tenant_${input.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    const tenant = Tenant.create(
      input.name,
      input.ownerEmail,
      input.planId,
      schema,
    );
    const client = await this.postgres.getClient();
    try {
      await client.query('BEGIN');
      await this.save(tenant);
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('password123', salt);
      await client.query(
        `CREATE TABLE IF NOT EXISTS "${schema}"."Owner" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "password" TEXT,
        "oauthType" TEXT,
        "oauthId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      );
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Owner_email_key" ON "${schema}"."Owner"("email")`,
      );
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Owner_oauthId_key" ON "${schema}"."Owner"("oauthId")`,
      );
      await client.query(
        `CREATE TABLE IF NOT EXISTS "${schema}"."Client" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      );
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Client_email_key" ON "${schema}"."Client"("email")`,
      );
      await client.query(
        `CREATE TABLE IF NOT EXISTS "${schema}"."Service" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "duration" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      );
      await client.query(
        `CREATE TABLE IF NOT EXISTS "${schema}"."Staff" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      );
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Staff_email_key" ON "${schema}"."Staff"("email")`,
      );
      await client.query(
        `CREATE TABLE IF NOT EXISTS "${schema}"."Appointment" (
        "id" TEXT PRIMARY KEY,
        "clientId" TEXT NOT NULL,
        "serviceId" TEXT NOT NULL,
        "staffId" TEXT NOT NULL,
        "scheduledAt" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
      );
      // Foreign keys
      try {
        await client.query(
          `ALTER TABLE "${schema}"."Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "${schema}"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        );
      } catch (e) {
        if (!e.message.includes('already exists')) throw e;
      }
      try {
        await client.query(
          `ALTER TABLE "${schema}"."Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "${schema}"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        );
      } catch (e) {
        if (!e.message.includes('already exists')) throw e;
      }
      try {
        await client.query(
          `ALTER TABLE "${schema}"."Appointment" ADD CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "${schema}"."Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        );
      } catch (e) {
        if (!e.message.includes('already exists')) throw e;
      }
      await client.query(
        `INSERT INTO "${schema}"."Owner" ("id", "email", "name", "password", "createdAt") VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP)`,
        [input.ownerEmail, `${input.name} Owner`, hashedPassword],
      );
      await client.query('COMMIT');
      return tenant;
    } catch (error) {
      await client.query('ROLLBACK');
      await this.postgres.query(
        'DELETE FROM public."Tenant" WHERE schema = $1',
        [schema],
      );
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      throw error;
    } finally {
      client.release();
    }
  }
}
