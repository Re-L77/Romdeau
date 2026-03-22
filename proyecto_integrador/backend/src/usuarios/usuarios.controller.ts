import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsuariosService } from './usuarios.service';

interface CreateUsuarioBody {
  id: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno?: string | null;
  email: string;
  rol_id?: number;
  activo?: boolean;
  foto_perfil_url?: string | null;
}

interface UpdateUsuarioBody {
  nombres?: string;
  apellido_paterno?: string;
  apellido_materno?: string | null;
  email?: string;
  rol_id?: number;
  activo?: boolean;
  foto_perfil_url?: string | null;
}

interface UpdateFotoPerfilBody {
  foto_perfil_url: string;
}

@Controller('api/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() body: CreateUsuarioBody) {
    return this.usuariosService.create(body);
  }

  @Get()
  findAll() {
    return this.usuariosService.findAll();
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
  ) {
    return this.usuariosService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.usuariosService.remove(id);
  }
}
