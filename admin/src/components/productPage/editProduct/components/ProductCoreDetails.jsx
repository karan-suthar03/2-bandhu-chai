import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    TextField,
    Typography,
    Card,
    CardContent,
    Divider,
    CircularProgress,
    Alert,
    Stack
} from '@mui/material';
import { Store, Save } from '@mui/icons-material';

const ProductCoreDetails = ({ product, onSave, loading }) => {
    const [details, setDetails] = useState(product);
    const [status, setStatus] = useState(null);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setDetails(product);
    }, [product]);

    const handleChange = (e) => {
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (errors[e.target.name]) {
            setErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
        setStatus(null);
    };

    const validate = () => {
        const newErrors = {};
        if (!details.name?.trim()) newErrors.name = 'Product name is required.';
        if (!details.description?.trim()) newErrors.description = 'Short description is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setStatus(null);
        try {
            await onSave(details);
            setStatus({ type: 'success', message: 'Core details saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Failed to save details.' });
        }
    };

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <Store color="primary" /> Core Details
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Stack spacing={2}>
                    <TextField
                        label="Product Name"
                        name="name"
                        value={details.name || ''}
                        onChange={handleChange}
                        fullWidth
                        required
                        error={!!errors.name}
                        helperText={errors.name}
                        disabled={loading}
                    />
                    <TextField
                        label="Short Description"
                        name="description"
                        value={details.description || ''}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        required
                        error={!!errors.description}
                        helperText={errors.description}
                        disabled={loading}
                    />
                    <TextField
                        label="Full Description"
                        name="fullDescription"
                        value={details.fullDescription || ''}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={6}
                        disabled={loading}
                    />
                </Stack>

                <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Button
                        variant="contained"
                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Details'}
                    </Button>
                </Box>
                {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}
            </CardContent>
        </Card>
    );
};

export default ProductCoreDetails;