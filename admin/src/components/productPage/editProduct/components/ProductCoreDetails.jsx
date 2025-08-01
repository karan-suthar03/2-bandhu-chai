import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Card, CardContent, Divider, CircularProgress, Alert } from '@mui/material';
import { Store, Save } from '@mui/icons-material';

const ProductCoreDetails = ({ product, onSave, loading }) => {
    const [details, setDetails] = useState({
        name: product.name,
        description: product.description,
        fullDescription: product.fullDescription
    });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [errors, setErrors] = useState({});

    const isDisabled = loading || saving;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDetails(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
        setStatus(null);
    };

    const validate = () => {
        const newErrors = {};
        if (!details.name.trim()) newErrors.name = 'Product name is required.';
        if (!details.description.trim()) newErrors.description = 'Short description is required.';
        if (!details.fullDescription.trim()) newErrors.fullDescription = 'Full description is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        setStatus(null);
        try {
            await onSave(details); // Simulate API call
            setStatus({ type: 'success', message: 'Core details saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to save details.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <Store color="primary" /> Core Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <TextField
                    label="Product Name"
                    name="name"
                    value={details.name}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={isDisabled}
                    sx={{ mb: 2 }}
                />

                <TextField
                    label="Short Description"
                    name="description"
                    value={details.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    required
                    error={!!errors.description}
                    helperText={errors.description}
                    disabled={isDisabled}
                    sx={{ mb: 2 }}
                />

                <TextField
                    label="Full Description"
                    name="fullDescription"
                    value={details.fullDescription}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={6}
                    required
                    error={!!errors.fullDescription}
                    helperText={errors.fullDescription}
                    disabled={isDisabled}
                />

                <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={isDisabled}
                    >
                        {saving ? 'Saving...' : 'Save Details'}
                    </Button>
                </Box>
                {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}
            </CardContent>
        </Card>
    );
};

export default ProductCoreDetails;