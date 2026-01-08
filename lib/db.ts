import * as Prisma from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

// Some TypeScript setups with newer Prisma packages may not expose a named
// `PrismaClient` type that the bundler/TS config recognizes. Use a runtime
// extraction and fall back to `any` for typing to avoid build-time errors.
const PrismaClientConstructor = (Prisma as any).PrismaClient || (Prisma as any).default || (Prisma as any);

type AnyPrismaClient = any;

const globalForPrisma = globalThis as unknown as {
  prisma: AnyPrismaClient | undefined
}

// Create adapter
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
})

export const prisma = globalForPrisma.prisma ?? new PrismaClientConstructor({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
