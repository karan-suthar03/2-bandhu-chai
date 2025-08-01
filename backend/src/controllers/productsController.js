import prisma from "../config/prisma.js";
import { NotFoundError } from "../middlewares/errors/AppError.js";

async function getProducts(req, res) {
    const { sortBy, priceRange, searchTerm, selectedCategory } = req.query;
    
    const results = await prisma.product.findMany({
        where: {
            stock: {
                gt: 0
            },
            deactivated: false,
            ...(searchTerm && {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } }
                ]
            }),
            ...(selectedCategory && selectedCategory !== "all" && {
                category: selectedCategory
            }),
            ...(priceRange && (() => {
                if (priceRange === "all") {
                    return { price: { gte: 0, lte: 999999 } };
                }

                if (priceRange.endsWith("+")) {
                    const min = parseInt(priceRange.replace("+", ""), 10);
                    return { price: { gte: min, lte: 999999 } };
                }

                const [minStr, maxStr] = priceRange.split("-");
                const min = parseInt(minStr, 10);
                const max = parseInt(maxStr, 10);
                return { price: { gte: min, lte: max } };
            })())
        },
        orderBy: sortBy === "name" ? { name: 'asc' } :
                 sortBy === "price-low" ? { price: 'asc' } :
                 sortBy === "price-high" ? { price: 'desc' } :
                 sortBy === "rating" ? { rating: 'desc' } :
                 sortBy === "reviews" ? { reviewsCount: 'desc' } : undefined,
        take: 100
    });

    res.status(200).json({
        success: true,
        data: results.map(product => ({
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            discount: product.discount,
            rating: product.rating,
            reviews: 112,
            badge: product.badge,
            image: product.image,
            category: product.category,
            description: product.description,
            stock: product.stock,
            organic: product.organic,
            fastDelivery: product.fastDelivery,
            isNew: product.isNew,
            features: product.features
        }))
    });
}

async function getFeaturedProducts(req, res) {
    const result = await prisma.product.findMany({
        where: {
            featured: true,
            deactivated: false
        }
    });

    const featuredProducts = result.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        oldPrice: product.oldPrice,
        discount: product.discount,
        rating: product.rating,
        reviews: 10,
        badge: product.badge,
        image: product.image
    }));
    
    res.json({
        success: true,
        data: featuredProducts
    });
}

async function getProduct(req, res) {
    const { productId } = req.params;
    
    const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) }
    });

    if (!product || product.deactivated) {
        throw new NotFoundError('Product not found');
    }

    res.json({
        success: true,
        data: {
            id: product.id,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            discount: product.discount,
            rating: product.rating,
            badge: product.badge,
            images: product.images,
            category: product.category,
            description: product.description,
            longDescription: product.longDescription,
            stock: product.stock,
            organic: product.organic,
            fastDelivery: product.fastDelivery,
            isNew: product.isNew,
            sizes: product.sizes,
            features: product.features,
            specifications: product.specifications,
            brewingInstructions: []
        }
    });
}

export { getProducts, getFeaturedProducts, getProduct };