import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuditoriasService } from './auditorias.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';

@Controller('api/auditorias')
export class AuditoriasController {
  constructor(private readonly auditoriasService: AuditoriasService) {}

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() createAuditoriaDto: CreateAuditoriaDto) {
    return this.auditoriasService.create(createAuditoriaDto);
  }

  @Roles(Role.ADMIN, Role.AUDITOR)
  @Get()
  findAll() {
    return this.auditoriasService.findAll();
  }

  @Roles(Role.ADMIN, Role.AUDITOR)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditoriasService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAuditoriaDto: UpdateAuditoriaDto,
  ) {
    return this.auditoriasService.update(id, updateAuditoriaDto);
  }
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.auditoriasService.remove(id);
  }
}
