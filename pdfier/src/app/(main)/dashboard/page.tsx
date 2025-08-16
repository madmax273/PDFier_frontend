'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePlus, MessageSquare, Minimize2, ArrowRightLeft, FileText, Lock } from 'lucide-react';
import Cookies from 'js-cookie';

interface Document {
  id: string;
  name: string;
  displayName?: string;
  url: string;
  createdAt: string;
}

// This component will automatically be rendered inside app/(app)/layout.tsx
export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const accessToken = Cookies.get('accessToken');
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/documents/list-user-files`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }

        const data = await response.json();
        // Process and sort documents
        const processedDocs = data.files
          .map((doc: Document) => ({
            ...doc,
            // Remove timestamp prefix from name
            displayName: doc.name.replace(/^chat_\d+_/, '')
          }))
          // Sort by creation date (newest first)
          .sort((a: Document, b: Document) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 3);

        setDocuments(processedDocs);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load recent documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        // Try to extract timestamp from filename if the format is chat_TIMESTAMP_filename.pdf
        const timestampMatch = dateString.match(/^chat_(\d+)_/);
        if (timestampMatch && timestampMatch[1]) {
          const timestamp = parseInt(timestampMatch[1]);
          if (!isNaN(timestamp)) {
            return new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            }).format(new Date(timestamp));
          }
        }
        return 'Unknown date';
      }
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(date);
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Unknown date';
    }
  };

  const getGoogleDocsUrl = (pdfUrl: string) => {
    return `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
  };
  return (
    <> {/* Fragment because this content is wrapped by the layout */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Welcome To PDFier! 👋</h1>

      {/* AI Assistant Call-to-action */}
      <section className=" bg-white p-6 rounded-xl shadow-sm mb-8 flex justify-between">
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold mb-2">Unlock Insights with AI Chat!</h2>
          <p className="text-gray-600">Ask anything about your PDFs and get instant, intelligent answers.</p>
        </div>
        <div className="flex justify-end">
          <Link href="/chat-ai" className="bg-[#A294F9] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#471396] transition-colors duration-200 flex items-center space-x-2">
            <MessageSquare size={20} />
            <span>Chat with a PDF now</span>
          </Link>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quick Action Card 1 */}
          <Link href="/tools/protect" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-app-purple-200 transition-all duration-200 flex flex-col items-center text-center">
            <Lock size={36} className="text-[#471396] mb-3" />
            <h3 className="text-lg font-medium text-gray-800">Protect PDF</h3>
            <p className="text-sm text-gray-500 mt-1">Add protection to your PDFs.</p>
          </Link>

          {/* Quick Action Card 2 */}
          <Link href="/tools/merge" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-app-purple-200 transition-all duration-200 flex flex-col items-center text-center">
            <ArrowRightLeft size={36} className="text-[#471396] mb-3" />
            <h3 className="text-lg font-medium text-gray-800">Merge PDFs</h3>
            <p className="text-sm text-gray-500 mt-1">Combine multiple documents.</p>
          </Link>

          {/* Quick Action Card 3 */}
          <Link href="/tools/compress" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-app-purple-200 transition-all duration-200 flex flex-col items-center text-center">
            <Minimize2 size={36} className="text-[#471396] mb-3" />
            <h3 className="text-lg font-medium text-gray-800">Compress PDF</h3>
            <p className="text-sm text-gray-500 mt-1">Reduce file size without quality loss.</p>
          </Link>

          {/* Quick Action Card 4 (Placeholder for another common action) */}
          <Link href="/documents" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:border-app-purple-200 transition-all duration-200 flex flex-col items-center text-center">
            <FileText size={36} className="text-[#471396] mb-3" />
            <h3 className="text-lg font-medium text-gray-800">My Documents</h3>
            <p className="text-sm text-gray-500 mt-1">Access your saved PDFs.</p>
          </Link>
        </div>
      </section>

      {/* Recent Documents Section */}
      {Cookies.get('accessToken') ? (
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">Recent Documents</h2>
            <Link href="/documents" className="text-sm text-[#471396] hover:underline">
              View all
            </Link>
          </div>
         
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">{error}</div>
            ) : documents.length > 0 ? (
              <ul className="space-y-4">
                {documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <FileText size={20} className="text-[#471396] flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-700 truncate max-w-md">{doc.displayName || doc.name}</p>
                      </div>
                    </div>
                    <a 
                      href={getGoogleDocsUrl(doc.url)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#471396] hover:underline text-sm px-3 py-1.5 rounded hover:bg-gray-50"
                    >
                      View
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <FileText size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No recent documents</p>
                <Link 
                  href="/tools" 
                  className="mt-2 inline-block text-[#471396] hover:underline"
                >
                  Upload your first document
                </Link>
              </div>
            )}
           
            {documents.length > 0 && (
              <div className="mt-4 text-right">
                <Link href="/documents" className="text-[#471396] hover:underline font-medium">
                  View All Documents &rarr;
                </Link>
              </div>
            )}
          </div>
        </section>
      ) : (
        <div className="text-center py-8">
          <FileText size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">You must <a href="/login">login</a> to view your documents.</p>
        </div>
      )}
    </>
  );
}