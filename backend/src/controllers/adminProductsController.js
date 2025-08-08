import { getAdminProducts, getAdminProduct } from './products/productQueries.js';
import { createProduct } from './products/productCreation.js';
import { 
    updateProduct, 
    updateProductCategorization, 
    updateProductCoreDetails, 
    updateProductPricing 
} from './products/productUpdates.js';
import { updateProductMedia } from './products/productMedia.js';
import { 
    deactivateProduct, 
    activateProduct, 
    bulkDeactivateProducts, 
    bulkActivateProducts 
} from './products/productStatus.js';
import { getAllVariants } from './products/productVariants.js';

export {
    getAdminProducts,
    getAdminProduct,

    createProduct,

    updateProduct,
    updateProductCategorization,
    updateProductCoreDetails,
    updateProductPricing,
    updateProductMedia,

    deactivateProduct,
    activateProduct,
    bulkDeactivateProducts,
    bulkActivateProducts,

    getAllVariants
};
