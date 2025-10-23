"use client";

import * as React from "react";
import Link from "next/link";
import { Code2, Command, Store, Wallet, DollarSign } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { WalletConnectButton } from "@/components/wallet-connect-button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  developers: [
    {
      title: "My Endpoints",
      url: "/dashboard/endpoints/manage",
      icon: Code2,
      isActive: true,
      items: [
        {
          title: "Create Endpoint",
          url: "/dashboard/endpoints/create",
        },
        {
          title: "Manage Endpoints",
          url: "/dashboard/endpoints/manage",
        },
      ],
    },
    {
      title: "Pricing",
      url: "/dashboard/pricing",
      icon: DollarSign,
      items: [
        {
          title: "Manage Pricing",
          url: "/dashboard/pricing",
        },
      ],
    },
  ],
  consumers: [
    {
      name: "Browse Marketplace",
      url: "/dashboard",
      icon: Store,
    },
    {
      name: "My Wallet",
      url: "/dashboard/wallet",
      icon: Wallet,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Toolforge</span>
                  <span className="truncate text-xs">MCP Marketplace</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.developers} />
        <NavProjects projects={data.consumers} />
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 pb-2">
          <WalletConnectButton />
        </div>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
