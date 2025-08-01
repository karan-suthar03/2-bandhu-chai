import React from 'react';
import { Box, Typography, Button, Breadcrumbs, Link, Chip } from '@mui/material';
import { Edit, ArrowBack } from '@mui/icons-material';

const ProductHeader = ({ product, onBackClick, hasUnsavedChanges }) => (
    <Box sx={{ mb: 4 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
            <Link color="inherit" href="/dashboard" sx={{ textDecoration: 'none' }}>
                Dashboard
            </Link>
            <Link color="inherit" href="/dashboard/products" sx={{ textDecoration: 'none' }}>
                Products
            </Link>
            <Typography color="text.primary">Edit Product</Typography>
        </Breadcrumbs>

        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
            <Box>
                <Typography variant="h4" gutterBottom display="flex" alignItems="center" gap={1}>
                    <Edit color="primary" />
                    Edit Product
                    {product.deactivated && (
                        <Chip label="Deactivated" color="error" size="small" />
                    )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Product ID: {product.id} | Last Updated: {new Date(product.updatedAt).toLocaleDateString()}
                </Typography>
            </Box>

            <Box display="flex" gap={2} alignItems="center">
                {hasUnsavedChanges && (
                    <Chip
                        label="Unsaved Changes"
                        color="warning"
                        icon={<Edit />}
                        size="small"
                    />
                )}
                <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={onBackClick}
                >
                    Back to Products
                </Button>
            </Box>
        </Box>
    </Box>
);

export default ProductHeader;