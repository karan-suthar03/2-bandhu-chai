import React from 'react';
import { Card, CardContent, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar, Chip } from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import {formatCurrency} from "../../../Utils/Utils.js";

const OrderItems = ({ order }) => (
    <Card>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight="bold" display="flex" alignItems="center" gap={1}><ShoppingCart /> Order Items</Typography>
                <Chip label={`${order.orderItems?.length || 0} items`} color="primary" size="small" />
            </Box>
            <TableContainer>
                <Table>
                    <TableHead><TableRow><TableCell>Product</TableCell><TableCell align="center">Qty</TableCell><TableCell align="right">Price</TableCell><TableCell align="right">Total</TableCell></TableRow></TableHead>
                    <TableBody>
                        {order.orderItems?.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <Avatar src={item.variant?.product?.image?.smallUrl} alt={item.variant?.product?.name} variant="rounded">{item.variant?.product?.name?.charAt(0)}</Avatar>
                                        <Box>
                                            <Typography variant="body2" fontWeight="medium">{item.variant?.product?.name || 'N/A'}</Typography>
                                            <Typography variant="caption" color="text.secondary">Size: {item.variant?.size || 'N/A'}</Typography>
                                        </Box>
                                    </Box>
                                </TableCell>
                                <TableCell align="center">{item.quantity}</TableCell>
                                <TableCell align="right">{formatCurrency(item.price)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(item.price * item.quantity)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box mt={3} p={2} bgcolor="grey.100" borderRadius={1}>
                <Typography variant="body2" color="text.secondary"><strong>Note:</strong> Order items are read-only and cannot be modified after placement.</Typography>
            </Box>
        </CardContent>
    </Card>
);

export default OrderItems;