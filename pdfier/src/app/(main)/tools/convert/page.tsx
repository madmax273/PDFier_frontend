// src/app/(main)/tools/convert/page.tsx
"use client";

import { useState, useCallback } from 'react';
import { Upload, FileText, FileDown, X, CheckCircle, FileUp, Home, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFileStore } from '@/store/FileStore';
import Link from 'next/link';


type ConvertFormat = 'pdf' | 'docx' | 'jpg' | 'png';

export default function ConvertPDFPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [targetFormat, setTargetFormat] = useState<ConvertFormat>('docx');
  const [isConverting, setIsConverting] = useState(false);
  const { files, addFiles, removeFile, clearFiles } = useFileStore();
  const router = useRouter();

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
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    
    setIsConverting(true);
    try {
      // TODO: Implement conversion logic
      console.log('Converting files to:', targetFormat);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // router.push('/tools/convert/result?url=...');
    } catch (error) {
      console.error('Conversion error:', error);
    } finally {
      setIsConverting(false);
    }
  };

  const formatOptions: { value: ConvertFormat; label: string; icon: any }[] = [
    { value: 'docx', label: 'Word Document', icon: FileText },
    { value: 'jpg', label: 'JPG Image', icon: FileUp },
    { value: 'png', label: 'PNG Image', icon: FileUp },
    { value: 'pdf', label: 'PDF', icon: FileText },
  ];

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
        <span>Merge PDF</span>
      </nav>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Convert Files</h1>
          <p className="text-gray-600">Convert your files to different formats</p>
        </div>

        <div className="space-y-8">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-[#471396] bg-purple-50' : 'border-gray-300'
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
                      multiple
                      onChange={handleFileInput}
                    />
                  </label>
                </p>
                <p className="text-xs text-gray-500">or drag and drop files</p>
              </div>
            </div>
          </div>

          {/* Conversion Options */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Options</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Convert to
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {formatOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <div
                          key={option.value}
                          onClick={() => setTargetFormat(option.value)}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            targetFormat === option.value
                              ? 'border-[#471396] ring-2 ring-[#471396] ring-opacity-50 bg-purple-50'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          <div className="flex items-center">
                            <div
                              className={`h-4 w-4 rounded-full border mr-2 flex items-center justify-center ${
                                targetFormat === option.value
                                  ? 'border-[#471396] bg-[#471396]'
                                  : 'border-gray-400'
                              }`}
                            >
                              {targetFormat === option.value && (
                                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                              )}
                            </div>
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 mr-2 text-gray-600" />
                              <span className="font-medium text-gray-900">{option.label}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Files to Convert</h3>
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
                      onClick={() => removeFile(index)}
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
              onClick={handleConvert}
              disabled={files.length === 0 || isConverting}
              className={`ml-auto inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                files.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-[#471396] hover:bg-[#3a0f75]'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#471396]`}
            >
              {isConverting ? (
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
                  Converting...
                </>
              ) : (
                <>
                  <FileDown className="h-4 w-4 mr-2" />
                  {files.length === 0 ? 'Select Files to Convert' : `Convert to ${targetFormat.toUpperCase()}`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}