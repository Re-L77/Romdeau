import { Controller, Get } from '@nestjs/common';
import { DepartamentosService } from './departamentos.service';

@Controller('api/departamentos')
export class DepartamentosController {
  constructor(private readonly departamentosService: DepartamentosService) {}

  @Get()
  findAll() {
    return this.departamentosService.findAll();
  }
}
