import React, { useState, useMemo, useEffect } from 'react';
import {
    Box, Button, TextField, Typography, Paper, Grid, Switch, FormControlLabel,
    Avatar, IconButton, Autocomplete, Chip, FormControl, CircularProgress,
    Alert, Tooltip, Card, CardContent, CardMedia, Icon, alpha, Stack
} from '@mui/material';
import {
    PhotoCamera, CloudUpload, Close, CheckCircle, Store, Category, AttachMoney, EnergySavingsLeaf, LocalShipping, Percent
} from '@mui/icons-material';
import { postProduct } from '../../../api/index.js';
import { calculateDiscountPercentage, formatDiscountDisplay } from '../../../utils/pricingUtils.js';

const DropzoneBox = ({ children, error }) => (
    <Box sx={{
        p: 3, borderRadius: 2, minHeight: 180,
        border: theme => `2px dashed ${error ? theme.palette.error.main : theme.palette.divider}`,
        backgroundColor: theme => alpha(theme.palette.grey[500], 0.05),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', flexDirection: 'column', gap: 1
    }}>
        {children}
    </Box>
);

const AddProduct = () => {
    const [product, setProduct] = useState({
        name: '',
        price: '',
        oldPrice: '',
        stock: '',
        category: '',
        badge: '',
        description: '',
        fullDescription: '',
        features: [],
        discount: '',
        isNew: false,
        featured: true,
        organic: false,
        fastDelivery: true,
    });
    const [mainImage, setMainImage] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submissionStatus, setSubmissionStatus] = useState(null);

    const mainImageUrl = useMemo(() => mainImage ? URL.createObjectURL(mainImage) : null, [mainImage]);

    useEffect(() => {
        const calculatedDiscount = calculateDiscountPercentage(
            parseFloat(product.price) || 0,
            parseFloat(product.oldPrice) || 0
        );
        
        setProduct(prev => ({
            ...prev,
            discount: formatDiscountDisplay(calculatedDiscount)
        }));
    }, [product.price, product.oldPrice]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleMainImageSelect = (e) => {
        if (e.target.files?.[0]) setMainImage(e.target.files[0]);
    };

    const handleRemoveMainImage = () => setMainImage(null);

    const handleGalleryAdd = (e) => {
        if (e.target.files) setGallery(prev => [...prev, ...Array.from(e.target.files)]);
    };

    const handleRemoveGalleryImage = (index) => {
        setGallery(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!product.name.trim()) newErrors.name = 'Product name is required.';
        if (!product.price || product.price <= 0) newErrors.price = 'A valid price is required.';
        if (!product.stock || product.stock < 0) newErrors.stock = 'A valid stock count is required.';
        if (!product.category.trim()) newErrors.category = 'Category is required.';
        if (!product.description.trim()) newErrors.description = 'A short description is required.';
        if (!product.fullDescription.trim()) newErrors.fullDescription = 'The full description is required.';
        if (!mainImage) newErrors.mainImage = 'The main image is required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setLoading(true);
        setSubmissionStatus(null);
        const formData = new FormData();
        const finalDiscount = calculateDiscountPercentage(
            parseFloat(product.price) || 0,
            parseFloat(product.oldPrice) || 0
        );
        
        Object.entries(product).forEach(([key, value]) => {
            if (key === 'features') {
                formData.append(key, JSON.stringify(value));
            } else if (key === 'discount') {
                formData.append(key, finalDiscount);
            } else {
                formData.append(key, value);
            }
        });
        formData.append('mainImage', mainImage);
        gallery.forEach(file => formData.append('gallery', file));

        try {
            await postProduct(formData);
            setSubmissionStatus({ type: 'success', message: 'Product created successfully!' });
            // Optionally reset the form here
        } catch (error) {
            setSubmissionStatus({ type: 'error', message: 'Failed to create product.' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = useMemo(() => {
        return product.name && product.price > 0 && product.stock >= 0 && product.category && product.description && product.fullDescription && mainImage;
    }, [product, mainImage]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>

                    <Grid item xs={12} md={6}>
                        <Stack spacing={4}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                        <Store /> Core Details
                                    </Typography>
                                    <TextField
                                        label="Product Name" name="name" value={product.name}
                                        onChange={handleChange} fullWidth required
                                        error={!!errors.name} helperText={errors.name} sx={{ mb: 2 }}
                                        disabled={loading}
                                    />
                                    <TextField
                                        label="Short Description" name="description" value={product.description}
                                        onChange={handleChange} fullWidth multiline rows={3} required
                                        error={!!errors.description} helperText={errors.description} sx={{ mb: 2 }}
                                        disabled={loading}
                                    />
                                    <TextField
                                        label="Full Description" name="fullDescription" value={product.fullDescription}
                                        onChange={handleChange} fullWidth multiline rows={6}
                                        error={!!errors.fullDescription} helperText={errors.fullDescription}
                                        disabled={loading}
                                    />
                                </CardContent>
                            </Card>

                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                        <AttachMoney /> Pricing, Stock & Discount <Percent fontSize="small" />
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Price" name="price" type="number" value={product.price}
                                                onChange={handleChange} fullWidth required
                                                error={!!errors.price} helperText={errors.price}
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Old Price (Optional)" name="oldPrice" type="number"
                                                value={product.oldPrice} onChange={handleChange} fullWidth
                                                disabled={loading}
                                                helperText="Enter old price to automatically calculate discount"
                                            />
                                        </Grid>
                                    </Grid>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Stock Quantity" name="stock" type="number"
                                                value={product.stock} onChange={handleChange} fullWidth required
                                                error={!!errors.stock} helperText={errors.stock}
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Discount (%)" name="discount" type="number"
                                                value={product.discount} fullWidth
                                                disabled={true}
                                                helperText="Automatically calculated based on price and old price"
                                                InputProps={{ 
                                                    style: { backgroundColor: '#f5f5f5' }
                                                }}
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>

                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                                        <Category /> Categorization
                                    </Typography>
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Category" name="category" value={product.category}
                                                onChange={handleChange} fullWidth required
                                                error={!!errors.category} helperText={errors.category}
                                                disabled={loading}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                label="Badge (e.g., 'Sale')" name="badge" value={product.badge}
                                                onChange={handleChange} fullWidth
                                                disabled={loading}
                                            />
                                        </Grid>
                                    </Grid>
                                    <Autocomplete
                                        multiple freeSolo options={[]} value={product.features}
                                        onChange={(e, val) => setProduct(p => ({ ...p, features: val }))}
                                        disabled={loading}
                                        renderTags={(val, getTagProps) => val.map((opt, idx) => (
                                            <Chip key={opt} label={opt} {...getTagProps({ index: idx })} />
                                        ))}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Features" placeholder="Add feature and hit Enter" />
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Stack spacing={4}>
                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Media</Typography>
                                    <FormControl fullWidth error={!!errors.mainImage}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Main Image*</Typography>
                                        <DropzoneBox error={!!errors.mainImage}>
                                            {!mainImage ? (
                                                <Button component="label" startIcon={<PhotoCamera />}>
                                                    Upload
                                                    <input hidden type="file" accept="image/*" onChange={handleMainImageSelect} disabled={loading} />
                                                </Button>
                                            ) : (
                                                <Box sx={{ position: 'relative' }}>
                                                    <Avatar src={mainImageUrl} variant="rounded" sx={{ width: 100, height: 100 }} />
                                                    <Tooltip title="Remove Image">
                                                        <IconButton size="small" onClick={handleRemoveMainImage} sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'white' }} disabled={loading}>
                                                            <Close fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            )}
                                        </DropzoneBox>
                                        <Typography variant="caption" color="error" sx={{ mt: 1 }}>{errors.mainImage}</Typography>
                                    </FormControl>
                                    <FormControl fullWidth sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Gallery</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                            {gallery.map((file, i) => (
                                                <Box key={i} sx={{ position: 'relative' }}>
                                                    <Avatar src={URL.createObjectURL(file)} variant="rounded" sx={{ width: 70, height: 70 }} />
                                                    <Tooltip title="Remove Image">
                                                        <IconButton size="small" onClick={() => handleRemoveGalleryImage(i)} sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'white' }} disabled={loading}>
                                                            <Close fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            ))}
                                            <Tooltip title="Add Image">
                                                <IconButton component="label" sx={{ width: 70, height: 70, border: '2px dashed grey', borderRadius: 2 }} disabled={loading}>
                                                    <CloudUpload />
                                                    <input hidden multiple type="file" accept="image/*" onChange={handleGalleryAdd} disabled={loading} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </FormControl>
                                </CardContent>
                            </Card>

                            <Card elevation={2}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>Attributes</Typography>
                                    <Grid container>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel control={<Switch checked={product.isNew} onChange={handleChange} name="isNew" disabled={loading} />} label="New Arrival" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel control={<Switch checked={product.featured} onChange={handleChange} name="featured" disabled={loading} />} label="Featured Product" />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel control={<Switch checked={product.organic} onChange={handleChange} name="organic" disabled={loading} />} label={<Box display="flex" alignItems="center"><EnergySavingsLeaf fontSize="small" sx={{ mr: 0.5 }}/> Organic</Box>} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <FormControlLabel control={<Switch checked={product.fastDelivery} onChange={handleChange} name="fastDelivery" disabled={loading} />} label={<Box display="flex" alignItems="center"><LocalShipping fontSize="small" sx={{ mr: 0.5 }}/> Fast Delivery</Box>} />
                                        </Grid>
                                    </Grid>

                                    {submissionStatus && (
                                        <Alert severity={submissionStatus.type} sx={{ mt: 2 }}>{submissionStatus.message}</Alert>
                                    )}

                                    <Button
                                        type="submit" variant="contained" fullWidth
                                        disabled={!isFormValid || loading}
                                        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
                                        sx={{ mt: 2, py: 1.5 }}
                                    >
                                        {loading ? 'Creating...' : 'Create Product'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default AddProduct;