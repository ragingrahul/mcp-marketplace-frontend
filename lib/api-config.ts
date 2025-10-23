/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

/**
 * Get the API base URL from environment or default
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  auth: {
    signup: `${API_BASE_URL}/api/auth/signup`,
    login: `${API_BASE_URL}/api/auth/login`,
    logout: `${API_BASE_URL}/api/auth/logout`,
    profile: `${API_BASE_URL}/api/auth/profile`,
    refresh: `${API_BASE_URL}/api/auth/refresh`,
  },
  endpoints: {
    base: `${API_BASE_URL}/api/endpoints`,
    byId: (id: string) => `${API_BASE_URL}/api/endpoints/${id}`,
  },
  payment: {
    balance: `${API_BASE_URL}/api/balance`,
    deposit: `${API_BASE_URL}/api/deposit/manual`,
  },
} as const;

/**
 * HTTP client configuration
 */
export const HTTP_CONFIG = {
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
} as const;
