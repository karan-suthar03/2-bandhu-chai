import prisma from "../config/prisma.js";

async function getProducts(req,res) {
    try {
        const {sortBy,priceRange,searchTerm,selectedCategory} = req.query;
        const results = await prisma.product.findMany({
            where: {
                stock: {
                    gt: 0
                },
                ...(searchTerm && {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } }
                    ]
                }),
                ...(selectedCategory && selectedCategory!== "all" && {
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
        })
        res.status(200).json({
            success: true,
            data: results.map(product => ({
                id: product.id,
                name: product.name,
                price: "₹"+ product.price,
                oldPrice: "₹"+ product.oldPrice,
                discount: product.discount* 100 + '% Off',
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
        })
    }catch (e){
        console.error('Error fetching products:', e);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products'
        });
    }
}

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
            price: "₹"+ product.price,
            oldPrice: "₹"+ product.oldPrice,
            discount: product.discount* 100 + '% Off',
            rating: product.rating,
            reviews: 10,
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

async function getProduct(req,res){
    const { productId } = req.params;
    try {
        const product = await prisma.product.findUnique({
            where: { id: parseInt(productId) }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            data: {
                id: product.id,
                name: product.name,
                price: "₹"+ product.price,
                oldPrice: "₹"+ product.oldPrice,
                discount: product.discount* 100 + '% Off',
                rating: product.rating,
                // reviews: product.reviews,
                badge: product.badge,
                images: product.images,
                category: product.category,
                description: product.description,
                longDescription: product.longDescription,
                stock: product.stock,
                organic: product.organic,
                fastDelivery: product.fastDelivery,
                isNew: product.isNew,
                sizes:product.sizes,
                features: product.features,
                specifications: product.specifications,
                brewingInstructions: []
            }
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
}

export { getProducts, getFeaturedProducts, getProduct };