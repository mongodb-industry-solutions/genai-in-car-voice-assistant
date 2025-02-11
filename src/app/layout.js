import "./globals.css";
import ThemeProvider from "./ThemeProvider";

export const metadata = {
  title: "GenAI-Powered In-Car Voice Assistant",
  description: "An automotive demo by MongoDB Industry Solutions",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
