import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

async function verify() {
  console.log('--- Iniciando verificación de datos reales de proveedores ---');
  console.log('Conectando a:', process.env.DATABASE_URL?.split('@')[1] || 'URL no encontrada');

  const prisma = new PrismaClient();

  try {
    // 1. Contar registros
    const count = await prisma.proveedores.count();
    console.log(`Total de proveedores en la BD: ${count}`);

    if (count > 0) {
      // 2. Obtener los primeros 3 proveedores
      const samples = await prisma.proveedores.findMany({
        take: 3,
        select: {
          id: true,
          razon_social: true,
          is_active: true,
          nombre_comercial: true
        }
      });
      console.log('Muestras de datos reales:');
      samples.forEach((p, i) => {
        console.log(`${i + 1}. [${p.id}] ${p.nombre_comercial || p.razon_social} (Activo: ${p.is_active})`);
      });
    } else {
      console.log('AVISO: La tabla de proveedores está vacía en la base de datos.');
    }

  } catch (error) {
    console.error('ERROR al consultar la base de datos:', error);
  } finally {
    await prisma.$disconnect();
    console.log('--- Verificación finalizada ---');
  }
}

verify();
