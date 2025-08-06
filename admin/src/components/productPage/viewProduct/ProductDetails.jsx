import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Divider,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    CardMedia,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
} from '@mui/material';
import {
    Edit as EditIcon,
    ArrowBack as ArrowBackIcon,
    Inventory as InventoryIcon,
    LocalOffer as LocalOfferIcon,
    Star as StarIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { getAdminProduct } from '../../../api';
import { formatCurrency, formatDiscount } from '../../Utils/Utils';

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProduct();
    }, [productId]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getAdminProduct(productId);
            
            if (response.data.success) {
                setProduct(response.data.data);
            } else {
                setError('Failed to fetch product details');
            }
        } catch (err) {
            console.error('Error fetching product:', err);
            setError(err.response?.data?.message || 'Failed to fetch product details');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        navigate(`/dashboard/products/edit/${productId}`);
    };

    const handleBack = () => {
        navigate('/dashboard/products');
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
                <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
                    Back to Products
                </Button>
            </Box>
        );
    }

    if (!product) {
        return (
            <Box p={3}>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Product not found
                </Alert>
                <Button variant="outlined" onClick={handleBack} startIcon={<ArrowBackIcon />}>
                    Back to Products
                </Button>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <IconButton onClick={handleBack} color="primary">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h4" component="h1">
                        Product Details
                    </Typography>
                    <Chip 
                        label={product.deactivated ? 'Deactivated' : 'Active'} 
                        color={product.deactivated ? 'error' : 'success'}
                        variant="filled"
                    />
                </Box>
                <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    onClick={handleEdit}
                    color="primary"
                >
                    Edit Product
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Product Images
                        </Typography>

                        {product.image && (
                            <Card sx={{ mb: 2 }}>
                                <CardMedia
                                    component="img"
                                    height="300"
                                    image={product.image.largeUrl || product.image.originalUrl}
                                    alt={product.name}
                                    sx={{ objectFit: 'cover' }}
                                />
                                <CardContent>
                                    <Typography variant="body2" color="text.secondary">
                                        Main Product Image
                                    </Typography>
                                </CardContent>
                            </Card>
                        )}

                        {product.images && product.images.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" gutterBottom>
                                    Additional Images
                                </Typography>
                                <Grid container spacing={1}>
                                    {product.images.map((img, index) => (
                                        <Grid item xs={6} sm={4} key={index}>
                                            <Card>
                                                <CardMedia
                                                    component="img"
                                                    height="120"
                                                    image={img.smallUrl || img.originalUrl}
                                                    alt={`${product.name} ${index + 1}`}
                                                    sx={{ objectFit: 'cover' }}
                                                />
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Box>
                        )}
                    </Paper>

                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Product Tags & Features
                        </Typography>
                        
                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} mb={2}>
                            {product.featured && (
                                <Chip icon={<StarIcon />} label="Featured" color="primary" />
                            )}
                            {product.isNew && (
                                <Chip label="New" color="secondary" />
                            )}
                            {product.organic && (
                                <Chip label="Organic" color="success" />
                            )}
                            {product.fastDelivery && (
                                <Chip label="Fast Delivery" color="info" />
                            )}
                            {product.badge && (
                                <Chip icon={<LocalOfferIcon />} label={product.badge} variant="outlined" />
                            )}
                        </Stack>

                        {product.features && product.features.length > 0 && (
                            <Box mt={2}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Features:
                                </Typography>
                                <Stack spacing={1}>
                                    {product.features.map((feature, index) => (
                                        <Box key={index} display="flex" alignItems="center" gap={1}>
                                            <CheckCircleIcon color="success" fontSize="small" />
                                            <Typography variant="body2">{feature}</Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Paper>

                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Basic Information
                        </Typography>
                        
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Product ID
                                </Typography>
                                <Typography variant="body1">#{product.id}</Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Product Name
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                    {product.name}
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Category
                                </Typography>
                                <Chip label={product.category} variant="outlined" />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Rating
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <StarIcon color="warning" fontSize="small" />
                                    <Typography variant="body1">
                                        {product.rating ? product.rating.toFixed(1) : 'N/A'} 
                                        {product.reviewCount > 0 && ` (${product.reviewCount} reviews)`}
                                    </Typography>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                            <InventoryIcon />
                            Product Variants & Pricing
                        </Typography>
                        
                        {product.variants && product.variants.length > 0 ? (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Size</strong></TableCell>
                                            <TableCell><strong>Price</strong></TableCell>
                                            <TableCell><strong>Old Price</strong></TableCell>
                                            <TableCell><strong>Discount</strong></TableCell>
                                            <TableCell><strong>Stock</strong></TableCell>
                                            <TableCell><strong>SKU</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {product.variants.map((variant) => (
                                            <TableRow 
                                                key={variant.id}
                                                sx={{
                                                    backgroundColor: variant.id === product.defaultVariant?.id ? 
                                                        'action.hover' : 'inherit'
                                                }}
                                            >
                                                <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        {variant.size}
                                                        {variant.id === product.defaultVariant?.id && (
                                                            <Chip size="small" label="Default" color="primary" />
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {formatCurrency(variant.price)}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    {variant.oldPrice ? (
                                                        <Typography 
                                                            variant="body2" 
                                                            sx={{ textDecoration: 'line-through' }}
                                                            color="text.secondary"
                                                        >
                                                            {formatCurrency(variant.oldPrice)}
                                                        </Typography>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {variant.discount ? (
                                                        <Chip 
                                                            label={formatDiscount(variant.discount)} 
                                                            size="small" 
                                                            color="success" 
                                                        />
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip 
                                                        label={variant.stock} 
                                                        size="small"
                                                        color={variant.stock > 0 ? 'success' : 'error'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {variant.sku || '-'}
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        ) : (
                            <Alert severity="warning">
                                No variants found for this product
                            </Alert>
                        )}
                    </Paper>

                    <Paper elevation={3} sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Product Descriptions
                        </Typography>
                        
                        <Box mb={2}>
                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                Short Description
                            </Typography>
                            <Typography variant="body1" paragraph>
                                {product.description || 'No description available'}
                            </Typography>
                        </Box>

                        {product.longDescription && (
                            <Box mb={2}>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Detailed Description
                                </Typography>
                                <Typography variant="body1" paragraph>
                                    {product.longDescription}
                                </Typography>
                            </Box>
                        )}

                        {product.specifications && (
                            <Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Specifications
                                </Typography>
                                <Box component="pre" sx={{ 
                                    fontFamily: 'inherit', 
                                    whiteSpace: 'pre-wrap',
                                    backgroundColor: 'grey.50',
                                    p: 2,
                                    borderRadius: 1,
                                    fontSize: '0.875rem'
                                }}>
                                    {JSON.stringify(product.specifications, null, 2)}
                                </Box>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default ProductDetails;
