import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL + '?connection_limit=5&pool_timeout=1000'
        }
    }
});

process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;
