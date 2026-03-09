// src/services/api.js
import axios from 'axios';

// === Main Axios Instance ===
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  timeout: 30000, // 30 seconds global timeout
  headers: {
    'Accept': 'application/json',
    // IMPORTANT: Do NOT set 'Content-Type': 'application/json' globally
    // Axios automatically handles JSON and overrides for FormData/multipart
  },
});

// === Request Interceptor: Add Bearer Token ===
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Optional debug: log every request
    // console.log(`[API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);

    return config;
  },
  (error) => Promise.reject(error)
);

// === Response Interceptor: Handle 401 Unauthorized globally ===
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global 401 → logout + redirect
    if (error.response?.status === 401) {
      console.warn('[API] 401 Unauthorized detected → Logging out');
      localStorage.removeItem('token');
      window.location.href = '/login'; // Or use navigate('/login') if using react-router
    }

    // Optional: log errors for debugging
    // console.error('[API RESPONSE ERROR]', error.response?.data || error.message);

    return Promise.reject(error);
  }
);

// === Reusable File Upload Helper (perfect for resume, certificate, etc.) ===
export const uploadFile = async (endpoint, file, fieldName = 'file') => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  const formData = new FormData();
  formData.append(fieldName, file);

  try {
    const response = await api.post(endpoint, formData, {
      // Axios automatically sets correct 'Content-Type': 'multipart/form-data; boundary=...'
      // Do NOT set it manually — it will break the boundary
      timeout: 60000, // 60 seconds for larger files
    });

    return response.data;
  } catch (error) {
    // Friendly error message for frontend
    const errMsg =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'File upload failed';

    console.error(`Upload failed to ${endpoint}:`, errMsg);
    throw new Error(errMsg);
  }
};

// === Specialized upload helpers (optional - cleaner in components) ===
export const uploadResume = (file) => uploadFile('/resume/upload', file, 'resume');
export const uploadCertificate = (file) => uploadFile('/certificate/upload', file, 'certificate');

// === Export the main api instance ===
export default api;