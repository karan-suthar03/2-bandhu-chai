import React, { useState, useMemo } from 'react';
import {
    Box, Button, TextField, Typography, Grid, Switch, FormControlLabel,
    Avatar, IconButton, Autocomplete, Chip, FormControl, CircularProgress,
    Alert, Tooltip, Card, CardContent, Stack, Divider, Radio,
    alpha, Paper
} from '@mui/material';
import {
    PhotoCamera, CloudUpload, Close, CheckCircle, Store, Category, AttachMoney, EnergySavingsLeaf,
    LocalShipping, AddCircleOutline, Delete
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


const VariantManager = ({ variants, setVariants, defaultVariantId, setDefaultVariantId, errors, loading }) => {

    const handleAddVariant = () => {
        const newVariant = {
            id: `temp_${Date.now()}`,
            size: '',
            price: '',
            oldPrice: '',
            stock: '',
            sku: ''
        };
        setVariants(prev => [...prev, newVariant]);
    };

    const handleRemoveVariant = (idToRemove) => {
        if (defaultVariantId === idToRemove) {
            setDefaultVariantId(null);
        }
        setVariants(prev => prev.filter(v => v.id !== idToRemove));
    };

    const handleVariantChange = (id, field, value) => {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <AttachMoney /> Variants, Pricing & Stock
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add product variants like different sizes or weights. Select one as the default to be shown on the product page.
                </Typography>

                <Stack spacing={3} divider={<Divider />}>
                    {variants.map((variant, index) => {
                        const calculatedDiscount = formatDiscountDisplay(
                            calculateDiscountPercentage(parseFloat(variant.price) || 0, parseFloat(variant.oldPrice) || 0)
                        );
                        const variantErrors = errors?.variants?.[index] || {};

                        return (
                            <Paper key={variant.id} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                                <FormControlLabel
                                    value={variant.id}
                                    control={<Radio checked={defaultVariantId === variant.id} onChange={(e) => setDefaultVariantId(e.target.value)} disabled={loading} />}
                                    label={`Variant ${index + 1} (Set as Default)`}
                                    sx={{ mb: 2, fontWeight: 'medium' }}
                                />

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="Size" name="size" value={variant.size} fullWidth required onChange={(e) => handleVariantChange(variant.id, 'size', e.target.value)} error={!!variantErrors.size} helperText={variantErrors.size} disabled={loading}/></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="Price" name="price" type="number" value={variant.price} fullWidth required onChange={(e) => handleVariantChange(variant.id, 'price', e.target.value)} error={!!variantErrors.price} helperText={variantErrors.price} disabled={loading}/></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="Old Price" name="oldPrice" type="number" value={variant.oldPrice} fullWidth onChange={(e) => handleVariantChange(variant.id, 'oldPrice', e.target.value)} disabled={loading}/></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="Stock" name="stock" type="number" value={variant.stock} fullWidth required onChange={(e) => handleVariantChange(variant.id, 'stock', e.target.value)} error={!!variantErrors.stock} helperText={variantErrors.stock} disabled={loading}/></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="SKU" name="sku" value={variant.sku} fullWidth required onChange={(e) => handleVariantChange(variant.id, 'sku', e.target.value)} disabled={loading}/></Grid>
                                    <Grid item xs={12} sm={6} md={3}><TextField label="Discount (%)" name="discount" value={calculatedDiscount} fullWidth disabled InputProps={{ style: { backgroundColor: '#f5f5f5' }}}/></Grid>
                                </Grid>

                                {variants.length > 1 && (
                                    <Tooltip title="Remove Variant">
                                        <IconButton onClick={() => handleRemoveVariant(variant.id)} size="small" sx={{ position: 'absolute', top: 8, right: 8 }} disabled={loading}>
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </Paper>
                        );
                    })}
                </Stack>

                <Button startIcon={<AddCircleOutline />} onClick={handleAddVariant} sx={{ mt: 2 }} disabled={loading}>
                    Add Another Variant
                </Button>
                {typeof errors.variants === 'string' && <Typography color="error" variant="body2" sx={{ display: 'block', mt: 1 }}>{errors.variants}</Typography>}
            </CardContent>
        </Card>
    );
};
const AddProduct = () => {
    const [product, setProduct] = useState({
        name: '',
        category: '',
        badge: '',
        description: '',
        longDescription: '',
        features: [],
        isNew: false,
        featured: true,
        organic: false,
        fastDelivery: true,
    });

    const [variants, setVariants] = useState([{ id: `temp_${Date.now()}`, size: 'Default', price: '', oldPrice: '', stock: '', sku: '' }]);
    const [defaultVariantId, setDefaultVariantId] = useState(variants[0].id);

    const [mainImage, setMainImage] = useState(null);
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [submissionStatus, setSubmissionStatus] = useState(null);

    const mainImageUrl = useMemo(() => mainImage ? URL.createObjectURL(mainImage) : null, [mainImage]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProduct(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleMainImageSelect = (e) => { if (e.target.files?.[0]) setMainImage(e.target.files[0]); };
    const handleRemoveMainImage = () => setMainImage(null);
    const handleGalleryAdd = (e) => { if (e.target.files) setGallery(prev => [...prev, ...Array.from(e.target.files)]); };
    const handleRemoveGalleryImage = (index) => { setGallery(prev => prev.filter((_, i) => i !== index)); };

    const validateForm = () => {
        const newErrors = { variants: [] };
        if (!product.name.trim()) newErrors.name = 'Product name is required.';
        if (!product.category.trim()) newErrors.category = 'Category is required.';
        if (!product.description.trim()) newErrors.description = 'A short description is required.';
        if (!product.longDescription.trim()) newErrors.longDescription = 'The full description is required.';
        if (!mainImage) newErrors.mainImage = 'The main image is required.';

        if(variants.length === 0) {
            newErrors.variants = 'At least one product variant is required.';
        } else {
            variants.forEach((v, index) => {
                const variantError = {};
                if (!v.size.trim()) variantError.size = 'Size is required.';
                if (!v.price || v.price <= 0) variantError.price = 'Valid price is required.';
                if (!v.stock || v.stock < 0) variantError.stock = 'Valid stock is required.';
                if (Object.keys(variantError).length > 0) newErrors.variants[index] = variantError;
            });
        }
        if (!defaultVariantId) {
            const errorMsg = 'You must select one variant as the default.';
            newErrors.variants = typeof newErrors.variants === 'string' ? `${newErrors.variants} ${errorMsg}` : errorMsg;
        }

        const hasVariantErrors = newErrors.variants.length > 0 && newErrors.variants.some(e => Object.keys(e).length > 0);
        setErrors(newErrors);

        return Object.keys(newErrors).every(key => key === 'variants') && !hasVariantErrors && typeof newErrors.variants !== 'string';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            setSubmissionStatus({ type: 'error', message: 'Please correct the errors before submitting.' });
            return;
        }

        setLoading(true);
        setSubmissionStatus(null);
        const formData = new FormData();

        Object.entries(product).forEach(([key, value]) => {
            formData.append(key, key === 'features' ? JSON.stringify(value) : value);
        });

        const variantsForSubmission = variants.map(v => {
            const { id, ...rest } = v;
            return {
                ...rest,
                price: parseFloat(v.price) || 0,
                oldPrice: v.oldPrice ? parseFloat(v.oldPrice) : null,
                stock: parseInt(v.stock, 10) || 0,
                discount: calculateDiscountPercentage(v.price, v.oldPrice),
                isDefault: v.id === defaultVariantId,
            };
        });
        formData.append('variants', JSON.stringify(variantsForSubmission));
        formData.append('defaultVariantId', defaultVariantId);

        formData.append('mainImage', mainImage);
        gallery.forEach(file => formData.append('gallery', file));

        try {
            await postProduct(formData);
            setSubmissionStatus({ type: 'success', message: 'Product created successfully!' });
        } catch (error) {
            setSubmissionStatus({ type: 'error', message: error.response?.data?.message || 'Failed to create product.' });
            console.error("Submission failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = useMemo(() => {
        return product.name && product.category && product.description && product.longDescription && mainImage && variants.every(v => v.size && v.price > 0 && v.stock >= 0) && defaultVariantId;
    }, [product, mainImage, variants, defaultVariantId]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
            <form onSubmit={handleSubmit} noValidate>
                <Grid container spacing={4}>
                    {}
                    <Grid item xs={12} md={7} lg={8}>
                        <Stack spacing={4}>
                            <Card elevation={2}><CardContent>
                                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}><Store /> Core Details</Typography>
                                <TextField label="Product Name" name="name" value={product.name} onChange={handleChange} fullWidth required error={!!errors.name} helperText={errors.name} sx={{ mb: 2 }} disabled={loading} />
                                <TextField label="Short Description" name="description" value={product.description} onChange={handleChange} fullWidth multiline rows={3} required error={!!errors.description} helperText={errors.description} sx={{ mb: 2 }} disabled={loading} />
                                <TextField label="Full Description" name="longDescription" value={product.longDescription} onChange={handleChange} fullWidth multiline rows={6} required error={!!errors.longDescription} helperText={errors.longDescription} disabled={loading} />
                            </CardContent></Card>

                            <VariantManager variants={variants} setVariants={setVariants} defaultVariantId={defaultVariantId} setDefaultVariantId={setDefaultVariantId} errors={errors} loading={loading} />

                            <Card elevation={2}><CardContent>
                                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}><Category /> Categorization</Typography>
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid item xs={12} sm={6}><TextField label="Category" name="category" value={product.category} onChange={handleChange} fullWidth required error={!!errors.category} helperText={errors.category} disabled={loading} /></Grid>
                                    <Grid item xs={12} sm={6}><TextField label="Badge (e.g., 'Sale')" name="badge" value={product.badge} onChange={handleChange} fullWidth disabled={loading} /></Grid>
                                </Grid>
                                <Autocomplete multiple freeSolo options={[]} value={product.features} onChange={(e, val) => setProduct(p => ({ ...p, features: val }))} disabled={loading}
                                              renderTags={(val, getTagProps) => val.map((opt, idx) => (<Chip key={opt} label={opt} {...getTagProps({ index: idx })} />))}
                                              renderInput={(params) => (<TextField {...params} label="Features" placeholder="Add feature and hit Enter" />)}
                                />
                            </CardContent></Card>
                        </Stack>
                        <Stack spacing={4}>
                            <Card elevation={2}><CardContent>
                                <Typography variant="h6" gutterBottom>Media</Typography>
                                <FormControl fullWidth error={!!errors.mainImage}>
                                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Main Image*</Typography>
                                    <DropzoneBox error={!!errors.mainImage}>
                                        {!mainImage ? (
                                            <Button component="label" startIcon={<PhotoCamera />}><input hidden type="file" accept="image/*" onChange={handleMainImageSelect} disabled={loading} />Upload</Button>
                                        ) : (
                                            <Box sx={{ position: 'relative' }}>
                                                <Avatar src={mainImageUrl} variant="rounded" sx={{ width: 100, height: 100 }} />
                                                <Tooltip title="Remove Image"><IconButton size="small" onClick={handleRemoveMainImage} sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'white' }} disabled={loading}><Close fontSize="small" /></IconButton></Tooltip>
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
                                                <Tooltip title="Remove Image"><IconButton size="small" onClick={() => handleRemoveGalleryImage(i)} sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'white' }} disabled={loading}><Close fontSize="small" /></IconButton></Tooltip>
                                            </Box>
                                        ))}
                                        <Tooltip title="Add Image">
                                            <IconButton component="label" sx={{ width: 70, height: 70, border: '2px dashed grey', borderRadius: 2 }} disabled={loading}><CloudUpload /><input hidden multiple type="file" accept="image/*" onChange={handleGalleryAdd} disabled={loading} /></IconButton>
                                        </Tooltip>
                                    </Box>
                                </FormControl>
                            </CardContent></Card>

                            <Card elevation={2}><CardContent>
                                <Typography variant="h6" gutterBottom>Attributes</Typography>
                                <Grid container>
                                    <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={product.isNew} onChange={handleChange} name="isNew" disabled={loading} />} label="New Arrival" /></Grid>
                                    <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={product.featured} onChange={handleChange} name="featured" disabled={loading} />} label="Featured Product" /></Grid>
                                    <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={product.organic} onChange={handleChange} name="organic" disabled={loading} />} label={<Box display="flex" alignItems="center"><EnergySavingsLeaf fontSize="small" sx={{ mr: 0.5 }}/> Organic</Box>} /></Grid>
                                    <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={product.fastDelivery} onChange={handleChange} name="fastDelivery" disabled={loading} />} label={<Box display="flex" alignItems="center"><LocalShipping fontSize="small" sx={{ mr: 0.5 }}/> Fast Delivery</Box>} /></Grid>
                                </Grid>

                                {submissionStatus && <Alert severity={submissionStatus.type} sx={{ mt: 3, mb: 2 }}>{submissionStatus.message}</Alert>}

                                <Button type="submit" variant="contained" fullWidth disabled={!isFormValid || loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />} sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}>
                                    {loading ? 'Creating...' : 'Create Product'}
                                </Button>
                            </CardContent></Card>
                        </Stack>
                    </Grid>
                </Grid>
            </form>
        </Box>
    );
};

export default AddProduct;