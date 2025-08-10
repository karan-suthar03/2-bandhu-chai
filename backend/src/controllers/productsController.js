import { ProductService } from "../services/productService.js";
import { sendSuccess, createPaginatedResponse, sendResponse } from "../utils/responseUtils.js";
import asyncHandler from "../middlewares/asyncHandler.js";

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
        
        const product = await ProductService.getProductById(productId);

        console.log('Product found:', product ? 'Yes' : 'No');
        if (product) {
            console.log('Product details:', { id: product.id, name: product.name });
        }

        if (!product) {
            console.log('Product not found or deactivated');
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.log('Sending successful response for product:', product.id);
        res.json({
            success: true,
            data: product
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

const getRelatedProducts = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const limit = parseInt(req.query.limit) || 4;
    
    const relatedProducts = await ProductService.getRelatedProducts(productId, limit);
    
    return sendSuccess(res, {
        data: relatedProducts
    });
});

export {
    getProducts,
    getFeaturedProducts,
    getProduct,
    getRelatedProducts
};
