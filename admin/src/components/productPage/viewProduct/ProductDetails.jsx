import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Button, CircularProgress, Alert, Stack } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

import ProductDetailsHeader from './components/ProductDetailsHeader';
import ProductImageGallery from './components/ProductImageGallery';
import ProductInfoCard from './components/ProductInfoCard';
import ProductAttributes from './components/ProductAttributes';
import ProductVariantsTable from './components/ProductVariantsTable';
import ProductDescription from './components/ProductDescription';
import {useProductDetails} from "../../hooks/useProductDetails.js";

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const { product, loading, error } = useProductDetails(productId);

    const handleEdit = () => navigate(`/dashboard/products/edit/${productId}`);
    const handleBack = () => navigate('/dashboard/products');

    if (loading) {
        return <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px"><CircularProgress /></Box>;
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>Back to Products</Button>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box p={3}>
                <Alert severity="warning" sx={{ mb: 2 }}>Product not found.</Alert>
                <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>Back to Products</Button>
            </Box>
        );
    }

    return (
        <Box p={{ xs: 2, md: 3 }}>
            <ProductDetailsHeader
                product={product}
                onBack={handleBack}
                onEdit={handleEdit}
            />
            <Grid container spacing={3}>
                <Grid item xs={12} md={5} className="w-full" >
                    <Stack spacing={3}>
                        <ProductImageGallery
                            name={product.name}
                            mainImage={product.image}
                            galleryImages={product.images}
                        />
                        <ProductAttributes
                            product={product}
                        />
                        <ProductInfoCard product={product} />
                        <ProductVariantsTable
                            variants={product.variants}
                            defaultVariantId={product.defaultVariant?.id}
                        />
                        <ProductDescription product={product} />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProductDetails;