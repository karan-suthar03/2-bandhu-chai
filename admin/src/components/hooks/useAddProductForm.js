import { useState, useMemo, useCallback } from 'react';
import {useProductVariants} from "./useProductVariant.js";
import {calculateDiscountPercentage} from "../../utils/pricingUtils.js";
import {postProduct} from "../../api/index.js";

const initialProductState = {
    name: '',
    category: '',
    badge: '',
    description: '',
    longDescription: '',
    features: [],
    isNew: false,
    featured: true,
    organic: false,
    fastDelivery: true,
};

const initialVariant = { id: `temp_${Date.now()}`, size: 'Default', price: '', oldPrice: '', stock: '', sku: '' };

export const useAddProductForm = () => {
    const [product, setProduct] = useState(initialProductState);
    const {
        variants, defaultVariantId, setDefaultVariantId,
        handleAddVariant, handleRemoveVariant, handleVariantChange
    } = useProductVariants([initialVariant], initialVariant.id);

    const [mainImage, setMainImage] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submissionStatus, setSubmissionStatus] = useState(null);

    const mainImageUrl = useMemo(() => (mainImage ? URL.createObjectURL(mainImage) : null), [mainImage]);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    }, [errors]);

    const handleMainImageSelect = useCallback((e) => { if (e.target.files?.[0]) setMainImage(e.target.files[0]); }, []);
    const handleRemoveMainImage = useCallback(() => setMainImage(null), []);
    const handleGalleryAdd = useCallback((e) => { if (e.target.files) setGallery(prev => [...prev, ...Array.from(e.target.files)]); }, []);
    const handleRemoveGalleryImage = useCallback((index) => { setGallery(prev => prev.filter((_, i) => i !== index)); }, []);

    const validateForm = useCallback(() => {
        const newErrors = { variants: [] };
        if (!product.name.trim()) newErrors.name = 'Product name is required.';
        if (!product.category.trim()) newErrors.category = 'Category is required.';
        if (!product.description.trim()) newErrors.description = 'A short description is required.';
        if (!mainImage) newErrors.mainImage = 'The main image is required.';

        if (variants.length === 0) {
            newErrors.variants = 'At least one product variant is required.';
        } else {
            variants.forEach((v, index) => {
                const variantError = {};
                if (!v.size.trim()) variantError.size = 'Size is required.';
                if (!v.price || v.price <= 0) variantError.price = 'Valid price is required.';
                if (!v.stock || v.stock < 0) variantError.stock = 'Valid stock is required.';
                if (Object.keys(variantError).length > 0) newErrors.variants[index] = variantError;
            });
        }
        if (!defaultVariantId) {
            const errorMsg = 'You must select one variant as the default.';
            newErrors.variants = typeof newErrors.variants === 'string' ? `${newErrors.variants} ${errorMsg}` : errorMsg;
        }

        const hasError = Object.values(newErrors).some(v => (Array.isArray(v) ? v.length > 0 : !!v));
        setErrors(newErrors);
        return !hasError;
    }, [product, mainImage, variants, defaultVariantId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setSubmissionStatus({ type: 'error', message: 'Please correct the errors before submitting.' });
            return;
        }

        setLoading(true);
        setSubmissionStatus(null);

        const formData = new FormData();
        Object.entries(product).forEach(([key, value]) => formData.append(key, key === 'features' ? JSON.stringify(value) : value));

        const variantsForSubmission = variants.map(v => ({
            size: v.size,
            price: parseFloat(v.price) || 0,
            oldPrice: v.oldPrice ? parseFloat(v.oldPrice) : null,
            stock: parseInt(v.stock, 10) || 0,
            sku: v.sku,
            discount: calculateDiscountPercentage(v.price, v.oldPrice),
            isDefault: v.id === defaultVariantId,
        }));
        formData.append('variants', JSON.stringify(variantsForSubmission));
        formData.append('mainImage', mainImage);
        gallery.forEach(file => formData.append('gallery', file));

        try {
            await postProduct(formData);
            setSubmissionStatus({ type: 'success', message: 'Product created successfully!' });
        } catch (error) {
            setSubmissionStatus({ type: 'error', message: error.response?.data?.message || 'Failed to create product.' });
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = useMemo(() => {
        return product.name && product.category && mainImage && variants.every(v => v.size && v.price > 0 && v.stock >= 0) && defaultVariantId;
    }, [product, mainImage, variants, defaultVariantId]);

    return {
        product, setProduct, variants, defaultVariantId, setDefaultVariantId, mainImage, gallery,
        loading, errors, submissionStatus, mainImageUrl, isFormValid,
        handleChange, handleMainImageSelect, handleRemoveMainImage, handleGalleryAdd,
        handleRemoveGalleryImage, handleAddVariant, handleRemoveVariant, handleVariantChange,
        handleSubmit,
    };
};