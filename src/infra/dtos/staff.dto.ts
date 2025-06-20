import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class CreateStaffDto {
  @ApiProperty({
    description: 'Nome do membro da equipe',
    example: 'Maria Souza',
  })
  @IsString()
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  name: string;

  @ApiProperty({
    description: 'Email do membro da equipe',
    example: 'maria@empresa.com',
  })
  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  email: string;

  @ApiProperty({ description: 'Cargo', example: 'Atendente' })
  @IsString()
  @IsNotEmpty({ message: 'O cargo é obrigatório' })
  role: string;

  @ApiProperty({
    description: 'Senha do membro da equipe',
    example: 'senha123',
  })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}

export class UpdateStaffDto {
  @ApiProperty({
    description: 'Nome do membro da equipe',
    example: 'Maria Souza',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Email do membro da equipe',
    example: 'maria@empresa.com',
    required: false,
  })
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @ApiProperty({ description: 'Cargo', example: 'Atendente', required: false })
  @IsString()
  role?: string;

  @ApiProperty({
    description: 'Senha do membro da equipe',
    example: 'senha123',
    required: false,
  })
  @IsString()
  password?: string;
}
