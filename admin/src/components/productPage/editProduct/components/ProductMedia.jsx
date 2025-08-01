import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    Box, Button, Typography, Card, CardContent, Divider,
    IconButton, CircularProgress, Alert,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip
} from '@mui/material';
import {
    Image, Save, CloudUpload, Delete, Visibility,
    PhotoCamera, Collections, KeyboardArrowUp, KeyboardArrowDown
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
        return () => {
            cleanupObjectUrls();
        };
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
            objectUrls.current.delete(media.mainImageUrl);
        }

        const imageUrl = URL.createObjectURL(file);
        objectUrls.current.add(imageUrl);
        
        setMedia(prev => ({ 
            ...prev, 
            mainImageUrl: imageUrl,
            mainImageFile: file
        }));
        setStatus(null);
    };

    const handleGalleryImageAdd = (event) => {
        const files = Array.from(event.target.files);

        if (media.galleryImages.length + files.length > MAX_GALLERY_IMAGES) {
            setStatus({ 
                type: 'error', 
                message: `Cannot add ${files.length} images. Maximum ${MAX_GALLERY_IMAGES} images allowed in gallery. Currently have ${media.galleryImages.length} images.` 
            });
            return;
        }

        const validFiles = [];
        const errors = [];

        files.forEach((file, index) => {
            const validationErrors = validateFile(file);
            if (validationErrors.length > 0) {
                errors.push(`${file.name}: ${validationErrors.join(', ')}`);
            } else {
                const imageUrl = URL.createObjectURL(file);
                objectUrls.current.add(imageUrl);
                
                const newImage = {
                    id: Date.now() + index,
                    url: imageUrl,
                    name: file.name,
                    file: file,
                    isNew: true
                };
                validFiles.push(newImage);
            }
        });

        if (errors.length > 0) {
            setStatus({ 
                type: 'error', 
                message: `Some files failed validation: ${errors.join('; ')}` 
            });
        }

        if (validFiles.length > 0) {
            setMedia(prev => ({
                ...prev,
                galleryImages: [...prev.galleryImages, ...validFiles]
            }));
            
            if (errors.length === 0) {
                setStatus(null);
            }
        }
    };

    const handleGalleryImageDelete = (imageId) => {
        const imageToDelete = media.galleryImages.find(img => img.id === imageId);

        if (imageToDelete && imageToDelete.url && imageToDelete.url.startsWith('blob:')) {
            URL.revokeObjectURL(imageToDelete.url);
            objectUrls.current.delete(imageToDelete.url);
        }
        
        setMedia(prev => ({
            ...prev,
            galleryImages: prev.galleryImages.filter(img => img.id !== imageId)
        }));
    };

    const moveImage = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= media.galleryImages.length) return;

        const newGalleryImages = [...media.galleryImages];
        const imageToMove = newGalleryImages[fromIndex];

        newGalleryImages.splice(fromIndex, 1);
        newGalleryImages.splice(toIndex, 0, imageToMove);

        setMedia(prev => ({
            ...prev,
            galleryImages: newGalleryImages
        }));
    };
    const handlePreviewClose = () => {
        setPreviewImage(null);
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            const formData = new FormData();
            if (media.mainImageFile) {
                formData.append('mainImage', media.mainImageFile);
            }
            const existingImages = media.galleryImages.filter(img => !img.isNew);
            const newImages = media.galleryImages.filter(img => img.isNew && img.file);
            newImages.forEach(img => {
                formData.append('gallery', img.file);
            });
            const galleryOrder = media.galleryImages.map((img, index) => {
                if (img.isNew) {
                    const newImageIndex = newImages.findIndex(newImg => newImg.id === img.id);
                    return `new_${newImageIndex}`;
                } else {
                    return img.url || img;
                }
            });
            formData.append('existingImages', JSON.stringify(existingImages.map(img => img.url || img)));
            formData.append('galleryOrder', JSON.stringify(galleryOrder));

            if (!media.mainImageFile && newImages.length === 0 && media.galleryImages.length === (product.galleryImages || []).length) {
                const originalOrder = (product.galleryImages || []).map(img => img.url || img);
                const currentOrder = existingImages.map(img => img.url || img);
                
                if (JSON.stringify(originalOrder) === JSON.stringify(currentOrder)) {
                    setStatus({ 
                        type: 'error', 
                        message: 'No changes detected. Please make changes before saving.' 
                    });
                    setSaving(false);
                    return;
                }
            }
            
            await onSave({ formData });

            setMedia(prev => ({
                ...prev,
                mainImageFile: null,
                galleryImages: prev.galleryImages.map(img => ({
                    ...img,
                    isNew: false
                }))
            }));
            
            setStatus({ type: 'success', message: 'Media saved successfully!' });
        } catch (err) {
            console.error('Media save error:', err);
            setStatus({ 
                type: 'error', 
                message: err.message || 'Failed to save media.' 
            });
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
                                <Box
                                    onClick={() => setPreviewImage(media.mainImageUrl)}
                                    sx={{
                                        width: 200,
                                        height: 200,
                                        mx: 'auto',
                                        mb: 2,
                                        cursor: 'pointer',
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        border: '1px solid #e0e0e0'
                                    }}
                                >
                                    <img
                                        src={media.mainImageUrl}
                                        alt="Main product"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                </Box>
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
                        {media.galleryImages.length > 0 && (
                            <Chip
                                label={`${media.galleryImages.length} images`}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        )}
                    </Typography>

                    {media.galleryImages.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                            {media.galleryImages.map((image, index) => (
                                <Box
                                    key={image.id}
                                    position="relative"
                                >
                                    <Box
                                        sx={{
                                            width: 200,
                                            height: 200,
                                            overflow: 'hidden',
                                            borderRadius: 1,
                                            cursor: 'pointer',
                                            border: '1px solid #e0e0e0'
                                        }}
                                        onClick={() => setPreviewImage(image.url)}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.name || 'Gallery image'}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </Box>
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            right: 4,
                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                                        }}
                                        size="small"
                                        color="error"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleGalleryImageDelete(image.id);
                                        }}
                                        disabled={isDisabled}
                                    >
                                        <Delete fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        sx={{
                                            position: 'absolute',
                                            top: 4,
                                            left: 4,
                                            backgroundColor: 'rgba(255,255,255,0.9)',
                                            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' }
                                        }}
                                        size="small"
                                        color="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setPreviewImage(image.url);
                                        }}
                                        disabled={isDisabled}
                                    >
                                        <Visibility fontSize="small" />
                                    </IconButton>
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 4,
                                            left: 4,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 0.5
                                        }}
                                    >
                                        {index > 0 && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveImage(index, index - 1);
                                                }}
                                                disabled={isDisabled}
                                                sx={{
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                    color: 'white',
                                                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                                                    width: 24,
                                                    height: 24
                                                }}
                                            >
                                                <KeyboardArrowUp fontSize="small" />
                                            </IconButton>
                                        )}
                                        {index < media.galleryImages.length - 1 && (
                                            <IconButton
                                                size="small"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    moveImage(index, index + 1);
                                                }}
                                                disabled={isDisabled}
                                                sx={{
                                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                                    color: 'white',
                                                    '&:hover': { backgroundColor: 'rgba(0,0,0,0.9)' },
                                                    width: 24,
                                                    height: 24
                                                }}
                                            >
                                                <KeyboardArrowDown fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Box>

                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            bottom: 4,
                                            right: 4,
                                            backgroundColor: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            borderRadius: 1,
                                            px: 1,
                                            py: 0.5,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}
                                    >
                                        <Typography variant="caption">{index + 1}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
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
