import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando configuração do banco de dados...');

  try {
    // Criar um plano padrão
    const defaultPlan = await prisma.plan.upsert({
      where: { id: 'default-plan' },
      update: {},
      create: {
        id: 'default-plan',
        name: 'Plano Básico',
        description: 'Plano básico para estabelecimentos pequenos',
        price: 99.9,
        features: {
          maxServices: 10,
          maxStaff: 5,
          maxAppointmentsPerMonth: 100,
        },
      },
    });

    console.log('Plano padrão criado:', defaultPlan);

    // Criar um admin da plataforma
    const admin = await prisma.platformAdmin.upsert({
      where: { email: 'admin@agendamento.com' },
      update: {},
      create: {
        email: 'admin@agendamento.com',
        name: 'Administrador da Plataforma',
        password:
          '$2b$10$3FrkzKngV5oVJmSxUdLUs.x/TjD2/nQhRyZlXfRsxtzK2sqyPJc.C', // senha: 'senha123'
      },
    });

    console.log('Admin da plataforma criado:', admin);

    // Função para criar um membro da equipe padrão para um tenant
    async function createDefaultStaffForTenant(tenantSchema: string) {
      const tenantPrisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env.DATABASE_URL,
          },
        },
      }).$extends({
        query: {
          $allModels: {
            async $allOperations({ args, query, operation, model }) {
              // Este trecho faz com que as operações sejam executadas no schema do tenant
              args = {
                ...args,
                ...(model !== 'Tenant' &&
                  model !== 'Plan' &&
                  model !== 'PlatformAdmin' && {
                    $qrb_model_schema: { schema: tenantSchema },
                  }),
              };
              return query(args);
            },
          },
        },
      });

      try {
        // Criar um membro da equipe padrão (staff) para o tenant
        const staff = await tenantPrisma.staff.upsert({
          where: { email: 'staff@exemplo.com' },
          update: {},
          create: {
            name: 'Funcionário Padrão',
            email: 'staff@exemplo.com',
            role: 'Atendente',
            password:
              '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // senha: 'randompassword'
          },
        });

        console.log(
          `Membro da equipe padrão criado para o tenant ${tenantSchema}:`,
          staff,
        );
      } catch (error) {
        console.error(
          `Erro ao criar membro da equipe padrão para o tenant ${tenantSchema}:`,
          error,
        );
      } finally {
        await tenantPrisma.$disconnect();
      }
    }

    // Verificar se existem tenants e criar um staff padrão para cada um
    const tenants = await prisma.tenant.findMany();
    for (const tenant of tenants) {
      await createDefaultStaffForTenant(tenant.schema);
    }

    console.log('Configuração do banco de dados concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar o banco de dados:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
