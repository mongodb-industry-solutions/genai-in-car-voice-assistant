import "./globals.css";
import ThemeProvider from "./ThemeProvider";
import { VehicleProvider } from "@/context/VehicleContext";
import { ChatSessionProvider } from "@/context/ChatSessionContext";

export const metadata = {
  title: "GenAI-Powered In-Car Voice Assistant",
  description: "An automotive demo by MongoDB Industry Solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <VehicleProvider>
            <ChatSessionProvider>{children}</ChatSessionProvider>
          </VehicleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
