import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Stack, Skeleton, Alert, Button, Typography, Breadcrumbs, Link } from '@mui/material';
import { ArrowBack, Receipt, Edit } from '@mui/icons-material';
import { getAdminOrder } from '../../../api';

import OrderDetailsHeader from './components/OrderDetailsHeader';
import OrderDetailsInfo from './components/OrderDetailsInfo';
import OrderCustomerInfo from './components/OrderCustomerInfo';
import OrderItemsList from './components/OrderItemsList';
import OrderPaymentDetails from './components/OrderPaymentDetails';
import OrderStatusDetails from './components/OrderStatusDetails';

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrder = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const response = await getAdminOrder(orderId);
                
                if (response.data.success) {
                    const orderData = response.data.data;
                    const transformedOrder = {
                        id: orderData.id,
                        customerName: orderData.customerName,
                        customerEmail: orderData.customerEmail,
                        customerPhone: orderData.customerPhone,
                        shippingAddress: orderData.shippingAddress,
                        status: orderData.status,
                        paymentStatus: orderData.paymentStatus,
                        paymentMethod: orderData.paymentMethod,
                        subtotal: orderData.subtotal || 0,
                        totalDiscount: orderData.totalDiscount || 0,
                        shippingCost: orderData.shippingCost || 0,
                        tax: orderData.tax || 0,
                        finalTotal: orderData.finalTotal || 0,
                        orderItems: orderData.orderItems || [],
                        createdAt: orderData.createdAt,
                        updatedAt: orderData.updatedAt,
                        confirmedAt: orderData.confirmedAt,
                        shippedAt: orderData.shippedAt,
                        deliveredAt: orderData.deliveredAt,
                        cancelledAt: orderData.cancelledAt,
                        notes: orderData.notes || ''
                    };
                    
                    setOrder(transformedOrder);
                } else {
                    setError('Failed to load order data');
                }
            } catch (err) {
                console.error('Error loading order:', err);
                setError(err.response?.data?.message || 'Failed to load order data');
            } finally {
                setLoading(false);
            }
        };

        if (orderId) {
            loadOrder();
        } else {
            setError('No order ID provided');
            setLoading(false);
        }
    }, [orderId]);

    const handleBackClick = () => {
        navigate('/dashboard/orders');
    };

    const handleEditClick = () => {
        navigate(`/dashboard/orders/edit/${order.id}`);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3 }}>
                <Stack spacing={3}>
                    <Skeleton variant="rounded" height={60} />
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={8}>
                            <Stack spacing={3}>
                                <Skeleton variant="rounded" height={200} />
                                <Skeleton variant="rounded" height={300} />
                                <Skeleton variant="rounded" height={200} />
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Stack spacing={3}>
                                <Skeleton variant="rounded" height={150} />
                                <Skeleton variant="rounded" height={200} />
                            </Stack>
                        </Grid>
                    </Grid>
                </Stack>
            </Box>
        );
    }

    if (error || !order) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    {error || 'Order not found'}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <OrderDetailsHeader 
                order={order} 
                onBackClick={handleBackClick}
                onEditClick={handleEditClick}
            />

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                        <OrderDetailsInfo order={order} />
                        <OrderCustomerInfo order={order} />
                        <OrderItemsList order={order} />
                        <OrderPaymentDetails order={order} />
                        <OrderStatusDetails order={order} />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OrderDetails;
