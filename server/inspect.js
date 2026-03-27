const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const crop = await prisma.crop.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, images: true }
  });
  console.log(JSON.stringify(crop, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
