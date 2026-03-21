import { Controller, Get, UseGuards } from '@nestjs/common';
import { ActivosService } from './activos.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';

@Controller('api/activos')
export class ActivosController {
  constructor(private readonly activosService: ActivosService) {}

  @Get()
  @UseGuards(SupabaseAuthGuard)
  findAll() {
    return this.activosService.findAll();
  }
}
