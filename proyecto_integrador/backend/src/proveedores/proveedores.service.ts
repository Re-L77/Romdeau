import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ProveedorCreateDto {
  razon_social: string;
  rfc_tax_id?: string;
  contacto_soporte?: string;
  direccion_fiscal?: string;
  sitio_web?: string;
  nombre_comercial?: string;
  telefono?: string;
  telefono_alternativo?: string;
  contacto_nombre?: string;
  contacto_puesto?: string;
  categoria?: string;
  descripcion_servicios?: string;
  calificacion?: string;
  notas?: string;
}

interface ProveedorUpdateDto {
  razon_social?: string;
  rfc_tax_id?: string;
  contacto_soporte?: string;
  direccion_fiscal?: string;
  sitio_web?: string;
  is_active?: boolean;
  nombre_comercial?: string;
  telefono?: string;
  telefono_alternativo?: string;
  contacto_nombre?: string;
  contacto_puesto?: string;
  categoria?: string;
  descripcion_servicios?: string;
  calificacion?: string;
  notas?: string;
}

@Injectable()
export class ProveedoresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const proveedores = await this.prisma.proveedores.findMany({
      include: {
        datos_financieros: {
          select: {
            costo_adquisicion: true,
            valor_libro_actual: true,
            fecha_compra: true,
            fin_garantia: true,
          },
        },
      },
      orderBy: {
        razon_social: 'asc',
      },
    });

    return proveedores;
  }

  async findOne(id: string) {
    const proveedor = await this.prisma.proveedores.findUnique({
      where: { id },
      include: {
        datos_financieros: {
          select: {
            costo_adquisicion: true,
            valor_libro_actual: true,
            fecha_compra: true,
            fin_garantia: true,
          },
        },
      },
    });

    if (!proveedor) {
      throw new NotFoundException(`Proveedor con id ${id} no encontrado`);
    }

    return proveedor;
  }

  async create(dto: ProveedorCreateDto) {
    return this.prisma.proveedores.create({
      data: {
        razon_social: dto.razon_social,
        rfc_tax_id: dto.rfc_tax_id ?? null,
        contacto_soporte: dto.contacto_soporte ?? null,
        direccion_fiscal: dto.direccion_fiscal ?? null,
        sitio_web: dto.sitio_web ?? null,
        is_active: true,
        nombre_comercial: dto.nombre_comercial ?? null,
        telefono: dto.telefono ?? null,
        telefono_alternativo: dto.telefono_alternativo ?? null,
        contacto_nombre: dto.contacto_nombre ?? null,
        contacto_puesto: dto.contacto_puesto ?? null,
        categoria: dto.categoria ?? null,
        descripcion_servicios: dto.descripcion_servicios ?? null,
        calificacion: dto.calificacion ?? null,
        notas: dto.notas ?? null,
      },
    });
  }

  async update(id: string, dto: ProveedorUpdateDto) {
    await this.findOne(id);
    const { notas, ...rest } = dto;
    return this.prisma.proveedores.update({
      where: { id },
      data: {
        ...rest,
        ...(notas !== undefined ? { notas: notas ?? null } : {}),
      },
    });
  }
}
