import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

interface CreateTenantParams {
  name: string;
  schema: string;
  ownerEmail: string;
  planId: string;
}

export async function createTenant({
  name,
  schema,
  ownerEmail,
  planId,
}: CreateTenantParams): Promise<any> {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Início da transação
    await client.query('BEGIN');

    // 1. Criar schema do tenant
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);

    // 2. Registrar o tenant na tabela Tenant
    const createTenantQuery = `
      INSERT INTO public."Tenant" (name, schema, "ownerEmail", "planId", "createdAt")
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, name, schema, "ownerEmail"
    `;

    const tenantResult = await client.query(createTenantQuery, [
      name,
      schema,
      ownerEmail,
      planId,
    ]);
    const tenant = tenantResult.rows[0];

    // 3. Criar tabelas necessárias no schema do tenant
    const createTablesQueries = [
      `CREATE TABLE IF NOT EXISTS "${schema}"."Owner" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT,
        "oauthType" TEXT,
        "oauthId" TEXT UNIQUE,
        "createdAt" TIMESTAMP DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS "${schema}"."Client" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        phone TEXT,
        "createdAt" TIMESTAMP DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS "${schema}"."Service" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        duration INT NOT NULL,
        price FLOAT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS "${schema}"."Staff" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        "createdAt" TIMESTAMP DEFAULT now()
      )`,
      `CREATE TABLE IF NOT EXISTS "${schema}"."Appointment" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "clientId" UUID NOT NULL,
        "serviceId" UUID NOT NULL,
        "staffId" UUID NOT NULL,
        "scheduledAt" TIMESTAMP NOT NULL,
        status TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT now(),
        CONSTRAINT fk_client FOREIGN KEY ("clientId") REFERENCES "${schema}"."Client"(id),
        CONSTRAINT fk_service FOREIGN KEY ("serviceId") REFERENCES "${schema}"."Service"(id),
        CONSTRAINT fk_staff FOREIGN KEY ("staffId") REFERENCES "${schema}"."Staff"(id)
      )`,
      `CREATE TABLE IF NOT EXISTS "${schema}"."AvailableSlot" (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "staffId" UUID NOT NULL,
        "dayOfWeek" INT NOT NULL,
        "startTime" TIMESTAMP NOT NULL,
        "endTime" TIMESTAMP NOT NULL,
        "isRecurring" BOOLEAN DEFAULT TRUE,
        "specificDate" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT now(),
        CONSTRAINT fk_staff FOREIGN KEY ("staffId") REFERENCES "${schema}"."Staff"(id)
      )`,
      /* Índices para melhorar performance de consultas entre agendamentos e slots disponíveis */
      `CREATE INDEX IF NOT EXISTS idx_available_slot_staff_id ON "${schema}"."AvailableSlot" ("staffId")`,
      `CREATE INDEX IF NOT EXISTS idx_available_slot_day_of_week ON "${schema}"."AvailableSlot" ("dayOfWeek")`,
      `CREATE INDEX IF NOT EXISTS idx_available_slot_specific_date ON "${schema}"."AvailableSlot" ("specificDate")`,
      `CREATE INDEX IF NOT EXISTS idx_available_slot_is_recurring ON "${schema}"."AvailableSlot" ("isRecurring")`,
      `CREATE INDEX IF NOT EXISTS idx_appointment_staff_id ON "${schema}"."Appointment" ("staffId")`,
      `CREATE INDEX IF NOT EXISTS idx_appointment_scheduled_at ON "${schema}"."Appointment" ("scheduledAt")`,
      `CREATE INDEX IF NOT EXISTS idx_appointment_status ON "${schema}"."Appointment" ("status")`,
      `CREATE INDEX IF NOT EXISTS idx_appointment_client_id ON "${schema}"."Appointment" ("clientId")`,
    ];

    for (const query of createTablesQueries) {
      await client.query(query);
    }

    // Confirmar a transação
    await client.query('COMMIT');

    console.log(`Tenant "${name}" (schema: ${schema}) criado com sucesso!`);
    return tenant;
  } catch (error) {
    // Em caso de erro, reverter a transação
    await client.query('ROLLBACK');
    console.error('Erro ao criar tenant:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Se for executado diretamente como script
if (require.main === module) {
  // Exemplo de uso via linha de comando
  const args = process.argv.slice(2);
  if (args.length < 3) {
    console.error(
      'Uso: node create-tenant.js <nome> <schema> <email> [planId]',
    );
    process.exit(1);
  }

  const [name, schema, ownerEmail] = args;
  const planId = args[3] || 'default-plan'; // Usa o plano padrão se não for especificado

  createTenant({ name, schema, ownerEmail, planId })
    .then((tenant) => {
      console.log('Tenant criado:', tenant);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Falha ao criar tenant:', error);
      process.exit(1);
    });
}
