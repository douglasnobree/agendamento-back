import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PostgresService } from '../db/postgres/postgres.service';
import { TenantService } from '../prisma/tenant.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly postgres: PostgresService,
    private readonly tenantService: TenantService,
  ) {}

  async validatePlatformAdmin(email: string, password: string) {
    const result = await this.postgres.query(
      'SELECT * FROM public."PlatformAdmin" WHERE email = $1',
      [email],
    );
    const admin = result.rows[0];
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
      const ownerResult = await this.postgres.query(
        `SELECT * FROM "${tenantSchema}"."Owner" WHERE email = $1`,
        [email],
      );
      const owner = ownerResult.rows[0];
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
      const clientResult = await this.postgres.query(
        `SELECT * FROM "${tenantSchema}"."Client" WHERE email = $1`,
        [email],
      );
      const client = clientResult.rows[0];
      if (!client) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
      // const isPasswordValid = await bcrypt.compare(password, client.password);
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
      const staffResult = await this.postgres.query(
        `SELECT * FROM "${tenantSchema}"."Staff" WHERE email = $1`,
        [email],
      );
      const staff = staffResult.rows[0];
      if (!staff) {
        throw new UnauthorizedException('Credenciais inválidas');
      }
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
