import { ProductService } from "../services/productService.js";
import { sendSuccess, createPaginatedResponse, sendResponse } from "../utils/responseUtils.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import prisma from "../config/prisma.js";

const getProducts = asyncHandler(async (req, res) => {
    const result = await ProductService.getProducts(req.query);
    
    return sendResponse(res, 200, createPaginatedResponse(result.products, result.pagination));
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 8;
    const products = await ProductService.getFeaturedProducts(limit);
    
    return sendSuccess(res, {
        data: products
    });
});

const getProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        
        console.log('getProduct called with productId:', productId);
        
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

        console.log('Product found:', product ? 'Yes' : 'No');
        if (product) {
            console.log('Product details:', { id: product.id, name: product.name, deactivated: product.deactivated });
        }

        if (!product || product.deactivated) {
            console.log('Product not found or deactivated');
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const responseData = {
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
        };

        console.log('Sending successful response for product:', product.id);
        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Error in getProduct:', {
            message: error.message,
            stack: error.stack,
            productId: req.params.productId
        });
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product'
        });
    }
};

export {
    getProducts,
    getFeaturedProducts,
    getProduct
};
