import { DynamicModule, Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostgresModule } from '../../../infra/db/postgres/postgres.module';
import { UseCaseProxy } from '../usecase-proxy';
import { ValidatePlatformAdminUseCase } from './auth-useCase-validatePlatformAdmin';
import { ValidateTenantOwnerUseCase } from './auth-useCase-validateTenantOwner';
import { ValidateTenantClientUseCase } from './auth-useCase-validateTenantClient';
import { ValidateTenantStaffUseCase } from './auth-useCase-validateTenantStaff';
import { LoginUseCase } from './auth-useCase-login';
import { PlatformAdminRepositoryPostgres } from '../../../infra/db/postgres/repositories/platform-admin.repository';
import { OwnerRepositoryPostgres } from '../../../infra/db/postgres/repositories/owner.repository';
import { ClientRepositoryPostgres } from '../../../infra/db/postgres/repositories/client.repository';
import { StaffRepositoryPostgres } from '../../../infra/db/postgres/repositories/staff.repository';
import { TenantRepositoryPostgres } from '../../../infra/db/postgres/repositories/tenant.repository';

@Module({
  imports: [PostgresModule, ConfigModule],
})
export class AuthUsecaseProxyModule {
  static VALIDATE_PLATFORM_ADMIN_USE_CASE = 'ValidatePlatformAdminUseCaseProxy';
  static VALIDATE_TENANT_OWNER_USE_CASE = 'ValidateTenantOwnerUseCaseProxy';
  static VALIDATE_TENANT_CLIENT_USE_CASE = 'ValidateTenantClientUseCaseProxy';
  static VALIDATE_TENANT_STAFF_USE_CASE = 'ValidateTenantStaffUseCaseProxy';
  static LOGIN_USE_CASE = 'LoginUseCaseProxy';
  static register(): DynamicModule {
    // Registra primeiro o JwtModule para o uso interno
    const jwtModule = JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    });

    return {
      module: AuthUsecaseProxyModule,
      imports: [jwtModule, PostgresModule],
      providers: [
        {
          provide: 'PlatformAdminRepository',
          useClass: PlatformAdminRepositoryPostgres,
        },
        {
          provide: 'OwnerRepository',
          useClass: OwnerRepositoryPostgres,
        },
        {
          provide: 'ClientRepository',
          useClass: ClientRepositoryPostgres,
        },
        {
          provide: 'StaffRepository',
          useClass: StaffRepositoryPostgres,
        },
        {
          provide: 'TenantRepository',
          useClass: TenantRepositoryPostgres,
        },
        {
          inject: ['PlatformAdminRepository'],
          provide: AuthUsecaseProxyModule.VALIDATE_PLATFORM_ADMIN_USE_CASE,
          useFactory: (repo) =>
            new UseCaseProxy(new ValidatePlatformAdminUseCase(repo)),
        },
        {
          inject: ['OwnerRepository', 'TenantRepository'],
          provide: AuthUsecaseProxyModule.VALIDATE_TENANT_OWNER_USE_CASE,
          useFactory: (ownerRepo, tenantRepo) =>
            new UseCaseProxy(
              new ValidateTenantOwnerUseCase(ownerRepo, tenantRepo),
            ),
        },
        {
          inject: ['ClientRepository', 'TenantRepository'],
          provide: AuthUsecaseProxyModule.VALIDATE_TENANT_CLIENT_USE_CASE,
          useFactory: (clientRepo, tenantRepo) =>
            new UseCaseProxy(
              new ValidateTenantClientUseCase(clientRepo, tenantRepo),
            ),
        },
        {
          inject: ['StaffRepository', 'TenantRepository'],
          provide: AuthUsecaseProxyModule.VALIDATE_TENANT_STAFF_USE_CASE,
          useFactory: (staffRepo, tenantRepo) =>
            new UseCaseProxy(
              new ValidateTenantStaffUseCase(staffRepo, tenantRepo),
            ),
        },
        {
          inject: [JwtService],
          provide: AuthUsecaseProxyModule.LOGIN_USE_CASE,
          useFactory: (jwtService: JwtService) =>
            new UseCaseProxy(new LoginUseCase(jwtService)),
        },
      ],
      exports: [
        AuthUsecaseProxyModule.VALIDATE_PLATFORM_ADMIN_USE_CASE,
        AuthUsecaseProxyModule.VALIDATE_TENANT_OWNER_USE_CASE,
        AuthUsecaseProxyModule.VALIDATE_TENANT_CLIENT_USE_CASE,
        AuthUsecaseProxyModule.VALIDATE_TENANT_STAFF_USE_CASE,
        AuthUsecaseProxyModule.LOGIN_USE_CASE,
      ],
    };
  }
}
