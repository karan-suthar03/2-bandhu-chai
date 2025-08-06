
import React from 'react';
import { Paper, Typography, Grid, Chip, Box } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

const ProductInfoCard = ({ product }) => (
    <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
            Basic Information
        </Typography>
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary">Product Name</Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>{product.name}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Product ID</Typography>
                <Typography variant="body1">#{product.id}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <Chip label={product.category || 'N/A'} variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Rating</Typography>
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
);

export default ProductInfoCard;