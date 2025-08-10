import axiosInstance from "./axios.js";

const getProducts = async (params) => {
    try {
        const response = await axiosInstance.get(`/products`, { params });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching products:', error);

        if (error.isNetworkError || error.isServerDown || error.isTimeout) {
            return [];
        }

        throw error;
    }
};

const getFeaturedProducts = async () => {
    try {
        const response = await axiosInstance.get('/products/featured');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching featured products:', error);

        if (error.isNetworkError || error.isServerDown || error.isTimeout) {
            return [];
        }

        throw error;
    }
};

const getProduct = async (productId) => {
    try {
        const response = await axiosInstance.get(`/products/${productId}`);
        return response.data.data;
    } catch (error) {
        console.error('Error fetching product:', error);

        if (error.isNetworkError || error.isServerDown || error.isTimeout) {
            return null;
        }
        
        throw error;
    }
}

const getRelatedProducts = async (productId, limit = 4) => {
    try {
        const response = await axiosInstance.get(`/products/${productId}/related`, { 
            params: { limit } 
        });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching related products:', error);

        if (error.isNetworkError || error.isServerDown || error.isTimeout) {
            return [];
        }
        
        throw error;
    }
};

const getCartItems = async (cartItems) => {
    try {
        const response = await axiosInstance.post('/products/cart', { cartItems });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching cart items:', error);

        if (error.isNetworkError || error.isServerDown || error.isTimeout) {
            return [];
        }
        
        throw error;
    }
};

export { getProducts, getFeaturedProducts, getProduct, getRelatedProducts, getCartItems };