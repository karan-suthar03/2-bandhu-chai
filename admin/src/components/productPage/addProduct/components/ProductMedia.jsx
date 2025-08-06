import React from 'react';
import { Box, Button, Typography, FormControl, Avatar, IconButton, Tooltip, Stack, alpha } from '@mui/material';
import { PhotoCamera, CloudUpload, Close } from '@mui/icons-material';

const DropzoneBox = ({ children, error }) => (
    <Box sx={{ p: 3, borderRadius: 2, minHeight: 180, border: theme => `2px dashed ${error ? theme.palette.error.main : theme.palette.divider}`, backgroundColor: theme => alpha(theme.palette.grey[500], 0.05), display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', flexDirection: 'column', gap: 1 }}>
        {children}
    </Box>
);

const ProductMedia = ({ mainImage, gallery, handlers, mainImageUrl, errors, loading }) => (
    <Stack spacing={4}>
        <FormControl fullWidth error={!!errors.mainImage}>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>Main Image*</Typography>
            <DropzoneBox error={!!errors.mainImage}>
                {!mainImage ? (
                    <Button component="label" startIcon={<PhotoCamera />}><input hidden type="file" accept="image/*" onChange={handlers.onMainImageSelect} disabled={loading} />Upload Image</Button>
                ) : (
                    <Box sx={{ position: 'relative' }}>
                        <Avatar src={mainImageUrl} variant="rounded" sx={{ width: 120, height: 120 }} />
                        <Tooltip title="Remove Image"><IconButton size="small" onClick={handlers.onRemoveMainImage} sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'white', boxShadow: 1 }} disabled={loading}><Close fontSize="small" /></IconButton></Tooltip>
                    </Box>
                )}
            </DropzoneBox>
            {errors.mainImage && <Typography variant="caption" color="error" sx={{ mt: 1 }}>{errors.mainImage}</Typography>}
        </FormControl>

        <FormControl fullWidth>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>Gallery Images</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {gallery.map((file, i) => (
                    <Box key={i} sx={{ position: 'relative' }}>
                        <Avatar src={URL.createObjectURL(file)} variant="rounded" sx={{ width: 70, height: 70 }} />
                        <Tooltip title="Remove Image"><IconButton size="small" onClick={() => handlers.onRemoveGalleryImage(i)} sx={{ position: 'absolute', top: -10, right: -10, backgroundColor: 'white', boxShadow: 1 }} disabled={loading}><Close fontSize="small" /></IconButton></Tooltip>
                    </Box>
                ))}
                <Tooltip title="Add Images">
                    <IconButton component="label" sx={{ width: 70, height: 70, border: '2px dashed', borderColor: 'divider', borderRadius: 2 }} disabled={loading}>
                        <CloudUpload /><input hidden multiple type="file" accept="image/*" onChange={handlers.onGalleryAdd} />
                    </IconButton>
                </Tooltip>
            </Box>
        </FormControl>
    </Stack>
);

export default ProductMedia;