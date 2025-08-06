import { useState, useEffect } from 'react';
import {getAdminOrder} from "../../api/index.js";

export const useOrderDetails = (orderId) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) {
            setError('No order ID provided');
            setLoading(false);
            return;
        }

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
                setError(err.response?.data?.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId]);

    return { order, loading, error };
};