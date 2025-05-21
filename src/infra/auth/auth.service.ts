import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UseCaseProxy } from '../../application/usecases/usecase-proxy';
import { ValidatePlatformAdminUseCase } from '../../application/usecases/Auth/auth-useCase-validatePlatformAdmin';
import { ValidateTenantOwnerUseCase } from '../../application/usecases/Auth/auth-useCase-validateTenantOwner';
import { ValidateTenantClientUseCase } from '../../application/usecases/Auth/auth-useCase-validateTenantClient';
import { ValidateTenantStaffUseCase } from '../../application/usecases/Auth/auth-useCase-validateTenantStaff';
import { LoginUseCase } from '../../application/usecases/Auth/auth-useCase-login';
import { AuthUsecaseProxyModule } from '../../application/usecases/Auth/auth-usecase-proxy.module';

@Injectable()
export class AuthService {
  constructor(
    @Inject(AuthUsecaseProxyModule.VALIDATE_PLATFORM_ADMIN_USE_CASE)
    private readonly validatePlatformAdminUseCaseProxy: UseCaseProxy<ValidatePlatformAdminUseCase>,
    @Inject(AuthUsecaseProxyModule.VALIDATE_TENANT_OWNER_USE_CASE)
    private readonly validateTenantOwnerUseCaseProxy: UseCaseProxy<ValidateTenantOwnerUseCase>,
    @Inject(AuthUsecaseProxyModule.VALIDATE_TENANT_CLIENT_USE_CASE)
    private readonly validateTenantClientUseCaseProxy: UseCaseProxy<ValidateTenantClientUseCase>,
    @Inject(AuthUsecaseProxyModule.VALIDATE_TENANT_STAFF_USE_CASE)
    private readonly validateTenantStaffUseCaseProxy: UseCaseProxy<ValidateTenantStaffUseCase>,
    @Inject(AuthUsecaseProxyModule.LOGIN_USE_CASE)
    private readonly loginUseCaseProxy: UseCaseProxy<LoginUseCase>,
  ) {}

  async validatePlatformAdmin(email: string, password: string) {
    return this.validatePlatformAdminUseCaseProxy
      .getInstance()
      .execute({ email, password });
  }

  async validateTenantOwner(
    tenantSchema: string,
    email: string,
    password: string,
  ) {
    return this.validateTenantOwnerUseCaseProxy
      .getInstance()
      .execute({ tenantSchema, email, password });
  }

  async validateTenantClient(
    tenantSchema: string,
    email: string,
    password: string,
  ) {
    return this.validateTenantClientUseCaseProxy
      .getInstance()
      .execute({ tenantSchema, email, password });
  }

  async validateTenantStaff(
    tenantSchema: string,
    email: string,
    password: string,
  ) {
    return this.validateTenantStaffUseCaseProxy
      .getInstance()
      .execute({ tenantSchema, email, password });
  }

  async login(user: any) {
    return this.loginUseCaseProxy.getInstance().execute(user);
  }
}
