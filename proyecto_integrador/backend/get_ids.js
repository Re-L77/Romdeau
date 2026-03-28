
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getData() {
  const activo = await prisma.activos.findFirst();
  const usuario = await prisma.usuarios.findFirst();
  const oficina = await prisma.oficinas.findFirst();
  const estante = await prisma.estantes.findFirst();
  
  console.log(JSON.stringify({
    activoId: activo?.id,
    usuarioId: usuario?.id,
    oficinaId: oficina?.id,
    estanteId: estante?.id
  }, null, 2));
  
  await prisma.$disconnect();
}

getData();
