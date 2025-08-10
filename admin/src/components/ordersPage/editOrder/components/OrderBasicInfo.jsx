import React, { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    Alert,
    CircularProgress,
    Divider,
    Switch,
    FormControlLabel
} from '@mui/material';
import { Save } from '@mui/icons-material';
import { formatCurrency } from "../../../Utils/Utils.js";

const OrderBasicInfo = ({ order, onSave, saving }) => {
    const [formData, setFormData] = useState({
        subtotal: order.subtotal || '0',
        totalDiscount: order.totalDiscount || '0',
        shippingCost: order.shippingCost || '0',
        finalTotal: order.finalTotal || '0'
    });
    const [autoCalculate, setAutoCalculate] = useState(false);
    const [isModified, setIsModified] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (autoCalculate) {
            const subtotal = parseFloat(formData.subtotal) || 0;
            const totalDiscount = parseFloat(formData.totalDiscount) || 0;
            const shippingCost = parseFloat(formData.shippingCost) || 0;

            const calculatedFinalTotal = subtotal - totalDiscount + shippingCost;

            setFormData(prev => ({
                ...prev,
                finalTotal: calculatedFinalTotal.toString()
            }));
        }
    }, [formData.subtotal, formData.totalDiscount, formData.shippingCost, autoCalculate]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setIsModified(true);
        setError('');
        setSuccess('');
    };

    const validateAndCalculate = () => {
        const subtotal = parseFloat(formData.subtotal) || 0;
        const totalDiscount = parseFloat(formData.totalDiscount) || 0;
        const shippingCost = parseFloat(formData.shippingCost) || 0;
        const finalTotal = parseFloat(formData.finalTotal) || 0;

        if (subtotal < 0) return 'Subtotal cannot be negative';
        if (totalDiscount < 0) return 'Discount cannot be negative';
        if (totalDiscount > subtotal) return 'Discount cannot be greater than subtotal';
        if (shippingCost < 0) return 'Shipping cost cannot be negative';
        if (finalTotal < 0) return 'Final total cannot be negative';

        if (!autoCalculate) {
            const expectedTotal = subtotal - totalDiscount + shippingCost;
            const difference = Math.abs(expectedTotal - finalTotal);
            if (difference > 0.01) { // Allow for small floating-point rounding differences
                return `Manual calculation mismatch. Expected total: ${formatCurrency(expectedTotal)}, but got: ${formatCurrency(finalTotal)}`;
            }
        }

        return null;
    };

    const handleSave = async () => {
        setError('');

        const validationError = validateAndCalculate();
        if (validationError) {
            setError(validationError);
            return;
        }

        const saveData = {
            subtotal: parseFloat(formData.subtotal),
            totalDiscount: parseFloat(formData.totalDiscount),
            shippingCost: parseFloat(formData.shippingCost),
            finalTotal: parseFloat(formData.finalTotal)
        };

        try {
            await onSave(saveData);
            setIsModified(false);
            setSuccess('Order pricing updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Save error:', err);
            setError(err.message || 'Failed to save changes. Please try again.');
        }
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                        Order Pricing
                    </Typography>
                    <Box display="flex" gap={1} alignItems="center">
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={autoCalculate}
                                    onChange={(e) => setAutoCalculate(e.target.checked)}
                                    size="small"
                                />
                            }
                            label="Auto Calculate"
                            sx={{ mr: 2 }}
                        />
                        <Button
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                            onClick={handleSave}
                            disabled={!isModified || saving}
                            size="small"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Subtotal" type="number" value={formData.subtotal} onChange={(e) => handleInputChange('subtotal', e.target.value)} InputProps={{ startAdornment: '₹' }} helperText="Base amount before discounts" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Total Discount" type="number" value={formData.totalDiscount} onChange={(e) => handleInputChange('totalDiscount', e.target.value)} InputProps={{ startAdornment: '₹' }} helperText="Total discount applied" />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Shipping Cost" type="number" value={formData.shippingCost} onChange={(e) => handleInputChange('shippingCost', e.target.value)} InputProps={{ startAdornment: '₹' }} helperText="Shipping and handling charges" />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Final Total" type="number" value={formData.finalTotal} onChange={(e) => handleInputChange('finalTotal', e.target.value)} InputProps={{ startAdornment: '₹' }} helperText={autoCalculate ? "Auto-calculated total" : "Manual final total"} disabled={autoCalculate} sx={{ '& .MuiInputBase-root': { backgroundColor: autoCalculate ? 'action.hover' : 'transparent', fontWeight: 'bold' } }} />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                <Box>
                    <Typography variant="subtitle2" gutterBottom>
                        Calculation Breakdown:
                    </Typography>
                    <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                        <Grid container spacing={1}>
                            <Grid item xs={8}><Typography variant="body2">Subtotal:</Typography></Grid>
                            <Grid item xs={4} textAlign="right"><Typography variant="body2">{formatCurrency(formData.subtotal)}</Typography></Grid>

                            <Grid item xs={8}><Typography variant="body2" color="error">Less: Discount:</Typography></Grid>
                            <Grid item xs={4} textAlign="right"><Typography variant="body2" color="error">-{formatCurrency(formData.totalDiscount)}</Typography></Grid>

                            <Grid item xs={8}><Typography variant="body2">Add: Shipping:</Typography></Grid>
                            <Grid item xs={4} textAlign="right"><Typography variant="body2">+{formatCurrency(formData.shippingCost)}</Typography></Grid>

                            <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>

                            <Grid item xs={8}><Typography variant="body1" fontWeight="bold">Final Total:</Typography></Grid>
                            <Grid item xs={4} textAlign="right"><Typography variant="body1" fontWeight="bold" color="primary">{formatCurrency(formData.finalTotal)}</Typography></Grid>
                        </Grid>
                    </Box>
                </Box>

                <Box mt={3} p={2} bgcolor="info.light" sx={{ color: 'info.dark' }} borderRadius={1}>
                    <Typography variant="body2">
                        <strong>Auto-Calculate Mode:</strong> When enabled, totals are calculated automatically. When disabled, you can set all values manually, but they must add up correctly.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default OrderBasicInfo;