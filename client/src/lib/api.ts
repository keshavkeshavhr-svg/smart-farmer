import axios, { AxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor — unwraps .data so callers get the payload directly
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorData = error.response?.data?.error;
    if (errorData) {
      if (errorData.code === 'UNAUTHORIZED' && window.location.pathname !== '/login') {
        // Optional: Trigger logout flow or redirect
      }
      return Promise.reject(errorData);
    }
    return Promise.reject({
      code: 'NETWORK_ERROR',
      message: 'Failed to connect to the server',
    });
  }
);

/**
 * Typed wrapper around the axios instance.
 * Since our response interceptor unwraps `.data`, every method
 * returns `Promise<T>` instead of `Promise<AxiosResponse<T>>`.
 */
export const api = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.get(url, config) as unknown as Promise<T>,

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.post(url, data, config) as unknown as Promise<T>,

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.put(url, data, config) as unknown as Promise<T>,

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.patch(url, data, config) as unknown as Promise<T>,

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    axiosInstance.delete(url, config) as unknown as Promise<T>,
};
