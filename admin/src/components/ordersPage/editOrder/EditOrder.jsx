import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Grid, Stack, Skeleton, Card, CardContent, Alert } from '@mui/material';
import { getAdminOrder, updateOrder, updateOrderStatus } from '../../../api';
import { StatusEnum } from '../enums';

import OrderHeader from './components/OrderHeader';
import OrderBasicInfo from './components/OrderBasicInfo';
import OrderCustomerDetails from './components/OrderCustomerDetails';
import OrderItems from './components/OrderItems';
import OrderPaymentInfo from './components/OrderPaymentInfo';
import OrderStatusInfo from './components/OrderStatusInfo';

const EditOrder = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
                        subtotal: orderData.subtotal?.toString() || '0',
                        totalDiscount: orderData.totalDiscount?.toString() || '0',
                        shippingCost: orderData.shippingCost?.toString() || '0',
                        tax: orderData.tax?.toString() || '0',
                        finalTotal: orderData.finalTotal?.toString() || '0',
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

    const handleSaveChanges = async (dataSection, saveData) => {
        console.log(`Saving ${dataSection}:`, saveData);

        setSaving(true);
        
        try {
            if (dataSection === 'status') {
                const response = await updateOrderStatus(order.id, saveData);

                if (response.data.success) {
                    setOrder(prev => ({
                        ...prev,
                        status: saveData.status,
                        ...(saveData.status === StatusEnum.CONFIRMED && { confirmedAt: new Date().toISOString() }),
                        ...(saveData.status === StatusEnum.SHIPPED && { shippedAt: new Date().toISOString() }),
                        ...(saveData.status === StatusEnum.DELIVERED && { deliveredAt: new Date().toISOString() }),
                        ...(saveData.status === StatusEnum.CANCELLED && { cancelledAt: new Date().toISOString() }),
                    }));
                    console.log('Order status updated successfully');
                } else {
                    throw new Error('Failed to update order status');
                }
            } else {
                const response = await updateOrder(order.id, saveData);

                if (response.data.success) {
                    setOrder(prev => ({
                        ...prev,
                        ...saveData
                    }));
                    console.log(`Order ${dataSection} updated successfully`);
                } else {
                    throw new Error(`Failed to update order ${dataSection}`);
                }
            }
        } catch (error) {
            console.error(`Error updating order ${dataSection}:`, error);
            throw error;
        } finally {
            setSaving(false);
        }
    };

    const handleBackClick = () => {
        navigate('/dashboard/orders');
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
            <OrderHeader 
                order={order} 
                onBackClick={handleBackClick}
            />

            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    <Stack spacing={3}>
                        <OrderBasicInfo 
                            order={order} 
                            onSave={(data) => handleSaveChanges('basic', data)}
                            saving={saving}
                        />
                        
                        <OrderCustomerDetails 
                            order={order} 
                            onSave={(data) => handleSaveChanges('customer', data)}
                            saving={saving}
                        />
                        
                        <OrderItems 
                            order={order} 
                        />
                    </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Stack spacing={3}>
                        <OrderStatusInfo 
                            order={order} 
                            onSave={(data) => handleSaveChanges('status', data)}
                            saving={saving}
                        />
                        
                        <OrderPaymentInfo 
                            order={order} 
                            onSave={(data) => handleSaveChanges('payment', data)}
                            saving={saving}
                        />
                    </Stack>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EditOrder;
