import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { Save } from '@mui/icons-material';
import {useProductVariants} from "../../../hooks/useProductVariant.js";
import {calculateDiscountPercentage} from "../../../../utils/pricingUtils.js";
import VariantManager from "../../../variantsPage/components/VariantManager.jsx";

const ProductVariants = ({ product, onSave, loading }) => {
    const {
        variants, defaultVariantId, setDefaultVariantId,
        handleAddVariant, handleRemoveVariant, handleVariantChange
    } = useProductVariants(product.variants, product.defaultVariantId);

    const [status, setStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = { variants: [] };
        if (variants.length === 0) {
            newErrors.variants = 'At least one variant is required.';
            setErrors(newErrors);
            return false;
        }
        variants.forEach((v, index) => {
            const variantError = {};
            if (!v.size?.trim()) variantError.size = 'Size is required.';
            if (!v.price || v.price <= 0) variantError.price = 'Valid price is required.';
            if (!v.stock || v.stock < 0) variantError.stock = 'Valid stock is required.';
            if (Object.keys(variantError).length > 0) newErrors.variants[index] = variantError;
        });
        if (!defaultVariantId) {
            newErrors.variants = 'You must select one variant as the default.';
        }
        const hasErrors = Array.isArray(newErrors.variants) && (newErrors.variants.length > 0 && newErrors.variants.some(e => !!e));
        setErrors(newErrors);
        return !hasErrors && typeof newErrors.variants !== 'string';
    };

    const handleSave = async () => {
        if (!validate()) return;
        setStatus(null);

        const variantsForSubmission = variants.map(v => ({
            id: v.id?.startsWith('temp_') ? undefined : parseInt(v.id, 10),
            size: v.size,
            price: parseFloat(v.price) || 0,
            oldPrice: v.oldPrice ? parseFloat(v.oldPrice) : null,
            stock: parseInt(v.stock, 10) || 0,
            sku: v.sku,
            discount: calculateDiscountPercentage(v.price, v.oldPrice),
            isDefault: v.id === defaultVariantId,
        }));
        const updateData = { variants: variantsForSubmission };

        try {
            await onSave(updateData);
            setStatus({ type: 'success', message: 'Variants saved successfully!' });
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Failed to save variants.' });
        }
    };

    return (
        <>
            <VariantManager
                variants={variants}
                defaultVariantId={defaultVariantId}
                setDefaultVariantId={setDefaultVariantId}
                errors={errors}
                loading={loading}
                onVariantChange={handleVariantChange}
                onAddVariant={handleAddVariant}
                onRemoveVariant={handleRemoveVariant}
            />
            <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save />}
                    onClick={handleSave}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Variants'}
                </Button>
            </Box>
            {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}
            {typeof errors.variants === 'string' && <Typography color="error" variant="body2" sx={{ display: 'block', mt: 1 }}>{errors.variants}</Typography>}
        </>
    );
};

export default ProductVariants;