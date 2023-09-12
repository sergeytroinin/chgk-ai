import { PrismaClient } from '@prisma/client';
import env from '@/helpers/env';

let prisma: PrismaClient;
declare global {
  var __db: PrismaClient | undefined;
}

if (!env.isProduction) {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }
  prisma = global.__db;
}

export default prisma;
