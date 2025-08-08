import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createDefaultAdmin() {
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.admin.findFirst({
            where: {
                username: 'admin'
            }
        });

        if (existingAdmin) {
            console.log('Default admin already exists');
            return;
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash('admin123', saltRounds);

        // Create default admin
        const admin = await prisma.admin.create({
            data: {
                username: 'admin',
                email: 'admin@bandhuchai.com',
                password: hashedPassword,
                role: 'admin',
                isActive: true
            }
        });

        console.log('Default admin created successfully:');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('Email:', admin.email);
        
    } catch (error) {
        console.error('Error creating default admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the function if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    createDefaultAdmin().then(() => {
        console.log('Seed script completed');
        process.exit(0);
    }).catch((error) => {
        console.error('Seed script failed:', error);
        process.exit(1);
    });
}

createDefaultAdmin();
