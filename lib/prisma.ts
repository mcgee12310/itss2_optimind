// Ensure Prisma uses the native binary engine during build/run unless overridden.
// This avoids the "Using engine type 'client' requires either 'adapter' or 'accelerateUrl'" error
// when building on environments without an adapter configured.
if (!process.env.PRISMA_CLIENT_ENGINE) {
  process.env.PRISMA_CLIENT_ENGINE = "binary";
}

// Import @prisma/client after setting the env var so the client picks up the engine choice at load time.
const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis as unknown as { prisma?: InstanceType<typeof PrismaClient> };

let _prismaInstance: InstanceType<typeof PrismaClient> | undefined = undefined;

function _getPrisma(): InstanceType<typeof PrismaClient> {
  if (_prismaInstance) return _prismaInstance;
  _prismaInstance = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = _prismaInstance;
  }
  return _prismaInstance;
}

// Export a lazy proxy that constructs the real PrismaClient only when a property is accessed or method called.
export const prisma = new Proxy(
  {},
  {
    get(_, prop) {
      const client = _getPrisma();
      // @ts-ignore
      return client[prop as keyof typeof client];
    },
    apply(_, __, args) {
      const client = _getPrisma();
      // @ts-ignore
      return (client as any)(...args);
    },
  },
) as unknown as InstanceType<typeof PrismaClient>;
