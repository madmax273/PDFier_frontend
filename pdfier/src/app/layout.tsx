import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientAuthInitializer from "@/components/auth/clientAuthInitializer";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDFier - Smart Document AI",
  description: "Next-generation PDF processing and AI chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased selection:bg-purple-300 selection:text-purple-900`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientAuthInitializer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
