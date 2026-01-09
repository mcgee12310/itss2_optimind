import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Please check .env file.");
}

// Ensure connectionString is a string
const dbUrl = typeof connectionString === 'string' 
  ? connectionString 
  : String(connectionString);

if (!dbUrl.trim().startsWith('postgres')) {
  throw new Error("DATABASE_URL is not a valid PostgreSQL connection string. Please check .env file.");
}

// Create adapter with connection string
const adapter = new PrismaNeon({ connectionString: dbUrl.trim() });

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}