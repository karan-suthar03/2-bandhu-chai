import React from 'react';
import { Card, CardContent, Typography, TextField, Autocomplete, Chip, Grid } from '@mui/material';
import { Category } from '@mui/icons-material';

const ProductCategorization = ({ product, setProduct, handleChange, errors, loading }) => (
    <Card elevation={2}>
        <CardContent>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}><Category /> Categorization</Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}><TextField label="Category" name="category" value={product.category} onChange={handleChange} fullWidth required error={!!errors.category} helperText={errors.category} disabled={loading} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Badge (e.g., 'Sale')" name="badge" value={product.badge} onChange={handleChange} fullWidth disabled={loading} /></Grid>
            </Grid>
            <Autocomplete
                multiple freeSolo options={[]} value={product.features}
                onChange={(e, val) => setProduct(p => ({ ...p, features: val }))}
                disabled={loading}
                renderTags={(val, getTagProps) => val.map((opt, idx) => (<Chip key={opt} label={opt} {...getTagProps({ index: idx })} />))}
                renderInput={(params) => (<TextField {...params} label="Features / Keywords" placeholder="Add and hit Enter" />)}
            />
        </CardContent>
    </Card>
);

export default ProductCategorization;