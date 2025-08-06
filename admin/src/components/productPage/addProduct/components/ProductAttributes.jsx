import React from 'react';
import { Card, CardContent, Typography, FormControlLabel, Switch, Grid, Box, Button, CircularProgress, Alert } from '@mui/material';
import { EnergySavingsLeaf, LocalShipping, CheckCircle } from '@mui/icons-material';

const ProductAttributes = ({ product, handleChange, submissionStatus, isFormValid, loading, handleSubmit }) => (
    <Card elevation={2}>
        <CardContent>
            <Typography variant="h6" gutterBottom>Attributes & Actions</Typography>
            <Grid container>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={product.isNew} onChange={handleChange} name="isNew" disabled={loading} />} label="New Arrival" /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={product.featured} onChange={handleChange} name="featured" disabled={loading} />} label="Featured Product" /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={product.organic} onChange={handleChange} name="organic" disabled={loading} />} label={<Box display="flex" alignItems="center"><EnergySavingsLeaf fontSize="small" sx={{ mr: 0.5 }}/> Organic</Box>} /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={product.fastDelivery} onChange={handleChange} name="fastDelivery" disabled={loading} />} label={<Box display="flex" alignItems="center"><LocalShipping fontSize="small" sx={{ mr: 0.5 }}/> Fast Delivery</Box>} /></Grid>
            </Grid>
            {submissionStatus && <Alert severity={submissionStatus.type} sx={{ mt: 3, mb: 2 }}>{submissionStatus.message}</Alert>}
            <Button type="submit" variant="contained" onClick={handleSubmit} fullWidth disabled={!isFormValid || loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />} sx={{ mt: 3, py: 1.5, fontWeight: 'bold' }}>
                {loading ? 'Creating Product...' : 'Create Product'}
            </Button>
        </CardContent>
    </Card>
);

export default ProductAttributes;