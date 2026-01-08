import * as Prisma from '@prisma/client'

// Lazily initialize Prisma client to avoid runtime/build-time failures
// when the environment in the bundler (e.g., Vercel build) can't initialize
// adapters or native bindings. Creation is deferred until the first use.

type AnyPrismaClient = any;

const globalForPrisma = globalThis as unknown as { prisma?: AnyPrismaClient };

const createPrismaClient = () => {
  const PrismaClientConstructor = (Prisma as any).PrismaClient || (Prisma as any).default || (Prisma as any);

  // Try to create adapter if available; fail silently and continue without it.
  let adapter: any = undefined;
  try {
    // Dynamically require to avoid bundlers trying to resolve during analysis.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@prisma/adapter-libsql');
    const PrismaLibSql = mod.PrismaLibSql || mod.default || mod;
    adapter = new PrismaLibSql({ url: process.env.DATABASE_URL || 'file:./prisma/dev.db' });
  } catch (e) {
    // Adapter not available at build time — continue without adapter.
  }

  try {
    const client = adapter
      ? new PrismaClientConstructor({ adapter, log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] })
      : new PrismaClientConstructor({ log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'] });
    return client as AnyPrismaClient;
  } catch (e) {
    // If client creation fails (for example during a static build), return null and
    // avoid throwing during module initialization. Consumers will see errors when
    // they attempt to use the client at runtime.
    // eslint-disable-next-line no-console
    console.warn('Prisma client could not be initialized at build-time:', e?.message || e);
    return null as any;
  }
};

let prismaInstance: AnyPrismaClient | null = globalForPrisma.prisma ?? null;

export const prisma = new Proxy(
  {},
  {
    get(_target, prop: string) {
      if (!prismaInstance) {
        prismaInstance = createPrismaClient();
        if (process.env.NODE_ENV !== 'production' && prismaInstance) globalForPrisma.prisma = prismaInstance;
      }

      if (!prismaInstance) {
        throw new Error('Prisma client is not available in this environment.');
      }

      return (prismaInstance as any)[prop];
    },
  }
) as AnyPrismaClient;
