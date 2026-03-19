import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDFier - Welcome",
  description: "Create your PDFier account or log in to get started",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2" />

      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 glass-panel p-8 sm:p-10 rounded-3xl border border-border/50 shadow-2xl">
        {children}
      </div>
    </div>
  );
}
