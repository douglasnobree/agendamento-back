import { Injectable } from '@nestjs/common';
import { PostgresService } from '../db/postgres/postgres.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantService {
  constructor(
    private readonly postgres: PostgresService,
    private readonly configService: ConfigService,
  ) {}

  async createTenant(data: {
    name: string;
    ownerEmail: string;
    planId: string;
  }): Promise<any> {
    const schema = `tenant_${data.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')}_${Date.now()}`;

    // Criar um novo tenant no schema public
    const client = await this.postgres.getClient();
    try {
      await client.query('BEGIN');
      const tenantResult = await client.query(
        `INSERT INTO public."Tenant" ("id", name, "ownerEmail", "planId", schema) VALUES (gen_random_uuid(), $1, $2, $3, $4) RETURNING *`,
        [data.name, data.ownerEmail, data.planId, schema],
      );
      const tenant = tenantResult.rows[0];

      await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash('password123', salt);

      // Criar tabelas e índices
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
      // Corrige sintaxe do Postgres: não existe 'ADD CONSTRAINT IF NOT EXISTS' para foreign key
      // Primeiro verifica se a constraint já existe, se não, adiciona
      // Para simplificar, tenta adicionar e ignora erro de duplicidade
      try {
        await client.query(
          `ALTER TABLE "${schema}"."Appointment" ADD CONSTRAINT "Appointment_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "${schema}"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE`,
        );
      } catch (e) {
        // Se a constraint já existe, ignora o erro
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
        [data.ownerEmail, `${data.name} Owner`, hashedPassword],
      );
      await client.query('COMMIT');
      return tenant;
    } catch (error) {
      await client.query('ROLLBACK');
      await client.query(`DELETE FROM public."Tenant" WHERE schema = $1`, [
        schema,
      ]);
      await client.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      throw error;
    } finally {
      client.release();
    }
  }

  async getTenantById(id: string): Promise<any> {
    const client = await this.postgres.getClient();
    try {
      const result = await client.query(
        `SELECT * FROM public."Tenant" WHERE id = $1`,
        [id],
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async getTenantBySchema(schema: string): Promise<any> {
    const client = await this.postgres.getClient();
    try {
      const result = await client.query(
        `SELECT * FROM public."Tenant" WHERE schema = $1`,
        [schema],
      );
      return result.rows[0] || null;
    } finally {
      client.release();
    }
  }

  async listTenants(): Promise<any[]> {
    const client = await this.postgres.getClient();
    try {
      const result = await client.query(`SELECT * FROM public."Tenant"`);
      return result.rows;
    } finally {
      client.release();
    }
  }
}
