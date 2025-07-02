// app/(app)/layout.tsx
"use client";

import React, { useState } from 'react';
import Sidebar from '@/components/common/sidebar'; // Using @/ alias
import Header from '@/components/common/header';   // Using @/ alias
import Footer from '@/components/common/footer';   // Using @/ alias

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className="min-h-screen flex bg-gray-100 relative">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-40">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => toggleSidebar()}
          collapsed={isSidebarCollapsed}
          onCollapse={toggleSidebarCollapse}
        />
      </div>

      {/* Main Content Area */}
      <div 
          className="flex flex-col flex-1 min-h-screen w-full transition-all duration-200" 
          style={{ 
            paddingLeft: isSidebarCollapsed ? '5rem' : '16rem',
    width: '100%'
          }}
        >        {/* Header */}
        <div className="sticky top-0 z-30 bg-white dark:bg-gray-900 shadow-sm">
          <Header
            
          />
        </div>

        {/* Main Content */}
        <main className="flex-grow p-4 lg:p-6 relative z-10">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>

        {/* Footer */}
        <div className="relative z-20">
          <Footer />
        </div>
      </div>
    </div>
  );
}