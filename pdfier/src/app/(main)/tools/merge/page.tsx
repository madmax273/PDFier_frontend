"use client";

import React, { useState, useCallback, useRef, ChangeEvent } from 'react';
import Link from 'next/link';
import {
    Home, ChevronRight, FilePlus, Cloud, HardDrive, Box as Dropbox, 
    CheckCircle, FileText, XCircle, ArrowUp, ArrowDown, Layers,
    Box
  } from 'lucide-react';
// import { useAuthStore } from '@/store/authStore'; // Import Zustand store
import { useRouter } from 'next/navigation';


// Define a type for the PDF file object
interface PdfFile {
  id: string; // Unique ID for keying in React (using Object URL for simplicity)
  file: File; // The actual File object
  name: string;
  size: string; // Formatted size (e.g., "1.2 MB")
}

export default function MergePDFPage() {
//   const { user, isLoggedIn, isLoading: isAuthLoading, updateUserUsage } = useAuthStore();
  const router = useRouter();
  const [selectedFiles, setSelectedFiles] = useState<PdfFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [mergeMessage, setMergeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper function to format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Callback to add files from various sources (drag/drop, input)
  const addFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newPdfs: PdfFile[] = Array.from(files)
      .filter(file => file.type === 'application/pdf') // Ensure only PDFs are added
      .map(file => ({
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`, // More robust unique ID
        file: file,
        name: file.name,
        size: formatFileSize(file.size),
      }));

    setSelectedFiles(prev => [...prev, ...newPdfs]);
  }, []);

  // Handle file selection from the hidden input
  const handleFileSelect = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(event.target.files);
    setShowDropdown(false); // Close dropdown after selection
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear input value to allow re-selection of same file
    }
  };

  // Drag and Drop Handlers
  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    addFiles(event.dataTransfer.files);
  }, [addFiles]);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  // Remove a file from the list
  const removeFile = (idToRemove: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== idToRemove));
  };

  // Reorder files in the list
  const moveFile = (idToMove: string, direction: 'up' | 'down') => {
    setSelectedFiles(prevFiles => {
      const index = prevFiles.findIndex(file => file.id === idToMove);
      if (index === -1) return prevFiles;

      const newFiles = [...prevFiles];
      if (direction === 'up' && index > 0) {
        [newFiles[index - 1], newFiles[index]] = [newFiles[index], newFiles[index - 1]];
      } else if (direction === 'down' && index < newFiles.length - 1) {
        [newFiles[index + 1], newFiles[index]] = [newFiles[index], newFiles[index + 1]];
      }
      return newFiles;
    });
  };

  // Handle the actual PDF merge operation
  const handleMergePdfs = async () => {
    if (selectedFiles.length < 2) {
      setMergeMessage({ type: 'error', text: 'Please select at least two PDF files to merge.' });
      return;
    }

    setIsMerging(true);
    setMergeMessage(null);

    const formData = new FormData();
    selectedFiles.forEach((pdfFile, index) => {
      formData.append(`files`, pdfFile.file, pdfFile.name); // 'files' should match backend's expected field name
    });

    try {
      // API call to your backend's merge endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/pdf/merge`, {
        method: 'POST',
        body: formData,
        credentials: 'include', // Crucial for sending HTTP-only access_token cookie
      });

      if (response.ok) {
        // Assuming backend returns a PDF blob
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged_document.pdf'; // Suggested download filename
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url); // Clean up the object URL

        // Assuming backend also returns updated usage metrics in JSON part
        // You might need to parse JSON from headers or a separate response if blob is primary
        // For simplicity, let's assume the backend sends JSON first, then the file.
        // Or, if the backend sends JSON *with* the file, you'd need a more complex fetch.
        // For now, let's assume the backend sends the file, and then you might have a separate
        // endpoint to just update usage, or the merge endpoint returns a JSON response first.
        // For this example, we'll simulate usage update.
        
        // --- SIMULATE USAGE UPDATE ---
        // In a real scenario, your backend's merge endpoint would return the updated user_usage.
        // For now, let's manually increment for demo purposes.
        // const currentUsage = user?.usage_metrics;
        // if (currentUsage) {
        //     const updatedUsage = {
        //         ...currentUsage,
        //         pdf_processed_today: currentUsage.pdf_processed_today + 1
        //     };
        //     updateUserUsage(updatedUsage); // Update Zustand store
        // }
        // --- END SIMULATE USAGE UPDATE ---

        setMergeMessage({ type: 'success', text: 'PDFs merged and downloaded successfully!' });
        setSelectedFiles([]); // Clear files after successful merge
      } else {
        const errorData = await response.json(); // Parse error message from backend
        setMergeMessage({ type: 'error', text: errorData.detail || 'Failed to merge PDFs. Please try again.' });
      }
    } catch (error) {
      console.error("Error merging PDFs:", error);
      setMergeMessage({ type: 'error', text: 'Network error or unable to connect to the server.' });
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 lg:p-8">
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

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Merge PDF</h1>

      {/* Main Upload Area */}
      <section
        className={`relative bg-white border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragOver ? 'border-app-purple-500 bg-app-purple-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col items-center justify-center py-12">
          {/* Main Icon */}
          <Layers size={64} className="text-app-purple-400 mb-6" /> 
          <p className="text-lg text-gray-700 font-semibold mb-2">Drag & Drop PDFs Here</p>
          <p className="text-gray-500 mb-6">or</p>

          {/* Choose Files Button with Dropdown */}
          <div className="relative inline-block text-left">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-lg border border-transparent shadow-sm px-6 py-3 bg-[#471396] text-base font-medium text-white hover:bg-[#471396]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#471396]/50 transition-colors duration-200"
              onClick={() => setShowDropdown(!showDropdown)}
              
            >
              <FilePlus size={20} className="mr-2" />
              Choose Files
              <ChevronRight size={16} className="-mr-1 ml-2 transform rotate-90" />
            </button>

            {showDropdown && (
              <div className="origin-top-right absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                    onClick={() => {
                        fileInputRef.current?.click();
                        setShowDropdown(false); // Close dropdown immediately
                    }}
                  >
                    <HardDrive size={18} className="mr-3 text-gray-500" /> From device
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept="application/pdf"
                      onChange={handleFileSelect}
                    />
                  </button>
                  {/* Disabled Pro/Cloud options */}
                  <a
                    href="#"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 opacity-50 cursor-not-allowed"
                    role="menuitem"
                    onClick={(e) => e.preventDefault()} // Prevent navigation
                  >
                    <Cloud size={18} className="mr-3 text-gray-500" /> From Smallpdf <span className="ml-auto text-yellow-600 text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-100">Pro</span>
                  </a>
                  <a
                    href="#"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 opacity-50 cursor-not-allowed"
                    role="menuitem"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Dropbox size={18} className="mr-3 text-gray-500" /> From Dropbox
                  </a>
                  <a
                    href="#"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 opacity-50 cursor-not-allowed"
                    role="menuitem"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Box size={18} className="mr-3 text-gray-500" /> From Google Drive
                  </a>
                  <a
                    href="#"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 opacity-50 cursor-not-allowed"
                    role="menuitem"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Box size={18} className="mr-3 text-gray-500" /> From OneDrive
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <section className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Files to Merge ({selectedFiles.length})</h2>
          <ul className="space-y-3">
            {selectedFiles.map((file, index) => (
              <li key={file.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3 flex-grow">
                  <FileText size={20} className="text-app-purple-500" />
                  <span className="font-medium text-gray-800 truncate">{file.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({file.size})</span>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => moveFile(file.id, 'up')}
                    disabled={index === 0}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move file up"
                  >
                    <ArrowUp size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => moveFile(file.id, 'down')}
                    disabled={index === selectedFiles.length - 1}
                    className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Move file down"
                  >
                    <ArrowDown size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-2 rounded-full hover:bg-red-100 transition-colors"
                    aria-label="Remove file"
                  >
                    <XCircle size={18} className="text-red-500" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-center">
            {mergeMessage && (
              <div className={`p-3 mb-4 rounded-lg text-sm inline-block
                ${mergeMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {mergeMessage.text}
              </div>
            )}
            <button
              onClick={handleMergePdfs}
              disabled={selectedFiles.length < 2 || isMerging}
              className="inline-flex items-center justify-center rounded-lg shadow-md px-8 py-3 bg-app-purple-600 text-base font-medium text-white hover:bg-app-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-app-purple-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMerging ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Merging...
                </>
              ) : (
                <>
                  <Layers size={20} className="mr-2" /> {/* Using Layers icon for merge */}
                  Merge PDFs
                </>
              )}
            </button>
          </div>
        </section>
      )}


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

