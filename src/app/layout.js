import "./globals.css";
import ThemeProvider from "./ThemeProvider";
import { VehicleProvider } from "@/context/VehicleContext";

export const metadata = {
  title: "GenAI-Powered In-Car Voice Assistant",
  description: "An automotive demo by MongoDB Industry Solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <VehicleProvider>{children}</VehicleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
