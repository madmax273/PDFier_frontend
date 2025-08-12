"use client";
import { useEffect, useState, useCallback } from 'react';
// Removed next/navigation as it's not supported in this environment
// import { useSearchParams } from 'next/navigation'; 
import { Download, Loader2, ArrowLeft, FileText } from 'lucide-react'; // Corrected lucide-react imports

interface DownloadItem {
    url: string;
    fileName: string;
}

export default function ProtectDownloadPage() {
    // Replaced useSearchParams with a custom hook/logic to parse query parameters
    const getSearchParams = useCallback(() => {
        const params = new URLSearchParams(window.location.search);
        const urls = Array.from(params.getAll('url') as string[]).filter((url) => typeof url === 'string');
        return urls;
    }, []);

    const [downloadItems, setDownloadItems] = useState<DownloadItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Removed fetchMetadata as it's no longer needed with the simplified DownloadItem interface
    // const fetchMetadata = useCallback(async (url: string) => { /* ... */ }, []);

    useEffect(() => {
        const urls = getSearchParams();
        console.log("URLS:", urls);
        if (urls && urls.length > 0) {
            // Simplified processing as metadata fetching is removed
            const processedItems: DownloadItem[] = [];
            for (let i = 0; i < urls.length; i++) {
                const decodedUrl = decodeURIComponent(urls[i]);
                const formattedUrl = decodedUrl.startsWith('http') 
                    ? decodedUrl 
                    : `https://${decodedUrl}`;
                processedItems.push({
                    url: formattedUrl,
                    fileName: `protected-document-${i + 1}.pdf`
                });
            }
            setDownloadItems(processedItems);
        } else {
            setError('No PDF URL(s) provided in query parameters.');
        }
        setIsLoading(false);
    }, [getSearchParams]); // Removed fetchMetadata from dependencies

    const downloadPdf = async (url: string, fileName: string) => {
        if (!url) {
            setError('No download URL provided');
            return;
        }
        
        try {
            // Open the URL in a new tab for download
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Fallback: If the direct download doesn't work, try opening in a new tab
            setTimeout(() => {
                if (!document.body.contains(link)) {
                    window.open(url, '_blank');
                }
            }, 1000);
            
        } catch (error) {
            console.error('Download error:', error);
            setError('Failed to download PDF. Please try right-clicking the download button and selecting "Save link as..."');
        }
    };

    // Removed handleFileNameChange as the input field for fileName is no longer present
    // const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => { /* ... */ };

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
                    <p className="text-sm mt-1">{error || 'No protected PDFs available'}</p>
                    <a // Changed Link to a tag
                        href="/tools/protect"
                        className="mt-4 inline-flex items-center text-sm text-[#471396] hover:underline"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Protect Tool
                    </a>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <script src="https://cdn.tailwindcss.com"></script>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <style>
                {`
                body {
                    font-family: 'Inter', sans-serif;
                }
                `}
            </style>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <a // Changed Link to a tag
                        href="/tools/protect"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-[#471396] rounded-md px-2 py-1 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Protect Tool
                    </a>
                    <h1 className="text-3xl font-bold text-gray-900 mt-2">Your Protected Document{downloadItems.length > 1 ? 's' : ''}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Changed to a grid for multiple items */}
                    {downloadItems.map((item, index) => (
                        <div key={index} className="flex flex-col items-center bg-white border border-gray-200 rounded-lg shadow-lg p-6 text-center">
                            <div className="flex items-center justify-center w-24 h-24 bg-purple-100 rounded-full mb-4">
                                <FileText className="h-12 w-12 text-[#471396]" />
                            </div>
                            <span className="text-lg font-medium text-gray-900 mb-4 truncate w-full px-2">{item.fileName}</span>
                            <button
                                onClick={() => downloadPdf(item.url, item.fileName)}
                                className="w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#471396] hover:bg-[#3a0f7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#471396] transition-all duration-200 ease-in-out transform hover:scale-105"
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Download
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
