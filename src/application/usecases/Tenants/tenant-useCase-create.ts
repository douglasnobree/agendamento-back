import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { TenantRepository } from '../../../domain/repositoriesInterface/tenant.repository-interface';
import { Tenant } from '../../../domain/entities/tenant.entity';
import { TenantFactory } from '../../../domain/factories/tenant.factory';
import { PostgresService } from '../../../infra/db/postgres/postgres.service';
import * as bcrypt from 'bcrypt';

export type CreateTenantInput = {
  name: string;
  ownerEmail: string;
  planId: string;
};

@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject('TenantRepository')
    private readonly tenantRepository: TenantRepository,
    private readonly postgres: PostgresService,
  ) {}

  async execute(input: CreateTenantInput): Promise<Tenant> {
    // Gerar schema único
    const schema = `tenant_${input.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;
    // Cria entidade Tenant (DDD)
    const tenant = TenantFactory.create({ ...input, schema });
    const client = await this.postgres.getClient();
    try {
      await client.query('BEGIN');
      // Salva tenant no schema public
      await this.tenantRepository.save(tenant);
      // Cria schema do tenant
      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
      // Cria tabelas e índices
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('password123', salt);
      await client.query(`CREATE TABLE IF NOT EXISTS "${schema}"."Owner" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "password" TEXT,
        "oauthType" TEXT,
        "oauthId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Owner_email_key" ON "${schema}"."Owner"("email")`,
      );
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Owner_oauthId_key" ON "${schema}"."Owner"("oauthId")`,
      );
      await client.query(`CREATE TABLE IF NOT EXISTS "${schema}"."Client" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "phone" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Client_email_key" ON "${schema}"."Client"("email")`,
      );
      await client.query(`CREATE TABLE IF NOT EXISTS "${schema}"."Service" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "duration" INTEGER NOT NULL,
        "price" DOUBLE PRECISION NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      await client.query(`CREATE TABLE IF NOT EXISTS "${schema}"."Staff" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "Staff_email_key" ON "${schema}"."Staff"("email")`,
      );
      await client.query(`CREATE TABLE IF NOT EXISTS "${schema}"."Appointment" (
        "id" TEXT PRIMARY KEY,
        "clientId" TEXT NOT NULL,
        "serviceId" TEXT NOT NULL,
        "staffId" TEXT NOT NULL,
        "scheduledAt" TIMESTAMP(3) NOT NULL,
        "status" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`);
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
      // Cria Owner inicial
      await client.query(
        `INSERT INTO "${schema}"."Owner" ("id", "email", "name", "password", "createdAt") VALUES (gen_random_uuid(), $1, $2, $3, CURRENT_TIMESTAMP)`,
        [input.ownerEmail, `${input.name} Owner`, hashedPassword],
      );
      await client.query('COMMIT');
      return tenant;
    } catch (error) {
      await client.query('ROLLBACK');
      // Remove tenant do schema public
      await this.postgres.query(
        'DELETE FROM public."Tenant" WHERE schema = $1',
        [schema],
      );
      // Remove schema do banco
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      throw new InternalServerErrorException(
        'Erro ao criar tenant: ' + error.message,
      );
    } finally {
      client.release();
    }
  }
}
