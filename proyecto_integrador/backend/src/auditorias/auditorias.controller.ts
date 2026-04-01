import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuditoriasService } from './auditorias.service';
import { CreateAuditoriaDto } from './dto/create-auditoria.dto';
import { UpdateAuditoriaDto } from './dto/update-auditoria.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';

/**
 * Controlador para gestionar auditorías de activos
 * Proporciona endpoints para crear, leer, actualizar y eliminar auditorías
 */
@Controller('api/auditorias')
export class AuditoriasController {
  constructor(private readonly auditoriasService: AuditoriasService) {}

  /**
   * Crea una nueva auditoría de activos
   * @requires ADMIN role
   * @param createAuditoriaDto Datos de la auditoría a crear
   */
  @Roles(Role.ADMIN, Role.AUDITOR)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAuditoriaDto: CreateAuditoriaDto) {
    return this.auditoriasService.create(createAuditoriaDto);
  }

  /**
   * Obtiene todas las auditorías registradas
   * @requires ADMIN or AUDITOR role
   */
  @Roles(Role.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.auditoriasService.findAll();
  }

  /**
   * Obtiene todas las auditorías de un activo específico
   * @requires ADMIN or AUDITOR role
   * @param activoId ID del activo
   */
  @Roles(Role.ADMIN, Role.AUDITOR)
  @Get('activo/:activoId')
  @HttpCode(HttpStatus.OK)
  findByActivo(@Param('activoId') activoId: string) {
    return this.auditoriasService.findByActivo(activoId);
  }

  /**
   * Obtiene todas las auditorías realizadas por un auditor específico
   * @requires ADMIN or AUDITOR role
   * @param auditorId ID del auditor
   */
  @Roles(Role.ADMIN, Role.AUDITOR)
  @Get('auditor/:auditorId')
  @HttpCode(HttpStatus.OK)
  findByAuditor(@Param('auditorId') auditorId: string) {
    return this.auditoriasService.findByAuditor(auditorId);
  }

  /**
   * Obtiene una auditoría por ID
   * @requires ADMIN or AUDITOR role
   * @param id ID de la auditoría
   */
  @Roles(Role.ADMIN, Role.AUDITOR)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.auditoriasService.findOne(id);
  }

  /**
   * Actualiza una auditoría existente
   * @requires ADMIN role
   * @param id ID de la auditoría
   * @param updateAuditoriaDto Datos a actualizar
   */
  @Roles(Role.ADMIN)
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateAuditoriaDto: UpdateAuditoriaDto,
  ) {
    return this.auditoriasService.update(id, updateAuditoriaDto);
  }

  /**
   * Elimina una auditoría
   * @requires ADMIN role
   * @param id ID de la auditoría a eliminar
   */
  @Roles(Role.ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.auditoriasService.remove(id);
  }
}
