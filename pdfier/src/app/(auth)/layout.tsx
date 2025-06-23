import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDFier - Create your account",
  description: "Create your PDFier account to get started",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
