import prisma from "../../config/prisma.js";
import asyncHandler from '../../middlewares/asyncHandler.js';
import { NotFoundError, ValidationError } from "../../middlewares/errors/AppError.js";
import { sendSuccess } from '../../utils/responseUtils.js';
import { validateId } from '../../utils/validationUtils.js';
import { uploadVariants } from './productCreation.js';

const updateProductMedia = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const productId = validateId(id, 'Product ID');

    const existingProduct = await prisma.product.findUnique({
        where: { id: productId }
    });

    if (!existingProduct) {
        throw new NotFoundError('Product not found');
    }

    const updateData = {};
    const uploadResults = [];

    if (req.files?.mainImage?.[0]) {
        console.log('Processing main image update...');
        const mainImage = req.files.mainImage[0];
        
        try {
            const mainImageVariantsUrls = await uploadVariants(mainImage);
            updateData.image = mainImageVariantsUrls;
            uploadResults.push(`Main image updated: ${Object.keys(mainImageVariantsUrls).length} variants uploaded`);
            console.log('Main image uploaded successfully, storing in updateData.image:', JSON.stringify(mainImageVariantsUrls, null, 2));
        } catch (uploadError) {
            console.error('Main image upload failed:', uploadError);
            throw new Error(`Main image upload failed: ${uploadError.message}`);
        }
    }

    if (req.mediaUpdate) {
        const { galleryOrder, existingImages, hasNewGalleryImages } = req.mediaUpdate;
        
        console.log('Processing gallery update...');
        console.log('Existing images:', existingImages.length);
        console.log('New images:', req.files?.gallery?.length || 0);
        console.log('Gallery order:', galleryOrder);

        let finalGalleryImages = [];

        let currentProductImages = [];
        if (existingProduct.images && Array.isArray(existingProduct.images)) {
            currentProductImages = existingProduct.images.map(img => {
                if (typeof img === 'string') {
                    try {
                        return JSON.parse(img);
                    } catch (e) {
                        return img;
                    }
                }
                return img;
            });
        }

        let newUploadedImages = [];
        if (hasNewGalleryImages && req.files?.gallery && req.files.gallery.length > 0) {
            console.log(`Uploading ${req.files.gallery.length} new gallery images...`);
            
            try {
                const galleryPromises = req.files.gallery.map(async (img, index) => {
                    console.log(`Uploading gallery image ${index + 1}/${req.files.gallery.length}`);
                    const variants = await uploadVariants(img);
                    return variants;
                });
                
                newUploadedImages = await Promise.all(galleryPromises);
                uploadResults.push(`Gallery images uploaded: ${newUploadedImages.length} new images`);
                console.log('New gallery images uploaded successfully:', newUploadedImages.length, 'images');
            } catch (uploadError) {
                console.error('Gallery images upload failed:', uploadError);
                throw new Error(`Gallery images upload failed: ${uploadError.message}`);
            }
        }

        if (galleryOrder && galleryOrder.length > 0) {
            console.log('Applying custom gallery order...');
            
            const newImageMap = new Map();
            newUploadedImages.forEach((img, index) => {
                newImageMap.set(`new_${index}`, img);
            });

            const currentImageMap = new Map();
            currentProductImages.forEach((img) => {
                if (typeof img === 'string') {
                    currentImageMap.set(img, img);
                } else if (img && typeof img === 'object') {
                    if (img.largeUrl) currentImageMap.set(img.largeUrl, img);
                    if (img.mediumUrl) currentImageMap.set(img.mediumUrl, img);
                    if (img.smallUrl) currentImageMap.set(img.smallUrl, img);
                    if (img.extraLargeUrl) currentImageMap.set(img.extraLargeUrl, img);
                }
            });

            galleryOrder.forEach(item => {
                if (typeof item === 'string' && item.startsWith('new_')) {
                    const newImg = newImageMap.get(item);
                    if (newImg) {
                        finalGalleryImages.push(newImg);
                    }
                } else if (typeof item === 'string') {
                    const existingImg = currentImageMap.get(item);
                    if (existingImg) {
                        finalGalleryImages.push(existingImg);
                    } else {
                        finalGalleryImages.push(item);
                    }
                } else {
                    finalGalleryImages.push(item);
                }
            });
            
            uploadResults.push(`Gallery reordered: ${finalGalleryImages.length} images in custom order`);
        } else if (existingImages.length > 0) {
            finalGalleryImages = [...currentProductImages, ...newUploadedImages];
            
            uploadResults.push(`Gallery updated: kept ${currentProductImages.length} existing images`);
            if (newUploadedImages.length > 0) {
                uploadResults.push(`Added ${newUploadedImages.length} new images`);
            }
        } else {
            finalGalleryImages = newUploadedImages;
        }

        updateData.images = finalGalleryImages;
        console.log(`Final gallery contains ${finalGalleryImages.length} images`);
    }

    if (Object.keys(updateData).length === 0) {
        throw new ValidationError('No valid media files or updates provided');
    }

    console.log('Updating product in database...');
    const updatedProduct = await prisma.product.update({
        where: { id: productId },
        data: updateData
    });

    console.log('Raw response from database update:');
    console.log('- image type:', typeof updatedProduct.image);
    console.log('- image value:', updatedProduct.image);
    console.log('- images type:', typeof updatedProduct.images);
    console.log('- images length:', updatedProduct.images?.length);
    if (updatedProduct.images?.length > 0) {
        console.log('- first image in array type:', typeof updatedProduct.images[0]);
        console.log('- first image in array value:', updatedProduct.images[0]);
    }

    let processedImage = updatedProduct.image;
    let processedImages = updatedProduct.images;

    if (processedImage && typeof processedImage === 'string') {
        try {
            processedImage = JSON.parse(processedImage);
            console.warn('Had to parse image field as string - this should not happen with Prisma JSON fields');
        } catch (e) {
            console.error('Failed to parse image JSON string in response:', processedImage);
        }
    }

    if (processedImages && Array.isArray(processedImages)) {
        processedImages = processedImages.map(img => {
            if (typeof img === 'string') {
                try {
                    const parsed = JSON.parse(img);
                    console.warn('Had to parse images array item as string - this should not happen with Prisma JSON fields');
                    return parsed;
                } catch (e) {
                    console.error('Failed to parse image JSON string in response:', img);
                    return img;
                }
            }
            return img;
        });
    }

    const responseData = {
        id: updatedProduct.id,
        image: processedImage,
        images: processedImages,
        metadata: {
            uploadResults,
            mediaUpdate: req.mediaUpdate,
            updatedAt: updatedProduct.updatedAt
        }
    };

    console.log('Product media updated successfully');
    return sendSuccess(res, { data: responseData }, 'Product media updated successfully');
});

export {
    updateProductMedia
};
