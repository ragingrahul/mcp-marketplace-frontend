/**
 * Wallet Service
 * Handles wallet balance and payment-related API calls
 */

import { API_ENDPOINTS, HTTP_CONFIG } from "@/lib/api-config";

export interface UserBalance {
  balance_eth: string;
  total_deposited_eth: string;
  total_spent_eth: string;
}

export interface BalanceResponse {
  success: boolean;
  balance_eth: string;
  total_deposited_eth: string;
  total_spent_eth: string;
  platform_wallet_address?: string;
}

export interface DepositResponse {
  success: boolean;
  message: string;
  balance?: UserBalance;
}

/**
 * Custom error class for API errors
 */
export class ApiWalletError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiWalletError";
  }
}

/**
 * Wallet Service
 * Provides methods for wallet-related API operations
 */
export class WalletService {
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
        throw new ApiWalletError(
          data.message || "Request failed",
          response.status,
          data
        );
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiWalletError) {
        throw error;
      }

      // Network or parsing error
      throw new ApiWalletError(
        error instanceof Error ? error.message : "Network error occurred"
      );
    }
  }

  /**
   * Get user's wallet balance
   * @param accessToken - Current access token
   * @returns User balance information
   */
  static async getBalance(
    accessToken: string
  ): Promise<{
    success: boolean;
    balance: UserBalance;
    platformWalletAddress?: string;
  }> {
    const response = await this.makeRequest<BalanceResponse>(
      API_ENDPOINTS.payment.balance,
      accessToken,
      {
        method: "GET",
      }
    );

    // Transform response to match expected format
    return {
      success: response.success,
      balance: {
        balance_eth: response.balance_eth,
        total_deposited_eth: response.total_deposited_eth,
        total_spent_eth: response.total_spent_eth,
      },
      platformWalletAddress: response.platform_wallet_address,
    };
  }

  /**
   * Deposit funds to user's wallet (manual, for testing)
   * @param accessToken - Current access token
   * @param amountEth - Amount to deposit in ETH
   * @returns Deposit transaction information
   */
  static async depositFunds(
    accessToken: string,
    amountEth: string
  ): Promise<DepositResponse> {
    return this.makeRequest<DepositResponse>(
      API_ENDPOINTS.payment.deposit,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({ amount_eth: amountEth }),
      }
    );
  }

  /**
   * Credit deposit after blockchain transaction
   * @param accessToken - Current access token
   * @param amountEth - Amount deposited in ETH
   * @param txHash - Blockchain transaction hash
   * @returns Updated balance information
   */
  static async creditDeposit(
    accessToken: string,
    amountEth: string,
    txHash: string
  ): Promise<DepositResponse> {
    return this.makeRequest<DepositResponse>(
      `${API_ENDPOINTS.payment.deposit.replace("/manual", "/credit")}`,
      accessToken,
      {
        method: "POST",
        body: JSON.stringify({ amount_eth: amountEth, tx_hash: txHash }),
      }
    );
  }
}
