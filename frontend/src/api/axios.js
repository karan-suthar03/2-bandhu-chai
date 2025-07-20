import axios from 'axios';

const axiosInstance = axios.create({
    baseURL:'http://localhost:3000/',
});

// Add a request interceptor to include the token in headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.error('Unauthorized access - redirecting to login');
            window.location.href = '/login';
        } else {
            console.error('API error:', error);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;