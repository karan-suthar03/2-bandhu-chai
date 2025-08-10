import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Stack, Alert, Skeleton, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import ProductCoreDetails from './components/ProductCoreDetails';
import ProductVariants from './components/ProductVariants';
import ProductCategorization from './components/ProductCategorization';
import ProductMedia from './components/ProductMedia';
import {useEditProduct} from "../../hooks/useEditProduct.js";

const EditProductSkeleton = () => (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Stack spacing={3}>
            <Skeleton variant="text" width={300} height={40} />
            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}><Stack spacing={4}><Skeleton variant="rectangular" height={300} /><Skeleton variant="rectangular" height={400} /></Stack></Grid>
                <Grid item xs={12} lg={4}><Stack spacing={4}><Skeleton variant="rectangular" height={350} /></Stack></Grid>
            </Grid>
        </Stack>
    </Box>
);

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { product, loading, saving, error, onSaveCoreDetails, onSaveVariants, onSaveCategorization, onSaveMedia } = useEditProduct(productId);

    if (loading) return <EditProductSkeleton />;
    if (error) return (
        <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Button startIcon={<ArrowBack />} onClick={() => navigate('/products')}>Back to Products</Button>
        </Box>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f4f6f8' }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/products')}>Back to Products</Button>
                <Typography variant="h4">Edit Product: {product.core.name}</Typography>
            </Box>
            <Grid container spacing={4}>
                <Grid item xs={12} lg={8}>
                    <Stack spacing={4}>
                        <ProductCoreDetails product={product.core} onSave={onSaveCoreDetails} loading={saving.core} />
                        <ProductVariants product={product.variants} onSave={onSaveVariants} loading={saving.variants} />
                        <ProductCategorization product={product.categorization} onSave={onSaveCategorization} loading={saving.categorization} />
                        <ProductMedia product={product.media} onSave={onSaveMedia} loading={saving.media} />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EditProduct;