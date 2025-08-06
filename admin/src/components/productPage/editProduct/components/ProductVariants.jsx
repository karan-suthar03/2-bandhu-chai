import React, { useState } from 'react';
import {
    Box, Button, TextField, Typography, Card, CardContent, Stack, Divider, Radio,
    Paper, Grid, IconButton, Tooltip, FormControlLabel, CircularProgress, Alert
} from '@mui/material';
import { AttachMoney, Save, AddCircleOutline, Delete } from '@mui/icons-material';
import { calculateDiscountPercentage, formatDiscountDisplay } from '../../../../utils/pricingUtils.js';

const ProductVariants = ({ product, onSave, loading }) => {
    const [variants, setVariants] = useState(product.variants || []);
    const [defaultVariantId, setDefaultVariantId] = useState(product.defaultVariantId);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const isDisabled = loading || saving;

    const handleAddVariant = () => {
        const newVariant = {
            id: `temp_${Date.now()}`,
            size: '',
            price: '',
            oldPrice: '',
            stock: '',
            sku: ''
        };
        setVariants(prev => [...prev, newVariant]);
    };

    const handleRemoveVariant = (idToRemove) => {
        if (defaultVariantId === idToRemove) {
            setDefaultVariantId(null);
        }
        setVariants(prev => prev.filter(v => v.id !== idToRemove));
    };

    const handleVariantChange = (id, field, value) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
        setStatus(null);
    };

    const validate = () => {
        const newErrors = { variants: [] };
        
        if (variants.length === 0) {
            newErrors.variants = 'At least one product variant is required.';
            setErrors(newErrors);
            return false;
        }

        variants.forEach((v, index) => {
            const variantError = {};
            if (!v.size.trim()) variantError.size = 'Size is required.';
            if (!v.price || parseFloat(v.price) <= 0) variantError.price = 'Valid price is required.';
            if (!v.stock || parseInt(v.stock) < 0) variantError.stock = 'Valid stock is required.';
            if (Object.keys(variantError).length > 0) newErrors.variants[index] = variantError;
        });

        if (!defaultVariantId) {
            const errorMsg = 'You must select one variant as the default.';
            newErrors.variants = typeof newErrors.variants === 'string' ? 
                `${newErrors.variants} ${errorMsg}` : errorMsg;
        }

        const hasVariantErrors = Array.isArray(newErrors.variants) && 
            newErrors.variants.some(e => e && Object.keys(e).length > 0);
        
        setErrors(newErrors);
        return !hasVariantErrors && typeof newErrors.variants !== 'string';
    };

    const handleSave = async () => {
        if (!validate()) return;
        
        setSaving(true);
        setStatus(null);
        
        try {
            const variantsForSubmission = variants.map(v => {
                const baseVariant = {
                    size: v.size,
                    price: parseFloat(v.price) || 0,
                    oldPrice: v.oldPrice ? parseFloat(v.oldPrice) : null,
                    stock: parseInt(v.stock, 10) || 0,
                    sku: v.sku,
                    discount: calculateDiscountPercentage(v.price, v.oldPrice),
                    isDefault: v.id === defaultVariantId,
                };

                if (!v.id.startsWith('temp_')) {
                    baseVariant.id = parseInt(v.id);
                }

                return baseVariant;
            });

            const updateData = {
                variants: variantsForSubmission,
                defaultVariantId: defaultVariantId.startsWith('temp_') ? null : parseInt(defaultVariantId)
            };

            await onSave(updateData);
            setStatus({ type: 'success', message: 'Variants saved successfully!' });
            
        } catch (error) {
            setStatus({ type: 'error', message: error.message || 'Failed to save variants.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <AttachMoney /> Variants, Pricing & Stock
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage product variants like different sizes or weights. Select one as the default to be shown on the product page.
                </Typography>

                <Stack spacing={3} divider={<Divider />}>
                    {variants.map((variant, index) => {
                        const calculatedDiscount = formatDiscountDisplay(
                            calculateDiscountPercentage(parseFloat(variant.price) || 0, parseFloat(variant.oldPrice) || 0)
                        );
                        const variantErrors = errors?.variants?.[index] || {};

                        return (
                            <Paper key={variant.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                                <FormControlLabel
                                    value={variant.id}
                                    control={
                                        <Radio 
                                            checked={defaultVariantId === variant.id} 
                                            onChange={(e) => setDefaultVariantId(e.target.value)} 
                                            disabled={isDisabled} 
                                        />
                                    }
                                    label={`Variant ${index + 1} (Set as Default)`}
                                    sx={{ mb: 2, fontWeight: 'medium' }}
                                />

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField 
                                            label="Size" 
                                            name="size" 
                                            value={variant.size} 
                                            fullWidth 
                                            required 
                                            onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)} 
                                            error={!!variantErrors.size} 
                                            helperText={variantErrors.size} 
                                            disabled={isDisabled}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField 
                                            label="Price" 
                                            name="price" 
                                            type="number" 
                                            value={variant.price} 
                                            fullWidth 
                                            required 
                                            onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)} 
                                            error={!!variantErrors.price} 
                                            helperText={variantErrors.price} 
                                            disabled={isDisabled}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField 
                                            label="Old Price" 
                                            name="oldPrice" 
                                            type="number" 
                                            value={variant.oldPrice} 
                                            fullWidth 
                                            onChange={(e) => handleVariantChange(variant.id, 'oldPrice', e.target.value)} 
                                            disabled={isDisabled}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField 
                                            label="Stock" 
                                            name="stock" 
                                            type="number" 
                                            value={variant.stock} 
                                            fullWidth 
                                            required 
                                            onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)} 
                                            error={!!variantErrors.stock} 
                                            helperText={variantErrors.stock} 
                                            disabled={isDisabled}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField 
                                            label="SKU" 
                                            name="sku" 
                                            value={variant.sku} 
                                            fullWidth 
                                            onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)} 
                                            disabled={isDisabled}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <TextField 
                                            label="Discount (%)" 
                                            name="discount" 
                                            value={calculatedDiscount} 
                                            fullWidth 
                                            disabled 
                                            InputProps={{ style: { backgroundColor: '#f5f5f5' }}}
                                        />
                                    </Grid>
                                </Grid>

                                {variants.length > 1 && (
                                    <Tooltip title="Remove Variant">
                                        <IconButton 
                                            onClick={() => handleRemoveVariant(variant.id)} 
                                            size="small" 
                                            sx={{ position: 'absolute', top: 8, right: 8 }} 
                                            disabled={isDisabled}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>

                <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button 
                        startIcon={<AddCircleOutline />} 
                        onClick={handleAddVariant} 
                        disabled={isDisabled}
                    >
                        Add Another Variant
                    </Button>
                    
                    <Button 
                        variant="contained" 
                        color="primary" 
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={isDisabled}
                    >
                        {saving ? 'Saving...' : 'Save Variants'}
                    </Button>
                </Box>
                
                {status && (
                    <Alert severity={status.type} sx={{ mt: 2 }}>
                        {status.message}
                    </Alert>
                )}
                
                {typeof errors.variants === 'string' && (
                    <Typography color="error" variant="body2" sx={{ display: 'block', mt: 1 }}>
                        {errors.variants}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default ProductVariants;
