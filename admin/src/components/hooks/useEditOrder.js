import { useState, useEffect, useCallback } from 'react';
import {getAdminOrder, updateOrder, updateOrderStatus} from "../../api/index.js";

export const useEditOrder = (orderId) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
                    setOrder(response.data.data);
                } else {
                    setError('Failed to load order data');
                }
            } catch (err) {
                setError(err.response?.data?.message || 'An unexpected error occurred');
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId]);

    const handleSave = useCallback(async (saveFunction) => {
        setSaving(true);
        try {
            const response = await saveFunction();
            if (response.data.success) {
                setOrder(prev => ({ ...prev, ...response.data.data }));
                return response.data.data;
            } else {
                throw new Error(response.data.message || 'Save operation failed');
            }
        } catch (err) {
            console.error('Save failed:', err);
            throw err;
        } finally {
            setSaving(false);
        }
    }, [orderId]);

    const handleUpdatePricing = useCallback((data) => {
        return handleSave(() => updateOrder(orderId, data));
    }, [orderId, handleSave]);

    const handleUpdateCustomer = useCallback((data) => {
        const payload = { ...data, shippingAddress: JSON.stringify(data.shippingAddress) };
        return handleSave(() => updateOrder(orderId, payload));
    }, [orderId, handleSave]);

    const handleUpdateStatus = useCallback((data) => {
        return handleSave(() => updateOrderStatus(orderId, data));
    }, [orderId, handleSave]);

    return {
        order,
        loading,
        saving,
        error,
        handleUpdatePricing,
        handleUpdateCustomer,
        handleUpdateStatus,
    };
};