import { PrismaClient } from '@prisma/client';
import { logger } from '@misan/logger';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  globalThis.prismaGlobal ??
  new PrismaClient({
    log:
      process.env.LOG_LEVEL === 'debug'
        ? [
            { emit: 'event', level: 'query' },
            { emit: 'stdout', level: 'error' },
            { emit: 'stdout', level: 'warn' },
          ]
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}

export async function connectDatabase(): Promise<boolean> {
  try {
    await prisma.$connect();
    logger.info('Successfully connected to PostgreSQL database.', { module: 'Database' });
    return true;
  } catch (error) {
    logger.error('Failed to connect to PostgreSQL database.', {
      module: 'Database',
      error,
    });
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Disconnected from PostgreSQL database.', { module: 'Database' });
}

export * from '@prisma/client';
