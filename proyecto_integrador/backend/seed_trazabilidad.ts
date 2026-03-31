
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  const activo = await prisma.activos.findFirst();
  const usuario = await prisma.usuarios.findFirst();
  const oficina = await prisma.oficinas.findFirst();
  const estante = await prisma.estantes.findFirst();

  if (!activo || !usuario || !oficina) {
    console.log('No hay suficientes datos base (activos, usuarios, oficinas) para generar trazabilidad.');
    return;
  }

  console.log(`Generando trazabilidad para activo: ${activo.id}`);

  // 1. Crear un movimiento inicial (Asignación)
  await prisma.movimientos_activos.create({
    data: {
      activo_id: activo.id,
      custodio_nuevo_id: usuario.id,
      oficina_nueva_id: oficina.id,
      estante_nuevo_id: estante?.id,
      fecha_movimiento: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Hace 7 días
      estado_nuevo_id: 1, // Nuevo/Bueno
    }
  });

  // 2. Crear una auditoría con coordenadas PostGIS
  // Nota: ST_GeomFromText no se puede usar directamente en create, usamos raw para las coordenadas si el modelo lo requiere,
  // pero prisma maneja el tipo geography como buffer o similar. 
  // Intentaremos insertar una auditoría básica primero.
  
  await prisma.$executeRaw`
    INSERT INTO logs_auditoria (
      id, activo_id, auditor_id, fecha_hora, estado_reportado_id, 
      coordenadas_gps, comentarios
    ) VALUES (
      uuid_generate_v4(), 
      ${activo.id}::uuid, 
      ${usuario.id}::uuid, 
      NOW() - INTERVAL '2 days', 
      1, 
      ST_GeographyFromText('POINT(-99.1332 19.4326)'), 
      'Auditoría de rutina - Activo localizado correctamente'
    )
  `;

  console.log('Trazabilidad generada exitosamente.');
}

seed()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
