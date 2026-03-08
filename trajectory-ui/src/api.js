import axios from 'axios';

// 1. Spring Boot API Gateway (Port 8080)
export const springApi = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

springApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwt_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 2. Python FastAPI Worker (Port 8000)
export const pythonApi = axios.create({
    baseURL: import.meta.env.VITE_PYTHON_API_URL || 'http://localhost:8000',
});