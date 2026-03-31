import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { ResumenDto, FinancieroDto, AuditoriaRecienteDto, AlertaDto, GraficasDto, AuditoriaProgramadaDto } from './dto/dashboard.dto';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';

@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('resumen')
  async getResumen(): Promise<ResumenDto> {
    return this.dashboardService.getResumen();
  }

  @Get('financiero')
  async getFinanciero(): Promise<FinancieroDto> {
    return this.dashboardService.getFinanciero();
  }

  @Get('auditorias-recientes')
  async getAuditoriasRecientes(): Promise<AuditoriaRecienteDto[]> {
    return this.dashboardService.getAuditoriasRecientes();
  }

  @Get('alertas')
  async getAlertas(): Promise<AlertaDto[]> {
    return this.dashboardService.getAlertas();
  }

  @Get('auditorias-programadas')
  async getAuditoriasProgramadas(): Promise<AuditoriaProgramadaDto[]> {
    return this.dashboardService.getAuditoriasProgramadas();
  }

  @Get('graficas')
  async getGraficas(): Promise<GraficasDto> {
    return this.dashboardService.getGraficas();
  }
}
