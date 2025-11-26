// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { PrismaClient } from '@/generated/prisma/client';

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
