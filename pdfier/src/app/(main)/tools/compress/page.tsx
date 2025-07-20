// src/app/(main)/tools/compress/page.tsx
"use client";

import { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, X, CheckCircle, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/FileStore';
import { useAuthStore } from '@/store/AuthStore';
import Cookies from 'js-cookie';
import { Toast } from '@/components/ui/toast';
import { Home } from 'lucide-react';
import Link from 'next/link';


export default function CompressPDFPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [compressionLevel, setCompressionLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isCompressing, setIsCompressing] = useState(false);
  const { files, addFiles, removeFile, clearFiles } = useFileStore();
  const router = useRouter();
  const {user,updateGuestUsage,updateUserUsage} = useAuthStore();
  const [downloadUrl, setDownloadUrl] = useState<{ download_urls: string[] } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(file => 
      file.type === 'application/pdf'
    );
    addFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(file => 
        file.type === 'application/pdf'
      );
      addFiles(selectedFiles);
    }
  };

  const handleCompress = async () => {
    if (files.length === 0) return;

    if (!process.env.NEXT_PUBLIC_BACKEND_URL) {
      throw new Error('Backend URL is not configured. Please check your environment variables.');
    }

    if(user && user.plan_type === 'guest'){
      console.log('Current guest usage:', user.usage_metrics.pdf_processed_today);
      if(user.usage_metrics.pdf_processed_today >= user.usage_metrics.pdf_processed_limit_daily){
        alert(`You have exceeded the daily limit of ${user.usage_metrics.pdf_processed_limit_daily} PDF files to compress.`);
        return;
      } else {
        const newCount = user.usage_metrics.pdf_processed_today + 1;
        console.log('Updating to:', newCount);
        updateGuestUsage(newCount);
        console.log('Guest usage after update:', user.usage_metrics.pdf_processed_today);
      }
    }
    
    setIsCompressing(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('files', file.file));
      formData.append('compression_level', compressionLevel);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/tools/pdf/compress`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${Cookies.get('accessToken')}`,
        },
      });

      if(response.ok){
        const responseData = await response.json();
        setDownloadUrl(responseData.download_urls);
        // console.log("Compressed PDF URL:", downloadUrl); // This console.log will show the *previous* state of downloadUrl, it's asynchronous. If you want to see the new value, log responseData.download_urls
        if(responseData.user_usage){
            updateUserUsage(responseData.user_usage);
        }
        setToast({ message: 'PDF compressed successfully!', type: 'success' });
        const params = new URLSearchParams();
        responseData.download_urls.forEach((urlObj: string) => {
            params.append('url', urlObj);
        });
        console.log("Query string to push:", params.toString());
        
        router.push(`/tools/compress/download?${params.toString()}`);
        
        clearFiles();
    }
      else{
        console.log('Compression failed!');
        setToast({ message: 'Compression failed!', type: 'error' });
      }
    } catch (error) {
      console.error('Compression error:', error);
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="text-sm font-medium text-gray-500 mb-6 flex items-center space-x-2">
        <Link href="/" className="text-gray-400 hover:text-gray-600">
          <Home size={16} />
        </Link>
        <ChevronRight size={16} />
        <Link href="/tools" className="text-gray-400 hover:text-gray-600">
          Tools
        </Link>
        <ChevronRight size={16} />
        <span>Compress PDF</span>
      </nav>
      <div className="max-w-4xl mx-auto">
        {/* Toast Notification */}
    {toast && (
      <Toast
        message={toast.message}
        type={toast.type}
        onDismiss={() => setToast(null)}
      />
    )}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compress PDF</h1>
          <p className="text-gray-600">Reduce file size while maintaining good quality</p>
        </div>
        
      
      
        <div className="space-y-8">
          {/* File Upload Area */}
          <div
            className={`border-3 border-dashed border-[#471396] rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-[#7A00E6]' : 'border-[#A294F9]'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-3 bg-purple-100 rounded-full">
                <Upload className="h-6 w-6 text-[#471396]" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer font-medium text-[#471396] hover:text-[#3a0f75] focus-within:outline-none"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf"
                      multiple
                      onChange={handleFileInput}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">or drag and drop PDF files</p>
              </div>
            </div>
          </div>

          {/* Compression Options */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Compression Options</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compression Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'low', label: 'Low', desc: 'Smaller size reduction, better quality' },
                      { value: 'medium', label: 'Medium', desc: 'Good balance' },
                      { value: 'high', label: 'High', desc: 'Maximum compression' },
                    ].map((option) => (
                      <div
                        key={option.value}
                        onClick={() => setCompressionLevel(option.value as any)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          compressionLevel === option.value
                            ? 'border-[#471396] ring-2 ring-[#471396] ring-opacity-50 bg-purple-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center">
                          <div
                            className={`h-4 w-4 rounded-full border mr-2 flex items-center justify-center ${
                              compressionLevel === option.value
                                ? 'border-[#471396] bg-[#471396]'
                                : 'border-gray-400'
                            }`}
                          >
                            {compressionLevel === option.value && (
                              <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">{option.label}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-left ml-6">
                          {option.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Files to Compress</h3>
              </div>
              <ul className="divide-y divide-gray-200">
                {files.map((file, index) => (
                  <li key={index} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {(file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            {files.length > 0 && (
              <button
                onClick={clearFiles}
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Clear All
              </button>
            )}
            <button
              onClick={handleCompress}
              disabled={files.length === 0 || isCompressing}
              className={`ml-auto inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                files.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#471396] hover:bg-[#3a0f75]'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#471396]`}
            >
              {isCompressing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Compressing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  {files.length === 0 ? 'Select Files to Compress' : 'Compress PDF'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Features List */}
            <section className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-2xl font-semibold text-gray-700 mb-4">Features of Smart PDF Merge</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Merge multiple PDFs into a single file in seconds</h3>
                    <p className="text-gray-600 text-sm">Quickly combine documents without hassle.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Works online on any device and operating system</h3>
                    <p className="text-gray-600 text-sm">Access our tool from anywhere, anytime.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Trusted by millions of users worldwide</h3>
                    <p className="text-gray-600 text-sm">Join a global community of satisfied users.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle size={24} className="text-green-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-800">Secure and private processing</h3>
                    <p className="text-gray-600 text-sm">Your documents are safe with us, processed securely in the cloud.</p>
                  </div>
                </div>
              </div>
            </section>
    </div>
  );
}