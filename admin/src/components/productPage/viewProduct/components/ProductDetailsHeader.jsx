import React from 'react';
import { Box, Typography, Chip, Button, IconButton } from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';

const ProductDetailsHeader = ({ product, onBack, onEdit }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={onBack} color="primary" aria-label="back to products">
                <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" component="h1">
                Product Details
            </Typography>
            <Chip
                label={product.deactivated ? 'Deactivated' : 'Active'}
                color={product.deactivated ? 'error' : 'success'}
            />
        </Box>
        <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={onEdit}
            color="primary"
        >
            Edit Product
        </Button>
    </Box>
);

export default ProductDetailsHeader;