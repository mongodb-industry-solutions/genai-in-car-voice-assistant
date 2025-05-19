"use client";

import dynamic from "next/dynamic";
import { createElement } from "react";

// Helper function to check if PowerSync is configured
const isPowerSyncEnabled = () => {
  const powersyncUrl =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_POWERSYNC_URL
      : undefined;
  const backendBaseUrl =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_BACKEND_BASE_URL
      : undefined;
  return powersyncUrl && backendBaseUrl;
};

/**
 * Only use PowerSync in client side rendering if it's configured
 */
export const DynamicSystemProvider = ({ children }) => {
  // If PowerSync is not enabled, return children directly without the provider
  if (!isPowerSyncEnabled()) {
    console.warn(
      "PowerSync is disabled: Missing environment variables. App will run without PowerSync."
    );
    return children;
  }

  // Only load the SystemProvider dynamically if PowerSync is enabled
  const SystemProviderComponent = dynamic(() => import("./SystemProvider"), {
    ssr: false,
  });

  return createElement(SystemProviderComponent, null, children);
};
