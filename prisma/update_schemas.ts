// Script: update_schemas.ts
// Atualiza todos os schemas de tenants já criados, aplicando novas tabelas/colunas conforme o modelo base, usando conexão direta com o banco (pg)

import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

const tenantSchemaUpdates = [
  // Criação das tabelas (caso não existam)
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
    "createdAt" TIMESTAMP DEFAULT now()
    password TEXT,
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
  `ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS password TEXT;`,
  `UPDATE "Staff" SET password = '' WHERE password IS NULL;`,
];

async function main() {
  await client.connect();
  console.log('Conectado ao banco de dados!');
  try {
    // Busca todos os schemas de tenants
    const res = await client.query('SELECT schema FROM public."Tenant"');
    const schemas = res.rows.map((r) => r.schema);
    for (const schemaName of schemas) {
      console.log(`Atualizando schema: ${schemaName}`);
      for (const sql of tenantSchemaUpdates) {
        // Executa cada comando no schema do tenant
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
