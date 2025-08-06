import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Box, Button, Typography, Card, CardContent, Divider,
    IconButton, CircularProgress, Alert,
    Dialog, DialogContent, DialogActions, Chip, Tooltip, Grid, Paper
} from '@mui/material';
import {
    Image, Save, CloudUpload, Delete, Visibility,
    PhotoCamera, Collections, KeyboardArrowUp, KeyboardArrowDown, AddAPhoto
} from '@mui/icons-material';

const ProductMedia = ({ product, onSave, loading }) => {
    const [media, setMedia] = useState({
        mainImageUrl: product.mainImageUrl,
        mainImageFile: null,
        galleryImages: product.galleryImages || []
    });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const objectUrls = useRef(new Set());

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    const MAX_GALLERY_IMAGES = 10;

    const isDisabled = loading || saving;

    const cleanupObjectUrls = useCallback(() => {
        objectUrls.current.forEach(url => {
            URL.revokeObjectURL(url);
        });
        objectUrls.current.clear();
    }, []);

    useEffect(() => {
        return () => cleanupObjectUrls();
    }, [cleanupObjectUrls]);

    const validateFile = (file) => {
        const errors = [];
        
        if (!ALLOWED_TYPES.includes(file.type)) {
            errors.push(`File type ${file.type} is not allowed. Allowed types: ${ALLOWED_TYPES.join(', ')}`);
        }
        
        if (file.size > MAX_FILE_SIZE) {
            errors.push(`File size ${(file.size / (1024 * 1024)).toFixed(2)}MB exceeds maximum allowed size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
        }
        
        return errors;
    };

    const handleMainImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const validationErrors = validateFile(file);
        if (validationErrors.length > 0) {
            setStatus({ 
                type: 'error', 
                message: `Main image validation failed: ${validationErrors.join(', ')}` 
            });
            return;
        }

        if (media.mainImageUrl && media.mainImageUrl.startsWith('blob:')) {
            URL.revokeObjectURL(media.mainImageUrl);
        }

        const imageUrl = URL.createObjectURL(file);
        objectUrls.current.add(imageUrl);
        setMedia(prev => ({ ...prev, mainImageUrl: imageUrl, mainImageFile: file }));
        setStatus(null);
    };

    const handleGalleryImageAdd = (event) => {
        const files = Array.from(event.target.files);
        if (media.galleryImages.length + files.length > MAX_GALLERY_IMAGES) {
            setStatus({ type: 'error', message: `Cannot exceed ${MAX_GALLERY_IMAGES} gallery images.` });
            return;
        }

        const newImages = [];
        const errors = [];
        files.forEach((file, i) => {
            const error = validateFile(file);
            if (error) {
                errors.push(`${file.name}: ${error}`);
            } else {
                const imageUrl = URL.createObjectURL(file);
                objectUrls.current.add(imageUrl);
                newImages.push({ id: `new_${Date.now() + i}`, url: imageUrl, name: file.name, file: file, isNew: true });
            }
        });

        if (errors.length > 0) setStatus({ type: 'error', message: `Validation errors: ${errors.join('; ')}` });
        if (newImages.length > 0) {
            setMedia(prev => ({ ...prev, galleryImages: [...prev.galleryImages, ...newImages] }));
            if (errors.length === 0) setStatus(null);
        }
    };

    const handleGalleryImageDelete = (imageId) => {
        const image = media.galleryImages.find(img => img.id === imageId);
        if (image?.url?.startsWith('blob:')) {
            URL.revokeObjectURL(image.url);
        }
        setMedia(prev => ({ ...prev, galleryImages: prev.galleryImages.filter(img => img.id !== imageId) }));
    };

    const moveImage = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= media.galleryImages.length) return;
        const newGalleryImages = [...media.galleryImages];
        const [imageToMove] = newGalleryImages.splice(fromIndex, 1);
        newGalleryImages.splice(toIndex, 0, imageToMove);
        setMedia(prev => ({ ...prev, galleryImages: newGalleryImages }));
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const formData = new FormData();
            if (media.mainImageFile) formData.append('mainImage', media.mainImageFile);

            const newImages = media.galleryImages.filter(img => img.isNew && img.file);
            newImages.forEach(img => formData.append('gallery', img.file));

            const galleryOrder = media.galleryImages.map(img => (img.isNew ? `new_${img.file.name}` : img.url));
            formData.append('galleryOrder', JSON.stringify(galleryOrder));

            await onSave({ formData });

            setMedia(prev => ({ ...prev, mainImageFile: null, galleryImages: prev.galleryImages.map(img => ({ ...img, isNew: false })) }));
            setStatus({ type: 'success', message: 'Media saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: err.message || 'Failed to save media.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card elevation={3} sx={{ borderRadius: 2 }}>
            <CardContent>
                <Typography variant="h5" gutterBottom display="flex" alignItems="center" gap={1.5} sx={{ fontWeight: 'bold' }}>
                    <Image color="primary" /> Product Media
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={4}>
                    {/* Main Image Section */}
                    <Grid item xs={12} md={5}>
                        <Typography variant="h6" gutterBottom><PhotoCamera fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} /> Main Image</Typography>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                textAlign: 'center',
                                bgcolor: '#fdfdfd',
                                borderColor: '#e0e0e0',
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%'
                            }}
                        >
                            {media.mainImageUrl ? (
                                <Box sx={{ mb: 2, position: 'relative' }}>
                                    <img src={media.mainImageUrl} alt="Main product" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8, cursor: 'pointer' }} onClick={() => setPreviewImage(media.mainImageUrl)} />
                                    <Chip label={media.mainImageFile?.name || 'Current Image'} size="small" sx={{ mt: 1 }} />
                                </Box>
                            ) : (
                                <Box sx={{ my: 4 }}>
                                    <CloudUpload sx={{ fontSize: 60, color: '#bdbdbd' }} />
                                    <Typography color="textSecondary">No main image</Typography>
                                </Box>
                            )}
                            <input type="file" accept="image/*" id="main-image-upload" style={{ display: 'none' }} onChange={handleMainImageChange} disabled={isDisabled} />
                            <label htmlFor="main-image-upload">
                                <Button component="span" variant="contained" startIcon={<CloudUpload />} disabled={isDisabled}>
                                    {media.mainImageUrl ? 'Change Image' : 'Upload Image'}
                                </Button>
                            </label>
                        </Paper>
                    </Grid>

                    {/* Gallery Section */}
                    <Grid item xs={12} md={7}>
                        <Typography variant="h6" gutterBottom><Collections fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} /> Gallery</Typography>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fdfdfd', borderColor: '#e0e0e0', borderRadius: 2, minHeight: 300 }}>
                            <Grid container spacing={2}>
                                {media.galleryImages.map((image, index) => (
                                    <Grid item key={image.id} xs={6} sm={4}>
                                        <Card sx={{ position: 'relative', height: 120, borderRadius: 2, overflow: 'hidden' }}>
                                            <img src={image.url} alt={image.name || 'Gallery'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    p: 0.5,
                                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)'
                                                }}
                                            >
                                                <Tooltip title="Preview"><IconButton size="small" onClick={() => setPreviewImage(image.url)} disabled={isDisabled} sx={{ color: 'white' }}><Visibility fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleGalleryImageDelete(image.id)} disabled={isDisabled}><Delete fontSize="small" /></IconButton></Tooltip>
                                            </Box>
                                            <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', bgcolor: 'rgba(0,0,0,0.5)' }}>
                                                <Tooltip title="Move Up"><IconButton size="small" onClick={() => moveImage(index, index - 1)} disabled={isDisabled || index === 0} sx={{ color: 'white' }}><KeyboardArrowUp fontSize="small" /></IconButton></Tooltip>
                                                <Tooltip title="Move Down"><IconButton size="small" onClick={() => moveImage(index, index + 1)} disabled={isDisabled || index === media.galleryImages.length - 1} sx={{ color: 'white' }}><KeyboardArrowDown fontSize="small" /></IconButton></Tooltip>
                                            </Box>
                                        </Card>
                                    </Grid>
                                ))}
                                <Grid item xs={6} sm={4}>
                                    <input type="file" accept="image/*" multiple id="gallery-images-upload" style={{ display: 'none' }} onChange={handleGalleryImageAdd} disabled={isDisabled || media.galleryImages.length >= MAX_GALLERY_IMAGES} />
                                    <label htmlFor="gallery-images-upload">
                                        <Paper
                                            sx={{
                                                height: 120,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                                border: '2px dashed #ccc',
                                                cursor: 'pointer',
                                                "&:hover": { borderColor: 'primary.main', bgcolor: '#fafafa' },
                                                opacity: isDisabled || media.galleryImages.length >= MAX_GALLERY_IMAGES ? 0.5 : 1
                                            }}
                                        >
                                            <AddAPhoto color="action" />
                                            <Typography variant="caption" align="center" sx={{ mt: 1 }}>Add Images</Typography>
                                        </Paper>
                                    </label>
                                </Grid>
                            </Grid>
                            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
                                {media.galleryImages.length} / {MAX_GALLERY_IMAGES} images added.
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
                    {status && <Alert severity={status.type} sx={{ flexGrow: 1 }}>{status.message}</Alert>}
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={isDisabled}
                        sx={{ minWidth: 120, height: 40 }}
                    >
                        {saving ? 'Saving...' : 'Save Media'}
                    </Button>
                </Box>
            </CardContent>

            {/* Image Preview Dialog */}
            <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="lg" PaperProps={{ sx: { borderRadius: 4 } }}>
                <DialogContent sx={{ p: 1 }}>
                    <img src={previewImage} alt="Preview" style={{ width: '100%', maxHeight: '85vh', objectFit: 'contain' }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPreviewImage(null)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default ProductMedia;