import axios from './axios.js';

export const getProductReviews = async (productId, { page = 1, limit = 10 } = {}) => {
  try {
    const res = await axios.get(`/products/${productId}/reviews`, { params: { page, limit } });
    return { reviews: res.data.data || [], summary: res.data.summary || null };
  } catch (error) {
    console.error('Error fetching reviews:', error);
    if (error.isNetworkError || error.isServerDown || error.isTimeout) {
      return { reviews: [], summary: null };
    }
    throw error;
  }
};

export const createProductReview = async (productId, payload) => {
  try {
    const res = await axios.post(`/products/${productId}/reviews`, payload);
    return res.data.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};
