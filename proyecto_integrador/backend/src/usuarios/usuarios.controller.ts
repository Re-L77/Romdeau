import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';

interface CreateUsuarioBody {
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  password?: string;
  rol_id?: number;
  activo?: boolean;
  foto_perfil_url?: string | null;
  telefono?: string | null;
  departamento_id?: number | null;
}

interface UpdateUsuarioBody {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string | null;
  email?: string;
  rol_id?: number;
  activo?: boolean;
  foto_perfil_url?: string | null;
  telefono?: string | null;
  departamento_id?: number | null;
}

interface UpdateFotoPerfilBody {
  foto_perfil_url: string;
}

interface AuthenticatedRequest {
  user?: {
    id: string;
    rol_id: Role;
  };
}

@Controller('api/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() body: CreateUsuarioBody) {
    return this.usuariosService.create(body);
  }

  @Get()
  @Roles(Role.ADMIN, Role.AUDITOR)
  findAll(@Query('order') order: 'asc' | 'desc' = 'desc') {
    return this.usuariosService.findAll(order);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id/foto-perfil')
  updateFotoPerfil(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateFotoPerfilBody,
  ) {
    return this.usuariosService.updateFotoPerfil(id, body.foto_perfil_url);
  }

  @Post(':id/foto-perfil/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFotoPerfil(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usuariosService.uploadFotoPerfilToStorage(id, file);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUsuarioBody,
    @Request() req: AuthenticatedRequest,
  ) {
    const user = req.user;
    if (user?.rol_id === Role.EMPLEADO) {
      // Un empleado solo puede editar su propio perfil
      if (user.id !== id) {
        throw new ForbiddenException(
          'No tienes permiso para editar a otro usuario.',
        );
      }
      // Un empleado no puede cambiar su rol ni estado activo
      delete body.rol_id;
      delete body.activo;
    }
    return this.usuariosService.update(id, body);
  }

  @Patch(':id/password')
  @Roles(Role.ADMIN)
  changePassword(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: { password: string },
  ) {
    return this.usuariosService.changePassword(id, body.password);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.AUDITOR)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usuariosService.remove(id);
  }
}
