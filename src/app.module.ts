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
import { UsecaseProxyModule } from './application/usecases/usecase-proxy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PostgresModule,
    AuthModule,
    UsecaseProxyModule.register()
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
