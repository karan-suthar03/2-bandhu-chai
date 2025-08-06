import React from 'react';
import { Box, Grid, Card, CardContent, Stack } from '@mui/material';
import VariantManager from '../../variantsPage/components/VariantManager.jsx';
import ProductCoreDetails from './components/ProductCoreDetails';
import ProductCategorization from './components/ProductCategorization';
import ProductMedia from './components/ProductMedia';
import ProductAttributes from './components/ProductAttributes';
import {useAddProductForm} from "../../hooks/useAddProductForm.js";
const AddProduct = () => {
    const {
        product, setProduct, variants, defaultVariantId, setDefaultVariantId,
        loading, errors, mainImageUrl, isFormValid, mainImage, gallery, submissionStatus,
        handleChange, handleMainImageSelect, handleRemoveMainImage, handleGalleryAdd,
        handleRemoveGalleryImage, handleAddVariant, handleRemoveVariant, handleVariantChange,
        handleSubmit,
    } = useAddProductForm();
    return (
        <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <form onSubmit={handleSubmit} noValidate>
                <Grid container spacing={4}>
                    <Grid item xs={12} lg={8}>
                        <Stack spacing={4}>
                            <ProductCoreDetails product={product} handleChange={handleChange} errors={errors} loading={loading} />
                            <VariantManager
                                variants={variants}
                                defaultVariantId={defaultVariantId}
                                setDefaultVariantId={setDefaultVariantId}
                                errors={errors}
                                loading={loading}
                                onVariantChange={handleVariantChange}
                                onAddVariant={handleAddVariant}
                                onRemoveVariant={handleRemoveVariant}
                            />
                            <ProductCategorization product={product} setProduct={setProduct} handleChange={handleChange} errors={errors} loading={loading} />
                            <Card elevation={2}>
                                <CardContent>
                                    <ProductMedia
                                        mainImage={mainImage}
                                        gallery={gallery}
                                        handlers={{ onMainImageSelect: handleMainImageSelect, onRemoveMainImage: handleRemoveMainImage, onGalleryAdd: handleGalleryAdd, onRemoveGalleryImage: handleRemoveGalleryImage }}
                                        mainImageUrl={mainImageUrl}
                                        errors={errors}
                                        loading={loading}
                                    />
                                </CardContent>
                            </Card>
                            <ProductAttributes
                                product={product}
                                handleChange={handleChange}
                                submissionStatus={submissionStatus}
                                isFormValid={isFormValid}
                                loading={loading}
                            />
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};
export default AddProduct;