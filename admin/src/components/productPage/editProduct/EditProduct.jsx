import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Button, Typography, Grid, Stack, Alert, Skeleton
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { 
    getAdminProduct, 
    updateProduct, 
    updateProductCoreDetails, 
    updateProductCategorization, 
    updateProductMedia 
} from '../../../api/index.js';

// Import the individual components
import ProductCoreDetails from './components/ProductCoreDetails.jsx';
import ProductVariants from './components/ProductVariants.jsx';
import ProductCategorization from './components/ProductCategorization.jsx';
import ProductMedia from './components/ProductMedia.jsx';

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productData, setProductData] = useState(null);

    const getImageUrl = (imageObj) => {
        if (!imageObj) return null;
        if (typeof imageObj === 'string') return imageObj;
        if (typeof imageObj === 'object') {
            const url = imageObj.mediumUrl || imageObj.originalUrl || imageObj.url || null;
            console.log('Extracted main image URL:', url, 'from:', imageObj);
            return url;
        }
        return null;
    };

    const prepareGalleryImages = (images) => {
        if (!Array.isArray(images)) return [];
        const prepared = images.map((img, index) => ({
            id: `gallery_${index}`,
            url: getImageUrl(img),
            name: `Gallery Image ${index + 1}`,
            isNew: false
        })).filter(img => img.url);
        console.log('Prepared gallery images:', prepared);
        return prepared;
    };

    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await getAdminProduct(productId);
                
                if (response.data.success) {
                    const data = response.data.data;

                    console.log('Product image data:', {
                        image: data.image,
                        images: data.images
                    });

                    const preparedData = {
                        name: data.name || '',
                        description: data.description || '',
                        fullDescription: data.longDescription || '',

                        category: data.category || '',
                        badge: data.badge || '',
                        features: data.features || [],
                        isNew: data.isNew || false,
                        featured: data.featured || false,
                        organic: data.organic || false,
                        fastDelivery: data.fastDelivery || false,

                        variants: data.variants && data.variants.length > 0 
                            ? data.variants.map(v => ({
                                id: v.id.toString(),
                                size: v.size || '',
                                price: v.price?.toString() || '',
                                oldPrice: v.oldPrice?.toString() || '',
                                stock: v.stock?.toString() || '',
                                sku: v.sku || ''
                            }))
                            : [{
                                id: 'temp_default',
                                size: 'Default',
                                price: data.price?.toString() || '',
                                oldPrice: data.oldPrice?.toString() || '',
                                stock: data.stock?.toString() || '',
                                sku: ''
                            }],
                        defaultVariantId: data.defaultVariant ? data.defaultVariant.id.toString() : 'temp_default',

                        mainImageUrl: getImageUrl(data.image),
                        galleryImages: prepareGalleryImages(data.images)
                    };
                    
                    setProductData(preparedData);
                } else {
                    setError('Failed to load product data');
                }
            } catch (err) {
                console.error('Error loading product:', err);
                setError(err.response?.data?.message || 'Failed to load product data');
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            loadProduct();
        }
    }, [productId]);

    // Save handlers for each component
    const handleSaveCoreDetails = async (coreDetailsData) => {
        await updateProductCoreDetails(productId, coreDetailsData);
    };

    const handleSaveVariants = async (variantsData) => {
        await updateProduct(productId, variantsData);
    };

    const handleSaveCategorization = async (categorizationData) => {
        await updateProductCategorization(productId, categorizationData);
    };

    const handleSaveMedia = async (mediaData) => {
        const formData = mediaData.formData || mediaData;
        await updateProductMedia(productId, formData);
    };

    if (loading || !productData) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Stack spacing={3}>
                    <Skeleton variant="text" width={300} height={40} />
                    <Skeleton variant="rectangular" width="100%" height={200} />
                    <Skeleton variant="rectangular" width="100%" height={300} />
                </Stack>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/products')}>
                    Back to Products
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button startIcon={<ArrowBack />} onClick={() => navigate('/dashboard/products')}>
                    Back to Products
                </Button>
                <Typography variant="h4">Edit Product</Typography>
            </Box>

            <Grid container spacing={4}>
                <Grid item xs={12} md={7} lg={8}>
                    <Stack spacing={4}>
                        <ProductCoreDetails 
                            product={productData}
                            onSave={handleSaveCoreDetails}
                            loading={loading}
                        />

                        <ProductVariants 
                            product={{
                                variants: productData.variants,
                                defaultVariantId: productData.defaultVariantId
                            }}
                            onSave={handleSaveVariants}
                            loading={loading}
                        />

                        <ProductCategorization 
                            product={productData}
                            onSave={handleSaveCategorization}
                            loading={loading}
                        />
                    </Stack>
                    <Stack spacing={4}>
                        <ProductMedia 
                            product={productData}
                            onSave={handleSaveMedia}
                            loading={loading}
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EditProduct;