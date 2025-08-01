import { 
    makeVariants
} from '../utils/imageUtils.js';

const validateCreateProduct = async (req, res, next) => {

    const errorResponse = (message) =>
        res.status(400).json({success: false, error: message});

    if(!req.body || Object.keys(req.body).length === 0) {
        return errorResponse('Product data is required');
    }

    let mainImage = req.files?.mainImage[0];
    if (!mainImage || !mainImage.mimetype.startsWith('image/')) {
        return errorResponse('Main image is required and must be an image file');
    }
    mainImage.variants = await makeVariants(mainImage);

    req.areFilesPresent = false;
    if (req.files.gallery instanceof Array && req.files.gallery.length > 0) {
        req.files.gallery = req.files.gallery.filter(img => img.mimetype.startsWith('image/'));
        if (req.files.gallery.length === 0) {
            console.log('No valid additional images found');
        }else{
            req.files.gallery = await Promise.all(req.files.gallery.map(async (img) => {
                const variants = await makeVariants(img);
                return {
                    ...img,
                    variants: variants
                };
            }));
            req.areFilesPresent = true;
        }
    }else{
        req.files.gallery = [];
        console.log('No additional images provided');
    }

    console.log("images processed successfully");

    const {
        name, price, oldPrice, stock,
        category, badge, description, fullDescription,
        features, discount, isNew, featured,
        organic, fastDelivery
    } = req.body;

    if (!name || name.trim().length === 0)
        return errorResponse('Product name is required');

    req.body.name = name.trim();

    if (!price || isNaN(price) || parseFloat(price) <= 0)
        return errorResponse('Valid product price is required');
    req.body.price = parseFloat(price);

    if (!stock || isNaN(stock) || parseInt(stock) < 0)
        return errorResponse('Valid stock quantity is required');
    req.body.stock = parseInt(stock);

    if (!category || category.trim().length === 0)
        return errorResponse('Product category is required');
    req.body.category = category.trim();

    if (!description || description.trim().length === 0)
        return errorResponse('Product description is required');
    req.body.description = description.trim();

    if (badge && badge.trim().length <= 0)
        return errorResponse('Product badge is not valid');
    if(badge){
        req.body.badge = badge.trim();
    }

    if (oldPrice && (isNaN(oldPrice) || parseFloat(oldPrice) < 0))
        return errorResponse('Valid old price is required');
    if (oldPrice) {
        req.body.oldPrice = parseFloat(oldPrice);
    }

    if (!fullDescription || fullDescription.trim().length === 0)
        return errorResponse('Product full description is required');
    req.body.fullDescription = fullDescription.trim();


    if (features) {
        try {
            const parsedFeatures = JSON.parse(features);
            if (!Array.isArray(parsedFeatures))
                return errorResponse('Product features must be a valid JSON array');
        } catch (error) {
            return errorResponse('Product features must be a valid JSON array');
        }
    }

    if (discount && (isNaN(discount) || parseFloat(discount) < 0 || parseFloat(discount) > 100))
        return errorResponse('Valid discount percentage is required');
    if (discount) {
        req.body.discount = discount/ 100;
    }

    const checkBoolean = (value, fieldName) => {
        if (value !== undefined && typeof value !== 'boolean' && value !== 'true' && value !== 'false') {
            return errorResponse(`${fieldName} must be a boolean value`);
        }
    };

    const boolError =
        checkBoolean(isNew, 'isNew') ||
        checkBoolean(featured, 'featured') ||
        checkBoolean(organic, 'organic') ||
        checkBoolean(fastDelivery, 'fastDelivery');

    if (boolError) return boolError;

    console.log(req.body);

    next();
};

const validateProductMediaUpdate = async (req, res, next) => {
    const errorResponse = (message) =>
        res.status(400).json({ success: false, error: message });

    try {
        let galleryOrder = [];
        let existingImages = [];
        
        if (req.body.galleryOrder) {
            try {
                galleryOrder = JSON.parse(req.body.galleryOrder);
            } catch (e) {
                console.log('Invalid galleryOrder JSON, ignoring');
            }
        }
        
        if (req.body.existingImages) {
            try {
                existingImages = JSON.parse(req.body.existingImages);
            } catch (e) {
                console.log('Invalid existingImages JSON, ignoring');
            }
        }
        const hasFiles = req.files && (req.files.mainImage || (req.files.gallery && req.files.gallery.length > 0));
        const hasReordering = galleryOrder.length > 0 || existingImages.length > 0;
        
        if (!hasFiles && !hasReordering) {
            return errorResponse('No media files or reordering data provided');
        }

        if (req.files?.mainImage?.[0]) {
            let mainImage = req.files.mainImage[0];
            if (!mainImage.mimetype.startsWith('image/')) {
                return errorResponse('Main image must be an image file');
            }

            const MAX_MAIN_SIZE = 15 * 1024 * 1024;
            if (mainImage.size > MAX_MAIN_SIZE) {
                return errorResponse(`Main image size ${(mainImage.size / (1024 * 1024)).toFixed(2)}MB exceeds maximum 15MB`);
            }
            
            mainImage.variants = await makeVariants(mainImage);
        }

        req.areGalleryFilesPresent = false;
        if (req.files?.gallery && req.files.gallery.length > 0) {
            const MAX_GALLERY_SIZE = 10 * 1024 * 1024; // 10MB per gallery image
            const MAX_GALLERY_COUNT = 10;

            const totalCount = existingImages.length + req.files.gallery.length;
            if (totalCount > MAX_GALLERY_COUNT) {
                return errorResponse(`Too many gallery images. Maximum ${MAX_GALLERY_COUNT} allowed, got ${totalCount} total (${existingImages.length} existing + ${req.files.gallery.length} new)`);
            }

            req.files.gallery = req.files.gallery.filter(img => {
                if (!img.mimetype.startsWith('image/')) {
                    console.log(`Skipping non-image file: ${img.originalname}`);
                    return false;
                }
                if (img.size > MAX_GALLERY_SIZE) {
                    console.log(`Skipping oversized file: ${img.originalname} (${(img.size / (1024 * 1024)).toFixed(2)}MB)`);
                    return false;
                }
                return true;
            });
            
            if (req.files.gallery.length > 0) {
                req.files.gallery = await Promise.all(req.files.gallery.map(async (img) => {
                    const variants = await makeVariants(img);
                    return {
                        ...img,
                        variants: variants
                    };
                }));
                req.areGalleryFilesPresent = true;
            }
        } else {
            req.files.gallery = [];
        }

        req.mediaUpdate = {
            galleryOrder,
            existingImages,
            hasNewMainImage: !!(req.files?.mainImage?.[0]),
            hasNewGalleryImages: req.areGalleryFilesPresent,
            newGalleryCount: req.files?.gallery?.length || 0,
            existingGalleryCount: existingImages.length
        };

        console.log("Media update processed successfully:", req.mediaUpdate);
        next();
    } catch (error) {
        console.error('Media update validation error:', error);
        return errorResponse(`Media update validation failed: ${error.message}`);
    }
};

export { validateCreateProduct, validateProductMediaUpdate };