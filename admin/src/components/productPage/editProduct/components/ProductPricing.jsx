import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Divider, Grid, CircularProgress, Alert } from '@mui/material';
import { AttachMoney, Percent, Save } from '@mui/icons-material';

const ProductPricing = ({ product, onSave, loading }) => {
    const [pricing, setPricing] = useState({
        price: product.price,
        oldPrice: product.oldPrice,
        stock: product.stock,
        discount: product.discount,
    });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const isDisabled = loading || saving;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPricing(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        setStatus(null);
    };

    const validate = () => {
        const newErrors = {};
        if (!pricing.price || pricing.price <= 0) newErrors.price = 'A valid price is required.';
        if (!pricing.stock || pricing.stock < 0) newErrors.stock = 'A valid stock count is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        setStatus(null);
        try {
            await onSave(pricing);
            setStatus({ type: 'success', message: 'Pricing saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to save pricing.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <AttachMoney color="primary" /> Pricing, Stock & Discount <Percent fontSize="small" />
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Price" name="price" type="number" value={pricing.price}
                            onChange={handleChange} fullWidth required error={!!errors.price}
                            helperText={errors.price} disabled={isDisabled}
                            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Old Price (Optional)" name="oldPrice" type="number" value={pricing.oldPrice}
                            onChange={handleChange} fullWidth disabled={isDisabled}
                            InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography> }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Stock Quantity" name="stock" type="number" value={pricing.stock}
                            onChange={handleChange} fullWidth required error={!!errors.stock}
                            helperText={errors.stock} disabled={isDisabled}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Discount (%)" name="discount" type="number" value={pricing.discount}
                            onChange={handleChange} fullWidth disabled={isDisabled}
                            InputProps={{ endAdornment: <Typography sx={{ ml: 1 }}>%</Typography> }}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={isDisabled}
                    >
                        {saving ? 'Saving...' : 'Save Pricing'}
                    </Button>
                </Box>
                {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}
            </CardContent>
        </Card>
    );
};

export default ProductPricing;