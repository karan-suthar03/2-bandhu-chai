import 'dotenv/config';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();


function randomString(length = 10) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomBool() {
    return Math.random() > 0.5;
}

function randomNumber(min = 0, max = 1000) {
    return +(Math.random() * (max - min) + min).toFixed(2);
}

function randomArray(length = 3, generator = randomString) {
    return Array.from({ length }, () => generator());
}

function randomSizes() {
    return Array.from({ length: 3 }, () => ({
        size: randomString(3),
        price: `₹${randomNumber(100, 1000)}`,
        oldPrice: `₹${randomNumber(1000, 2000)}`
    }));
}

function randomObject() {
    return {
        name: randomString(20),
        price: randomNumber(100, 10000),
        oldPrice: randomNumber(200, 15000),
        discount: parseFloat(Math.random().toFixed(2)),
        description: randomString(50),
        longDescription: randomString(200),
        category: randomString(10),
        badge: randomString(5),
        rating: randomNumber(0, 5),
        stock: Math.floor(randomNumber(0, 500)),
        isNew: randomBool(),
        organic: randomBool(),
        fastDelivery: randomBool(),
        image: "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-BobHpIw2.jpg",
        images: [
            "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-BobHpIw2.jpg",
            "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-BobHpIw2.jpg",
            "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-BobHpIw2.jpg"
        ],
        features: randomArray(4),
        sizes: randomSizes(),
        specifications: {
            [randomString(5)]: randomString(10),
            [randomString(5)]: randomString(10),
            [randomString(5)]: randomString(10),
            [randomString(5)]: randomString(10)
        }
    };
}


async function seed() {
    try {
        console.log("Starting database seed...");

        // Test connection first
        await prisma.$connect();
        console.log("Database connected successfully");

        let products = [];

        for (let i = 0; i < 10; i++) {
            products.push(randomObject());
        }

        const result = await prisma.product.createMany({
            data: products,
            skipDuplicates: true
        })

        console.log(`Seeded ${result.count} products successfully`);
        
    } catch (error) {
        console.error("Error seeding database:");
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        if (error.meta) {
            console.error("Error meta:", error.meta);
        }
    } finally {
        await prisma.$disconnect();
        console.log("Database disconnected");
    }
}

await seed();