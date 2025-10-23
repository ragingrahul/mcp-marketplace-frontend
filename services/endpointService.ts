/**
 * Endpoint Service
 * Handles all endpoint-related API calls
 */

import { API_ENDPOINTS, HTTP_CONFIG } from "@/lib/api-config";

export interface EndpointParameter {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
  description?: string;
  default_value?: string;
}

export interface Endpoint {
  id: string;
  name: string;
  description?: string;
  url: string;
  method: string;
  parameters?: EndpointParameter[];
  headers?: Record<string, string>;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_paid: boolean;
  requires_payment?: boolean; // Backend sends this
  price_per_call_eth: string | null;
  developer_wallet_address: string | null;
}

export interface Developer {
  id: string;
  email: string;
  full_name?: string;
  endpoints: Endpoint[];
  endpoint_count: number;
}

export interface MarketplaceResponse {
  success: boolean;
  developers: Developer[];
  total_developers: number;
  total_endpoints: number;
}

export interface EndpointsResponse {
  success: boolean;
  endpoints: Endpoint[];
  count: number;
}

/**
 * Custom error class for API errors
 */
export class ApiEndpointError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = "ApiEndpointError";
  }
}

/**
 * Endpoint Service
 * Provides methods for endpoint-related API operations
 */
export class EndpointService {
  /**
   * Make an authenticated API request
   */
  private static async makeRequest<T>(
    url: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...HTTP_CONFIG.headers,
          Authorization: `Bearer ${accessToken}`,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiEndpointError(
          data.message || "Request failed",
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiEndpointError) {
        throw error;
      }

      // Network or parsing error
      throw new ApiEndpointError(
        error instanceof Error ? error.message : "Network error occurred"
      );
    }
  }

  /**
   * Get all developers with their endpoints (marketplace)
   * @param accessToken - Current access token
   * @returns List of developers with endpoints
   */
  static async getMarketplaceDevelopers(
    accessToken: string
  ): Promise<MarketplaceResponse> {
    return this.makeRequest<MarketplaceResponse>(
      `${API_ENDPOINTS.endpoints.base}/marketplace`,
      accessToken,
      {
        method: "GET",
      }
    );
  }

  /**
   * Get user's own endpoints
   * @param accessToken - Current access token
   * @returns List of user's endpoints
   */
  static async getMyEndpoints(accessToken: string): Promise<EndpointsResponse> {
    return this.makeRequest<EndpointsResponse>(
      API_ENDPOINTS.endpoints.base,
      accessToken,
      {
        method: "GET",
      }
    );
  }

  /**
   * Create a new endpoint
   * @param accessToken - Current access token
   * @param endpoint - Endpoint data
   * @returns Created endpoint
   */
  static async createEndpoint(
    accessToken: string,
    endpoint: Partial<Endpoint>
  ): Promise<any> {
    return this.makeRequest(API_ENDPOINTS.endpoints.base, accessToken, {
      method: "POST",
      body: JSON.stringify(endpoint),
    });
  }

  /**
   * Update an endpoint
   * @param accessToken - Current access token
   * @param endpointId - Endpoint ID
   * @param updates - Endpoint updates
   * @returns Updated endpoint
   */
  static async updateEndpoint(
    accessToken: string,
    endpointId: string,
    updates: Partial<Endpoint>
  ): Promise<any> {
    return this.makeRequest(
      API_ENDPOINTS.endpoints.byId(endpointId),
      accessToken,
      {
        method: "PUT",
        body: JSON.stringify(updates),
      }
    );
  }

  /**
   * Delete an endpoint
   * @param accessToken - Current access token
   * @param endpointName - Endpoint name
   * @returns Success message
   */
  static async deleteEndpoint(
    accessToken: string,
    endpointName: string
  ): Promise<any> {
    return this.makeRequest(
      `${API_ENDPOINTS.endpoints.base}/${endpointName}`,
      accessToken,
      {
        method: "DELETE",
      }
    );
  }
}
