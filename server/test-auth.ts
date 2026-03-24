import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testAuth() {
  try {
    const user = await prisma.user.findFirst({
      where: { role: 'FARMER' }
    });
    console.log("Found farmer:", user?.email, user?.phone);

    if (user) {
      const isMatch = await bcrypt.compare('Farmer@123', user.passwordHash);
      console.log("Password match for Farmer@123:", isMatch);
    }

    const buyer = await prisma.user.findFirst({
      where: { role: 'BUYER' }
    });
    console.log("Found buyer:", buyer?.email, buyer?.phone);

    if (buyer) {
      const isMatch = await bcrypt.compare('Buyer@123', buyer.passwordHash);
      console.log("Password match for Buyer@123:", isMatch);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
