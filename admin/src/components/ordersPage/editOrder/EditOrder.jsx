import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Stack, Skeleton, Alert } from '@mui/material';

import OrderHeader from './components/OrderHeader';
import OrderBasicInfo from './components/OrderBasicInfo';
import OrderCustomerDetails from './components/OrderCustomerDetails';
import OrderItems from './components/OrderItems';
import OrderPaymentInfo from './components/OrderPaymentInfo';
import OrderStatusInfo from './components/OrderStatusInfo';
import {useEditOrder} from "../../hooks/useEditOrder.js";

const EditOrderSkeleton = () => (
    <Box sx={{ p: 3 }}>
        <Stack spacing={3}>
            <Skeleton variant="rounded" height={60} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}><Skeleton variant="rounded" height={400} /></Grid>
                <Grid item xs={12} md={4}><Skeleton variant="rounded" height={300} /></Grid>
            </Grid>
        </Stack>
    </Box>
);

const EditOrder = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const {
        order,
        loading,
        saving,
        error,
        handleUpdatePricing,
        handleUpdateCustomer,
        handleUpdateStatus
    } = useEditOrder(orderId);

    const handleBackClick = () => navigate('/orders');

    if (loading) return <EditOrderSkeleton />;
    if (error || !order) return <Box sx={{ p: 3 }}><Alert severity="error">{error || 'Order not found'}</Alert></Box>;

    return (
        <Box sx={{ p: 3 }}>
            <OrderHeader order={order} onBackClick={handleBackClick} />

            <Grid container spacing={3}>
                <Grid item className="w-full">
                    <Stack spacing={3}>
                        <OrderBasicInfo
                            order={order}
                            onSave={handleUpdatePricing}
                            saving={saving}
                        />
                        <OrderCustomerDetails
                            order={order}
                            onSave={handleUpdateCustomer}
                            saving={saving}
                        />
                        <OrderItems order={order} />
                        <OrderStatusInfo
                            order={order}
                            onSave={handleUpdateStatus}
                            saving={saving}
                        />
                        <OrderPaymentInfo order={order} />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EditOrder;