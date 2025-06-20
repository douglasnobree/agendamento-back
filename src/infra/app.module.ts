import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostgresModule } from './db/postgres/postgres.module';
import { TenantSchemaMiddleware } from './middleware/tenant-schema.middleware';
import { TenantController } from './controllers/tenant.controller';
import { ServiceController } from './controllers/service.controller';
import { ClientController } from './controllers/client.controller';
import { StaffController } from './controllers/staff.controller';
import { AppointmentController } from './controllers/appointment.controller';
import { PlanController } from './controllers/plan.controller';
import { AuthController } from './controllers/auth.controller';
import { AvailableSlotController } from './controllers/available-slot.controller';
import { AuthModule } from './auth/auth.module';
import { ModuleRef } from '@nestjs/core';
import { TenantUsecaseProxyModule } from '../application/usecases/Tenants/tenant-usecase-proxy.module';
import { ServiceUsecaseProxyModule } from '../application/usecases/Services/service-usecase-proxy.module';
import { ClientUsecaseProxyModule } from '../application/usecases/Clients/client-usecase-proxy.module';
import { StaffUsecaseProxyModule } from '../application/usecases/Staff/staff-usecase-proxy.module';
import { AppointmentUsecaseProxyModule } from '../application/usecases/Appointments/appointment-usecase-proxy.module';
import { PlanUsecaseProxyModule } from '../application/usecases/Plans/plan-usecase-proxy.module';
import { AvailableSlotUsecaseProxyModule } from '../application/usecases/AvailableSlots/available-slot-usecase-proxy.module';

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
    PlanUsecaseProxyModule.register(),
    AvailableSlotUsecaseProxyModule.register(),
  ],
  controllers: [
    TenantController,
    ServiceController,
    ClientController,
    StaffController,
    AppointmentController,
    PlanController,
    AuthController,
    AvailableSlotController,
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
