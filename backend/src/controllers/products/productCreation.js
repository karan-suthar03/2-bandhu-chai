import prisma from "../../config/prisma.js";
import asyncHandler from '../../middlewares/asyncHandler.js';
import { ValidationError } from "../../middlewares/errors/AppError.js";
import { sendCreated } from '../../utils/responseUtils.js';
import { validateRequired } from '../../utils/validationUtils.js';
import { uploadFile } from "../../services/s3Service.js";

async function uploadVariants(mainImage) {
    const variants = mainImage.variants;
    const variantEntries = Object.entries(variants);

    const uploadPromises = variantEntries.map(([key, variantObject]) => {
        const params = {
            fileName: variantObject.filename,
            buffer: variantObject.buffer,
            mimetype: variantObject.mimetype,
            encoding: variantObject.encoding
        };
        return uploadFile(params).then(imageUrl => {
            console.log(`Uploaded ${key} variant. URL:`, imageUrl);
            return { key, imageUrl };
        });
    });

    const settledResults = await Promise.all(uploadPromises);

    const variantUrls = settledResults.reduce((acc, {key, imageUrl}) => {
        acc[`${key}Url`] = imageUrl;
        return acc;
    }, {});
    return variantUrls;
}

const createProduct = asyncHandler(async (req, res) => {
    const {
        name, category, badge, description, features,
        isNew, featured, organic, fastDelivery,
        variants: variantsData
    } = req.body;

    const missingFields = validateRequired(['name', 'category', 'description'], req.body);
    if (missingFields.length > 0) {
        throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`);
    }

    const mainImageVariantsUrls = await uploadVariants(req.files.mainImage[0]);

    let additionalImagesVariantsUrls = [];
    if (req.areFilesPresent && req.files.gallery && req.files.gallery.length > 0) {
        additionalImagesVariantsUrls = await Promise.all(
            req.files.gallery.map(img => uploadVariants(img))
        );
    }

    const product = await prisma.$transaction(async (tx) => {
        const createdProduct = await tx.product.create({
            data: {
                name,
                category,
                description,
                longDescription: req.body.fullDescription,
                badge: badge || null,
                features: features ? JSON.parse(features) : [],
                isNew: isNew === 'true',
                featured: featured === 'true',
                organic: organic === 'true',
                fastDelivery: fastDelivery === 'true',
                image: mainImageVariantsUrls,
                images: additionalImagesVariantsUrls,

                variants: {
                    create: variantsData.map(variant => {
                        const price = parseFloat(variant.price);
                        const oldPrice = variant.oldPrice ? parseFloat(variant.oldPrice) : null;
                        let discount = null;
                        if (oldPrice && oldPrice > price) {
                            discount = (oldPrice - price) / oldPrice;
                        } else if (variant.discount) {
                            discount = parseFloat(variant.discount);
                        }
                        
                        return {
                            size: variant.size,
                            price: price,
                            oldPrice: oldPrice,
                            stock: parseInt(variant.stock),
                            discount: discount,
                            sku: variant.sku,
                        };
                    })
                }
            },
            include: {
                variants: true,
            }
        });

        const defaultVariantData = variantsData.find(v => v.isDefault === true);
        if (!defaultVariantData) {
            throw new Error("Default variant was not specified in the request.");
        }

        const defaultVariant = createdProduct.variants.find(v => v.sku === defaultVariantData.sku);
        if (!defaultVariant) {
            throw new Error("Could not find the created default variant by SKU. SKUs might be missing or duplicated.");
        }

        const updatedProduct = await tx.product.update({
            where: { id: createdProduct.id },
            data: {
                defaultVariantId: defaultVariant.id,
            },
            include: {
                variants: true,
            }
        });

        return updatedProduct;
    });

    console.log('Transaction successful.');
    return sendCreated(res, { 
        data: product 
    }, 'Product created successfully');
});

export {
    createProduct,
    uploadVariants
};
