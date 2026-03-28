import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { SupabaseAuthGuard } from '../auth/supabase-auth/supabase-auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';

@UseGuards(SupabaseAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('health-score')
  getHealthScore() {
    return this.analyticsService.getHealthScore();
  }

  @Get('user-performance')
  getUserPerformance() {
    return this.analyticsService.getUserPerformance();
  }

  @Get('cost-by-department')
  getCostByDepartment() {
    return this.analyticsService.getCostByDepartment();
  }

  @Get('temporal-comparison')
  getTemporalComparison() {
    return this.analyticsService.getTemporalComparison();
  }

  @Get('critical-assets')
  getCriticalAssets() {
    return this.analyticsService.getCriticalAssets();
  }

  @Get('movements-by-month')
  getMovementsByMonth() {
    return this.analyticsService.getMovementsByMonth();
  }

  @Get('operational-times')
  getOperationalTimes() {
    return this.analyticsService.getOperationalTimes();
  }

  @Get('depreciation-projection')
  getDepreciationProjection() {
    return this.analyticsService.getDepreciationProjection();
  }

  @Get('top-moved-assets')
  getTopMovedAssets() {
    return this.analyticsService.getTopMovedAssets();
  }
}
