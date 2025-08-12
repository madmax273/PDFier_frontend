"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Download, Loader2, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

export default function DownloadMergedPDF() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState('merged_document.pdf');
  const [fileSize, setFileSize] = useState<string>('0 KB');
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const pdfParam = searchParams.get('url');
  
  
  const fetchMetadata = useCallback(async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      console.log("response",response);
      const size = response.headers.get('content-length');
      console.log("size",size);
  
      if (size) {
        const sizeInKB = Math.ceil(parseInt(size, 10) / 1024);
        setFileSize(`${sizeInKB.toLocaleString()} KB`);
  
        // Assuming 1 page = 50KB (adjust this as per actual file type/content)
        const estimatedPages = Math.ceil(sizeInKB / 50);
        setTotalPages(estimatedPages);
      }
    } catch (err) {
      console.error('Error fetching file metadata:', err);
    }
  }, [setFileSize, setTotalPages]);
  


  useEffect(() => {
    if (pdfParam ) {
      try {
        const decodedUrl = decodeURIComponent(pdfParam);
        
        setPdfUrl(decodedUrl);
        fetchMetadata(decodedUrl);
        
      } catch (err) {
        console.error('Error processing PDF URL:', err);
        setError('Invalid PDF URL');
      }
    } else {
      setError('No PDF URL provided');
    }
    setIsLoading(false);
  }, [pdfParam, setFileSize, totalPages, setTotalPages, setCurrentPage]);

  const handleDownload = async () => {
    if (!pdfUrl) return;
    
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      setError('Failed to download PDF. Please try again.');
    }
  };

  const renderPageThumbnails = () => {
    return Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
      <div 
        key={pageNum} 
        className={`border rounded p-1 hover:border-[#471396] cursor-pointer transition-colors ${
          currentPage === pageNum ? 'border-[#471396] bg-purple-50' : ''
        }`}
        onClick={() => setCurrentPage(pageNum)}
      >
        <div className="bg-gray-50 aspect-[1/1.4] flex flex-col items-center justify-center text-xs text-gray-500">
          <FileText className="h-6 w-6 mb-1 text-gray-400" />
          <span>Page {pageNum}</span>
        </div>
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#471396]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
          <p className="font-medium">Error Loading Document</p>
          <p className="text-sm mt-1">{error}</p>
          <Link
            href="/tools/merge"
            className="mt-4 inline-flex items-center text-sm text-[#471396] hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Merge Tool
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link
            href="/tools/merge"
            className="inline-flex items-center text-sm text-gray-600 hover:text-[#471396]"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Merge Tool
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Your Merged Document</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* PDF Preview */}
          <div className="w-full lg:w-3/4">
            <div className="bg-white border border-gray-200 rounded-t-lg overflow-hidden shadow-sm">
              <div className="p-3 bg-gray-800 border-b border-gray-800 flex justify-between items-center">
                <span className="text-sm font-medium text-white">
                  Document Preview
                </span>
                <span className="text-xs text-white">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="h-[70vh]">
                {pdfUrl ? (
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true&page=${currentPage}`}
                    className="w-full h-full border-0"
                    title="PDF Preview"
                    onError={(e) => {
                      console.error('Error loading PDF in iframe');
                      setError('Failed to load PDF preview');
                    }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No document available for preview
                  </div>
                )}
              </div>
            </div>
            <div className="border-t border-gray-200 p-3">
              <div className="space-x-2">
                {[...Array(totalPages).keys()].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page + 1)}
                    className={`px-2 py-1 rounded-md ${
                      currentPage === page + 1
                        ? 'bg-purple-50 text-purple-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {page + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Document Info Sidebar */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="space-y-6">
                {/* Document Info */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Document Info</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        File Name
                      </label>
                      <input
                        type="text"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#471396] focus:ring-[#471396] text-sm text-gray-700 dark:text-[#ededed]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-300">Pages</p>
                        <p className="text-sm font-medium text-[#171717] dark:text-[#ededed]">{totalPages}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-300">Size</p>
                        <p className="text-sm font-medium text-[#171717] dark:text-[#ededed]">{fileSize}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Page Thumbnails */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Page Thumbnails
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {totalPages > 0 ? (
                      renderPageThumbnails()
                    ) : (
                      <div className="col-span-2 text-center py-4 text-sm text-gray-500">
                        No pages available
                      </div>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center px-4 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#471396] hover:bg-[#3a0f75] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#471396] transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}