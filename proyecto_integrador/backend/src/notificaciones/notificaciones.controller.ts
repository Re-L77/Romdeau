import { Controller, Get, Patch, Param, Query, Req } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';

@Controller('api/notificaciones')
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  @Get()
  async listar(@Req() req: any, @Query('no_leidas') noLeidas?: string) {
    const usuarioId = req.user?.id;
    const soloNoLeidas = noLeidas === 'true';
    return this.notificacionesService.listarPorUsuario(usuarioId, soloNoLeidas);
  }

  @Get('no-leidas/count')
  async contarNoLeidas(@Req() req: any) {
    const usuarioId = req.user?.id;
    const count = await this.notificacionesService.contarNoLeidas(usuarioId);
    return { count };
  }

  @Patch(':id/leer')
  async marcarLeida(@Param('id') id: string, @Req() req: any) {
    const usuarioId = req.user?.id;
    return this.notificacionesService.marcarLeida(id, usuarioId);
  }

  @Patch('leer-todas')
  async marcarTodasLeidas(@Req() req: any) {
    const usuarioId = req.user?.id;
    return this.notificacionesService.marcarTodasLeidas(usuarioId);
  }
}
