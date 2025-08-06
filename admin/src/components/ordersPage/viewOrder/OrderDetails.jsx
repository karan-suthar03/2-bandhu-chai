import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Stack, Skeleton, Alert } from '@mui/material';

import OrderDetailsHeader from './components/OrderDetailsHeader';
import OrderDetailsInfo from './components/OrderDetailsInfo';
import OrderCustomerInfo from './components/OrderCustomerInfo';
import OrderItemsList from './components/OrderItemsList';
import OrderPaymentDetails from './components/OrderPaymentDetails';
import OrderStatusDetails from './components/OrderStatusDetails';
import { useOrderDetails } from "../../hooks/useOrderDetails.js";

const OrderDetailsSkeleton = () => (
    <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
            <Skeleton variant="rounded" height={60} />
            <Grid container spacing={3}>
                <Grid item className="w-full">
                    <Stack spacing={3}>
                        <Skeleton variant="rounded" height={200} />
                        <Skeleton variant="rounded" height={300} />
                        <Skeleton variant="rounded" height={150} />
                        <Skeleton variant="rounded" height={200} />
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    </Box>
);

const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { order, loading, error } = useOrderDetails(orderId);

    const handleBackClick = () => navigate('/dashboard/orders');
    const handleEditClick = () => navigate(`/dashboard/orders/edit/${order.id}`);

    if (loading) {
        return <OrderDetailsSkeleton />;
    }

    if (error || !order) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error || 'Order not found'}</Alert>
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

            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item className="w-full">
                    <Stack spacing={3}>
                        <OrderDetailsInfo order={order} />
                        <OrderItemsList order={order} />
                        <OrderPaymentDetails order={order} />
                        <OrderCustomerInfo order={order} />
                        <OrderStatusDetails order={order} />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default OrderDetails;
