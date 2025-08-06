import { useState, useEffect } from 'react';
import {getAdminProduct} from "../../api/index.js";

export const useProductDetails = (productId) => {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!productId) {
            setError('No product ID provided.');
            setLoading(false);
            return;
        }

        const fetchProduct = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await getAdminProduct(productId);

                if (response.data.success) {
                    setProduct(response.data.data);
                } else {
                    setError('Failed to fetch product details.');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err.response?.data?.message || 'An unexpected error occurred while fetching product details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    return { product, loading, error };
};