import axios from 'axios';

// This is the specific export the AuthGateway is looking for!
export const springApi = axios.create({
    // 8080 is your Spring Boot API Gateway port
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

// This automatically attaches your JWT token to future requests once you log in
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

// We keep a default export just in case any of your older pages are still using `import api from './api'`
export default springApi;