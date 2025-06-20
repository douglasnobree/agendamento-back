import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function initDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Conectado ao banco de dados!');

    // Lê o arquivo SQL de inicialização
    const sqlFilePath = path.join(__dirname, 'db_init.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Executa o script SQL
    console.log('Iniciando execução do script de inicialização...');
    await client.query(sqlScript);
    console.log('Script de inicialização executado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar o banco de dados:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Executa a função
initDatabase();
