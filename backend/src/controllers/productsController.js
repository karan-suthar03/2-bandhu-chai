import prisma from "../config/prisma.js";
import { NotFoundError } from "../middlewares/errors/AppError.js";

async function getProducts(req, res) {
    try {
        const { sortBy, priceRange, searchTerm, selectedCategory } = req.query;

        const whereClause = {
            deactivated: false,
            variants: {
                some: {
                    stock: {
                        gt: 0
                    }
                }
            },
            ...(searchTerm && {
                OR: [
                    { name: { contains: searchTerm, mode: 'insensitive' } },
                    { description: { contains: searchTerm, mode: 'insensitive' } }
                ]
            }),
            ...(selectedCategory && selectedCategory !== "all" && {
                category: selectedCategory
            }),
        };

        if (priceRange && priceRange !== "all") {
            if (priceRange.endsWith("+")) {
                const min = parseInt(priceRange.replace("+", ""), 10);
                whereClause.defaultVariant = { price: { gte: min } };
            } else {
                const [minStr, maxStr] = priceRange.split("-");
                whereClause.defaultVariant = { price: { gte: parseInt(minStr, 10), lte: parseInt(maxStr, 10) } };
            }
        }

        const orderByClause =
            sortBy === "name" ? { name: 'asc' } :
                sortBy === "price-low" ? { defaultVariant: { price: 'asc' } } :
                    sortBy === "price-high" ? { defaultVariant: { price: 'desc' } } :
                        sortBy === "rating" ? { rating: 'desc' } :
                            sortBy === "reviews" ? { reviewCount: 'desc' } :
                                undefined;


        const results = await prisma.product.findMany({
            where: whereClause,
            include: {
                defaultVariant: {
                    select: {
                        price: true,
                        oldPrice: true,
                        discount: true,
                        size: true,
                        stock: true,
                    }
                }
            },
            orderBy: orderByClause,
            take: 100
        });

        if (!results || results.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No products found matching the criteria.",
                data: []
            });
        }

        const formattedProducts = results.map(product => {
            return {
                id: product.id,
                name: product.name,
                price: product.defaultVariant?.price || 0,
                oldPrice: product.defaultVariant?.oldPrice || null,
                discount: product.defaultVariant?.discount || null,
                size: product.defaultVariant?.size || 'N/A',
                stock: product.defaultVariant?.stock || 0,
                rating: product.rating,
                reviewCount: product.reviewCount,
                badge: product.badge,
                image: product.image,
                category: product.category,
                description: product.description,
                organic: product.organic,
                fastDelivery: product.fastDelivery,
                isNew: product.isNew,
                features: product.features
            };
        });

        res.status(200).json({
            success: true,
            data: formattedProducts
        });

    } catch (error) {
        console.error("Failed to get products:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching products."
        });
    }
}

async function getFeaturedProducts(req, res) {
    try {
        const productsWithDefaultVariant = await prisma.product.findMany({
            where: {
                featured: true,
                deactivated: false
            },
            include: {
                defaultVariant: {
                    select: {
                        price: true,
                        oldPrice: true,
                        discount: true,
                    }
                }
            }
        });

        const featuredProducts = productsWithDefaultVariant.map(product => {
            const price = product.defaultVariant?.price || 0;
            const oldPrice = product.defaultVariant?.oldPrice || null;
            const discount = product.defaultVariant?.discount || null;

            return {
                id: product.id,
                name: product.name,
                price: price,
                oldPrice: oldPrice,
                discount: discount,
                rating: product.rating,
                reviewCount: product.reviewCount,
                badge: product.badge,
                image: product.image
            };
        });

        res.json({
            success: true,
            data: featuredProducts
        });

    } catch (error) {
        console.error("Failed to get featured products:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching featured products."
        });
    }
}

async function getProduct(req, res) {
    const { productId } = req.params;
    
    const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) },
        include: {
            variants: {
                select: {
                    id: true,
                    size: true,
                    price: true,
                    oldPrice: true,
                    discount: true,
                    stock: true,
                    sku: true
                }
            },
            defaultVariant: {
                select: {
                    id: true,
                    size: true,
                    price: true,
                    oldPrice: true,
                    discount: true,
                    stock: true,
                    sku: true
                }
            }
        }
    });

    if (!product || product.deactivated) {
        throw new NotFoundError('Product not found');
    }

    res.json({
        success: true,
        data: {
            id: product.id,
            name: product.name,
            price: product.defaultVariant?.price || 0,
            oldPrice: product.defaultVariant?.oldPrice || null,
            discount: product.defaultVariant?.discount || null,
            stock: product.defaultVariant?.stock || 0,
            variants: product.variants,
            defaultVariant: product.defaultVariant,
            sizes: product.variants.map(variant => ({
                size: variant.size,
                price: variant.price,
                oldPrice: variant.oldPrice,
                discount: variant.discount,
                stock: variant.stock,
                sku: variant.sku,
                id: variant.id
            })),
            rating: product.rating,
            badge: product.badge,
            images: [product.image,...product.images],
            category: product.category,
            description: product.description,
            longDescription: product.longDescription,
            organic: product.organic,
            fastDelivery: product.fastDelivery,
            isNew: product.isNew,
            features: product.features,
            specifications: product.specifications,
            brewingInstructions: []
        }
    });
}

export { getProducts, getFeaturedProducts, getProduct };