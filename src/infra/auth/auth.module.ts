import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { PostgresModule } from '../db/postgres/postgres.module';
import { AuthUsecaseProxyModule } from '../../application/usecases/Auth/auth-usecase-proxy.module';
import { PlatformAdminRepositoryPostgres } from '../db/postgres/repositories/platform-admin.repository';
import { OwnerRepositoryPostgres } from '../db/postgres/repositories/owner.repository';
import { ClientRepositoryPostgres } from '../db/postgres/repositories/client.repository';
import { StaffRepositoryPostgres } from '../db/postgres/repositories/staff.repository';
import { TenantRepositoryPostgres } from '../db/postgres/repositories/tenant.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '1d'),
        },
      }),
    }),
    PostgresModule,
    AuthUsecaseProxyModule.register(),
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
