import React from 'react';
import { Paper, Typography, Box, Divider } from '@mui/material';

const ProductDescription = ({ product }) => (
    <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
            Product Descriptions
        </Typography>
        <Box mb={2}>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Short Description
            </Typography>
            <Typography variant="body1" paragraph>
                {product.description || 'No short description available.'}
            </Typography>
        </Box>

        {product.longDescription && (
            <Box mb={2}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Detailed Description
                </Typography>
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
                    {product.longDescription}
                </Typography>
            </Box>
        )}

        {product.specifications && (
            <Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Specifications
                </Typography>
                <Box component="pre" sx={{ fontFamily: 'inherit', whiteSpace: 'pre-wrap', bgcolor: 'grey.50', p: 2, borderRadius: 1, fontSize: '0.875rem' }}>
                    {typeof product.specifications === 'object' ? JSON.stringify(product.specifications, null, 2) : product.specifications}
                </Box>
            </Box>
        )}
    </Paper>
);

export default ProductDescription;