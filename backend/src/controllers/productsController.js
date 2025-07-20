import prisma from "../config/prisma.js";

async function getProducts() {}

async function getFeaturedProducts(req,res) {
    try {
        const result = await prisma.product.findMany({
            where: {
                featured: true,
                stock: {
                    gt: 0
                }
            }
        });

        const featuredProducts = result.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            discount: product.discount,
            rating: product.rating,
            reviews: product.reviews,
            badge: product.badge,
            image: product.image
        }));
        res.json({
            success: true,
            data: featuredProducts
        });
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured products'
        });
    }
}

export { getProducts, getFeaturedProducts };