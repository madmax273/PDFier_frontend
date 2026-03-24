// app/(app)/layout.tsx
"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/common/sidebar'; // Using @/ alias
import Header from '@/components/common/header';   // Using @/ alias
import Footer from '@/components/common/footer';   // Using @/ alias
import { useAuthStore } from '@/store/AuthStore';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isInitializing } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isSidebarCollapsed } = useAuthStore();

  const toggleSidebarCollapse = () => {
    useAuthStore.setState({ isSidebarCollapsed: !isSidebarCollapsed });
  };

  return (
    isInitializing ? (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    ) : (
      <div className="min-h-screen flex bg-background text-foreground relative overflow-hidden">
        {/* Background Decorative Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl -z-10 pointer-events-none -translate-x-1/3 translate-y-1/3" />

        <Sidebar
          isOpen={isSidebarOpen}
          collapsed={isSidebarCollapsed}
          onCollapse={toggleSidebarCollapse}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <div 
          className={`flex flex-col flex-1 min-h-screen w-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
            isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
          }`} 
        >
          {/* Header */}
          <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm transition-colors duration-200">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
          </div>

          {/* Main Content */}
          <main className="flex-grow p-4 lg:p-8 relative z-10 w-full">
            <div className="max-w-[1400px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              {children}
            </div>
          </main>

          {/* Footer */}
          <div className="mt-auto border-t border-border/50 bg-background/50 backdrop-blur-sm">
            <Footer />
          </div>
        </div>
      </div>
    )
  );
}
