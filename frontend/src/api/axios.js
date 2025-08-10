import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_BASE_URL,
    withCredentials: true,
    timeout: 10000, // 10 second timeout
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timeout - Server may be unavailable');
            error.isTimeout = true;
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
            console.error('Network error - Server unavailable');
            error.isNetworkError = true;
        } else if (!error.response) {
            console.error('No response from server - Server may be down');
            error.isServerDown = true;
        }
        
        console.error('API error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            url: error.config?.url
        });
        
        return Promise.reject(error);
    }
);

export default axiosInstance;