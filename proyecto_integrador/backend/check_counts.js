
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const mCount = await prisma.movimientos_activos.count();
  const lCount = await prisma.logs_auditoria.count();
  console.log(`Movimientos: ${mCount}`);
  console.log(`Auditorias: ${lCount}`);
  await prisma.$disconnect();
}

check();
