import { DynamicModule, Module } from '@nestjs/common';
import { ClientRepositoryPrisma } from '../../../infra/db/prisma/repositories/client.repository';
import { ListClientsUseCase } from './client-useCase-list';
import { GetClientByIdUseCase } from './client-useCase-getById';
import { CreateClientUseCase } from './client-useCase-create';
import { UpdateClientUseCase } from './client-useCase-update';
import { RemoveClientUseCase } from './client-useCase-remove';
import { UseCaseProxy } from '../usecase-proxy';
import { PrismaModule } from '../../../infra/db/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
})
export class ClientUsecaseProxyModule {
  static LIST_CLIENTS_USE_CASE = 'listClientsUsecaseProxy';
  static GET_CLIENT_BY_ID_USE_CASE = 'getClientByIdUsecaseProxy';
  static CREATE_CLIENT_USE_CASE = 'createClientUsecaseProxy';
  static UPDATE_CLIENT_USE_CASE = 'updateClientUsecaseProxy';
  static REMOVE_CLIENT_USE_CASE = 'removeClientUsecaseProxy';

  static register(): DynamicModule {
    return {
      module: ClientUsecaseProxyModule,
      providers: [
        {
          inject: [ClientRepositoryPrisma],
          provide: ClientUsecaseProxyModule.LIST_CLIENTS_USE_CASE,
          useFactory: (repo: ClientRepositoryPrisma) =>
            new UseCaseProxy(new ListClientsUseCase(repo)),
        },
        {
          inject: [ClientRepositoryPrisma],
          provide: ClientUsecaseProxyModule.GET_CLIENT_BY_ID_USE_CASE,
          useFactory: (repo: ClientRepositoryPrisma) =>
            new UseCaseProxy(new GetClientByIdUseCase(repo)),
        },
        {
          inject: [ClientRepositoryPrisma],
          provide: ClientUsecaseProxyModule.CREATE_CLIENT_USE_CASE,
          useFactory: (repo: ClientRepositoryPrisma) =>
            new UseCaseProxy(new CreateClientUseCase(repo)),
        },
        {
          inject: [ClientRepositoryPrisma],
          provide: ClientUsecaseProxyModule.UPDATE_CLIENT_USE_CASE,
          useFactory: (repo: ClientRepositoryPrisma) =>
            new UseCaseProxy(new UpdateClientUseCase(repo)),
        },
        {
          inject: [ClientRepositoryPrisma],
          provide: ClientUsecaseProxyModule.REMOVE_CLIENT_USE_CASE,
          useFactory: (repo: ClientRepositoryPrisma) =>
            new UseCaseProxy(new RemoveClientUseCase(repo)),
        },
      ],
      exports: [
        ClientUsecaseProxyModule.LIST_CLIENTS_USE_CASE,
        ClientUsecaseProxyModule.GET_CLIENT_BY_ID_USE_CASE,
        ClientUsecaseProxyModule.CREATE_CLIENT_USE_CASE,
        ClientUsecaseProxyModule.UPDATE_CLIENT_USE_CASE,
        ClientUsecaseProxyModule.REMOVE_CLIENT_USE_CASE,
      ],
    };
  }
}
