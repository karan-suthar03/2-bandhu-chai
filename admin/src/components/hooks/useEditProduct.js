import { useState, useEffect, useCallback } from 'react';
import {
    getAdminProduct,
    updateProduct,
    updateProductCategorization,
    updateProductCoreDetails, updateProductMedia
} from "../../api/index.js";

const getImageUrl = (imageObj) => (typeof imageObj === 'string' ? imageObj : imageObj?.mediumUrl || imageObj?.originalUrl || imageObj?.url || null);
const prepareGalleryImages = (images) => (Array.isArray(images) ? images.map((img, i) => ({ id: `gallery_${i}`, url: getImageUrl(img) })).filter(img => img.url) : []);

export const useEditProduct = (productId) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({ core: false, variants: false, categorization: false, media: false });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) {
            setError('No Product ID provided.');
            setLoading(false);
            return;
        }
        const loadProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getAdminProduct(productId);
                if (response.data.success) {
                    const data = response.data.data;
                    setProduct({
                        core: { name: data.name, description: data.description, fullDescription: data.longDescription },
                        variants: { variants: data.variants, defaultVariantId: data.defaultVariant?.id },
                        categorization: { category: data.category, badge: data.badge, features: data.features, isNew: data.isNew, featured: data.featured, organic: data.organic, fastDelivery: data.fastDelivery, deactivated: data.deactivated },
                        media: { mainImageUrl: getImageUrl(data.image), galleryImages: prepareGalleryImages(data.images) }
                    });
                } else {
                    throw new Error('Failed to load product data.');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [productId]);

    const handleSave = useCallback(async (section, saveFn, data) => {
        setSaving(prev => ({ ...prev, [section]: true }));
        try {
            await saveFn(productId, data);
        } catch (err) {
            console.error(`Error saving ${section}:`, err);
            throw err;
        } finally {
            setSaving(prev => ({ ...prev, [section]: false }));
        }
    }, [productId]);

    const onSaveCoreDetails = (data) => handleSave('core', updateProductCoreDetails, data);
    const onSaveVariants = (data) => handleSave('variants', updateProduct, data);
    const onSaveCategorization = (data) => handleSave('categorization', updateProductCategorization, data);
    const onSaveMedia = (data) => handleSave('media', updateProductMedia, data.formData || data);

    return {
        product,
        loading,
        saving,
        error,
        onSaveCoreDetails,
        onSaveVariants,
        onSaveCategorization,
        onSaveMedia
    };
};