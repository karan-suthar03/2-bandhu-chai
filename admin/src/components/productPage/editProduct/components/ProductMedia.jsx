import React, { useState } from 'react';
import { 
    Box, Button, Typography, Card, CardContent, Divider, 
    Grid, IconButton, Avatar, CircularProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { 
    Image, Save, CloudUpload, Delete, Visibility, 
    PhotoCamera, Collections
} from '@mui/icons-material';

const ProductMedia = ({ product, onSave, loading }) => {
    const [media, setMedia] = useState({
        mainImageUrl: product.mainImageUrl,
        galleryImages: product.galleryImages || []
    });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const isDisabled = loading || saving;

    const handleMainImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setMedia(prev => ({ ...prev, mainImageUrl: imageUrl }));
            setStatus(null);
        }
    };

    const handleGalleryImageAdd = (event) => {
        const files = Array.from(event.target.files);
        files.forEach((file, index) => {
            const imageUrl = URL.createObjectURL(file);
            const newImage = {
                id: Date.now() + index,
                url: imageUrl,
                name: file.name
            };
            setMedia(prev => ({
                ...prev,
                galleryImages: [...prev.galleryImages, newImage]
            }));
        });
        setStatus(null);
    };

    const handleGalleryImageDelete = (imageId) => {
        setMedia(prev => ({
            ...prev,
            galleryImages: prev.galleryImages.filter(img => img.id !== imageId)
        }));
    };

    const handlePreviewClose = () => {
        setPreviewImage(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            await onSave(media);
            setStatus({ type: 'success', message: 'Media saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to save media.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <Image color="primary" /> Product Media
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1}>
                        <PhotoCamera fontSize="small" />
                        Main Product Image
                    </Typography>
                    <Box 
                        sx={{ 
                            border: '2px dashed #ccc', 
                            borderRadius: 2, 
                            p: 3, 
                            textAlign: 'center',
                            position: 'relative',
                            backgroundColor: '#fafafa'
                        }}
                    >
                        {media.mainImageUrl ? (
                            <Box>
                                <Avatar
                                    src={media.mainImageUrl}
                                    sx={{ 
                                        width: 200, 
                                        height: 200, 
                                        mx: 'auto', 
                                        mb: 2,
                                        cursor: 'pointer'
                                    }}
                                    variant="rounded"
                                    onClick={() => setPreviewImage(media.mainImageUrl)}
                                />
                                <Box display="flex" justifyContent="center" gap={1}>
                                    <IconButton 
                                        color="primary" 
                                        onClick={() => setPreviewImage(media.mainImageUrl)}
                                        size="small"
                                        disabled={isDisabled}
                                    >
                                        <Visibility />
                                    </IconButton>
                                </Box>
                            </Box>
                        ) : (
                            <Box>
                                <CloudUpload sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                                <Typography variant="body2" color="text.secondary">
                                    No main image uploaded
                                </Typography>
                            </Box>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="main-image-upload"
                            onChange={handleMainImageChange}
                            disabled={isDisabled}
                        />
                        <label htmlFor="main-image-upload">
                            <Button
                                component="span"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                sx={{ mt: 2 }}
                                disabled={isDisabled}
                            >
                                {media.mainImageUrl ? 'Change Image' : 'Upload Image'}
                            </Button>
                        </label>
                    </Box>
                </Box>
                <Box>
                    <Typography variant="subtitle2" gutterBottom display="flex" alignItems="center" gap={1}>
                        <Collections fontSize="small" />
                        Gallery Images
                    </Typography>
                    
                    {media.galleryImages.length > 0 && (
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            {media.galleryImages.map((image) => (
                                <Grid item xs={6} sm={4} md={3} key={image.id}>
                                    <Box position="relative">
                                        <Avatar
                                            src={image.url}
                                            sx={{ 
                                                width: '100%', 
                                                height: 200,
                                                cursor: 'pointer'
                                            }}
                                            variant="rounded"
                                            onClick={() => setPreviewImage(image.url)}
                                        />
                                        <IconButton
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                right: 4,
                                                backgroundColor: 'rgba(255,255,255,0.8)',
                                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                                            }}
                                            size="small"
                                            color="error"
                                            onClick={() => handleGalleryImageDelete(image.id)}
                                            disabled={isDisabled}
                                        >
                                            <Delete fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            sx={{
                                                position: 'absolute',
                                                top: 4,
                                                left: 4,
                                                backgroundColor: 'rgba(255,255,255,0.8)',
                                                '&:hover': { backgroundColor: 'rgba(255,255,255,0.9)' }
                                            }}
                                            size="small"
                                            color="primary"
                                            onClick={() => setPreviewImage(image.url)}
                                            disabled={isDisabled}
                                        >
                                            <Visibility fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    )}

                    <Box 
                        sx={{ 
                            border: '2px dashed #ccc', 
                            borderRadius: 2, 
                            p: 2, 
                            textAlign: 'center',
                            backgroundColor: '#fafafa'
                        }}
                    >
                        <Collections sx={{ fontSize: 32, color: '#ccc', mb: 1 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Add more images to gallery
                        </Typography>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            style={{ display: 'none' }}
                            id="gallery-images-upload"
                            onChange={handleGalleryImageAdd}
                            disabled={isDisabled}
                        />
                        <label htmlFor="gallery-images-upload">
                            <Button
                                component="span"
                                variant="outlined"
                                startIcon={<CloudUpload />}
                                size="small"
                                disabled={isDisabled}
                            >
                                Add Images
                            </Button>
                        </label>
                    </Box>
                </Box>

                <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={isDisabled}
                    >
                        {saving ? 'Saving...' : 'Save Media'}
                    </Button>
                </Box>
                {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}
            </CardContent>
            <Dialog 
                open={!!previewImage} 
                onClose={handlePreviewClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Image Preview</DialogTitle>
                <DialogContent>
                    <Box textAlign="center">
                        <img 
                            src={previewImage} 
                            alt="Preview" 
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '70vh',
                                objectFit: 'contain'
                            }} 
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handlePreviewClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
};

export default ProductMedia;
