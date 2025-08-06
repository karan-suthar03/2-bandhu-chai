import React from 'react';
import {
    Box, Button, TextField, Typography, Card, CardContent, Stack, Divider, Radio,
    Paper, Grid, IconButton, Tooltip, FormControlLabel
} from '@mui/material';
import { AttachMoney, AddCircleOutline, Delete } from '@mui/icons-material';
import { calculateDiscountPercentage, formatDiscountDisplay } from '../../../utils/pricingUtils.js';

const VariantManager = ({ variants, defaultVariantId, setDefaultVariantId, errors, loading, onVariantChange, onAddVariant, onRemoveVariant }) => {

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <AttachMoney /> Variants, Pricing & Stock
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add product variants like different sizes or weights. Select one as the default to be shown on the product page.
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
                                    control={<Radio checked={defaultVariantId === variant.id} onChange={(e) => setDefaultVariantId(e.target.value)} disabled={loading} />}
                                    label={`Variant ${index + 1} (Set as Default)`}
                                    sx={{ mb: 2, fontWeight: 'medium' }}
                                />

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="Size" name="size" value={variant.size} fullWidth required onChange={(e) => onVariantChange(variant.id, 'size', e.target.value)} error={!!variantErrors.size} helperText={variantErrors.size} disabled={loading}/></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="Price" name="price" type="number" value={variant.price} fullWidth required onChange={(e) => onVariantChange(variant.id, 'price', e.target.value)} error={!!variantErrors.price} helperText={variantErrors.price} disabled={loading}/></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="Old Price" name="oldPrice" type="number" value={variant.oldPrice} fullWidth onChange={(e) => onVariantChange(variant.id, 'oldPrice', e.target.value)} disabled={loading}/></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="Stock" name="stock" type="number" value={variant.stock} fullWidth required onChange={(e) => onVariantChange(variant.id, 'stock', e.target.value)} error={!!variantErrors.stock} helperText={variantErrors.stock} disabled={loading}/></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="SKU" name="sku" value={variant.sku} fullWidth onChange={(e) => onVariantChange(variant.id, 'sku', e.target.value)} disabled={loading}/></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="Discount (%)" name="discount" value={calculatedDiscount} fullWidth disabled InputProps={{ style: { backgroundColor: '#f5f5f5' }}}/></Grid>
                                </Grid>

                                {variants.length > 1 && (
                                    <Tooltip title="Remove Variant">
                                        <IconButton onClick={() => onRemoveVariant(variant.id)} size="small" sx={{ position: 'absolute', top: 8, right: 8 }} disabled={loading}>
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>

                <Button startIcon={<AddCircleOutline />} onClick={onAddVariant} sx={{ mt: 2 }} disabled={loading}>
                    Add Another Variant
                </Button>
                {typeof errors.variants === 'string' && <Typography color="error" variant="body2" sx={{ display: 'block', mt: 1 }}>{errors.variants}</Typography>}
            </CardContent>
        </Card>
    );
};

export default VariantManager;