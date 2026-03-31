import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuditoriasprogramadasService } from './auditorias-programadas.service';
import { CreateAuditoriaProgramadaDto } from './dto/create-auditoria-programada.dto';
import { UpdateAuditoriaProgramadaDto } from './dto/update-auditoria-programada.dto';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';

@Controller('api/auditorias-programadas')
export class AuditoriasprogramadasController {
  constructor(
    private readonly auditoriasService: AuditoriasprogramadasService,
  ) {}

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() createAuditoriaProgramadaDto: CreateAuditoriaProgramadaDto) {
    return this.auditoriasService.create(createAuditoriaProgramadaDto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.AUDITOR)
  findAll() {
    return this.auditoriasService.findAll();
  }

  @Get('por-estado/:estado_id')
  @Roles(Role.ADMIN, Role.AUDITOR)
  findByStatus(@Param('estado_id') estado_id: string) {
    return this.auditoriasService.findByStatus(parseInt(estado_id, 10));
  }

  @Get('estados')
  @Roles(Role.ADMIN, Role.AUDITOR)
  getAllStates() {
    return this.auditoriasService.getAllStates();
  }

  @Get('filtros/auditores')
  @Roles(Role.ADMIN, Role.AUDITOR)
  async getAllAuditores(): Promise<any[]> {
    return await this.auditoriasService.getAllAuditores();
  }

  @Get('filtros/edificios')
  @Roles(Role.ADMIN, Role.AUDITOR)
  async getAllEdificios(): Promise<any[]> {
    return await this.auditoriasService.getAllEdificios();
  }

  @Get('filtros/sedes')
  @Roles(Role.ADMIN, Role.AUDITOR)
  async getAllSedes(): Promise<any[]> {
    return await this.auditoriasService.getAllSedes();
  }

  @Get('filtros/formulario')
  @Roles(Role.ADMIN, Role.AUDITOR)
  getFormCatalogs() {
    return this.auditoriasService.getFormCatalogs();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.AUDITOR)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.auditoriasService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateAuditoriaProgramadaDto: UpdateAuditoriaProgramadaDto,
  ) {
    return this.auditoriasService.update(id, updateAuditoriaProgramadaDto);
  }

  @Patch(':id/estado/:estado_id')
  @Roles(Role.ADMIN, Role.AUDITOR)
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('estado_id') estado_id: string,
  ) {
    return this.auditoriasService.updateStatus(id, parseInt(estado_id, 10));
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.auditoriasService.remove(id);
  }
}
