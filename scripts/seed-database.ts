import { Client } from 'pg';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  console.log('Iniciando configuração do banco de dados...');

  try {
    await client.connect();

    // Criar um plano padrão
    // Verificar se o plano já existe
    const checkPlanQuery = `
      SELECT id FROM public."Plan" WHERE id = 'default-plan';
    `;
    const planExists = await client.query(checkPlanQuery);

    if (planExists.rows.length === 0) {
      // Criar o plano se não existir
      const createPlanQuery = `
        INSERT INTO public."Plan" (id, name, description, price, features, "createdAt")
        VALUES (
          'default-plan',
          'Plano Básico',
          'Plano básico para estabelecimentos pequenos',
          99.9,
          '{"maxServices": 10, "maxStaff": 5, "maxAppointmentsPerMonth": 100}',
          NOW()
        )
        RETURNING id, name, description, price;
      `;
      const defaultPlan = await client.query(createPlanQuery);
      console.log('Plano padrão criado:', defaultPlan.rows[0]);
    } else {
      console.log('Plano padrão já existe');
    }

    // Criar um admin da plataforma
    // Verificar se o admin já existe
    const checkAdminQuery = `
      SELECT id FROM public."PlatformAdmin" WHERE email = 'admin@agendamento.com';
    `;
    const adminExists = await client.query(checkAdminQuery);

    if (adminExists.rows.length === 0) {
      // Criar o admin se não existir
      const createAdminQuery = `
        INSERT INTO public."PlatformAdmin" (email, name, password, "createdAt")
        VALUES (
          'admin@agendamento.com',
          'Administrador da Plataforma',
          '$2b$10$3FrkzKngV5oVJmSxUdLUs.x/TjD2/nQhRyZlXfRsxtzK2sqyPJc.C', -- senha: 'senha123'
          NOW()
        )
        RETURNING id, email, name;
      `;
      const admin = await client.query(createAdminQuery);
      console.log('Admin da plataforma criado:', admin.rows[0]);
    } else {
      console.log('Admin da plataforma já existe');
    }

    // Função para criar um membro da equipe padrão para um tenant
    async function createDefaultStaffForTenant(tenantSchema: string) {
      try {
        // Verificar se o staff já existe
        const checkStaffQuery = `
          SET search_path TO "${tenantSchema}";
          SELECT id FROM "Staff" WHERE email = 'staff@exemplo.com';
        `;
        const staffExists = await client.query(checkStaffQuery);

        if (staffExists.rows.length === 0) {
          // Criar o staff se não existir
          const createStaffQuery = `
            SET search_path TO "${tenantSchema}";
            INSERT INTO "Staff" (name, email, role, password, "createdAt")
            VALUES (
              'Funcionário Padrão',
              'staff@exemplo.com',
              'Atendente',
              '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', -- senha: 'randompassword'
              NOW()
            )
            RETURNING id, name, email, role;
          `;
          const staff = await client.query(createStaffQuery);
          console.log(
            `Membro da equipe padrão criado para o tenant ${tenantSchema}:`,
            staff.rows[0],
          );
        } else {
          console.log(
            `Membro da equipe padrão já existe para o tenant ${tenantSchema}`,
          );
        }
      } catch (error) {
        console.error(
          `Erro ao criar membro da equipe padrão para o tenant ${tenantSchema}:`,
          error,
        );
      }
    }

    // Verificar se existem tenants e criar um staff padrão para cada um
    const tenantsQuery = `SELECT schema FROM public."Tenant";`;
    const tenants = await client.query(tenantsQuery);
    for (const tenant of tenants.rows) {
      await createDefaultStaffForTenant(tenant.schema);
    }

    console.log('Configuração do banco de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar o banco de dados:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
