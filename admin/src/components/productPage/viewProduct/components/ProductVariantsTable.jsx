import React from 'react';
import {
    Paper, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, Box, Alert,
} from '@mui/material';
import { Inventory as InventoryIcon } from '@mui/icons-material';
import {formatCurrency, formatDiscount} from "../../../Utils/Utils.js";

const ProductVariantsTable = ({ variants, defaultVariantId }) => (
    <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
            <InventoryIcon /> Variants & Pricing
        </Typography>
        {variants && variants.length > 0 ? (
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Size</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Price</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Old Price</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Discount</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>SKU</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {variants.map((variant) => (
                            <TableRow key={variant.id} sx={{ bgcolor: variant.id === defaultVariantId ? 'action.hover' : 'inherit' }}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        {variant.size}
                                        {variant.id === defaultVariantId && <Chip size="small" label="Default" color="primary" />}
                                    </Box>
                                </TableCell>
                                <TableCell><Typography variant="body2" fontWeight="bold">{formatCurrency(variant.price)}</Typography></TableCell>
                                <TableCell>
                                    {variant.oldPrice ? <Typography variant="body2" sx={{ textDecoration: 'line-through' }} color="text.secondary">{formatCurrency(variant.oldPrice)}</Typography> : '—'}
                                </TableCell>
                                <TableCell>
                                    {variant.discount > 0 ? <Chip label={formatDiscount(variant.discount)} size="small" color="success" /> : '—'}
                                </TableCell>
                                <TableCell>
                                    <Chip label={variant.stock} size="small" color={variant.stock > 10 ? 'success' : (variant.stock > 0 ? 'warning' : 'error')} />
                                </TableCell>
                                <TableCell><Typography variant="body2" color="text.secondary">{variant.sku || '—'}</Typography></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        ) : (
            <Alert severity="warning">No variants found for this product.</Alert>
        )}
    </Paper>
);

export default ProductVariantsTable;