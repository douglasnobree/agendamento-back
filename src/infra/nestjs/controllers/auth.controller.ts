import {
  Controller,
  Post,
  Body,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginDto, LoginResponseDto } from '../../dtos/auth.dto';

@ApiTags('autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  @ApiOperation({ summary: 'Autenticar usuário e obter token JWT' })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciais de login do usuário',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticação bem-sucedida',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Dados inválidos ou schema do tenant não informado quando necessário',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas',
  })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const tenantSchema = (req as any).tenantSchema;
    let user;
    console.log('tenantSchema', tenantSchema);
    console.log('loginDto', loginDto);
    switch (loginDto.userType) {
      case 'admin':
        user = await this.authService.validatePlatformAdmin(
          loginDto.email,
          loginDto.password,
        );
        break;

      case 'owner':
        if (!loginDto.tenantSchema) {
          throw new BadRequestException(
            'Schema do tenant é necessário para login como dono de estabelecimento',
          );
        }
        user = await this.authService.validateTenantOwner(
          loginDto.tenantSchema,
          loginDto.email,
          loginDto.password,
        );
        break;
      case 'client':
        if (!loginDto.tenantSchema) {
          throw new BadRequestException(
            'Schema do tenant é necessário para login como cliente',
          );
        }
        user = await this.authService.validateTenantClient(
          loginDto.tenantSchema,
          loginDto.email,
          loginDto.password,
        );
        break;

      case 'staff':
        if (!loginDto.tenantSchema) {
          throw new BadRequestException(
            'Schema do tenant é necessário para login como membro da equipe',
          );
        }
        user = await this.authService.validateTenantStaff(
          loginDto.tenantSchema,
          loginDto.email,
          loginDto.password,
        );
        break;

      default:
        throw new BadRequestException('Tipo de usuário inválido');
    }

    return this.authService.login(user);
  }
}
