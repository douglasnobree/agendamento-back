# Sistema de Agendamento SaaS Multi-tenant

Este é um sistema SaaS multi-tenant para agendamento de serviços, com suporte para diferentes tipos de usuários (administradores da plataforma, donos de estabelecimentos e clientes).

## Arquitetura

O sistema utiliza uma estratégia multi-tenant por schema separado no PostgreSQL. Cada estabelecimento tem seu próprio schema isolado, enquanto a plataforma (admins, planos, tenants) fica no schema public.

## Pré-requisitos

- Node.js (v14+ recomendado)
- PostgreSQL (v12+ recomendado)
- npm ou yarn

## Configuração

1. Clone o repositório
2. Instale as dependências:

```bash
npm install
```

3. Configure o arquivo `.env` com suas variáveis de ambiente (veja o arquivo `.env.example`)
4. Execute a configuração do banco de dados:

```bash
npm run db:setup
```

## Executando o Projeto

Para iniciar o servidor em modo de desenvolvimento:

```bash
npm run start:dev
```

O servidor estará disponível em `http://localhost:3000` (ou na porta configurada no arquivo `.env`).

## Endpoints API

### Autenticação

- `POST /api/auth/login` - Login para qualquer tipo de usuário

### Admin da Plataforma

- `GET /api/admin/tenants` - Listar todos os tenants
- `GET /api/admin/tenants/:id` - Obter um tenant específico
- `POST /api/admin/tenants` - Criar um novo tenant
- `GET /api/admin/plans` - Listar todos os planos
- `GET /api/admin/plans/:id` - Obter um plano específico
- `POST /api/admin/plans` - Criar um novo plano
- `PUT /api/admin/plans/:id` - Atualizar um plano
- `DELETE /api/admin/plans/:id` - Excluir um plano

### Tenant (Estabelecimento)

Para acessar os recursos específicos de um tenant, todas as requisições devem incluir o header `X-Tenant-ID` com o ID do tenant.

#### Serviços

- `GET /api/tenant/services` - Listar todos os serviços
- `GET /api/tenant/services/:id` - Obter um serviço específico
- `POST /api/tenant/services` - Criar um novo serviço
- `PUT /api/tenant/services/:id` - Atualizar um serviço
- `DELETE /api/tenant/services/:id` - Excluir um serviço

#### Clientes

- `GET /api/tenant/clients` - Listar todos os clientes
- `GET /api/tenant/clients/:id` - Obter um cliente específico
- `POST /api/tenant/clients` - Criar um novo cliente
- `PUT /api/tenant/clients/:id` - Atualizar um cliente
- `DELETE /api/tenant/clients/:id` - Excluir um cliente

#### Equipe (Staff)

- `GET /api/tenant/staff` - Listar todos os membros da equipe
- `GET /api/tenant/staff/:id` - Obter um membro específico da equipe
- `POST /api/tenant/staff` - Criar um novo membro da equipe
- `PUT /api/tenant/staff/:id` - Atualizar um membro da equipe
- `DELETE /api/tenant/staff/:id` - Excluir um membro da equipe

#### Agendamentos

- `GET /api/tenant/appointments` - Listar todos os agendamentos
- `GET /api/tenant/appointments/:id` - Obter um agendamento específico
- `GET /api/tenant/appointments/client/:clientId` - Listar agendamentos de um cliente
- `POST /api/tenant/appointments` - Criar um novo agendamento
- `PUT /api/tenant/appointments/:id` - Atualizar um agendamento
- `DELETE /api/tenant/appointments/:id` - Excluir um agendamento

## Autenticação

O sistema utiliza autenticação JWT. Para realizar ações, você deve primeiro obter um token de acesso através do endpoint `/api/auth/login`.
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ yarn install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
