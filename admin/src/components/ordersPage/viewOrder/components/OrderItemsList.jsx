import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Avatar,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import { ShoppingCart, OpenInNew } from '@mui/icons-material';

const OrderItemsList = ({ order }) => {
    const navigate = useNavigate();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const handleProductClick = (productId) => {
        if (productId) {
            navigate(`/dashboard/products/edit/${productId}`);
        }
    };

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}>
                        <ShoppingCart />
                        Order Items
                    </Typography>
                    <Chip 
                        label={`${order.orderItems?.length || 0} items`} 
                        color="primary" 
                        size="small" 
                    />
                </Box>

                {!order.orderItems || order.orderItems.length === 0 ? (
                    <Box textAlign="center" py={4}>
                        <Typography color="text.secondary">
                            No items found in this order
                        </Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Product</TableCell>
                                    <TableCell align="center">Quantity</TableCell>
                                    <TableCell align="right">Unit Price</TableCell>
                                    <TableCell align="right">Total</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.orderItems.map((item, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>
                                            <Box 
                                                display="flex" 
                                                alignItems="center" 
                                                gap={2}
                                                sx={{ cursor: 'pointer' }}
                                                onClick={() => handleProductClick(item.productId)}
                                            >
                                                <Avatar
                                                    src={
                                                        item.product?.image?.smallUrl || 
                                                        item.product?.image?.mediumUrl || 
                                                        item.product?.image?.largeUrl ||
                                                        (item.product?.images && item.product.images.length > 0 ? 
                                                            item.product.images[0]?.smallUrl || 
                                                            item.product.images[0]?.mediumUrl || 
                                                            item.product.images[0]?.largeUrl 
                                                            : null
                                                        )
                                                    }
                                                    alt={item.product?.name}
                                                    sx={{ 
                                                        width: 40, 
                                                        height: 40,
                                                        cursor: 'pointer',
                                                        '&:hover': {
                                                            transform: 'scale(1.1)',
                                                            transition: 'transform 0.2s'
                                                        }
                                                    }}
                                                    variant="rounded"
                                                >
                                                    {item.product?.name?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography 
                                                        variant="body2" 
                                                        fontWeight="medium"
                                                        sx={{
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                color: 'primary.main',
                                                                textDecoration: 'underline'
                                                            }
                                                        }}
                                                    >
                                                        {item.product?.name || 'Unknown Product'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Product ID: {item.productId}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip 
                                                label={item.quantity} 
                                                size="small" 
                                                variant="outlined" 
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2">
                                                {formatCurrency(item.price)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography variant="body2" fontWeight="medium">
                                                {formatCurrency(item.price * item.quantity)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="View Product Details">
                                                <IconButton 
                                                    size="small" 
                                                    color="primary"
                                                    onClick={() => handleProductClick(item.productId)}
                                                >
                                                    <OpenInNew fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Tip:</strong> Click on any product name or image to view its details and make edits if needed.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default OrderItemsList;
