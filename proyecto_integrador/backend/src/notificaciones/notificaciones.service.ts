import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CreateNotificacionDto) {
    return this.prisma.notificaciones.create({
      data: {
        usuario_id: dto.usuario_id,
        tipo: dto.tipo,
        titulo: dto.titulo,
        mensaje: dto.mensaje,
        accion_url: dto.accion_url,
      },
    });
  }

  async listarPorUsuario(usuarioId: string, soloNoLeidas?: boolean) {
    return this.prisma.notificaciones.findMany({
      where: {
        usuario_id: usuarioId,
        ...(soloNoLeidas ? { leida: false } : {}),
      },
      orderBy: { creado_en: 'desc' },
    });
  }

  async contarNoLeidas(usuarioId: string) {
    return this.prisma.notificaciones.count({
      where: { usuario_id: usuarioId, leida: false },
    });
  }

  async marcarLeida(id: string, usuarioId: string) {
    const notificacion = await this.prisma.notificaciones.findFirst({
      where: { id, usuario_id: usuarioId },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return this.prisma.notificaciones.update({
      where: { id },
      data: { leida: true },
    });
  }

  async marcarTodasLeidas(usuarioId: string) {
    return this.prisma.notificaciones.updateMany({
      where: { usuario_id: usuarioId, leida: false },
      data: { leida: true },
    });
  }
}
