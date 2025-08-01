import React, { useState } from 'react';
import { 
    Box, Button, TextField, Typography, Card, CardContent, Divider, 
    Chip, FormControlLabel, Switch, CircularProgress, Alert, Grid
} from '@mui/material';
import { Category, Save, Star, NewReleases, EnergySavingsLeaf, LocalShipping } from '@mui/icons-material';

const ProductCategorization = ({ product, onSave, loading }) => {
    const [categorization, setCategorization] = useState({
        category: product.category,
        badge: product.badge,
        isNew: product.isNew,
        featured: product.featured,
        organic: product.organic,
        fastDelivery: product.fastDelivery,
        deactivated: product.deactivated,
        features: product.features || []
    });
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState(null);
    const [newFeature, setNewFeature] = useState('');

    const isDisabled = loading || saving;



    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCategorization(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        setStatus(null);
    };

    const handleFeatureAdd = () => {
        if (newFeature.trim() && !categorization.features.includes(newFeature.trim())) {
            setCategorization(prev => ({
                ...prev,
                features: [...prev.features, newFeature.trim()]
            }));
            setNewFeature('');
        }
    };

    const handleFeatureDelete = (featureToDelete) => {
        setCategorization(prev => ({
            ...prev,
            features: prev.features.filter(feature => feature !== featureToDelete)
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setStatus(null);
        try {
            await onSave(categorization);
            setStatus({ type: 'success', message: 'Categorization saved successfully!' });
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to save categorization.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card elevation={2}>
            <CardContent>
                <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                    <Category color="primary" /> Categorization & Badges
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Category"
                            name="category"
                            value={categorization.category}
                            disabled={isDisabled}
                            onChange={handleChange}
                            fullWidth
                            required
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="Badge (e.g., 'Premium', 'Best Seller')"
                            name="badge"
                            value={categorization.badge}
                            onChange={handleChange}
                            fullWidth
                            disabled={isDisabled}
                        />
                    </Grid>
                </Grid>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Product Features</Typography>
                    <Box display="flex" gap={1} alignItems="center" sx={{ mb: 2 }}>
                        <TextField
                            size="small"
                            placeholder="Add a feature"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleFeatureAdd()}
                            disabled={isDisabled}
                        />
                        <Button variant="outlined" size="small" onClick={handleFeatureAdd} disabled={isDisabled}>
                            Add
                        </Button>
                    </Box>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                        {categorization.features.map((feature, index) => (
                            <Chip
                                key={index}
                                label={feature}
                                onDelete={isDisabled ? undefined : () => handleFeatureDelete(feature)}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                        ))}
                    </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>Product Attributes</Typography>
                    <Grid container spacing={1}>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                disabled={isDisabled}
                                control={
                                    <Switch
                                        name="isNew"
                                        checked={categorization.isNew}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                    />
                                }
                                label={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <NewReleases fontSize="small" />
                                        New Product
                                    </Box>
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                disabled={isDisabled}
                                control={
                                    <Switch
                                        name="featured"
                                        checked={categorization.featured}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                    />
                                }
                                label={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Star fontSize="small" />
                                        Featured
                                    </Box>
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                disabled={isDisabled}
                                control={
                                    <Switch
                                        name="organic"
                                        checked={categorization.organic}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                    />
                                }
                                label={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <EnergySavingsLeaf fontSize="small" />
                                        Organic
                                    </Box>
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControlLabel
                                disabled={isDisabled}
                                control={
                                    <Switch
                                        name="fastDelivery"
                                        checked={categorization.fastDelivery}
                                        onChange={handleChange}
                                        disabled={isDisabled}
                                    />
                                }
                                label={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <LocalShipping fontSize="small" />
                                        Fast Delivery
                                    </Box>
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                disabled={isDisabled}
                                control={
                                    <Switch
                                        name="deactivated"
                                        checked={categorization.deactivated}
                                        onChange={handleChange}
                                        color="error"
                                        disabled={isDisabled}
                                    />
                                }
                                label="Deactivate Product"
                            />
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ mt: 3, textAlign: 'right' }}>
                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
                        onClick={handleSave}
                        disabled={isDisabled}
                    >
                        {saving ? 'Saving...' : 'Save Categorization'}
                    </Button>
                </Box>
                {status && <Alert severity={status.type} sx={{ mt: 2 }}>{status.message}</Alert>}
            </CardContent>
        </Card>
    );
};

export default ProductCategorization;
