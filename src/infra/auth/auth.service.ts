import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from '../prisma/tenant.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly tenantService: TenantService,
  ) {}

  async validatePlatformAdmin(email: string, password: string) {
    const admin = await this.prisma.platformAdmin.findUnique({
      where: { email },
    });

    if (!admin) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = true; // await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    return {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
    };
  }

  async validateTenantOwner(
    tenantSchema: string,
    email: string,
    password: string,
  ) {
    try {
      const tenantPrisma =
        await this.tenantService.getTenantPrismaClient(tenantSchema);

      const owner = await tenantPrisma.owner.findUnique({
        where: { email },
      });

      if (!owner) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const isPasswordValid = await bcrypt.compare(password, owner.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const tenant = await this.tenantService.getTenantBySchema(tenantSchema);

      return {
        id: owner.id,
        email: owner.email,
        name: owner.name,
        role: 'owner',
        tenantId: tenant.id,
        tenantSchema: tenant.schema,
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  async validateTenantClient(
    tenantSchema: string,
    email: string,
    password: string,
  ) {
    try {
      const tenantPrisma =
        await this.tenantService.getTenantPrismaClient(tenantSchema);

      const client = await tenantPrisma.client.findUnique({
        where: { email },
      });

      if (!client) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Aqui você precisaria implementar a lógica de validação de senha para clientes
      // Exemplo simplificado:
      // const isPasswordValid = await bcrypt.compare(password, client.password);

      // Para este exemplo, assumimos que o cliente é válido
      const isPasswordValid = true;

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const tenant = await this.tenantService.getTenantBySchema(tenantSchema);

      return {
        id: client.id,
        email: client.email,
        name: client.name,
        role: 'client',
        tenantId: tenant.id,
        tenantSchema: tenant.schema,
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  async validateTenantStaff(
    tenantSchema: string,
    email: string,
    password: string,
  ) {
    try {
      const tenantPrisma =
        await this.tenantService.getTenantPrismaClient(tenantSchema);

      const staff = await tenantPrisma.staff.findUnique({
        where: { email },
      });

      if (!staff) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // Verificar se o campo password existe
      if (!staff.password) {
        throw new UnauthorizedException(
          'Senha não configurada para este usuário',
        );
      }

      const isPasswordValid = await bcrypt.compare(password, staff.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      const tenant = await this.tenantService.getTenantBySchema(tenantSchema);

      return {
        id: staff.id,
        email: staff.email,
        name: staff.name,
        role: 'staff',
        tenantId: tenant.id,
        tenantSchema: tenant.schema,
      };
    } catch (error) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
  }

  async login(user: any) {
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
