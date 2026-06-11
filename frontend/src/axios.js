import axios from 'axios';

// Create a unified instance used across the entire application
const apiClient = axios.create({
  // Use http://localhost:5000 to match your node server port consistently
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000', 
  withCredentials: true
});

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 421: Refresh Token Logic
    if (error.response && error.response.status === 421 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // FIX: Point this to your backend server port (5000), not your frontend react app (3000)
        // Also ensure withCredentials is true here so the browser sends the refreshToken cookie
        await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`, // or whatever your refresh route is
          {},
          { withCredentials: true }
        );
        
        // Retry the original request using the same configured instance
        return apiClient(originalRequest);
      } catch (refreshError) {
        localStorage.clear(); // Wipe out user traces
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle 422: Redirect to Login
    if (error.response && error.response.status === 422) {
      localStorage.clear();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default apiClient;