import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Stack, Skeleton, Card, CardContent, Alert } from '@mui/material';
import { getAdminProduct, updateProductMedia } from '../../../api';

import ProductHeader from './components/ProductHeader';
import ProductCoreDetails from './components/ProductCoreDetails';
import ProductPricing from './components/ProductPricing';
import ProductCategorization from './components/ProductCategorization';
import ProductMedia from './components/ProductMedia';

const EditProduct = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await getAdminProduct(productId);
                
                if (response.data.success) {
                    const productData = response.data.data;
                    
                    // Transform the data to match the expected format
                    const transformedProduct = {
                        id: productData.id,
                        name: productData.name,
                        price: productData.price.toString(),
                        oldPrice: productData.oldPrice?.toString() || '',
                        stock: productData.stock.toString(),
                        category: productData.category,
                        badge: productData.badge,
                        description: productData.description,
                        fullDescription: productData.longDescription || '',
                        features: productData.features || [],
                        discount: productData.discount?.toString() || '',
                        isNew: productData.isNew,
                        featured: productData.featured,
                        organic: productData.organic,
                        fastDelivery: productData.fastDelivery,
                        deactivated: productData.deactivated,
                        createdAt: productData.createdAt,
                        updatedAt: productData.updatedAt,
                        mainImageUrl: (() => {
                            if (!productData.image) return '';
                            if (typeof productData.image === 'string') return productData.image;
                            return productData.image.largeUrl || productData.image.mediumUrl || productData.image.smallUrl || '';
                        })(),
                        galleryImages: (() => {
                            if (!productData.images || productData.images.length === 0) return [];
                            return productData.images.map((img, index) => {
                                if (typeof img === 'string') {
                                    return { id: index + 1, url: img };
                                }
                                return {
                                    id: index + 1,
                                    url: img.largeUrl || img.mediumUrl || img.smallUrl || ''
                                };
                            });
                        })()
                    };
                    
                    setProduct(transformedProduct);
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
        } else {
            setError('No product ID provided');
            setLoading(false);
        }
    }, [productId]);

    const handleSaveChanges = async (dataSection, saveData) => {
        console.log(`Saving ${dataSection}:`, saveData);

        setSaving(true);
        
        try {
            if (dataSection === 'media') {
                const { formData } = saveData;
                
                if (formData) {
                    const response = await updateProductMedia(product.id, formData);
                    
                    if (response.data.success) {
                        setProduct(prev => ({
                            ...prev,
                            mainImageUrl: response.data.data.image?.largeUrl || response.data.data.image?.mediumUrl || prev.mainImageUrl,
                            galleryImages: response.data.data.images?.map((img, index) => ({
                                id: index + 1,
                                url: img.largeUrl || img.mediumUrl || img.smallUrl || ''
                            })) || prev.galleryImages,
                            updatedAt: new Date().toISOString()
                        }));
                        
                        console.log('Media updated successfully:', response.data.message);
                    }
                } else {
                    console.log('No media data to process');
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                setProduct(prev => ({
                    ...prev,
                    ...saveData,
                    updatedAt: new Date().toISOString()
                }));
            }
            
            return Promise.resolve();
        } catch (error) {
            console.error(`Error saving ${dataSection}:`, error);
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const handleBackClick = () => {
        navigate('/dashboard/products');
    };

    if (loading) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Skeleton variant="text" width={300} height={40} sx={{ mb: 2 }} />
                <Grid container spacing={4}>
                    {[...Array(4)].map((_, i) => (
                        <Grid item xs={12} md={6} key={i}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
                                    <Skeleton variant="rectangular" height={150} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 } }}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Product not found
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <ProductHeader
                product={product}
                onBackClick={handleBackClick}
                hasUnsavedChanges={false}
            />

            <Stack spacing={4}>
                <ProductCoreDetails
                    product={product}
                    onSave={(data) => handleSaveChanges('coreDetails', data)}
                    loading={loading || saving}
                />
                <ProductPricing
                    product={product}
                    onSave={(data) => handleSaveChanges('pricing', data)}
                    loading={loading || saving}
                />
                <ProductCategorization
                    product={product}
                    onSave={(data) => handleSaveChanges('categorization', data)}
                    loading={loading || saving}
                />
                <ProductMedia
                    product={product}
                    onSave={(data) => handleSaveChanges('media', data)}
                    loading={loading || saving}
                />
            </Stack>
        </Box>
    );
};

export default EditProduct;