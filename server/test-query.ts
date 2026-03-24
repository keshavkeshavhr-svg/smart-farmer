import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: 'ramu@farmer.in', mode: 'insensitive' } },
          { phone: 'ramu@farmer.in' },
        ],
      },
    });
    console.log("Success:", !!user);
  } catch (err) {
    require('fs').writeFileSync('error.txt', err.message);
    console.error("Prisma Error message:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
