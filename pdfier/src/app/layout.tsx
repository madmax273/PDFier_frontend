import type { Metadata } from "next";
import "./globals.css";
import ClientAuthInitializer from "@/components/auth/clientAuthInitializer";

export const metadata: Metadata = {
  title: "PDFier",
  description: "PDFier - Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
      >
        <ClientAuthInitializer />
        {children}
      </body>
    </html>
  );
}
