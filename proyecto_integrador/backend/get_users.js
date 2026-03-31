const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.usuarios.findMany({ take: 5, select: { email: true } });
  console.log('USERS:', users);
}
main().catch(console.error).finally(() => prisma.$disconnect());
