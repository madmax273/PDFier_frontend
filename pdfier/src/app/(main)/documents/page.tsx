'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Cookies from 'js-cookie';
interface Document {
  name: string;
  id: string;
  url: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
        const accessToken = Cookies.get('accessToken');
        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;
      try {
        const response = await fetch(`${BACKEND_URL}/api/v1/documents/list-user-files`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch documents');
        }
        const data = await response.json();
        setDocuments(data.files || []);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const formatFileName = (name: string) => {
    // Remove the 'chat_timestamp_' prefix and file extension
    return name
      .replace(/^chat_\d+_/, '')
      .replace(/\.pdf$/i, '')
      .replace(/_/g, ' ');
  };

  const formatDate = (timestamp: string) => {
    // Extract timestamp from filename (format: chat_TIMESTAMP_name.pdf)
    const match = timestamp.match(/^chat_(\d+)_/);
    if (!match) return 'Unknown date';
    
    const date = new Date(parseInt(match[1]));
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">Loading your documents...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Error loading documents</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <div className="mt-6">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-[#471396] hover:bg-[#3a0f77]"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#2d0f57]">Your Documents</h1>
        <Button asChild className="bg-[#471396] hover:bg-[#3a0f77]">
          <Link href="/tools">Upload New</Link>
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">Upload a document to get started</p>
          <div className="mt-6">
            <Button asChild className="bg-[#471396] hover:bg-[#3a0f77]">
              <Link href="/tools">Upload Document</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow border border-gray-200">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-[#f0e9ff]">
                    <FileText className="h-6 w-6 text-[#471396]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg text-[#2d0f57] truncate">
                      {formatFileName(doc.name)}
                    </CardTitle>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(doc.name)}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 truncate pr-2">
                    {doc.name.length > 30 ? `${doc.name.substring(0, 30)}...` : doc.name}
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link 
                        href={`/viewer/${doc.id}`} 
                        className="text-[#471396] hover:bg-[#f0e9ff]"
                      >
                        View
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a 
                        href={doc.url} 
                        download
                        className="text-[#471396] hover:bg-[#f0e9ff]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <FileDown className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
