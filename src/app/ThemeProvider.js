"use client";

import { useState } from "react";
import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";

export default function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(true);

  return (
    <LeafyGreenProvider darkMode={darkMode}>{children}</LeafyGreenProvider>
  );
}
