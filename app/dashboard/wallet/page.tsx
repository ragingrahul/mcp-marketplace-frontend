"use client";

import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { WalletService, UserBalance } from "@/services/walletService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  AlertCircle,
  Check,
  DollarSign,
} from "lucide-react";
import {
  useAccount,
  useSendTransaction,
  useWaitForTransactionReceipt,
} from "wagmi";
import { parseEther } from "viem";

export default function WalletPage() {
  const { accessToken } = useAuth();
  const { address: connectedWalletAddress } = useAccount();

  // Wallet state
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [depositAmount, setDepositAmount] = useState("");
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);
  const [platformWalletAddress, setPlatformWalletAddress] =
    useState<string>("");

  // Blockchain transaction hooks
  const {
    data: txHash,
    sendTransaction,
    isPending: isSendingTx,
    error: txError,
  } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isTxConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
    });

  // Fetch wallet balance and platform wallet address
  useEffect(() => {
    const fetchBalance = async () => {
      if (!accessToken) return;

      try {
        setIsLoadingBalance(true);
        setWalletError(null);
        const response = await WalletService.getBalance(accessToken);

        if (response.success && response.balance) {
          setBalance(response.balance);
          if (response.platformWalletAddress) {
            setPlatformWalletAddress(response.platformWalletAddress);
          }
        }
      } catch (err: any) {
        setWalletError(err.message || "Error fetching balance");
        console.error("Error fetching balance:", err);
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [accessToken]);

  const handleDeposit = async () => {
    if (!connectedWalletAddress) {
      setWalletError("Please connect your MetaMask wallet first.");
      return;
    }
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setWalletError("Please enter a valid amount to deposit.");
      return;
    }
    if (!platformWalletAddress) {
      setWalletError(
        "Platform wallet address not available. Please try again."
      );
      return;
    }

    try {
      setWalletError(null);
      setDepositSuccess(false);

      // Send blockchain transaction
      sendTransaction({
        to: platformWalletAddress as `0x${string}`,
        value: parseEther(depositAmount),
      });
    } catch (err: any) {
      setWalletError(err.message || "Error initiating transaction");
      console.error("Error initiating transaction:", err);
    }
  };

  // Handle transaction confirmation and credit deposit
  useEffect(() => {
    const creditAfterConfirmation = async () => {
      if (!isTxConfirmed || !txHash || !depositAmount || !accessToken) return;

      try {
        setIsDepositing(true);
        const response = await WalletService.creditDeposit(
          accessToken,
          depositAmount,
          txHash
        );

        if (response.success) {
          setDepositSuccess(true);
          setDepositAmount("");
          // Update balance from response
          if (response.balance) {
            setBalance(response.balance);
          }
          setTimeout(() => setDepositSuccess(false), 5000);
        } else {
          setWalletError(response.message || "Failed to credit deposit");
        }
      } catch (err: any) {
        setWalletError(err.message || "Error crediting deposit");
        console.error("Error crediting deposit:", err);
      } finally {
        setIsDepositing(false);
      }
    };

    creditAfterConfirmation();
  }, [isTxConfirmed, txHash, depositAmount, accessToken]);

  // Handle transaction errors
  useEffect(() => {
    if (txError) {
      setWalletError(txError.message || "Transaction failed");
    }
  }, [txError]);

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <div>
                <h1 className="text-xl font-semibold">My Wallet</h1>
                <p className="text-xs text-muted-foreground">
                  Manage your funds and deposits
                </p>
              </div>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-4 p-4">
            {/* Error/Success Messages */}
            {walletError && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-destructive mt-0.5" />
                <p className="text-sm text-destructive">{walletError}</p>
              </div>
            )}

            {depositSuccess && (
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2">
                <Check className="h-4 w-4 text-green-600 mt-0.5" />
                <p className="text-sm text-green-900 dark:text-green-100">
                  Deposit successful! Your balance has been updated.
                </p>
              </div>
            )}

            {/* Balance Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Available Balance */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Available Balance
                  </CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  {isLoadingBalance ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {balance?.balance_eth || "0"} ETH
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your current balance
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Total Deposited */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Deposited
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingBalance ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {balance?.total_deposited_eth || "0"} ETH
                      </div>
                      <p className="text-xs text-muted-foreground">
                        All-time deposits
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Total Spent */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Spent
                  </CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  {isLoadingBalance ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl font-bold">
                        {balance?.total_spent_eth || "0"} ETH
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Spent on MCP tools
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Deposit Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownToLine className="h-5 w-5" />
                  Deposit Funds
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (ETH)</label>
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    disabled={isSendingTx || isConfirming || isDepositing}
                  />
                </div>

                <Button
                  onClick={handleDeposit}
                  disabled={
                    !depositAmount ||
                    isSendingTx ||
                    isConfirming ||
                    isDepositing ||
                    parseFloat(depositAmount) <= 0 ||
                    !connectedWalletAddress
                  }
                  className="w-full"
                >
                  {isSendingTx ? (
                    <>Sending Transaction...</>
                  ) : isConfirming ? (
                    <>Confirming...</>
                  ) : isDepositing ? (
                    <>Crediting Balance...</>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Deposit ETH
                    </>
                  )}
                </Button>

                {!connectedWalletAddress && (
                  <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      ⚠️ Please connect your MetaMask wallet using the button at
                      the bottom of the sidebar to deposit funds.
                    </p>
                  </div>
                )}

                {txHash && (
                  <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      Transaction submitted!{" "}
                      <a
                        href={`https://sepolia.basescan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium"
                      >
                        View on BaseScan
                      </a>
                    </p>
                  </div>
                )}

                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <h4 className="font-medium text-sm">How it works:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Enter the amount of ETH you want to deposit</li>
                    <li>Click "Deposit ETH" to initiate the transaction</li>
                    <li>Approve the transaction in MetaMask</li>
                    <li>Wait for blockchain confirmation</li>
                    <li>Your balance will be automatically updated</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
