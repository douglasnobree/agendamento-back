import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostgresModule } from './infra/db/postgres/postgres.module';
import { TenantSchemaMiddleware } from './infra/middleware/tenant-schema.middleware';
import { TenantController } from './interfaces/controllers/tenant.controller';
import { ServiceController } from './interfaces/controllers/service.controller';
import { ClientController } from './interfaces/controllers/client.controller';
import { StaffController } from './interfaces/controllers/staff.controller';
import { AppointmentController } from './interfaces/controllers/appointment.controller';
import { PlanController } from './interfaces/controllers/plan.controller';
import { AuthController } from './interfaces/controllers/auth.controller';
import { AuthModule } from './infra/auth/auth.module';
import { ModuleRef } from '@nestjs/core';
import { TenantUsecaseProxyModule } from './application/usecases/Tenants/tenant-usecase-proxy.module';
import { ServiceUsecaseProxyModule } from './application/usecases/Services/service-usecase-proxy.module';
import { ClientUsecaseProxyModule } from './application/usecases/Clients/client-usecase-proxy.module';
import { StaffUsecaseProxyModule } from './application/usecases/Staff/staff-usecase-proxy.module';
import { AppointmentUsecaseProxyModule } from './application/usecases/Appointments/appointment-usecase-proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostgresModule,
    AuthModule,
    TenantUsecaseProxyModule.register(),
    ServiceUsecaseProxyModule.register(),
    ClientUsecaseProxyModule.register(),
    StaffUsecaseProxyModule.register(),
    AppointmentUsecaseProxyModule.register(),
  ],
  controllers: [
    TenantController,
    ServiceController,
    ClientController,
    StaffController,
    AppointmentController,
    PlanController,
    AuthController,
  ],
  providers: [
    // Nenhum use case diretamente aqui!
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantSchemaMiddleware)
      .forRoutes({ path: 'api/tenant/*', method: RequestMethod.ALL });
  }
}
