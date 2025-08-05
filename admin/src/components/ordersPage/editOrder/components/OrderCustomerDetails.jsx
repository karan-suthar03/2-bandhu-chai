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
    CircularProgress
} from '@mui/material';
import { Save, Person } from '@mui/icons-material';

const parseAddress = (address) => {
    if (!address) {
        return { street: '', city: '', state: '', pincode: '', landmark: '' };
    }
    if (typeof address === 'string') {
        try {
            const parsed = JSON.parse(address);
            if (typeof parsed === 'object' && parsed !== null) {
                return {
                    street: parsed.street || '',
                    city: parsed.city || '',
                    state: parsed.state || '',
                    pincode: parsed.pincode || '',
                    landmark: parsed.landmark || ''
                };
            }
        } catch (e) {
            return { street: address, city: '', state: '', pincode: '', landmark: '' };
        }
    }
    return {
        street: address.street || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        landmark: address.landmark || ''
    };
};

const OrderCustomerDetails = ({ order, onSave, saving }) => {
    const [formData, setFormData] = useState({
        customerName: order.customerName || '',
        customerEmail: order.customerEmail || '',
        customerPhone: order.customerPhone || '',
        shippingAddress: parseAddress(order.shippingAddress)
    });
    const [isModified, setIsModified] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        setFormData({
            customerName: order.customerName || '',
            customerEmail: order.customerEmail || '',
            customerPhone: order.customerPhone || '',
            shippingAddress: parseAddress(order.shippingAddress)
        });
    }, [order]);

    const handleInputChange = (field, value) => {
        if (field.startsWith('shippingAddress.')) {
            const addressField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                shippingAddress: {
                    ...prev.shippingAddress,
                    [addressField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
        setIsModified(true);
        setError('');
        setSuccess('');
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validatePhone = (phone) => {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    };

    const handleSave = async () => {
        try {
            setError('');
            
            if (!formData.customerName.trim()) {
                setError('Customer name is required');
                return;
            }
            if (!validateEmail(formData.customerEmail)) {
                setError('Please enter a valid email address');
                return;
            }
            if (!validatePhone(formData.customerPhone)) {
                setError('Please enter a valid phone number');
                return;
            }
            if (!formData.shippingAddress.street.trim()) {
                setError('Street address is required');
                return;
            }
            if (!formData.shippingAddress.city.trim()) {
                setError('City is required');
                return;
            }
            if (!formData.shippingAddress.state.trim()) {
                setError('State is required');
                return;
            }
            if (!formData.shippingAddress.pincode.trim()) {
                setError('Pincode is required');
                return;
            }

            const saveData = {
                customerName: formData.customerName.trim(),
                customerEmail: formData.customerEmail.trim(),
                customerPhone: formData.customerPhone.trim(),
                shippingAddress: {
                    street: formData.shippingAddress.street.trim(),
                    city: formData.shippingAddress.city.trim(),
                    state: formData.shippingAddress.state.trim(),
                    pincode: formData.shippingAddress.pincode.trim(),
                    landmark: formData.shippingAddress.landmark.trim()
                }
            };

            await onSave(saveData);
            setIsModified(false);
            setSuccess('Customer details updated successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Save error:', err);
            setError(err.message || 'Failed to save changes');
        }
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        <Person />
                        Customer & Shipping Details
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

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                    </Alert>
                )}

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Customer Name"
                            value={formData.customerName}
                            onChange={(e) => handleInputChange('customerName', e.target.value)}
                            required
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={formData.customerEmail}
                            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                            required
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Phone Number"
                            value={formData.customerPhone}
                            onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} mt={2}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            Shipping Address
                        </Typography>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Street Address"
                            value={formData.shippingAddress.street}
                            onChange={(e) => handleInputChange('shippingAddress.street', e.target.value)}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="City"
                            value={formData.shippingAddress.city}
                            onChange={(e) => handleInputChange('shippingAddress.city', e.target.value)}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="State"
                            value={formData.shippingAddress.state}
                            onChange={(e) => handleInputChange('shippingAddress.state', e.target.value)}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Pincode"
                            value={formData.shippingAddress.pincode}
                            onChange={(e) => handleInputChange('shippingAddress.pincode', e.target.value)}
                            required
                        />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Landmark (Optional)"
                            value={formData.shippingAddress.landmark}
                            onChange={(e) => handleInputChange('shippingAddress.landmark', e.target.value)}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

export default OrderCustomerDetails;
