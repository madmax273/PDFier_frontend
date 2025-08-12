// src/app/(main)/tools/compress/download/page.tsx
"use client";
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Download, Loader2, ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';

interface DownloadItem {
    url: string;
    fileName: string;
    fileSize: string;
    totalPages: number;
}

export default function CompressDownloadPage() {
    const searchParams = useSearchParams();
    const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);

    const fetchMetadata = useCallback(async (url: string) => {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            const size = response.headers.get('content-length');
            
            if (size) {
                const sizeInKB = Math.ceil(parseInt(size, 10) / 1024);
                const estimatedPages = Math.ceil(sizeInKB / 50);
                
                return {
                    fileSize: `${sizeInKB.toLocaleString()} KB`,
                    totalPages: estimatedPages
                };
            }
            return { fileSize: '0 KB', totalPages: 1 };
        } catch (err) {
            console.error('Error fetching file metadata:', err);
            return { fileSize: '0 KB', totalPages: 1 };
        }
    }, []);

    useEffect(() => {
        const urls = searchParams.getAll('url');
        console.log("URLS:", urls);
        if (urls && urls.length > 0) {
            const processUrls = async () => {
                try {
                    const processedItems: DownloadItem[] = [];
                    for (let i = 0; i < urls.length; i++) {
                        const decodedUrl = decodeURIComponent(urls[i]);
                        const formattedUrl = decodedUrl.startsWith('http') 
                            ? decodedUrl 
                            : `https://${decodedUrl}`;
                        
                        const metadata = await fetchMetadata(formattedUrl);
                        processedItems.push({
                            url: formattedUrl,
                            fileName: `compressed-document-${i + 1}.pdf`,
                            fileSize: metadata.fileSize,
                            totalPages: metadata.totalPages
                        });
                    }
                    setDownloadItems(processedItems);
                } catch (err) {
                    setError('Invalid PDF URL(s) received.');
                    console.error('Error processing URL(s):', err);
                }
            };
            processUrls();
        } else {
            setError('No PDF URL(s) provided in query parameters.');
        }
        setIsLoading(false);
    }, [searchParams, fetchMetadata]);

    const downloadPdf = async (url: string, fileName: string) => {
        if (!url) return;
        
        try {
            const response = await fetch(url);
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

    const renderPageThumbnails = (totalPages: number) => {
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

    if (error || downloadItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
                    <p className="font-medium">Error Loading Document</p>
                    <p className="text-sm mt-1">{error || 'No compressed PDFs available'}</p>
                    <Link
                        href="/tools/compress"
                        className="mt-4 inline-flex items-center text-sm text-[#471396] hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Compress Tool
                    </Link>
                </div>
            </div>
        );
    }

    const selectedItem = downloadItems[selectedItemIndex];
    
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link
                        href="/tools/compress"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-[#471396]"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Compress Tool
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mt-2">Your Compressed Document{downloadItems.length > 1 ? 's' : ''}</h1>
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
                                    Page {currentPage} of {selectedItem.totalPages}
                                </span>
                            </div>
                            <div className="h-[70vh]">
                                {selectedItem.url ? (
                                    <iframe
                                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedItem.url)}&embedded=true&page=${currentPage}`}
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
                                {[...Array(selectedItem.totalPages).keys()].map((page) => (
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
                                {/* Document Selection */}
                                {downloadItems.length > 1 && (
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-3">Select Document</h3>
                                        <div className="space-y-2">
                                            {downloadItems.map((item, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => {
                                                        setSelectedItemIndex(index);
                                                        setCurrentPage(1);
                                                    }}
                                                    className={`w-full text-left p-2 rounded-md ${
                                                        selectedItemIndex === index
                                                            ? 'bg-purple-50 text-purple-600'
                                                            : 'hover:bg-gray-50'
                                                    }`}
                                                >
                                                    Document {index + 1}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
                                                value={selectedItem.fileName}
                                                onChange={(e) => {
                                                    const newItems = [...downloadItems];
                                                    newItems[selectedItemIndex] = {
                                                        ...selectedItem,
                                                        fileName: e.target.value
                                                    };
                                                    setDownloadItems(newItems);
                                                }}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-[#471396] focus:ring-[#471396] text-sm text-gray-700"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Pages</p>
                                                <p className="text-sm font-medium text-[#171717]">{selectedItem.totalPages}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Size</p>
                                                <p className="text-sm font-medium text-[#171717]">{selectedItem.fileSize}</p>
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
                                        {selectedItem.totalPages > 0 ? (
                                            renderPageThumbnails(selectedItem.totalPages)
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
                                        onClick={() => downloadPdf(selectedItem.url, selectedItem.fileName)}
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
