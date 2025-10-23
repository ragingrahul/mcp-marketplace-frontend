"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/lib/api-config";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Immediately redirect to login
    router.push("/login");

    // Perform health check in parallel (background)
    const performHealthCheck = async () => {
      try {
        console.log("🔍 Performing backend health check...");
        const startTime = Date.now();

        const response = await fetch(API_ENDPOINTS.health, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        if (response.ok) {
          const data = await response.json();
          console.log("✅ Backend health check successful:", {
            status: data.status,
            responseTime: `${responseTime}ms`,
            data,
          });
        } else {
          console.warn(
            "⚠️ Backend health check returned non-OK status:",
            response.status
          );
        }
      } catch (error) {
        console.error("❌ Backend health check failed:", error);
        console.error("Backend may be offline or unreachable");
      }
    };

    // Run health check in background without blocking redirect
    performHealthCheck();
  }, [router]);

  return null;
}
