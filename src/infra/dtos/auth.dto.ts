import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export enum UserType {
  ADMIN = 'admin',
  OWNER = 'owner',
  CLIENT = 'client',
  STAFF = 'staff',
}

export class LoginDto {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@exemplo.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'senha123',
  })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;

  @ApiProperty({
    description:
      'Schema do tenant (obrigatório para login como owner, client ou staff)',
    example: 'tenant_salao_xyz_1717171717',
    required: false,
  })
  @IsString()
  @IsOptional()
  tenantSchema?: string;

  @ApiProperty({
    description: 'Tipo de usuário',
    example: 'owner',
    enum: UserType,
  })
  @IsEnum(UserType, { message: 'Tipo de usuário inválido' })
  @IsNotEmpty({ message: 'O tipo de usuário é obrigatório' })
  userType: 'admin' | 'owner' | 'client' | 'staff';
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Informações do usuário',
    example: {
      id: 'abcd1234-efgh-5678-ijkl-90mnopqrstuv',
      email: 'usuario@exemplo.com',
      name: 'Nome do Usuário',
      role: 'owner',
      tenantId: 'abcd1234-efgh-5678-ijkl-90mnopqrstuv',
      tenantSchema: 'tenant_salao_xyz_1717171717',
    },
  })
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenantId?: string;
    tenantSchema?: string;
  };
}
