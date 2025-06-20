import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// Configuração da conexão com o PostgreSQL
export const dbPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Função para executar consultas SQL
export async function executeQuery(query: string, params: any[] = []) {
  const client = await dbPool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

// Função para executar consultas em um schema específico
export async function executeQueryInSchema(
  schema: string,
  query: string,
  params: any[] = [],
) {
  const client = await dbPool.connect();
  try {
    await client.query(`SET search_path TO "${schema}";`);
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}
