import sharp from 'sharp'
import crypto from "node:crypto";

function generateUniqueFilename(ext) {
    return crypto.randomBytes(32).toString('hex') + ext;
}

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
    mainImage.buffer = await sharp(mainImage.buffer).resize(400, 400).jpeg({ quality: 80 }).toBuffer();
    mainImage.originalname = generateUniqueFilename(".jpg");
    mainImage.mimetype = 'image/jpeg';
    mainImage.encoding = '7bit';

    req.areFilesPresent = false;
    if (req.files.gallery instanceof Array && req.files.gallery.length > 0) {
        req.files.gallery = req.files.gallery.filter(img => img.mimetype.startsWith('image/'));
        if (req.files.gallery.length === 0) {
            console.log('No valid additional images found');
        }else{
            req.files.gallery = await Promise.all(req.files.gallery.map(async (img) => {
                img.originalname = generateUniqueFilename(".jpg");
                img.buffer = await sharp(img.buffer).resize(400, 400).jpeg({ quality: 80 }).toBuffer();
                img.mimetype = 'image/jpeg';
                img.encoding = '7bit';
                return img;
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

export { validateCreateProduct };