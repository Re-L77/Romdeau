import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const proveedores = await prisma.proveedores.findMany();
    console.log('Proveedores found:', proveedores.length);
    console.log('First 3 providers:', JSON.stringify(proveedores.slice(0, 3), null, 2));
  } catch (error) {
    console.error('Error fetching providers:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
