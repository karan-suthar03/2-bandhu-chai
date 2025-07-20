import axiosInstance from "./axios.js";

const getProducts = async (params) => {};

const getFeaturedProducts = async () => {
    try {
        const response = await axiosInstance.get('/products/featured');
        return response.data;
    } catch (error) {
        console.error('Error fetching featured products:', error);
        throw error;
    }
};

export { getProducts, getFeaturedProducts };