import "./globals.css";
import ThemeProvider from "./ThemeProvider";
import { DynamicSystemProvider } from "@/components/providers/DynamicSystemProvider";
import { VehicleProvider } from "@/context/VehicleContext";
import { ChatSessionProvider } from "@/context/ChatSessionContext";
import { VideoProvider } from "@/context/VideoProvider";

export const metadata = {
  title: "GenAI-Powered In-Car Voice Assistant",
  description: "An automotive demo by MongoDB Industry Solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <DynamicSystemProvider>
          <ThemeProvider>
            <VehicleProvider>
              <VideoProvider>
                <ChatSessionProvider>{children}</ChatSessionProvider>{" "}
              </VideoProvider>
            </VehicleProvider>
          </ThemeProvider>
        </DynamicSystemProvider>
      </body>
    </html>
  );
}
