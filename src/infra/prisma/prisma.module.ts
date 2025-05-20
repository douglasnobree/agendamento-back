import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TenantService } from './tenant.service';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [PrismaService, TenantService],
  exports: [PrismaService, TenantService],
})
export class PrismaModule {}
