import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, TextField, Button, Box, Grid, Alert, CircularProgress, Divider } from '@mui/material'; // 1. Import Divider
import { Save, Person } from '@mui/icons-material';
import { parseAddress } from "../../Utils/orderUtils.jsx";

const OrderCustomerDetails = ({ order, onSave, saving }) => {
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        shippingAddress: {
            street: '',
            city: '',
            state: '',
            pincode: '',
            landmark: ''
        }
    });
    const [isModified, setIsModified] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (order) {
            setFormData({
                customerName: order.customerName || '',
                customerEmail: order.customerEmail || '',
                customerPhone: order.customerPhone || '',
                shippingAddress: parseAddress(order.shippingAddress) || {
                    street: '',
                    city: '',
                    state: '',
                    pincode: '',
                    landmark: ''
                }
            });
        }
    }, [order]);

    const handleInputChange = (field, value) => {
        const newFormData = { ...formData };
        if (field.startsWith('shippingAddress.')) {
            const addressField = field.split('.')[1];
            newFormData.shippingAddress[addressField] = value;
        } else {
            newFormData[field] = value;
        }
        setFormData(newFormData);
        setIsModified(true);
        setError('');
        setSuccess('');
    };

    const validateForm = () => {
        if (!formData.customerName.trim()) return 'Customer name is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) return 'Please enter a valid email.';
        if (!/^\+?[\d\s-()]{10,}$/.test(formData.customerPhone)) return 'Please enter a valid phone number.';
        if (!formData.shippingAddress.street.trim()) return 'Street address is required.';
        if (!formData.shippingAddress.city.trim()) return 'City is required.';
        if (!formData.shippingAddress.state.trim()) return 'State is required.';
        if (!/^\d{6}$/.test(formData.shippingAddress.pincode)) return 'Please enter a valid 6-digit pincode.';
        return null;
    };

    const handleSave = async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }
        try {
            const finalData = {
                ...formData,
                customerName: formData.customerName.trim(),
                customerEmail: formData.customerEmail.trim(),
                customerPhone: formData.customerPhone.trim(),
            };
            await onSave(finalData);
            setIsModified(false);
            setSuccess('Customer details updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.message || 'Failed to save changes.');
        }
    };


    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Person /> Customer & Shipping
                    </Typography>
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
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Customer Name" value={formData.customerName} onChange={(e) => handleInputChange('customerName', e.target.value)} required />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Email Address" type="email" value={formData.customerEmail} onChange={(e) => handleInputChange('customerEmail', e.target.value)} required />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField fullWidth label="Phone Number" value={formData.customerPhone} onChange={(e) => handleInputChange('customerPhone', e.target.value)} required />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1" fontWeight="bold">Shipping Address</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField fullWidth label="Street Address" value={formData.shippingAddress.street} onChange={(e) => handleInputChange('shippingAddress.street', e.target.value)} required />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField fullWidth label="City" value={formData.shippingAddress.city} onChange={(e) => handleInputChange('shippingAddress.city', e.target.value)} required />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField fullWidth label="State" value={formData.shippingAddress.state} onChange={(e) => handleInputChange('shippingAddress.state', e.target.value)} required />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField fullWidth label="Pincode" value={formData.shippingAddress.pincode} onChange={(e) => handleInputChange('shippingAddress.pincode', e.target.value)} required />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField fullWidth label="Landmark (Optional)" value={formData.shippingAddress.landmark} onChange={(e) => handleInputChange('shippingAddress.landmark', e.target.value)} />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default OrderCustomerDetails;