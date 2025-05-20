import {
  Module,
  MiddlewareConsumer,
  RequestMethod,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/prisma/prisma.module';
import { TenantMiddleware } from './infra/middleware/tenant.middleware';
import { TenantController } from './interfaces/controllers/tenant.controller';
import { ServiceController } from './interfaces/controllers/service.controller';
import { ClientController } from './interfaces/controllers/client.controller';
import { StaffController } from './interfaces/controllers/staff.controller';
import { AppointmentController } from './interfaces/controllers/appointment.controller';
import { PlanController } from './interfaces/controllers/plan.controller';
import { AuthController } from './interfaces/controllers/auth.controller';
import { AuthModule } from './infra/auth/auth.module';
import { ModuleRef } from '@nestjs/core';
import { setModuleRef } from './infra/decorators/tenant-db.decorator';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
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
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(private moduleRef: ModuleRef) {}

  onModuleInit() {
    setModuleRef(this.moduleRef);
  }

  configure(consumer: MiddlewareConsumer) {
    // Aplicar o middleware de tenant a todas as rotas que começam com /api/tenant
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: 'api/tenant/*', method: RequestMethod.ALL });
  }
}
