import React from 'react';
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
    Chip
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';

const OrderItems = ({ order }) => {
    console.log('Order data in EditOrder OrderItems:', order);
    console.log('Order items:', order.orderItems);
    if (order.orderItems && order.orderItems.length > 0) {
        console.log('First order item:', order.orderItems[0]);
        console.log('First item variant:', order.orderItems[0].variant);
        console.log('First item product:', order.orderItems[0].variant?.product);
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const getImageUrl = (imageObj) => {
        if (!imageObj) return null;
        if (typeof imageObj === 'string') {
            try {
                const parsed = JSON.parse(imageObj);
                return parsed.mediumUrl || parsed.originalUrl || parsed.url || null;
            } catch (e) {
                return imageObj;
            }
        }
        if (typeof imageObj === 'object') {
            return imageObj.mediumUrl || imageObj.originalUrl || imageObj.url || null;
        }
        return null;
    };

    const getProductImage = (item) => {
        const product = item.variant?.product;
        if (!product) return null;

        const mainImageUrl = getImageUrl(product.image);
        if (mainImageUrl) return mainImageUrl;

        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            return getImageUrl(product.images[0]);
        }

        return null;
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
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {order.orderItems.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar
                                                    src={getProductImage(item)}
                                                    alt={item.variant?.product?.name}
                                                    sx={{ width: 40, height: 40 }}
                                                    variant="rounded"
                                                >
                                                    {item.variant?.product?.name?.charAt(0)}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {item.variant?.product?.name || 'Unknown Product'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Product ID: {item.variant?.product?.id || item.productVariantId}
                                                    </Typography>
                                                    {item.variant?.size && (
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Size: {item.variant.size}
                                                        </Typography>
                                                    )}
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
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
                    <Typography variant="body2" color="text.secondary">
                        <strong>Note:</strong> Order items cannot be modified after the order is placed. 
                        If changes are needed, consider creating a new order or processing a refund.
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default OrderItems;
