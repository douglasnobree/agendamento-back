import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UseCase } from '../useCase';

export interface LoginUserDto {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId?: string;
  tenantSchema?: string;
}

export interface LoginResult {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId?: string;
    tenantSchema?: string;
  };
}

@Injectable()
export class LoginUseCase implements UseCase<LoginUserDto, LoginResult> {
  constructor(private readonly jwtService: JwtService) {}

  async execute(user: LoginUserDto): Promise<LoginResult> {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenantSchema: user.tenantSchema,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantSchema: user.tenantSchema,
      },
    };
  }
}
