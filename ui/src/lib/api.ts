import axios from "axios";
import { toast } from "sonner";

// Create axios instance with base URL
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(error);
    }

    // Handle 403 Forbidden errors
    if (error.response?.status === 403) {
      toast.error("You don't have permission to perform this action");
      return Promise.reject(error);
    }

    // Handle 404 Not Found errors
    if (error.response?.status === 404) {
      toast.error("The requested resource was not found");
      return Promise.reject(error);
    }

    // Handle validation errors
    if (error.response?.status === 400) {
      const message = error.response.data.message || "Invalid request data";
      toast.error(message);
      return Promise.reject(error);
    }

    // Handle server errors
    if (error.response?.status >= 500) {
      toast.error("An unexpected error occurred. Please try again later");
      return Promise.reject(error);
    }

    // Handle other errors
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  signup: (data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
  }) => api.post("/auth/signup", data),
  getCurrentUser: () => api.get("/users/me"),
};

// User API
export const userApi = {
  getUsers: () => api.get("/users"),
  getUserById: (id: number) => api.get(`/users/${id}`),
  getUserAccounts: (userId: number) => api.get(`/users/${userId}/accounts`),
  getUserAccount: (userId: number, accountId: number) =>
    api.get(`/users/${userId}/accounts/${accountId}`),
  getUserTransactions: (userId: number, accountId: number) =>
    api.get(`/users/${userId}/accounts/${accountId}/transactions`),
  createTransaction: (
    userId: number,
    accountId: number,
    data: { type: string; amount: number; description: string }
  ) => api.post(`/users/${userId}/accounts/${accountId}/transactions`, data),
};

// Account API
export const accountApi = {
  getAccounts: () => api.get("/users/me/accounts"),
  getAccountById: (id: number) => api.get(`/users/me/accounts/${id}`),
  createAccount: (data: { accountType: string }) =>
    api.post("/users/me/accounts", data),
  getAccountTransactions: (accountId: number) =>
    api.get(`/users/me/accounts/${accountId}/transactions`),
  createAccountTransaction: (
    accountId: number,
    data: { type: string; amount: number; description: string }
  ) => api.post(`/users/me/accounts/${accountId}/transactions`, data),
};

// Offer API
export const offerApi = {
  getOffers: () => api.get("/offers"),
  createOffer: (data: {
    description: string;
    type: string;
    validFrom: string;
    validTill: string;
  }) => api.post("/offers", data),
  deleteOffer: (id: number) => api.delete(`/offers/${id}`),
  assignOffer: (offerId: number, userId: number) =>
    api.post(`/offers/${offerId}/users/${userId}`),
  removeOffer: (offerId: number, userId: number) =>
    api.delete(`/offers/${offerId}/users/${userId}`),
};

export default api;
