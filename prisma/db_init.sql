-- Arquivo: db_init.sql
-- Este script cria os schemas e tabelas principais do banco de dados para a aplicação multi-tenant

-- Criação do schema público
CREATE SCHEMA IF NOT EXISTS public;

-- Criação do schema base para tenants (cada tenant terá seu próprio schema)
-- Exemplo de criação de um schema de tenant:
-- CREATE SCHEMA IF NOT EXISTS "tenant1";

-- Tabelas do schema público
CREATE TABLE IF NOT EXISTS public."PlatformAdmin" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password TEXT NOT NULL,
    "createdAt" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."Plan" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price FLOAT NOT NULL,
    features JSONB NOT NULL,
    "createdAt" TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."Tenant" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    schema TEXT UNIQUE NOT NULL,
    "ownerEmail" TEXT UNIQUE NOT NULL,
    "planId" UUID NOT NULL REFERENCES public."Plan"(id),
    "createdAt" TIMESTAMP DEFAULT now()
);

-- Exemplo de criação das tabelas do schema de um tenant
-- Substitua 'tenant1' pelo nome do schema do tenant
-- Repita para cada novo tenant

-- CREATE TABLE IF NOT EXISTS tenant1."Owner" (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     email TEXT UNIQUE NOT NULL,
--     name TEXT NOT NULL,
--     password TEXT,
--     "oauthType" TEXT,
--     "oauthId" TEXT UNIQUE,
--     "createdAt" TIMESTAMP DEFAULT now()
-- );

-- CREATE TABLE IF NOT EXISTS tenant1."Client" (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     email TEXT UNIQUE NOT NULL,
--     name TEXT NOT NULL,
--     phone TEXT,
--     "createdAt" TIMESTAMP DEFAULT now()
-- );

-- CREATE TABLE IF NOT EXISTS tenant1."Service" (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     description TEXT,
--     duration INT NOT NULL,
--     price FLOAT NOT NULL,
--     "createdAt" TIMESTAMP DEFAULT now()
-- );

-- CREATE TABLE IF NOT EXISTS tenant1."Staff" (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name TEXT NOT NULL,
--     role TEXT NOT NULL,
--     email TEXT UNIQUE NOT NULL,
--     password TEXT,
--     "createdAt" TIMESTAMP DEFAULT now()
-- );

-- CREATE TABLE IF NOT EXISTS tenant1."Appointment" (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     "clientId" UUID NOT NULL REFERENCES tenant1."Client"(id),
--     "serviceId" UUID NOT NULL REFERENCES tenant1."Service"(id),
--     "staffId" UUID NOT NULL REFERENCES tenant1."Staff"(id),
--     "scheduledAt" TIMESTAMP NOT NULL,
--     status TEXT NOT NULL,
--     "createdAt" TIMESTAMP DEFAULT now()
-- );

-- Para cada novo tenant, execute a criação do schema e das tabelas acima.
