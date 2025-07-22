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

        await createSampleOrders();
        
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

async function createSampleOrders() {
    try {
        console.log("Creating sample orders...");

        const products = await prisma.product.findMany({
            take: 5
        });

        if (products.length === 0) {
            console.log("No products found to create orders");
            return;
        }

        const sampleOrders = [
            {
                customerName: "John Doe",
                customerEmail: "john@example.com",
                customerPhone: "+91 9876543210",
                shippingAddress: {
                    street: "123 Main Street",
                    city: "Mumbai",
                    state: "Maharashtra",
                    pincode: "400001",
                    landmark: "Near City Mall"
                },
                status: "DELIVERED",
                paymentStatus: "COMPLETED",
                paymentMethod: "UPI",
                subtotal: 450.00,
                shippingCost: 0,
                tax: 81.00,
                finalTotal: 531.00,
                confirmedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                shippedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),   // 5 days ago
                deliveredAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                orderItems: [
                    {
                        productId: products[0].id,
                        productName: products[0].name,
                        price: products[0].price,
                        oldPrice: products[0].oldPrice,
                        quantity: 2
                    }
                ],
                statusHistory: [
                    { status: "PENDING", notes: "Order created" },
                    { status: "CONFIRMED", notes: "Order confirmed by admin" },
                    { status: "PROCESSING", notes: "Order is being prepared" },
                    { status: "SHIPPED", notes: "Order shipped via courier" },
                    { status: "OUT_FOR_DELIVERY", notes: "Out for delivery" },
                    { status: "DELIVERED", notes: "Order delivered successfully" }
                ]
            },
            {
                customerName: "Jane Smith",
                customerEmail: "jane@example.com",
                customerPhone: "+91 8765432109",
                shippingAddress: {
                    street: "456 Oak Avenue",
                    city: "Delhi",
                    state: "Delhi",
                    pincode: "110001",
                    landmark: "Opposite Metro Station"
                },
                status: "SHIPPED",
                paymentStatus: "COMPLETED",
                paymentMethod: "CREDIT_CARD",
                subtotal: 1200.00,
                shippingCost: 0,
                tax: 216.00,
                finalTotal: 1416.00,
                confirmedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
                shippedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),   // 1 day ago
                orderItems: [
                    {
                        productId: products[1].id,
                        productName: products[1].name,
                        price: products[1].price,
                        oldPrice: products[1].oldPrice,
                        quantity: 1
                    },
                    {
                        productId: products[2].id,
                        productName: products[2].name,
                        price: products[2].price,
                        oldPrice: products[2].oldPrice,
                        quantity: 3
                    }
                ],
                statusHistory: [
                    { status: "PENDING", notes: "Order created" },
                    { status: "CONFIRMED", notes: "Order confirmed and payment received" },
                    { status: "PROCESSING", notes: "Order is being packed" },
                    { status: "SHIPPED", notes: "Order shipped with tracking ID: TR123456" }
                ]
            },
            {
                customerName: "Mike Johnson",
                customerEmail: "mike@example.com",
                customerPhone: "+91 7654321098",
                shippingAddress: {
                    street: "789 Pine Street",
                    city: "Bangalore",
                    state: "Karnataka",
                    pincode: "560001",
                    landmark: "Near Tech Park"
                },
                status: "PENDING",
                paymentStatus: "PENDING",
                paymentMethod: "CASH_ON_DELIVERY",
                subtotal: 300.00,
                shippingCost: 99.00,
                tax: 54.00,
                finalTotal: 453.00,
                orderItems: [
                    {
                        productId: products[3].id,
                        productName: products[3].name,
                        price: products[3].price,
                        oldPrice: products[3].oldPrice,
                        quantity: 1
                    }
                ],
                statusHistory: [
                    { status: "PENDING", notes: "Order created, awaiting confirmation" }
                ]
            }
        ];

        for (const orderData of sampleOrders) {
            const { orderItems, statusHistory, ...orderFields } = orderData;
            
            const order = await prisma.order.create({
                data: {
                    ...orderFields,
                    orderItems: {
                        create: orderItems
                    },
                    statusHistory: {
                        create: statusHistory.map((history, index) => ({
                            ...history,
                            createdAt: new Date(Date.now() - (statusHistory.length - index - 1) * 24 * 60 * 60 * 1000)
                        }))
                    }
                }
            });

            console.log(`Created order: ${order.orderNumber}`);
        }

        console.log("Sample orders created successfully");
        
    } catch (error) {
        console.error("Error creating sample orders:", error);
    }
}

await seed();