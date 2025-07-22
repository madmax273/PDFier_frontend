"use client";

import { useState } from 'react';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<'collections' | 'Conversations'>('collections');
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Mock data - replace with actual data from your API
  const collections = [
    { id: '1', name: 'Professor', count: 7 },
    { id: '2', name: 'Research Papers', count: 12 },
    { id: '3', name: 'Study Materials', count: 5 },
  ];

  const pdfs = selectedCollection ? [
    { id: 'pdf1', name: 'Advanced Mathematics.pdf' },
    { id: 'pdf2', name: 'Computer Science Basics.pdf' },
  ] : [];

  return (
    <div className={cn("flex h-screen bg-gray-50", inter.className)}>
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('collections')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                activeTab === 'collections' 
                  ? 'bg-white shadow-sm text-[#471396]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Collections
            </button>
            <button
              onClick={() => setActiveTab('Conversations')}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                activeTab === 'Conversations' 
                  ? 'bg-white shadow-sm text-[#471396]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Conversations
            </button>
          </div>
          
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="Search collections..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#471396] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {activeTab === 'collections' && (
            <div>
              {collections.map((collection) => (
                <div key={collection.id} className="mb-2">
                  <button
                    onClick={() => setSelectedCollection(collection.id === selectedCollection ? null : collection.id)}
                    className="w-full flex items-center justify-between p-2 text-left text-sm font-medium text-gray-900 hover:bg-gray-100 rounded-md"
                  >
                    <span>{collection.name} ({collection.count})</span>
                    <svg
                      className={`h-4 w-4 transform transition-transform ${
                        selectedCollection === collection.id ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  
                  {selectedCollection === collection.id && (
                    <div className="ml-4 mt-1 space-y-1">
                      {pdfs.map((pdf) => (
                        <button
                          key={pdf.id}
                          className="w-full text-left p-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md flex items-center"
                        >
                          <svg
                            className="h-4 w-4 mr-2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                            />
                          </svg>
                          {pdf.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full bg-[#471396] hover:bg-[#3a0f7a] text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
            Upload New PDFs
          </button>
          <p className="mt-2 text-xs text-center text-gray-500">
            <button className="text-[#471396] hover:underline">Sign up</button> / <button className="text-[#471396] hover:underline">Create your own collections</button>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}