import React, { useState, useMemo, useEffect } from 'react';
import { Paper, Typography, Box, Card, CardMedia, alpha } from '@mui/material';
import { Photo as PhotoIcon } from '@mui/icons-material';

const ProductImageGallery = ({ name, mainImage, galleryImages = [] }) => {
    const allImages = useMemo(() => {
        const imageList = [];
        const addedUrls = new Set();

        if (mainImage) {
            const largeUrl = mainImage.largeUrl || mainImage.originalUrl;
            if (largeUrl && !addedUrls.has(largeUrl)) {
                imageList.push({
                    id: 'main',
                    small: mainImage.smallUrl || mainImage.mediumUrl || largeUrl,
                    large: largeUrl,
                });
                addedUrls.add(largeUrl);
            }
        }

        galleryImages.forEach((img, index) => {
            const largeUrl = img.largeUrl || img.originalUrl;
            if (largeUrl && !addedUrls.has(largeUrl)) {
                imageList.push({
                    id: `gallery_${index}`,
                    small: img.smallUrl || img.mediumUrl || largeUrl,
                    large: largeUrl,
                });
                addedUrls.add(largeUrl);
            }
        });

        return imageList;
    }, [mainImage, galleryImages]);

    const [selectedImage, setSelectedImage] = useState(allImages[0] || null);

    useEffect(() => {
        setSelectedImage(allImages[0] || null);
    }, [allImages]);

    if (!selectedImage) {
        return (
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>Product Images</Typography>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 300,
                        backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.05),
                        borderRadius: 2,
                        color: 'text.secondary',
                    }}
                >
                    <PhotoIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography>No images available</Typography>
                </Box>
            </Paper>
        );
    }

    return (
        <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Product Images
            </Typography>

            <Card sx={{ mb: 2, boxShadow: 'none' }}>
                <CardMedia
                    component="img"
                    image={selectedImage.large}
                    alt={`Main view: ${name}`}
                    sx={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 400,
                        aspectRatio: '1 / 1',
                        objectFit: 'contain',
                        borderRadius: 2,
                        backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.05),
                    }}
                />
            </Card>

            {allImages.length > 1 && (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1.5,
                        overflowX: 'auto',
                        pb: 1,
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                    }}
                    aria-label="Product image thumbnails"
                >
                    {allImages.map((image) => (
                        <Box
                            key={image.id}
                            onClick={() => setSelectedImage(image)}
                            sx={{
                                flexShrink: 0,
                                cursor: 'pointer',
                                width: 80,
                                height: 80,
                                borderRadius: 2,
                                overflow: 'hidden',
                                border: selectedImage.id === image.id
                                    ? (theme) => `3px solid ${theme.palette.primary.main}`
                                    : '3px solid transparent',
                                transition: 'border 0.2s ease-in-out',
                                '&:hover': { opacity: 0.8 },
                            }}
                        >
                            <img
                                src={image.small}
                                alt={`${name} thumbnail`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </Box>
                    ))}
                </Box>
            )}
        </Paper>
    );
};

export default ProductImageGallery;