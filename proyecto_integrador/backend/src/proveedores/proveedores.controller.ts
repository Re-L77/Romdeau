import { Controller, Get, Post, Patch, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ProveedoresService } from './proveedores.service';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../auth/roles/roles.enum';

@Controller('api/proveedores')
export class ProveedoresController {
  // Probe route to force registration
  @Get('ping')
  ping() {
    return { status: 'ok', module: 'proveedores' };
  }

  constructor(private readonly proveedoresService: ProveedoresService) { }

  @Get()
  @Roles(Role.ADMIN, Role.AUDITOR)
  findAll() {
    return this.proveedoresService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.AUDITOR)
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.proveedoresService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body()
    body: {
      razon_social: string;
      rfc_tax_id?: string;
      contacto_soporte?: string;
      direccion_fiscal?: string;
      sitio_web?: string;
    },
  ) {
    return this.proveedoresService.create(body);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body()
    body: {
      razon_social?: string;
      rfc_tax_id?: string;
      contacto_soporte?: string;
      direccion_fiscal?: string;
      sitio_web?: string;
      is_active?: boolean;
    },
  ) {
    return this.proveedoresService.update(id, body);
  }
}
