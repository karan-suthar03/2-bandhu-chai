import React from 'react';
import { Card, CardContent, Typography, TextField, Stack } from '@mui/material';
import { Store } from '@mui/icons-material';

const ProductCoreDetails = ({ product, handleChange, errors, loading }) => (
    <Card elevation={2}>
        <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}><Store /> Core Details</Typography>
            <Stack spacing={2}>
                <TextField label="Product Name" name="name" value={product.name} onChange={handleChange} fullWidth required error={!!errors.name} helperText={errors.name} disabled={loading} />
                <TextField label="Short Description" name="description" value={product.description} onChange={handleChange} fullWidth multiline rows={3} error={!!errors.description} helperText={errors.description} disabled={loading} />
                <TextField label="Full Description" name="longDescription" value={product.longDescription} onChange={handleChange} fullWidth multiline rows={6} disabled={loading} />
            </Stack>
        </CardContent>
    </Card>
);

export default ProductCoreDetails;