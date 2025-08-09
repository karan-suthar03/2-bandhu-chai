import prisma from "../config/prisma.js";
import { createQuery, createStringFilter, createExactFilter, createRangeFilter } from "../utils/queryUtils.js";
import { validatePagination } from "../utils/validationUtils.js";
import { CacheService } from "./cacheService.js";

export class ProductService {
    static async getProducts(filters = {}) {
        const cachedResult = await CacheService.getCachedProductsList(filters);
        if (cachedResult) {
            console.log('Products list served from cache');
            return cachedResult;
        }

        const {
            page = 1,
            limit = 12,
            search,
            category,
            minPrice,
            maxPrice,
            badge,
            inStock = true,
            featured = false,
            sort = 'createdAt',
            order = 'desc'
        } = filters;

        const pagination = validatePagination(page, limit);
        
        const query = createQuery('product')
            .where({ deactivated: false })
            .include({
                variants: true,
                defaultVariant: true
            })
            .paginate(pagination.page, pagination.limit)
            .orderBy(sort, order);

        if (search && search.trim()) {
            query.search(search, ['name', 'category', 'description', 'badge']);
        }

        const conditions = [
            createStringFilter(category, 'category'),
            createStringFilter(badge, 'badge'),
            createExactFilter(featured, 'featured')
        ].filter(Boolean);

        if (minPrice || maxPrice) {
            conditions.push({
                defaultVariant: createRangeFilter(minPrice, maxPrice, 'price')
            });
        }

        if (inStock) {
            conditions.push({
                variants: {
                    some: {
                        stock: { gt: 0 }
                    }
                }
            });
        }

        if (conditions.length > 0) {
            query.where(conditions);
        }

        const [products, total] = await Promise.all([
            query.execute(),
            query.count()
        ]);

        const result = {
            products: products.map(this.formatProduct),
            pagination: {
                ...pagination,
                total
            }
        };
        CacheService.cacheProductsList(filters, result)
            .then(() => console.log('Products list cached'))
            .catch(error => console.error('Failed to cache products list:', error));

        return result;
    }
    static async getFeaturedProducts(limit = 8) {
        const cachedProducts = await CacheService.getCachedFeaturedProducts(limit);
        if (cachedProducts) {
            console.log('Featured products served from cache');
            return cachedProducts;
        }

        const products = await prisma.product.findMany({
            where: {
                featured: true,
                deactivated: false
            },
            include: {
                variants: true,
                defaultVariant: true
            },
            take: limit,
            orderBy: { createdAt: 'desc' }
        });

        const formattedProducts = products.map(this.formatProduct);
        CacheService.cacheFeaturedProducts(limit, formattedProducts)
            .then(() => console.log('Featured products cached'))
            .catch(error => console.error('Failed to cache featured products:', error));

        return formattedProducts;
    }

    static async getProductById(productId) {
        const cachedProduct = await CacheService.getCachedProduct(productId);
        if (cachedProduct) {
            console.log(`Product ${productId} served from cache`);
            return cachedProduct;
        }

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
            return null;
        }

        const formattedProduct = {
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
            reviewCount: product.reviewCount,
            reviews: product.reviewCount,
            badge: product.badge,
            images: [product.image, ...product.images],
            category: product.category,
            description: product.description,
            longDescription: product.longDescription,
            organic: product.organic,
            fastDelivery: product.fastDelivery,
            isNew: product.isNew,
            features: product.features,
            specifications: product.specifications,
            brewingInstructions: []
        };
        CacheService.cacheProduct(productId, formattedProduct)
            .then(() => console.log(`Product ${productId} cached`))
            .catch(error => console.error(`Failed to cache product ${productId}:`, error));

        return formattedProduct;
    }

    static formatProduct(product) {
        return {
            id: product.id,
            name: product.name,
            image: product.image,
            price: product.defaultVariant?.price || 0,
            oldPrice: product.defaultVariant?.oldPrice,
            discount: product.defaultVariant?.discount,
            stock: product.defaultVariant?.stock || 0,
            badge: product.badge,
            rating: product.rating || 0,
            reviewCount: product.reviewCount || 0,
            reviews: product.reviewCount || 0,
            category: product.category,
            featured: product.featured,
            organic: product.organic,
            fastDelivery: product.fastDelivery,
            isNew: product.isNew,
            defaultVariant: product.defaultVariant,
            variants: product.variants
        };
    }
}
