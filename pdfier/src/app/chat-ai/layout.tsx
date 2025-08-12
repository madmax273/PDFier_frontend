"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function ChatAiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-gray-50 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-gradient-to-r from-[#471396] to-[#5e1bbf] backdrop-blur-md shadow-md">
        <div className="w-full px-6 py-4 flex items-center">
          <button 
            onClick={() => router.back()}
            className="mr-4 p-1.5 rounded-full hover:bg-white/10 transition-all duration-200"
            aria-label="Go back"
            title="Go back"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-white" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
          </button>
          <div className="border-l border-white/30 h-6 mx-3"></div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-wide">
            PDFier AI 🤖
          </h1>
        </div>
      </header>
      {children}
    </div>
  );
}