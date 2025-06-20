// Script: update_schemas.ts
// Atualiza todos os schemas de tenants já criados, aplicando novas tabelas/colunas conforme o modelo base, usando conexão direta com o banco (pg)

import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const tenantSchemaUpdates = [
  `CREATE TABLE IF NOT EXISTS "Owner" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT,
    "oauthType" TEXT,
    "oauthId" TEXT UNIQUE,
    "createdAt" TIMESTAMP DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "Client" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    password TEXT,
    "createdAt" TIMESTAMP DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "Service" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    duration INT NOT NULL,
    price FLOAT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "Staff" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    "createdAt" TIMESTAMP DEFAULT now()
  );`,
  `CREATE TABLE IF NOT EXISTS "Appointment" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "clientId" UUID NOT NULL,
    "serviceId" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "scheduledAt" TIMESTAMP NOT NULL,
    status TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_client FOREIGN KEY ("clientId") REFERENCES "Client"(id),
    CONSTRAINT fk_service FOREIGN KEY ("serviceId") REFERENCES "Service"(id),
    CONSTRAINT fk_staff FOREIGN KEY ("staffId") REFERENCES "Staff"(id)
  );`,
  `CREATE TABLE IF NOT EXISTS "AvailableSlot" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "staffId" UUID NOT NULL,
    "dayOfWeek" INT NOT NULL,
    "startTime" TIMESTAMP NOT NULL,
    "endTime" TIMESTAMP NOT NULL,
    "isRecurring" BOOLEAN DEFAULT TRUE,
    "specificDate" TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT now(),
    CONSTRAINT fk_staff FOREIGN KEY ("staffId") REFERENCES "Staff"(id)
  );`,
  `ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS password TEXT;`,
  `UPDATE "Staff" SET password = '' WHERE password IS NULL;`,
  `ALTER TABLE "Client" ADD COLUMN IF NOT EXISTS password TEXT;`,
  `UPDATE "Client" SET password = '' WHERE password IS NULL;`,

  /* Índices para melhorar performance de consultas entre agendamentos e slots disponíveis */
  `CREATE INDEX IF NOT EXISTS idx_available_slot_staff_id ON "AvailableSlot" ("staffId");`,
  `CREATE INDEX IF NOT EXISTS idx_available_slot_day_of_week ON "AvailableSlot" ("dayOfWeek");`,
  `CREATE INDEX IF NOT EXISTS idx_available_slot_specific_date ON "AvailableSlot" ("specificDate");`,
  `CREATE INDEX IF NOT EXISTS idx_available_slot_is_recurring ON "AvailableSlot" ("isRecurring");`,
  `CREATE INDEX IF NOT EXISTS idx_appointment_staff_id ON "Appointment" ("staffId");`,
  `CREATE INDEX IF NOT EXISTS idx_appointment_scheduled_at ON "Appointment" ("scheduledAt");`,
  `CREATE INDEX IF NOT EXISTS idx_appointment_status ON "Appointment" ("status");`,
  `CREATE INDEX IF NOT EXISTS idx_appointment_client_id ON "Appointment" ("clientId");`,
];

async function main() {
  await client.connect();
  console.log('Conectado ao banco de dados!');
  try {
    const res = await client.query('SELECT schema FROM public."Tenant"');
    const schemas = res.rows.map((r) => r.schema);
    for (const schemaName of schemas) {
      console.log(`Atualizando schema: ${schemaName}`);
      for (const sql of tenantSchemaUpdates) {
        await client.query(`SET search_path TO "${schemaName}"; ${sql}`);
      }
    }
    console.log('Atualização dos schemas concluída!');
  } catch (error) {
    console.error('Erro ao atualizar schemas:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
