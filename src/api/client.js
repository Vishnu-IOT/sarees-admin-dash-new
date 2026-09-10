import axios from 'axios';

// Points at the sarees-ecommerce-api backend. Configure in .env as
// VITE_API_BASE_URL (see .env.example). Falls back to localhost:5002
// for local development against the backend in this repo.
const baseURL = import.meta.env.VITE_API_BASE_URL || 'https://mediumorchid-rhinoceros-818505.hostingersite.com';

const client = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach auth token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Let the browser set the multipart boundary itself for FormData uploads.
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }
  return config;
});

// Normalizes backend error shape ({ message, error }) into a single
// readable string so every page can show it the same way.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      `[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} => Status:`,
      error.response?.status,
      'Payload:',
      error.response?.data
    );
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('admin_data');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    const data = error?.response?.data;
    const message = data?.message || data?.error || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default client;
