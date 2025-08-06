import React from 'react';
import {
    TableCell,
    TableRow,
    Chip,
    Box,
    Typography,
} from '@mui/material';
import {
    Warning as WarningIcon,
} from '@mui/icons-material';
import { formatCurrency, formatDiscount } from "../Utils/Utils.js";
import { useNavigate } from 'react-router-dom';

const VariantRow = ({ variant, onViewProduct }) => {
    const navigate = useNavigate();
    
    const getStockStatus = (stock) => {
        if (stock === 0) return { label: 'Out of Stock', color: 'error', icon: <WarningIcon fontSize="small" /> };
        if (stock <= 5) return { label: 'Low Stock', color: 'warning', icon: <WarningIcon fontSize="small" /> };
        return { label: 'In Stock', color: 'success' };
    };

    const stockStatus = getStockStatus(variant.stock);

    const handleRowClick = () => {
        onViewProduct(variant.productId);
    };

    return (
        <TableRow 
            hover 
            onClick={handleRowClick}
            style={{ cursor: 'pointer' }}
        >
            <TableCell>
                <Typography variant="body2" fontWeight="medium">
                    {variant.sku || '-'}
                </Typography>
            </TableCell>
            
            <TableCell>
                <Box>
                    <Typography variant="body2" fontWeight="medium">
                        {variant.product?.name || 'Unknown Product'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ID: {variant.productId}
                    </Typography>
                </Box>
            </TableCell>
            
            <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <img
                        src={variant.product?.smallImageUrl || '/placeholder-product.jpg'}
                        alt={variant.product?.name || 'Product'}
                        style={{
                            width: 40,
                            height: 40,
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '1px solid #ddd'
                        }}
                        onError={(e) => {
                            e.target.src = '/placeholder-product.jpg';
                        }}
                    />
                </Box>
            </TableCell>
            
            <TableCell>
                <Chip 
                    label={variant.product?.category || 'N/A'} 
                    size="small" 
                    variant="outlined" 
                />
            </TableCell>
            
            <TableCell>
                <Chip 
                    label={variant.size} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                />
            </TableCell>
            
            <TableCell>
                <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(variant.price)}
                </Typography>
            </TableCell>
            
            <TableCell>
                {variant.oldPrice ? (
                    <Typography 
                        variant="body2" 
                        sx={{ textDecoration: 'line-through' }}
                        color="text.secondary"
                    >
                        {formatCurrency(variant.oldPrice)}
                    </Typography>
                ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                )}
            </TableCell>
            
            <TableCell>
                {variant.discount ? (
                    <Chip 
                        label={formatDiscount(variant.discount)} 
                        size="small" 
                        color="success" 
                    />
                ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                )}
            </TableCell>
            
            <TableCell>
                <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" fontWeight="medium">
                        {variant.stock}
                    </Typography>
                    {variant.stock <= 5 && variant.stock > 0 && (
                        <WarningIcon color="warning" fontSize="small" />
                    )}
                </Box>
            </TableCell>
            
            <TableCell>
                <Chip 
                    label={stockStatus.label}
                    size="small"
                    color={stockStatus.color}
                    icon={stockStatus.icon}
                />
            </TableCell>
        </TableRow>
    );
};

export default VariantRow;
