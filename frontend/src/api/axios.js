import axios from 'axios';

const axiosInstance = axios.create({
    baseURL:'http://localhost:3000/',
    withCredentials: true,
});

axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('API error:', error);
        return Promise.reject(error);
    }
);

export default axiosInstance;