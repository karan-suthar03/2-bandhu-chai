import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: ['warn', 'error'],
    datasources: {
        db: {
            url: process.env.DATABASE_URL + '?connection_limit=5&pool_timeout=20&connect_timeout=60'
        }
    },
    errorFormat: 'minimal'
});

process.on('beforeExit', async () => {
    console.log('Disconnecting Prisma...');
    await prisma.$disconnect();
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, disconnecting Prisma...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received, disconnecting Prisma...');
    await prisma.$disconnect();
    process.exit(0);
});

export default prisma;
