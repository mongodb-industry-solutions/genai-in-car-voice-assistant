"use client";

import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";

export default function ThemeProvider({ children }) {
  const darkMode = true;

  return (
    <LeafyGreenProvider darkMode={darkMode} baseFontSize={16}>
      {children}
    </LeafyGreenProvider>
  );
}
