import axiosInstance from "./axios.js";

const getProducts = async (params) => {
    try {
        const response = await axiosInstance.get(`/products`, { params });
        return response.data.data;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

const getFeaturedProducts = async () => {
    try {
        const response = await axiosInstance.get('/products/featured');
        return response.data.data;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        throw error;
    }
};

export { getProducts, getFeaturedProducts };