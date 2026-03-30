import { Module } from '@nestjs/common';
import { DepreciacionController } from './depreciacion.controller';
import { DepreciacionService } from './depreciacion.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DepreciacionController],
  providers: [DepreciacionService],
})
export class DepreciacionModule {}
