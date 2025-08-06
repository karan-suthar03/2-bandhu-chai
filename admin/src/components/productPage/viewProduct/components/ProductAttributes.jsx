import React from 'react';
import { Paper, Typography, Stack, Chip, Box } from '@mui/material';
import {
    Star as StarIcon,
    LocalOffer as LocalOfferIcon,
    CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
const ProductAttributes = ({ product }) => (
    <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
            Tags & Features
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
            {product.featured && <Chip icon={<StarIcon />} label="Featured" color="primary" />}
            {product.isNew && <Chip label="New" color="secondary" />}
            {product.organic && <Chip label="Organic" color="success" />}
            {product.fastDelivery && <Chip label="Fast Delivery" color="info" />}
            {product.badge && <Chip icon={<LocalOfferIcon />} label={product.badge} variant="outlined" />}
        </Stack>
        code
        Code
        {product.features && product.features.length > 0 && (
            <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>
                    Features
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
);
export default ProductAttributes;