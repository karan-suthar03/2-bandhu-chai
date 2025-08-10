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
import {formatCurrency} from "../../../Utils/Utils.js";

const OrderItemsList = ({ order }) => {
    const navigate = useNavigate();

    const handleProductClick = (productId) => {
        if (productId) {
            navigate(`/products/edit/${productId}`);
        }
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
                                                onClick={() => handleProductClick(item.variant?.product?.id || item.productId)}
                                            >
                                                <Avatar
                                                    src={getProductImage(item)}
                                                    alt={item.variant?.product?.name}
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
                                                    {item.variant?.product?.name?.charAt(0)}
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
                                                        {item.variant?.product?.name || 'Unknown Product'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Product ID: {item.variant?.product?.id || item.productId}
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
                                        <TableCell align="center">
                                            <Tooltip title="View Product Details">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => handleProductClick(item.variant?.product?.id || item.productId)}
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
