import prisma from "../config/prisma.js";
import { createQuery, createStringFilter, createExactFilter, createRangeFilter } from "../utils/queryUtils.js";
import { validatePagination } from "../utils/validationUtils.js";

export class ProductService {
    static async getProducts(filters = {}) {
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

        return {
            products: products.map(this.formatProduct),
            pagination: {
                ...pagination,
                total
            }
        };
    }
    static async getFeaturedProducts(limit = 8) {
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

        return products.map(this.formatProduct);
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
