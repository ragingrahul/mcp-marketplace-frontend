"use client";

/**
 * Wallet Connect Button Component
 * Allows users to connect MetaMask wallet
 */

import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Wallet, LogOut, AlertCircle } from "lucide-react";
import { baseSepolia } from "wagmi/chains";

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();

  const isCorrectChain = chainId === baseSepolia.id;

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Get the injected connector (MetaMask)
  const injectedConnector = connectors[0];

  const handleConnect = () => {
    if (injectedConnector) {
      connect({ connector: injectedConnector });
    }
  };

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isCorrectChain ? "outline" : "destructive"}
            size="lg"
            className="w-full gap-2"
          >
            <Wallet className="h-4 w-4" />
            {isCorrectChain ? formatAddress(address) : "Wrong Network"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="center" className="w-56">
          <DropdownMenuLabel>Wallet Connected</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="px-2 py-2 text-sm">
            <div className="font-medium">Address</div>
            <div className="text-muted-foreground text-xs truncate">
              {address}
            </div>
          </div>
          {!isCorrectChain && (
            <>
              <DropdownMenuSeparator />
              <div className="px-2 py-2 text-sm">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-xs">
                    Please switch to Base Sepolia network
                  </span>
                </div>
              </div>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full gap-2"
      onClick={handleConnect}
      disabled={isPending || !injectedConnector}
    >
      <Wallet className="h-4 w-4" />
      {isPending ? "Connecting..." : "Connect MetaMask"}
    </Button>
  );
}
