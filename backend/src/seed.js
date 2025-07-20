import 'dotenv/config';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

// model Product {
//     id                   Int      @id @default(autoincrement())
//     name                 String
//     price                String
//     oldPrice             String?
//         discount             String?
//             description          String
//     longDescription      String?
//         category             String
//     badge                String
//     rating               Float    @default(0.0)
//     stock                Int      @default(0)
//     isNew                Boolean  @default(false)
//     organic              Boolean  @default(false)
//     fastDelivery         Boolean  @default(false)
//     image                String
//     images               String[]
//     features             String[]
//     sizes                Json?
//         specifications       Json?    // {"Tea Type": "Black Tea", "Origin": "Assam, India"}
//             brewingInstructions  String[]
//     createdAt            DateTime @default(now())
//     updatedAt            DateTime @updatedAt
//
// @@map("products")
// }

let product = {
    name: "Organic Assam Black Tea - 250g",
    price: 699,
    oldPrice: 899,
    discount: 0,
    description: "Experience the rich, robust flavor of our Organic Assam Black Tea, sourced directly from the lush tea gardens of Assam. Perfect for a refreshing morning brew or an afternoon pick-me-up.",
    longDescription: "Our Organic Assam Black Tea is handpicked from the finest tea leaves, ensuring a premium quality that tea lovers will appreciate. This tea is not only rich in flavor but also packed with antioxidants, making it a healthy choice for your daily routine. Enjoy it plain or with a splash of milk for a classic Assam tea experience.",
    category: "black-tea",
    badge: "Top Seller",
    rating: 4.2,
    stock: 100,
    isNew: true,
    organic: true,
    fastDelivery: true,
    image: "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-BobHpIw2.jpg",
    images: [
        "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-BobHpIw2.jpg",
        "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-1.jpg",
        "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-2.jpg"
    ],
    features: [
        "100% Organic",
        "Handpicked from Assam", 
        "Rich in Antioxidants",
        "Perfect for Morning Brew"
    ],
    sizes: [
        { size: "100g", price: "₹349", oldPrice: "₹449" },
        { size: "250g", price: "₹699", oldPrice: "₹899" },
        { size: "500g", price: "₹1299", oldPrice: "₹1699" }
    ],
    specifications: {
        "Tea Type": "Black Tea",
        "Origin": "Assam, India",
        "Grade": "FTGFOP",
        "Caffeine Level": "High",
        "Brewing Time": "3-5 minutes",
        "Water Temperature": "95-100°C",
        "Shelf Life": "2 years"
    }
}

let product2 = {
    name: "Premium Green Tea - 500g",
    price: 849,
    oldPrice: 999,
    discount: 0.15,
    description: "Savor the delicate, refreshing taste of our Premium Green Tea, sourced from the finest tea gardens in India. Ideal for health-conscious individuals looking for a soothing beverage.",
    longDescription: "Our Premium Green Tea is crafted from the youngest tea leaves, ensuring a light, fresh flavor that is both invigorating and calming. Rich in antioxidants, this tea supports overall health and wellness. Enjoy it hot or iced for a refreshing drink any time of day.",
    category: "green-tea",
    badge: "Pure Bliss",
    rating: 4.0,
    stock: 150,
    isNew: false,
    organic: true,
    fastDelivery: true,
    image: "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-1.jpg",
    images: [
        "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-1.jpg",
        "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-2.jpg",
        "https://karan-suthar03.github.io/2-bandhu-chai/assets/product-3.jpg"
    ],
    features: [
        "100% Organic",
        "Rich in Antioxidants",
        "Supports Weight Loss",
        "Refreshing Taste"
    ],
    sizes: [
        { size: "100g", price: "₹399", oldPrice: "₹499" },
        { size: "250g", price: "₹699", oldPrice: "₹899" },
        { size: "500g", price: "₹849", oldPrice: "₹999" }
    ],
    specifications: {
        "Tea Type": "Green Tea",
        "Origin": "Darjeeling, India",
        "Grade": "Sencha",
        "Caffeine Level": "Low",
        "Brewing Time": "2-3 minutes",
        "Water Temperature": "80-85°C",
        "Shelf Life": "1 year"
    }
}

async function seed() {
    try {
        console.log("Starting database seed...");
        
        // Test connection first
        await prisma.$connect();
        console.log("Database connected successfully");
        
        // Delete existing products
        // const deleted = await prisma.product.deleteMany();
        // console.log(`Deleted ${deleted.count} existing products`);
        
        // Create new product
        const createdProduct = await prisma.product.create({
            data: product2
        });

        console.log("Product created successfully:", createdProduct.name);
        console.log("Product ID:", createdProduct.id);
        
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